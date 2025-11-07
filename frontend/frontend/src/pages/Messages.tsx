import { useEffect, useMemo, useRef, useState } from "react";
import { listConversations, getMessages, sendMessage } from "../api/client";
import type { Conversation, Message, Paged } from "../types";

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);

  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pollingRef = useRef<number | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoadingConvs(true);
        setError(null);
        const convs = await listConversations();
        if (!alive) return;
        setConversations(convs);
        if (convs.length && !selected) setSelected(convs[0]);
      } catch (e: any) {
        if (!alive) return;
        setError("No se pudieron cargar las conversaciones");
        console.error(e);
      } finally {
        if (!alive) return;
        setLoadingConvs(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!selected) return;

    let alive = true;

    async function loadMsgs() {
      try {
        setLoadingMsgs(true);
        setError(null);
        const data = await getMessages(selected.id, 1, 50);
        if (!alive) return;
        const items = Array.isArray(data) ? data : (data as Paged<Message>).items ?? [];
        setMessages(items);
        scrollToBottom();
      } catch (e: any) {
        if (!alive) return;
        setError("No se pudieron cargar los mensajes");
        console.error(e);
      } finally {
        if (!alive) return;
        setLoadingMsgs(false);
      }
    }

    function startPolling() {
      stopPolling();
      pollingRef.current = window.setInterval(async () => {
        try {
          const data = await getMessages(selected.id, 1, 50);
          const items = Array.isArray(data) ? data : (data as Paged<Message>).items ?? [];

          setMessages((prev) => {
            const prevLast = prev[prev.length - 1]?.id;
            const newLast = items[items.length - 1]?.id;
            if (prevLast !== newLast) {
              return items;
            }
            return prev;
          });
        } catch (e) {
          console.error("Polling error", e);
        }
      }, 3000); 
    }

    function stopPolling() {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    }

    (async () => {
      await loadMsgs();
      startPolling();
    })();

    return () => {
      alive = false;
      stopPolling();
    };
  }, [selected?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  function scrollToBottom() {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !text.trim()) return;

    const tempId = Math.random() * 1e9;
    const optimistic: Message = {
      id: tempId,
      conversationId: selected.id,
      senderId: -1, 
      content: text.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimistic]);
    setText("");
    scrollToBottom();

    try {
      const saved = await sendMessage(selected.id, optimistic.content);
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? saved : m))
      );
    } catch (e) {
      console.error(e);
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      alert("No se pudo enviar el mensaje");
    }
  }

  const otherName = useMemo(() => {
    if (!selected) return "";
    const first = selected.participants?.[0];
    const second = selected.participants?.[1];
    const u =
      (first?.user?.nombre || "") +
      " " +
      (first?.user?.apellido || "");
    const v =
      (second?.user?.nombre || "") +
      " " +
      (second?.user?.apellido || "");
    return [u.trim(), v.trim()].filter(Boolean).join(" / ");
  }, [selected]);

  return (
    <div style={{ display: "flex", height: "calc(100vh - 64px)" }}>
      {/* Sidebar conversaciones */}
      <aside
        style={{
          width: 320,
          borderRight: "1px solid #e5e7eb",
          overflow: "auto",
        }}
      >
        <div style={{ padding: 16, borderBottom: "1px solid #e5e7eb" }}>
          <strong>Mis conversaciones</strong>
        </div>

        {loadingConvs ? (
          <div style={{ padding: 16 }}>Cargando…</div>
        ) : error ? (
          <div style={{ padding: 16, color: "crimson" }}>{error}</div>
        ) : conversations.length === 0 ? (
          <div style={{ padding: 16 }}>No tenés conversaciones aún.</div>
        ) : (
          conversations.map((c) => {
            const last = c.messages?.[c.messages.length - 1];
            return (
              <button
                key={c.id}
                onClick={() => setSelected(c)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "12px 16px",
                  border: 0,
                  background: selected?.id === c.id ? "#eef2ff" : "transparent",
                  borderBottom: "1px solid #f3f4f6",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontWeight: 600 }}>
                  Conversación #{c.id}
                </div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>
                  {last ? `${last.sender?.nombre ?? ""}: ${last.content}` : "—"}
                </div>
              </button>
            );
          })
        )}
      </aside>

      {/* Panel de chat */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div
          style={{
            height: 56,
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            padding: "0 16px",
            justifyContent: "space-between",
          }}
        >
          <div style={{ fontWeight: 600 }}>
            {selected ? `Chat con: ${otherName || "Participantes"}` : "Chat"}
          </div>
        </div>

        {/* Mensajes */}
        <div
          ref={containerRef}
          style={{
            flex: 1,
            padding: 16,
            overflow: "auto",
            background: "#f9fafb",
          }}
        >
          {!selected ? (
            <div>Elegí una conversación del panel izquierdo.</div>
          ) : loadingMsgs ? (
            <div>Cargando mensajes…</div>
          ) : messages.length === 0 ? (
            <div>Sin mensajes todavía.</div>
          ) : (
            messages.map((m) => (
              <div key={m.id} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 12, color: "#6b7280" }}>
                  {m.sender?.nombre ?? "Usuario"}{" "}
                  {new Date(m.createdAt).toLocaleString()}
                </div>
                <div
                  style={{
                    background: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    padding: 8,
                    display: "inline-block",
                    maxWidth: "70%",
                  }}
                >
                  {m.content}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input de envío */}
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
            placeholder="Escribí un mensaje…"
            style={{
              flex: 1,
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              padding: "10px 12px",
              outline: "none",
            }}
          />
          <button
            type="submit"
            disabled={!selected || !text.trim()}
            style={{
              background: "#2563eb",
              color: "#fff",
              border: 0,
              borderRadius: 8,
              padding: "10px 16px",
              cursor: "pointer",
            }}
          >
            Enviar
          </button>
        </form>
      </main>
    </div>
  );
}
