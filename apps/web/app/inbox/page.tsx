"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { AppShell } from "../../components/app-shell";
import { RequireAuth } from "../../components/require-auth";
import { useAuth } from "../../components/auth-provider";
import { apiRequest } from "../../lib/api-client";
import { apiBaseUrl } from "../../lib/config";
import { getStudioSlug } from "../../lib/studio";

type Conversation = {
  id: string;
  channel: string;
  client: { fullName: string } | null;
  messages: Array<{ text: string; createdAt: string }>;
  lastMessageAt: string | null;
};

type Message = {
  id: string;
  direction: "INBOUND" | "OUTBOUND";
  text: string;
  createdAt: string;
};

export default function InboxPage() {
  const { token, user } = useAuth();
  const studioSlug = useMemo(() => getStudioSlug(), []);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const loadConversations = useCallback(async () => {
    if (!token) {
      return;
    }
    try {
      const data = await apiRequest<Conversation[]>("/inbox/conversations", { token, studioSlug });
      setConversations(data);
      if (!selectedId && data.length > 0) {
        setSelectedId(data[0].id);
      }
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load inbox");
    }
  }, [selectedId, studioSlug, token]);

  const loadMessages = useCallback(async () => {
    if (!token || !selectedId) {
      return;
    }
    const data = await apiRequest<Message[]>(`/inbox/conversations/${selectedId}/messages`, {
      token,
      studioSlug
    });
    setMessages(data);
  }, [selectedId, studioSlug, token]);

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    if (!user?.studioId) {
      return;
    }
    const socket = io(`${apiBaseUrl}/ws`, {
      query: {
        studioId: user.studioId
      }
    });
    socket.on("inbox.updated", () => {
      void loadConversations();
      void loadMessages();
    });
    return () => {
      socket.disconnect();
    };
  }, [loadConversations, loadMessages, user?.studioId]);

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !selectedId || !messageText.trim()) {
      return;
    }
    await apiRequest(`/inbox/conversations/${selectedId}/messages`, {
      method: "POST",
      token,
      studioSlug,
      body: {
        text: messageText
      }
    });
    setMessageText("");
    await loadMessages();
    await loadConversations();
  }

  async function simulateInbound() {
    await apiRequest("/connectors/stub/inbound", {
      method: "POST",
      studioSlug,
      body: {
        externalThreadId: "stub-dev-thread",
        text: "This is a local inbound webhook simulation",
        clientName: "Webhook Client",
        phone: "+1-555-777-9999"
      }
    });
    await loadConversations();
  }

  return (
    <RequireAuth>
      <AppShell>
        <section className="grid gap-4 lg:grid-cols-[320px_1fr]">
          <aside className="card p-3">
            <div className="mb-3 flex items-center justify-between">
              <h1 className="text-lg font-semibold">Conversations</h1>
              <button className="rounded-lg border border-ink/15 px-2 py-1 text-xs" onClick={simulateInbound}>
                Simulate Inbound
              </button>
            </div>
            <ul className="space-y-2">
              {conversations.map((conversation) => (
                <li
                  className={`cursor-pointer rounded-lg border p-2 ${
                    selectedId === conversation.id ? "border-accent bg-accent/5" : "border-ink/10"
                  }`}
                  key={conversation.id}
                  onClick={() => setSelectedId(conversation.id)}
                >
                  <p className="text-sm font-medium">{conversation.client?.fullName ?? "Unknown client"}</p>
                  <p className="text-xs text-ink/70">{conversation.messages[0]?.text ?? "No messages yet"}</p>
                </li>
              ))}
            </ul>
          </aside>

          <article className="card flex min-h-[540px] flex-col p-3">
            <div className="border-b border-ink/10 pb-3">
              <p className="text-sm text-ink/70">
                {conversations.find((conversation) => conversation.id === selectedId)?.client?.fullName ??
                  "Select a thread"}
              </p>
            </div>
            <ul className="flex-1 space-y-2 overflow-y-auto py-3">
              {messages.map((message) => (
                <li
                  className={`max-w-[80%] rounded-xl p-2 text-sm ${
                    message.direction === "OUTBOUND" ? "ml-auto bg-accent text-white" : "bg-ink/10 text-ink"
                  }`}
                  key={message.id}
                >
                  <p>{message.text}</p>
                  <p className="mt-1 text-[10px] opacity-70">{new Date(message.createdAt).toLocaleString()}</p>
                </li>
              ))}
            </ul>
            <form className="flex gap-2 border-t border-ink/10 pt-3" onSubmit={sendMessage}>
              <input
                className="flex-1 rounded-xl border border-ink/15 px-3 py-2"
                onChange={(event) => setMessageText(event.target.value)}
                placeholder="Type a reply..."
                value={messageText}
              />
              <button className="rounded-xl bg-accent px-4 py-2 text-white" type="submit">
                Send
              </button>
            </form>
            {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
          </article>
        </section>
      </AppShell>
    </RequireAuth>
  );
}

