// frontend/src/pages/Messages.tsx
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getConversations, getMessages, sendMessage } from "../api/client";

// ---------------- Tipos ----------------

type Paged<T> = { items: T[]; total?: number; page?: number; pageSize?: number };

type OtherUser = {
  id?: number;
  nombre?: string | null;
  apellido?: string | null;
  email?: string;
};

type Conversation = {
  id: number;
  otherUser?: OtherUser;
  lastMessage?: { content?: string } | null;
};

type Message = {
  id?: number;
  content: string;
  createdAt: string;
  fromUserId?: number;
  toUserId?: number;
  isMine?: boolean;
};

type RawConversation = {
  id: number;
  participants?: { user?: OtherUser }[];
  messages?: { content: string }[];
};

// ---------------- Utils ----------------

function toArray<T>(data: any): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object" && "items" in data) {
    return (data as Paged<T>).items ?? [];
  }
  return [];
}

// Obtiene el id del remitente sin importar cómo venga llamado
function getSenderId(m: any): number | undefined {
  return m?.fromUserId ?? m?.senderId ?? m?.authorId ?? m?.userId;
}

// ---------------- Componente ----------------

export default function Messages() {
  const { user } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loadingConvs, setLoadingConvs] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pollingRef = useRef<number | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  function scrollToBottom() {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  // 1) Cargar conversaciones y mapear otherUser + lastMessage
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoadingConvs(true);
        setError(null);

        const data = await getConversations();
        const rawItems = toArray<RawConversation>(data);

        const myId = user?.id ?? null;

        const mapped: Conversation[] = rawItems.map((c) => {
          const participants = c.participants ?? [];
          const users = participants
            .map((p) => p.user)
            .filter((u): u is OtherUser => !!u);

          let other: OtherUser | undefined;
          if (myId != null && users.length > 1) {
            other = users.find((u) => u.id !== myId) ?? users[0];
          } else {
            other = users[0];
          }

          const last = (c.messages && c.messages[0]) || null;

          return {
            id: c.id,
            otherUser: other,
            lastMessage: last ? { content: last.content } : undefined,
          };
        });

        if (!alive) return;
        setConversations(mapped);

        if (mapped.length && selectedId == null) {
          setSelectedId(mapped[0].id);
        }
      } catch (e) {
        console.error(e);
        if (alive) setError("No se pudieron cargar las conversaciones");
      } finally {
        if (alive) setLoadingConvs(false);
      }
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // 2) Cargar mensajes de la conversación seleccionada
  useEffect(() => {
    if (selectedId == null) return;

    let alive = true;
    (async () => {
      try {
        setLoadingMsgs(true);
        setError(null);
        const data = await getMessages(selectedId, 1, 50);
        const items = toArray<Message>(data);

        const mineId = user?.id ?? null;
        const withMine = items.map((m) => {
          const senderId = getSenderId(m as any);
          return {
            ...m,
            isMine: mineId != null && senderId === mineId,
          };
        });

        if (!alive) return;
        setMessages(withMine);
        scrollToBottom();
      } catch (e) {
        console.error(e);
        if (alive) setError("No se pudieron cargar los mensajes");
      } finally {
        if (alive) setLoadingMsgs(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [selectedId, user?.id]);

  // 3) Polling cada 3s
  useEffect(() => {
    if (selectedId == null) return;

    function stop() {
      if (pollingRef.current != null) {
        window.clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    }

    pollingRef.current = window.setInterval(async () => {
      try {
        const data = await getMessages(selectedId, 1, 50);
        const items = toArray<Message>(data);
        const mineId = user?.id ?? null;

        setMessages((prev) => {
          const marked = items.map((m) => {
            const senderId = getSenderId(m as any);
            return {
              ...m,
              isMine: mineId != null && senderId === mineId,
            };
          });

          const prevLast = prev[prev.length - 1]?.id;
          const newLast = marked[marked.length - 1]?.id;
          if (prevLast !== newLast || marked.length !== prev.length) {
            return marked;
          }
          return prev;
        });
      } catch (e) {
        console.error(e);
      }
    }, 3000);

    return stop;
  }, [selectedId, user?.id]);

  // 4) Envío optimista
  async function handleSend() {
    if (!text.trim() || selectedId == null || !user?.id) return;

    const temp: Message = {
      id: Math.floor(Math.random() * -1e9),
      content: text.trim(),
      createdAt: new Date().toISOString(),
      fromUserId: user.id, // optimista
      toUserId: 0,
      isMine: true,
    };

    setMessages((prev) => [...prev, temp]);
    setText("");
    scrollToBottom();

    try {
      const saved = await sendMessage(selectedId, temp.content);
      setMessages((prev) => {
        const mineId = user.id;
        const arr = [...prev];
        const senderId = getSenderId(saved as any);
        arr[arr.length - 1] = {
          ...(saved as any),
          isMine: senderId === mineId,
        } as Message;
        return arr;
      });
      scrollToBottom();
    } catch (e) {
      console.error(e);
      setError("No se pudo enviar el mensaje");
    }
  }

  const currentConv = conversations.find((c) => c.id === selectedId);

  const headerTitle = (() => {
    if (!selectedId) return "Seleccioná una conversación";

    const other = currentConv?.otherUser;
    if (other) {
      const fullName = `${other.nombre ?? ""} ${other.apellido ?? ""}`.trim();
      if (fullName) return fullName;
      if (other.email) return other.email;
    }
    return `Conversación #${selectedId}`;
  })();

  // ---------------- UI ----------------

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "320px 1fr",
        height: "calc(100vh - 64px)",
      }}
    >
      {/* Lista de conversaciones */}
      <div style={{ borderRight: "1px solid #e5e7eb", overflowY: "auto" }}>
        <div style={{ padding: 12, fontWeight: 700 }}>Conversaciones</div>
        {loadingConvs && <div style={{ padding: 12 }}>Cargando…</div>}
        {conversations.map((c) => {
          const other = c.otherUser;
          const labelName =
            (other &&
              (`${other.nombre ?? ""} ${other.apellido ?? ""}`.trim() ||
                other.email)) ||
            `Conversación #${c.id}`;

          return (
            <div
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              style={{
                padding: 12,
                cursor: "pointer",
                background: selectedId === c.id ? "#eef2ff" : "transparent",
                borderBottom: "1px solid #f3f4f6",
              }}
            >
              <div style={{ fontWeight: 600 }}>{labelName}</div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>
                {c.lastMessage?.content || "Sin mensajes aún"}
              </div>
            </div>
          );
        })}
      </div>

      {/* Panel derecho: mensajes */}
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div
          style={{
            padding: 12,
            borderBottom: "1px solid #e5e7eb",
            fontWeight: 600,
          }}
        >
          {headerTitle}
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
          {loadingMsgs && <div>Cargando mensajes…</div>}
          {error && <div style={{ color: "crimson" }}>{error}</div>}

          {messages.map((m, idx) => (
            <div
              key={m.id ?? `temp-${idx}`}
              style={{
                display: "flex",
                justifyContent: m.isMine ? "flex-end" : "flex-start",
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  background: m.isMine ? "#2563eb" : "#e5e7eb",
                  color: m.isMine ? "#fff" : "#111827",
                  padding: "6px 10px",
                  borderRadius: 12,
                  maxWidth: "70%",
                  fontSize: 14,
                }}
              >
                {m.content}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div
          style={{
            display: "flex",
            gap: 8,
            padding: 12,
            borderTop: "1px solid #e5e7eb",
          }}
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escribí tu mensaje…"
            style={{
              flex: 1,
              padding: 10,
              borderRadius: 8,
              border: "1px solid #e5e7eb",
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
          />
          <button
            onClick={handleSend}
            style={{
              background: "#2563eb",
              color: "#fff",
              border: 0,
              borderRadius: 8,
              padding: "10px 14px",
              cursor: "pointer",
            }}
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}
