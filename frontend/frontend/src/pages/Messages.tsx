import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getConversations,
  getMessages,
  sendMessage,
} from "../api/client";
import type { Conversation, Message, Paged } from "../types";

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
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let alive = true;

    async function loadConvs() {
      try {
        setLoadingConvs(true);
        setError(null);
        const data = await getConversations();
        const items = Array.isArray(data)
          ? (data as Conversation[])
          : (data as Paged<Conversation>).items ?? [];
        if (alive) setConversations(items);
      } catch (err) {
        console.error(err);
        if (alive) setError("No se pudieron cargar las conversaciones");
      } finally {
        if (alive) setLoadingConvs(false);
      }
    }

    loadConvs();
    return () => {
      alive = false;
    };
  }, []);

  // ----- scroll al final -----
  function scrollToBottom() {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }

  // ----- cargar mensajes de una conversación -----
  async function loadMessagesFor(conversationId: number) {
    let alive = true;
    try {
      setLoadingMsgs(true);
      setError(null);
      const data = await getMessages(conversationId, 1, 50);
      const items = Array.isArray(data)
        ? (data as Message[])
        : (data as Paged<Message>).items ?? [];
      // marcar isMine
      const myId = user?.id;
      const decorated = items.map((m) => ({
        ...m,
        isMine: myId != null && m.senderId === myId,
      }));
      if (alive) setMessages(decorated);
      scrollToBottom();
    } catch (err) {
      console.error(err);
      if (alive) setError("No se pudieron cargar los mensajes");
    } finally {
      if (alive) setLoadingMsgs(false);
    }
    return () => {
      alive = false;
    };
  }

  // ----- polling -----
  function stopPolling() {
    if (pollingRef.current != null) {
      window.clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }

  function startPolling(conversationId: number) {
    stopPolling();
    pollingRef.current = window.setInterval(async () => {
      try {
        const data = await getMessages(conversationId, 1, 50);
        const items = Array.isArray(data)
          ? (data as Message[])
          : (data as Paged<Message>).items ?? [];
        const myId = user?.id;
        const decorated = items.map((m) => ({
          ...m,
          isMine: myId != null && m.senderId === myId,
        }));
        setMessages(decorated);
        scrollToBottom();
      } catch (err) {
        console.error("Error en polling de mensajes", err);
      }
    }, 4000); // cada 4 segundos
  }

  // ----- cuando cambia selectedId -----
  useEffect(() => {
    if (selectedId == null) {
      setMessages([]);
      stopPolling();
      return;
    }
    loadMessagesFor(selectedId);
    startPolling(selectedId);
    return () => {
      stopPolling();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  // ----- enviar mensaje -----
  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    if (selectedId == null) return;

    const tmp: Message = {
      id: Date.now(),
      conversationId: selectedId,
      senderId: user?.id ?? 0,
      content: text,
      createdAt: new Date().toISOString(),
      isMine: true,
    };

    setMessages((prev) => [...prev, tmp]);
    setText("");
    scrollToBottom();

    try {
      const saved = await sendMessage(selectedId, tmp.content);
      setMessages((prev) =>
        prev.map((m) => (m.id === tmp.id ? { ...saved, isMine: true } : m))
      );
    } catch (err) {
      console.error(err);
      setError("No se pudo enviar el mensaje");
      // opcional: deshacer el mensaje optimista
    }
  }

  // ----- render -----
  return (
    <div style={{ display: "flex", height: "calc(100vh - 60px)" }}>
      {/* Lista de conversaciones */}
      <aside
        style={{
          width: 280,
          borderRight: "1px solid #e5e7eb",
          padding: 16,
          overflowY: "auto",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Conversaciones</h2>
        {loadingConvs && <div>Cargando conversaciones…</div>}
        {error && (
          <div style={{ color: "crimson", marginBottom: 8 }}>{error}</div>
        )}

        {conversations.map((c) => (
          <div
            key={c.id}
            onClick={() => setSelectedId(c.id)}
            style={{
              padding: 8,
              marginBottom: 8,
              borderRadius: 8,
              cursor: "pointer",
              background: c.id === selectedId ? "#e5e7eb" : "transparent",
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
      </aside>

      {/* Panel de mensajes */}
      <section style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div
          style={{
            padding: 16,
            borderBottom: "1px solid #e5e7eb",
            minHeight: 56,
          }}
        >
          {selectedId == null ? (
            <strong>Seleccioná una conversación</strong>
          ) : (
            <strong>
              Conversación #{selectedId}
            </strong>
          )}
        </div>

        <div
          ref={listRef}
          style={{
            flex: 1,
            padding: 16,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {loadingMsgs && <div>Cargando mensajes…</div>}
          {messages.map((m) => (
            <div
              key={m.id}
              style={{
                display: "flex",
                justifyContent: m.isMine ? "flex-end" : "flex-start",
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
        </div>

        {/* Formulario de envío */}
        {selectedId != null && (
          <form
            onSubmit={handleSend}
            style={{
              padding: 12,
              borderTop: "1px solid #e5e7eb",
              display: "flex",
              gap: 8,
            }}
          >
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Escribí tu mensaje…"
              style={{
                flex: 1,
                padding: 8,
                borderRadius: 8,
                border: "1px solid #d1d5db",
              }}
            />
            <button
              type="submit"
              disabled={!text.trim()}
              style={{
                background: "#2563eb",
                color: "#fff",
                border: 0,
                borderRadius: 8,
                padding: "0 16px",
                cursor: "pointer",
              }}
            >
              Enviar
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
