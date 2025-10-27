"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Role = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  timestamp: string;
}

interface ChatResponse {
  reply: string;
  followUpSuggestions?: string[];
}

const quickPrompts = [
  "Can you help me book a service?",
  "What services do you offer?",
  "How soon can someone visit?",
  "Where do you operate?",
];

const initialMessages: ChatMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "Hi there! I’m Lumi, the virtual concierge at BrightSteps Local Services. How can I assist you today?",
    timestamp: new Date().toISOString(),
  },
];

function formatTimestamp(date: Date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const chatBodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = chatBodyRef.current;
    if (!element) return;
    element.scrollTo({ top: element.scrollHeight, behavior: "smooth" });
  }, [messages.length, isLoading]);

  const latestSuggestions = useMemo(() => {
    if (suggestions.length > 0) return suggestions;
    const unused = quickPrompts.filter(
      (prompt) => !messages.some((message) => message.content === prompt)
    );
    return unused.slice(0, 3);
  }, [messages, suggestions]);

  const appendMessage = (message: Omit<ChatMessage, "id" | "timestamp">) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `${message.role}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        timestamp: new Date().toISOString(),
        ...message,
      },
    ]);
  };

  const handleSubmit = async (content: string) => {
    if (!content.trim() || isLoading) return;
    appendMessage({ role: "user", content: content.trim() });
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          history: messages.map(({ role, content }) => ({ role, content })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to reach assistant");
      }

      const { reply, followUpSuggestions }: ChatResponse = await response.json();
      appendMessage({ role: "assistant", content: reply });
      setSuggestions(followUpSuggestions ?? []);
    } catch (error) {
      appendMessage({
        role: "assistant",
        content:
          "I ran into a hiccup processing that. Could you try again in a moment?",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="chat-card">
        <header className="chat-header">
          <span className="status-indicator" aria-hidden />
          <div className="header-copy">
            <h1>BrightSteps Support</h1>
            <p>Real people. Real help. Powered by a friendly AI concierge.</p>
          </div>
        </header>

        <section className="chat-body" aria-live="polite" ref={chatBodyRef}>
          {messages.map((message) => (
            <article
              key={message.id}
              className={`bubble bubble-${message.role}`}
            >
              <div className="bubble-meta">
                <span className="bubble-role">
                  {message.role === "assistant" ? "Lumi" : "You"}
                </span>
                <span className="bubble-time">
                  {formatTimestamp(new Date(message.timestamp))}
                </span>
              </div>
              <p>{message.content}</p>
            </article>
          ))}
          {isLoading && (
            <div className="typing-indicator">
              <span />
              <span />
              <span />
            </div>
          )}
        </section>

        <footer className="chat-footer">
          {latestSuggestions.length > 0 && (
            <div className="suggestions" role="list">
              {latestSuggestions.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className="suggestion"
                  onClick={() => handleSubmit(prompt)}
                  disabled={isLoading}
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          <form
            className="input-row"
            onSubmit={(event) => {
              event.preventDefault();
              handleSubmit(inputValue);
            }}
          >
            <textarea
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              placeholder="Ask about services, pricing, availability, or anything else."
              rows={2}
              maxLength={600}
              disabled={isLoading}
              required
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  handleSubmit(inputValue);
                }
              }}
            />
            <button type="submit" disabled={isLoading || !inputValue.trim()}>
              {isLoading ? "Sending" : "Send"}
            </button>
          </form>
        </footer>
      </div>

      <aside className="sidebar">
        <section className="info-card">
          <h2>About BrightSteps</h2>
          <p>
            BrightSteps connects homeowners with trusted local professionals for
            home upkeep, repairs, and lifestyle services. We vet every specialist
            so you can book with confidence.
          </p>
          <ul>
            <li>• Same-day and scheduled visits</li>
            <li>• Eco-conscious practices</li>
            <li>• Dedicated neighborhood teams</li>
          </ul>
        </section>

        <section className="info-card">
          <h3>Need a human?</h3>
          <p>Email hello@brightsteps.co or call (415) 555-9024 weekdays 8am-6pm.</p>
        </section>
      </aside>
    </div>
  );
}
