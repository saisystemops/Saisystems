"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  MessageCircle, X, Send, Phone, Loader2, Bot, User,
  ChevronDown, Shield, CheckCircle, AlertCircle, PhoneCall, Sparkles,
} from "lucide-react";
import { siteConfig } from "@/lib/config";
import { trackAIChatMessage, trackWhatsAppClick } from "@/lib/analytics";
import type { TriageState, CollectedData } from "@/lib/triage-engine";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  action?: string;
  timestamp: Date;
}

interface ScoreBreakdown {
  contactVerified: number;
  issueClarity: number;
  locationValid: number;
  customerHistory: number;
  responseQuality: number;
  total: number;
}

// ── State stage labels & progress ─────────────────────────────────────────────
const STAGE_CONFIG: Record<TriageState, { label: string; step: number; color: string }> = {
  greeting:           { label: "Welcome",      step: 0, color: "bg-gray-400" },
  collect_device:     { label: "Device Info",  step: 1, color: "bg-blue-500" },
  collect_issue:      { label: "Issue Details",step: 2, color: "bg-orange-500" },
  collect_contact:    { label: "Contact Info", step: 3, color: "bg-purple-500" },
  verify:             { label: "Verifying",    step: 4, color: "bg-yellow-500" },
  auto_approve:       { label: "Approved ✓",   step: 5, color: "bg-green-500" },
  service_desk_review:{ label: "Under Review", step: 5, color: "bg-blue-500" },
  ask_more:           { label: "More Info",    step: 3, color: "bg-orange-400" },
  escalated:          { label: "Escalated ✓",  step: 5, color: "bg-green-500" },
  resolved:           { label: "Resolved ✓",   step: 5, color: "bg-green-500" },
};
const TOTAL_STEPS = 5;

const QUICK_ACTIONS = [
  { label: "💻 Book Repair",     message: "I want to book a repair service" },
  { label: "💰 Get Quote",       message: "I need a price quote for my laptop" },
  { label: "🔍 Track Repair",    message: "Check my repair status" },
  { label: "📞 Talk to Agent",   message: "I want to speak to a human agent" },
];

function generateId(offset = 0): string {
  return (Date.now() + offset).toString();
}

// ── Collected data chips ──────────────────────────────────────────────────────
function DataChips({ data }: { data: Partial<CollectedData> }) {
  const chips = [
    data.deviceBrand && `💻 ${data.deviceBrand}${data.deviceModel ? ` ${data.deviceModel}` : ""}`,
    data.issueCategory && `🔧 ${data.issueCategory.replace(/_/g, " ")}`,
    data.location && `📍 ${data.location}`,
    data.customerName && `👤 ${data.customerName}`,
    data.customerPhone && `📞 ${data.customerPhone}`,
  ].filter(Boolean) as string[];

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 px-3 pt-1 pb-2 border-t border-gray-100 dark:border-gray-800">
      {chips.map((chip) => (
        <span
          key={chip}
          className="text-[10px] px-2 py-0.5 bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900 rounded-full font-medium"
        >
          {chip}
        </span>
      ))}
    </div>
  );
}

