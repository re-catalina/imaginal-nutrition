"use client";

import { useSession } from "next-auth/react";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  ts?: string;
};

export default function NemoChatPage() {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [streamingText, setStreamingText] = useState("");
  const [pending, setPending] = useState(false);
  const [loadingConv, setLoadingConv] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText, pending, scrollToBottom]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (status !== "authenticated") {
        return;
      }
      setLoadingConv(true);
      setError(null);
      try {
        const res = await fetch("/api/nemo/conversation");
        if (!res.ok) {
          throw new Error("Could not load conversation.");
        }
        const data = (await res.json()) as { conversationId: string; messages: ChatMessage[] };
        if (cancelled) {
          return;
        }
        setConversationId(data.conversationId);
        setMessages(data.messages.map((m) => ({ role: m.role, content: m.content, ts: m.ts })));
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load.");
        }
      } finally {
        if (!cancelled) {
          setLoadingConv(false);
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [status]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = input.trim();
    if (!text || !session?.user?.id || pending) {
      return;
    }

    setInput("");
    setPending(true);
    setError(null);
    setStreamingText("");

    const priorSnapshot = messages;
    const optimistic: ChatMessage[] = [...messages, { role: "user", content: text, ts: new Date().toISOString() }];
    setMessages(optimistic);

    try {
      const res = await fetch("/api/nemo/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          userId: session.user.id,
          conversationId: conversationId ?? undefined,
          stream: true
        })
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(typeof errBody?.error === "string" ? errBody.error : "Request failed.");
      }

      if (!res.body) {
        throw new Error("No response body.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        buffer += decoder.decode(value, { stream: true });

        let sep: number;
        while ((sep = buffer.indexOf("\n\n")) >= 0) {
          const raw = buffer.slice(0, sep).trim();
          buffer = buffer.slice(sep + 2);
          if (!raw.startsWith("data:")) {
            continue;
          }
          const payload = raw.replace(/^data:\s*/, "");
          try {
            const json = JSON.parse(payload) as {
              delta?: string;
              done?: boolean;
              reply?: string;
              updatedMessages?: ChatMessage[];
              error?: string;
            };
            if (json.error) {
              throw new Error(json.error);
            }
            if (typeof json.delta === "string" && json.delta.length > 0) {
              setStreamingText((prev) => prev + json.delta);
            }
            if (json.done && json.updatedMessages) {
              setMessages(json.updatedMessages.map((m) => ({ role: m.role, content: m.content, ts: m.ts })));
              setStreamingText("");
            }
          } catch (parseErr) {
            if (parseErr instanceof SyntaxError) {
              continue;
            }
            throw parseErr;
          }
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setMessages(priorSnapshot);
    } finally {
      setPending(false);
      setStreamingText("");
    }
  }

  if (status === "loading" || loadingConv) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-forest-muted">
        Loading Nemo…
      </div>
    );
  }

  return (
    <div className="page-fade-in flex min-h-[calc(100dvh-12rem)] flex-col">
      <div className="mb-4 border-b border-border pb-4">
        <p className="text-xs uppercase tracking-[0.3em] text-tan">Nemo</p>
        <h1 className="font-display text-2xl text-forest">Coach chat</h1>
      </div>

      <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-border bg-white shadow-sm shadow-black/5">
        <div className="flex min-h-[320px] flex-1 flex-col gap-4 overflow-y-auto px-4 py-4 sm:min-h-[400px]">
          {error && <p className="text-center text-sm text-red-600">{error}</p>}

          {messages.map((m, idx) => (
            <div
              key={`${m.role}-${m.ts ?? idx}`}
              className={`flex w-full gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              {m.role === "assistant" && (
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#2C3E2D] font-display text-lg text-cream"
                  aria-hidden
                >
                  N
                </div>
              )}
              <div
                className={`max-w-[min(100%,28rem)] px-4 py-3 text-sm leading-relaxed shadow-sm ${
                  m.role === "user"
                    ? "rounded-l-2xl rounded-r-none bg-[#2C3E2D] text-[#F0E8DC]"
                    : "rounded-l-none rounded-r-2xl bg-[#F0F7F2] text-forest"
                }`}
              >
                <p className="whitespace-pre-wrap">{m.content}</p>
              </div>
            </div>
          ))}

          {(pending || streamingText) && (
            <div className="flex w-full gap-3">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#2C3E2D] font-display text-lg text-cream"
                aria-hidden
              >
                N
              </div>
              <div className="max-w-[min(100%,28rem)] rounded-l-none rounded-r-2xl bg-[#F0F7F2] px-4 py-3 text-sm leading-relaxed text-forest shadow-sm">
                {streamingText ? (
                  <p className="whitespace-pre-wrap">{streamingText}</p>
                ) : (
                  <span className="inline-flex gap-1.5">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-[#4A7C5F] [animation-delay:-0.2s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-[#4A7C5F] [animation-delay:-0.1s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-[#4A7C5F]" />
                  </span>
                )}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <form onSubmit={onSubmit} className="border-t border-border p-3">
          <div className="flex items-end gap-3">
            <label className="sr-only" htmlFor="nemo-input">
              Message to Nemo
            </label>
            <textarea
              id="nemo-input"
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about meals, macros, habits…"
              disabled={pending}
              className="min-h-[48px] flex-1 resize-none rounded-2xl border border-border bg-[#F5EFE6] px-4 py-3 text-sm text-forest outline-none ring-fern placeholder:text-forest-muted focus:ring-2"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  e.currentTarget.form?.requestSubmit();
                }
              }}
            />
            <button
              type="submit"
              disabled={pending || !input.trim()}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#2C3E2D] text-cream shadow-md transition-opacity hover:opacity-90 disabled:opacity-40"
              aria-label="Send message"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M5 12h14M13 5l7 7-7 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
