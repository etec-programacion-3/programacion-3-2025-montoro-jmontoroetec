// frontend/src/pages/Messages.tsx
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getConversations,
  getMessages,
  sendMessage,
} from "../api/client";

// Tipos laxos para evitar errores de TS si tus types.ts difieren
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
  createdAt: string;          // ISO
  // En algunos esquemas puede llamarse senderId/authorId/etc.
  // Usamos any para evitar errores de tipado si tu types.ts no lo trae así:
  fromUserId?: number;
  toUserId?: number;
  isMine?: boolean;
};

function toArray<T>(data: any): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object" && "items" in data) {
    return (data as Paged<T>).items ?? [];
  }
  return [];
}

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

  // 1) Cargar conversaciones (y seleccionar la primera si no hay selección)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoadingConvs(true);
        setError(null);
        const data = await getConversations();
        const items = toArray<Conversation>(data);

        if (!alive) return;
        setConversations(items);

        if (items.length && selectedId == null) {
          setSelectedId(items[0].id);
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
  }, []);

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

        // Marcar isMine en UI
        const mineId = user?.id ?? null;
        const withMine = items.map((m) => ({
          ...m,
          isMine: mineId != null && (m as any).fromUserId === mineId,
        }));

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

  // 3) Polling de nuevos mensajes cada 3s
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
          const marked = items.map((m) => ({
            ...m,
            isMine: mineId != null && (m as any).fromUserId === mineId,
          }));

          // Actualizamos sólo si hay cambios evidentes (id del último o tamaño)
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

  // 4) Envío con actualización optimista
  async function handleSend() {
    if (!text.trim() || selectedId == null || !user?.id) return;

    const temp: Message = {
      id: Math.floor(Math.random() * -1e9), // id temporal negativo
      content: text.trim(),
      createdAt: new Date().toISOString(),
      fromUserId: user.id,
      toUserId: 0,
      isMine: true,
    };

    // Optimismo: lo metemos ya
    setMessages((prev) => [...prev, temp]);
    setText("");
    scrollToBottom();

    try {
      const saved = await sendMessage(selectedId, temp.content);
      // Reemplazamos al final por el guardado definitivo, marcando isMine
      setMessages((prev) => {
        const mineId = user.id;
        const arr = [...prev];
        arr[arr.length - 1] = {
          ...(saved as any),
          isMine: (saved as any).fromUserId === mineId,
        } as Message;
        return arr;
      });
      scrollToBottom();
    } catch (e) {
      console.error(e);
      setError("No se pudo enviar el mensaje");
    }
  }

  // 5) UI
  return (
    <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", height: "calc(100vh - 64px)" }}>
      {/* Panel izquierdo: conversaciones */}
      <div style={{ borderRight: "1px solid #e5e7eb", overflowY: "auto" }}>
        <div style={{ padding: 12, fontWeight: 700 }}>Conversaciones</div>
        {loadingConvs && <div style={{ padding: 12 }}>Cargando…</div>}
        {conversations.map((c) => (
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
            <div style={{ fontWeight: 600 }}>
              {c.otherUser?.nombre} {c.otherUser?.apellido}
            </div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>
              {c.lastMessage?.content || "Sin mensajes aún"}
            </div>
          </div>
        ))}
      </div>

      {/* Panel derecho: mensajes */}
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>
          {selectedId ? `Conversación #${selectedId}` : "Seleccioná una conversación"}
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

        {/* input */}
        <div style={{ display: "flex", gap: 8, padding: 12, borderTop: "1px solid #e5e7eb" }}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escribí tu mensaje…"
            style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #e5e7eb" }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
          />
          <button
            onClick={handleSend}
            style={{ background: "#2563eb", color: "#fff", border: 0, borderRadius: 8, padding: "10px 14px", cursor: "pointer" }}
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}
