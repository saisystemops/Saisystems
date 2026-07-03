/**
 * Flowise / Dify AI Client
 * ─────────────────────────────────────────────────────────────
 * Calls your self-hosted Flowise (or Dify) prediction API.
 *
 * Flowise free hosting options:
 *   • render.com free tier (recommended)
 *   • railway.app free tier
 *   • fly.io free tier
 *   • localhost (for development)
 *
 * Free AI models you can use inside Flowise:
 *   • Google Gemini 1.5 Flash (1M tokens/day free)
 *   • Groq + Llama 3.3 (30 req/min free — https://console.groq.com)
 *   • Ollama (fully local, offline, zero cost)
 */

export interface FlowiseResponse {
  text: string;
  intent?: "continue" | "handoff" | "booking" | "status" | "quote";
  sessionId?: string;
}

const FLOWISE_URL = process.env.FLOWISE_URL || "";
const FLOWISE_CHATFLOW_ID = process.env.FLOWISE_CHATFLOW_ID || "";
const FLOWISE_API_KEY = process.env.FLOWISE_API_KEY || "";

// ── Dify support ──────────────────────────────────────────────────────────────
const DIFY_URL = process.env.DIFY_URL || "";
const DIFY_API_KEY = process.env.DIFY_API_KEY || "";

/**
 * Send a message to Flowise and get AI response.
 * sessionId = customer phone number → Flowise maintains memory per customer.
 */
export async function askFlowise(
  question: string,
  sessionId: string,
  overrideConfig?: Record<string, unknown>
): Promise<FlowiseResponse> {
  // Try Flowise first
  if (FLOWISE_URL && FLOWISE_CHATFLOW_ID) {
    return callFlowise(question, sessionId, overrideConfig);
  }

  // Try Dify as alternative
  if (DIFY_URL && DIFY_API_KEY) {
    return callDify(question, sessionId);
  }

  // Fallback to Gemini directly (you already have the key)
  return fallbackToGemini(question, sessionId);
}

// ── Flowise ───────────────────────────────────────────────────────────────────
async function callFlowise(
  question: string,
  sessionId: string,
  overrideConfig?: Record<string, unknown>
): Promise<FlowiseResponse> {
  const url = `${FLOWISE_URL.replace(/\/$/, "")}/api/v1/prediction/${FLOWISE_CHATFLOW_ID}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (FLOWISE_API_KEY) {
    headers["Authorization"] = `Bearer ${FLOWISE_API_KEY}`;
  }

  const body: Record<string, unknown> = {
    question,
    sessionId, // Flowise uses this for conversation memory
    streaming: false,
  };

  if (overrideConfig) {
    body.overrideConfig = overrideConfig;
  }

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(25000), // 25s timeout
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Flowise error ${res.status}: ${err}`);
  }

  const data = await res.json();

  // Flowise returns { text } or { answer } depending on node type
  const text = data.text || data.answer || data.output || "";

  return {
    text,
    intent: detectIntent(text),
    sessionId,
  };
}

// ── Dify ──────────────────────────────────────────────────────────────────────
async function callDify(question: string, sessionId: string): Promise<FlowiseResponse> {
  const url = `${DIFY_URL.replace(/\/$/, "")}/v1/chat-messages`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${DIFY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: {},
      query: question,
      response_mode: "blocking",
      conversation_id: "",  // Dify will create one; for continuity store and pass it
      user: sessionId,
    }),
    signal: AbortSignal.timeout(25000),
  });

  if (!res.ok) {
    throw new Error(`Dify error ${res.status}`);
  }

  const data = await res.json();
  const text = data.answer || "";

  return {
    text,
    intent: detectIntent(text),
    sessionId,
  };
}

// ── Gemini fallback (uses existing key) ───────────────────────────────────────
const sessionMemory = new Map<string, Array<{ role: string; content: string }>>();

async function fallbackToGemini(question: string, sessionId: string): Promise<FlowiseResponse> {
  const GEMINI_KEY = process.env.GEMINI_API_KEY || "";
  if (!GEMINI_KEY) {
    return {
      text: "Hello! I'm the AI Assistant from Sai Systems. How can I help you with refurbished laptops, desktops, or services today?",
      intent: "continue",
      sessionId,
    };
  }

  const history = sessionMemory.get(sessionId) || [];

  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(GEMINI_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const chat = model.startChat({
    history: history.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
    systemInstruction: SAI_SYSTEM_PROMPT,
    generationConfig: { maxOutputTokens: 300, temperature: 0.6 },
  });

  const result = await chat.sendMessage(question);
  const text = result.response.text();

  // Update memory (keep last 10 turns)
  history.push({ role: "user", content: question });
  history.push({ role: "assistant", content: text });
  sessionMemory.set(sessionId, history.slice(-20));

  return { text, intent: detectIntent(text), sessionId };
}

// ── Intent detection from AI response text ────────────────────────────────────
function detectIntent(text: string): FlowiseResponse["intent"] {
  const t = text.toLowerCase();

  if (
    t.includes("transfer") ||
    t.includes("human agent") ||
    t.includes("our team will") ||
    t.includes("service desk") ||
    t.includes("connect you") ||
    t.includes("escalat") ||
    t.includes("handoff") ||
    t.includes("[handoff]") ||
    t.includes("HANDOFF")
  ) {
    return "handoff";
  }
  if (t.includes("book") || t.includes("appointment") || t.includes("schedule")) return "booking";
  if (t.includes("status") || t.includes("track") || t.includes("ticket number")) return "status";
  if (t.includes("price") || t.includes("cost") || t.includes("₹") || t.includes("quote")) return "quote";

  return "continue";
}

// ── System prompt for Gemini fallback ────────────────────────────────────────
const SAI_SYSTEM_PROMPT = `You are Sai Assistant, a friendly WhatsApp AI assistant for Sai Systems — a premium refurbished IT products sales & services company in Dindigul, Tamil Nadu, India.

RULES:
- Keep responses SHORT (under 50 words) — this is WhatsApp
- No markdown, no bullet points — plain text only  
- Be warm, professional, and use Indian greeting style
- Always respond in English

YOUR GOALS (in order):
1. Understand what device or service they need (buying refurbished laptop/desktop, printer service, CCTV setup, or chip-level repair)
2. Understand their specific requirements (e.g. wholesale vs retail, number of cameras, printer brand)
3. Collect their name and contact number/location
4. Provide basic info (laptops start from ₹12,000, desktops start from ₹8,000, CCTV setup starts from ₹6,500)
5. If you cannot help OR if they ask for a human → say "I'll connect you with our service team now." and end with [HANDOFF]

Services: Refurbished Laptops & Desktops Sales (Wholesale & Retail), CCTV Camera Installation & AMC, Printer & Scanner Repair, Office Networking, Chip-Level Board Repair
Price guide: Laptops from ₹12,000, Desktops from ₹8,000, CCTV setup from ₹6,500, Printer service from ₹500

When handing off, ALWAYS end your message with exactly: [HANDOFF]`;