// ── Progress bar ──────────────────────────────────────────────────────────────
function TriageProgress({ state }: { state: TriageState }) {
  const config = STAGE_CONFIG[state] || STAGE_CONFIG.greeting;
  const pct = Math.round((config.step / TOTAL_STEPS) * 100);

  return (
    <div className="px-4 py-1.5 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-gray-500 font-medium">{config.label}</span>
        <span className="text-[10px] text-gray-400">{pct}%</span>
      </div>
      <div className="h-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${config.color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ── Score badge (shown after verify) ─────────────────────────────────────────
function ScoreBadge({ score }: { score: ScoreBreakdown }) {
  const color =
    score.total >= 90 ? "text-green-500" :
    score.total >= 70 ? "text-yellow-500" :
    "text-orange-500";

  const icon =
    score.total >= 90 ? <CheckCircle size={12} /> :
    score.total >= 70 ? <Shield size={12} /> :
    <AlertCircle size={12} />;

  const label =
    score.total >= 90 ? "Auto-approved" :
    score.total >= 70 ? "Under Review" :
    "More Info Needed";

  return (
    <div className={`flex items-center gap-1.5 text-[11px] font-semibold ${color} mt-1`}>
      {icon}
      AI Score: {score.total}/100 — {label}
    </div>
  );
}

// ── Main Widget ───────────────────────────────────────────────────────────────
export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Triage state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [triageState, setTriageState] = useState<TriageState>("greeting");
  const [collectedData, setCollectedData] = useState<Partial<CollectedData>>({});
  const [history, setHistory] = useState<Array<{ role: string; content: string }>>([]);
  const [lastScore, setLastScore] = useState<ScoreBreakdown | null>(null);
  const [ticketRef, setTicketRef] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! 👋 I'm **Sai Assistant**, your AI assistant at Sai Systems. I'm here to help you book a repair, get a quote, or connect you with our team. What device can I help you with today?",
      timestamp: new Date(),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) inputRef.current?.focus();
  }, [isOpen, isMinimized]);

  const handleOpen = () => {
    setIsOpen(true);
    if (!sessionId) {
      setSessionId(`sess-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
    }
  };

  const handleWhatsApp = useCallback((message?: string) => {
    const msg = message || "Hello! I need assistance with my computer/laptop.";
    trackWhatsAppClick(msg);
    window.open(`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(msg)}`, "_blank");
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: generateId(),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    trackAIChatMessage(messages.length + 1);

    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          sessionId,
          currentState: triageState,
          history,
          collectedData,
        }),
      });

      const data = await res.json();

      // Update triage state
      if (data.state) setTriageState(data.state as TriageState);
      if (data.collectedData) setCollectedData(data.collectedData);
      if (data.history) setHistory(data.history);
      if (data.score) setLastScore(data.score);
      if (data.ticketRef) setTicketRef(data.ticketRef);
      if (data.sessionId && !sessionId) setSessionId(data.sessionId);

      const assistantMsg: Message = {
        id: generateId(1),
        role: "assistant",
        content: data.text || "I'm here to help! Could you provide more details?",
        action: data.action,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(1),
          role: "assistant",
          content: "Sorry, I'm having trouble connecting. Please reach us on WhatsApp for immediate help!",
          action: "whatsapp_handoff",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, messages.length, sessionId, triageState, history, collectedData]);

  const handleManualEscalation = useCallback(async () => {
    if (!sessionId) {
      handleWhatsApp();
      return;
    }
    try {
      await fetch("/api/ai-chat/handoff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, collectedData, reason: "manual_button" }),
      });

      const msg: Message = {
        id: generateId(),
        role: "assistant",
        content: "✅ You've been connected to our service team! A team member will WhatsApp you shortly at **" + (collectedData.customerPhone || "your number") + "**. Our response time is typically under 30 minutes. 🙏",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, msg]);
      setTriageState("escalated");
    } catch {
      handleWhatsApp();
    }
  }, [sessionId, collectedData, handleWhatsApp]);

  // ── Render message ──────────────────────────────────────────────────────────
  const renderMessage = (msg: Message) => {
    const formatted = msg.content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br/>");

    const isEscalated = triageState === "auto_approve" || triageState === "escalated" || triageState === "service_desk_review";

    return (
      <div key={msg.id} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
        <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs ${
          msg.role === "assistant" ? "bg-green-600 text-white" : "bg-gray-700 text-white"
        }`}>
          {msg.role === "assistant" ? <Bot size={14} /> : <User size={14} />}
        </div>

        <div className={`max-w-[82%] flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}>
          <div
            className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
              msg.role === "user"
                ? "bg-green-600 text-white rounded-tr-sm"
                : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-sm"
            }`}
            dangerouslySetInnerHTML={{ __html: formatted }}
          />

          {/* Score badge */}
          {msg.role === "assistant" && lastScore && isEscalated &&
            messages[messages.length - 1]?.id === msg.id && (
            <ScoreBadge score={lastScore} />
          )}

          {/* Ticket ref */}
          {msg.role === "assistant" && ticketRef && isEscalated &&
            messages[messages.length - 1]?.id === msg.id && (
            <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
              <Sparkles size={11} className="text-green-500" />
              Ticket: <span className="font-mono font-semibold text-green-600 dark:text-green-400">{ticketRef}</span>
            </div>
          )}

          {/* Action buttons */}
          {msg.action === "whatsapp_handoff" && (
            <button
              onClick={() => handleWhatsApp()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#25d366] text-white text-xs font-semibold rounded-full hover:bg-[#20bd5a] transition-all mt-1"
            >
              <MessageCircle size={12} /> Chat on WhatsApp
            </button>
          )}
          {msg.action === "book_service" && (
            <a
              href="/book-service"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-700 text-white text-xs font-semibold rounded-full hover:bg-green-800 transition-all mt-1"
            >
              📅 Open Booking Form
            </a>
          )}
          {msg.action === "check_status" && (
            <a
              href="/track"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-full hover:bg-blue-700 transition-all mt-1"
            >
              🔍 Track My Repair
            </a>
          )}
        </div>
      </div>
    );
  };

  // ── Closed state ────────────────────────────────────────────────────────────
  if (!isOpen) {
    return (
      <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end gap-2">
        <div className="relative">
          <button
            id="ai-chat-open-btn"
            onClick={handleOpen}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-green-600 to-emerald-700 text-white shadow-xl hover:shadow-green-500/30 hover:scale-110 transition-all flex items-center justify-center"
            aria-label="Open AI Chat"
          >
            <Bot size={24} />
          </button>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-ping" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full" />
        </div>
      </div>
    );
  }

  const isCompleted = ["auto_approve", "escalated", "service_desk_review", "resolved"].includes(triageState);

  // ── Open state ──────────────────────────────────────────────────────────────
  return (
    <div className={`fixed bottom-24 right-4 z-50 w-80 sm:w-96 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden transition-all duration-300 ${
      isMinimized ? "h-14" : "h-[560px]"
    }`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 to-emerald-600 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Bot size={16} className="text-white" />
          </div>
          <div>
            <p className="text-white text-sm font-bold">Sai Assistant — AI Assistant</p>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
              <span className="text-green-100 text-xs">Online · AI-Powered Triage</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleManualEscalation}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
            title="Talk to Human Agent"
          >
            <PhoneCall size={14} className="text-white" />
          </button>
          <button
            onClick={() => handleWhatsApp()}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
            title="Switch to WhatsApp"
          >
            <Phone size={14} className="text-white" />
          </button>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
          >
            <ChevronDown size={14} className={`text-white transition-transform ${isMinimized ? "rotate-180" : ""}`} />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
          >
            <X size={14} className="text-white" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Triage progress bar */}
          <TriageProgress state={triageState} />

          {/* Collected data chips */}
          <DataChips data={collectedData} />

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50 dark:bg-gray-950">
            {messages.map(renderMessage)}

            {isLoading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                  <Bot size={14} className="text-white" />
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-2xl rounded-tl-sm flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin text-green-600" />
                  <span className="text-xs text-gray-500">Sai Assistant is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions (only at start) */}
          {messages.length <= 1 && (
            <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
              <div className="flex flex-wrap gap-1.5">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => sendMessage(action.message)}
                    className="text-xs px-2.5 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-green-100 dark:hover:bg-green-900 hover:text-green-700 dark:hover:text-green-400 transition-all"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input — hide when completed */}
          {!isCompleted && (
            <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex-shrink-0">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  id="ai-chat-input"
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
                  placeholder="Type your message..."
                  disabled={isLoading}
                  className="flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-xl border-0 outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white placeholder-gray-400 disabled:opacity-50"
                />
                <button
                  id="ai-chat-send-btn"
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isLoading}
                  className="w-9 h-9 rounded-xl bg-green-700 text-white flex items-center justify-center hover:bg-green-800 transition-all disabled:opacity-40 flex-shrink-0"
                >
                  <Send size={14} />
                </button>
              </div>
              <p className="text-center text-gray-400 text-xs mt-1.5">
                Powered by Gemini AI ·{" "}
                <button onClick={handleManualEscalation} className="text-green-600 hover:underline">
                  Talk to Human
                </button>
              </p>
            </div>
          )}

          {/* Completed state footer */}
          {isCompleted && (
            <div className="px-4 py-3 bg-green-50 dark:bg-green-950/30 border-t border-green-100 dark:border-green-900 flex items-center gap-2 flex-shrink-0">
              <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
              <p className="text-xs text-green-700 dark:text-green-400 font-medium">
                Request sent! Our team will WhatsApp you shortly.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
