import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, Spinner } from "react-bootstrap";
import { RiRobot2Line } from "react-icons/ri";
import { IoClose } from "react-icons/io5";
import { FiSend } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { sendChatbotMessage } from "../services/chatbotService";
import "./ChatbotWidget.css";

const SUGGESTIONS = [
  "Ask about products",
  "Get recommendations",
  "Track my order",
  "Help me choose",
  "Ask anything",
];

const createId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const ChatbotWidget = () => {
  const { isAuthenticated, name, role } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);

  const initialWelcome = useMemo(() => {
    const who = isAuthenticated
      ? `${name ? name.split(" ")[0] : "there"}${role ? ` (${role})` : ""}`
      : "there";

    return {
      id: createId(),
      role: "bot",
      text: `Hi ${who}! I’m the CapShop assistant. Ask me about products, recommendations, or order tracking.`,
      at: new Date().toISOString(),
    };
  }, [isAuthenticated, name, role]);

  const [messages, setMessages] = useState(() => [initialWelcome]);

  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const endRef = useRef(null);

  // Keep the welcome message aligned with auth changes without duplicating messages.
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 0) return [initialWelcome];
      const first = prev[0];
      if (first.role !== "bot") return [initialWelcome, ...prev];
      return [{ ...first, text: initialWelcome.text }, ...prev.slice(1)];
    });
  }, [initialWelcome]);

  useEffect(() => {
    if (isOpen) {
      // small delay to ensure element is visible
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    endRef.current?.scrollIntoView({ block: "end" });
  }, [isOpen, messages, isLoading]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    const onMouseDown = (e) => {
      const rootEl = rootRef.current;
      if (!rootEl) return;
      if (rootEl.contains(e.target)) return;

      // Click outside closes the panel.
      setIsOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousedown", onMouseDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", onMouseDown);
    };
  }, [isOpen]);

  const appendMessage = (message) => {
    setMessages((prev) => [...prev, message]);
  };

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMsg = {
      id: createId(),
      role: "user",
      text: trimmed,
      at: new Date().toISOString(),
    };

    appendMessage(userMsg);
    setDraft("");

    setIsLoading(true);

    try {
      const response = await sendChatbotMessage({
        message: trimmed,
        conversationId,
      });

      if (response?.conversationId) {
        setConversationId(response.conversationId);
      }

      const replyText =
        response?.reply?.trim() ||
        "I’m here to help. Try asking about products, recommendations, or tracking an order.";

      appendMessage({
        id: createId(),
        role: "bot",
        text: replyText,
        at: new Date().toISOString(),
      });
    } catch (err) {
      appendMessage({
        id: createId(),
        role: "bot",
        text:
          "I couldn’t reach the assistant service right now. Please try again in a moment.",
        at: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    sendMessage(draft);
  };

  return (
    <div ref={rootRef} className="capshop-chatbot" aria-live="polite">
      <div className="capshop-chatbot-launcher">
        <Button
          type="button"
          variant="primary"
          className="capshop-chatbot-launcher-btn"
          onClick={() => setIsOpen((v) => !v)}
          aria-label={isOpen ? "Close chat" : "Open chat"}
          aria-expanded={isOpen}
        >
          <RiRobot2Line size={22} />
        </Button>
      </div>

      {isOpen && (
        <div
          className="capshop-chatbot-panel"
          role="dialog"
          aria-label="CapShop assistant"
        >
          <div className="capshop-chatbot-header">
            <div className="capshop-chatbot-title">
              <div className="capshop-chatbot-title-icon">
                <RiRobot2Line size={18} />
              </div>
              <div>
                <div className="capshop-chatbot-title-text">CapShop Assistant</div>
                <div className="capshop-chatbot-subtitle">
                  {isAuthenticated ? "Personalized help" : "Shopping help"}
                </div>
              </div>
            </div>

            <Button
              type="button"
              variant="light"
              className="capshop-chatbot-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              <IoClose size={18} />
            </Button>
          </div>

          <div className="capshop-chatbot-body">
            <div className="capshop-chatbot-suggestions">
              {SUGGESTIONS.map((label) => (
                <button
                  key={label}
                  type="button"
                  className="capshop-chatbot-chip"
                  onClick={() => sendMessage(label)}
                  disabled={isLoading}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="capshop-chatbot-messages">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={
                    m.role === "user"
                      ? "capshop-chatbot-message capshop-chatbot-message-user"
                      : "capshop-chatbot-message capshop-chatbot-message-bot"
                  }
                >
                  <div className="capshop-chatbot-bubble">{m.text}</div>
                </div>
              ))}

              {isLoading && (
                <div className="capshop-chatbot-message capshop-chatbot-message-bot">
                  <div className="capshop-chatbot-bubble capshop-chatbot-typing">
                    <Spinner
                      animation="border"
                      role="status"
                      size="sm"
                      className="me-2"
                    />
                    Thinking…
                  </div>
                </div>
              )}

              <div ref={endRef} />
            </div>
          </div>

          <form className="capshop-chatbot-footer" onSubmit={onSubmit}>
            <input
              ref={inputRef}
              className="capshop-chatbot-input"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Type a message…"
              disabled={isLoading}
              maxLength={600}
            />
            <button
              type="submit"
              className="capshop-chatbot-send"
              disabled={isLoading || !draft.trim()}
              aria-label="Send message"
            >
              <FiSend size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;
