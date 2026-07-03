/**
 * SAI AI Triage Engine
 * Implements a LangGraph-style state machine that guides customers through
 * a structured triage flow, verifies genuineness via an AI score (0-100),
 * and escalates to the human service desk via WhatsApp.
 *
 * States:
 *   greeting → collect_device → collect_issue → collect_contact
 *     → verify → [auto_approve | review | ask_more | escalate]
 */

export type TriageState =
  | "greeting"
  | "collect_device"
  | "collect_issue"
  | "collect_contact"
  | "verify"
  | "auto_approve"
  | "service_desk_review"
  | "ask_more"
  | "escalated"
  | "resolved";

export type TriageAction =
  | "continue"
  | "human_transfer"
  | "whatsapp_handoff"
  | "book_service"
  | "check_status"
  | "create_ticket";

export interface CollectedData {
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  deviceBrand?: string;
  deviceModel?: string;
  issueDescription?: string;
  issueCategory?: string;
  location?: string;
  urgency?: "low" | "normal" | "high" | "emergency";
  previousTickets?: number;
  issueClarityScore?: number;
  locationValidScore?: number;
  responseQualityScore?: number;
}

export interface TriageScoreBreakdown {
  contactVerified: number;       // 0-25: phone/email quality
  issueClarity: number;          // 0-25: specific, meaningful description
  locationValid: number;         // 0-20: city/area mentioned
  customerHistory: number;       // 0-15: returning vs new customer
  responseQuality: number;       // 0-15: not spam/nonsense
  total: number;                 // 0-100
}

export interface TriageResult {
  text: string;
  nextState: TriageState;
  action?: TriageAction;
  collectedData: Partial<CollectedData>;
  score?: TriageScoreBreakdown;
  sessionId: string;
  suggestEscalation?: boolean;
}

// ── Gemini helper ─────────────────────────────────────────────────────────────

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

async function callGemini(prompt: string, maxTokens = 400): Promise<string> {
  if (!GEMINI_API_KEY) return "";
  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: maxTokens, temperature: 0.4 },
    });
    return result.response.text().trim();
  } catch (err) {
    console.error("Gemini error:", err);
    return "";
  }
}

// ── Extract structured data from conversation ─────────────────────────────────

async function extractData(
  history: Array<{ role: string; content: string }>,
  current: Partial<CollectedData>
): Promise<Partial<CollectedData>> {
  const conversationText = history.map((m) => `${m.role}: ${m.content}`).join("\n");

  const prompt = `You are a data extraction and triage evaluation assistant. From the following customer service conversation, extract the details and rate the response quality.
Return ONLY a JSON object with these fields (use null if the information is missing):
{
  "customerName": "string or null",
  "customerPhone": "string (10-12 digits) or null",
  "customerEmail": "string or null",
  "deviceBrand": "HP|Dell|Lenovo|Acer|Asus|MSI|Samsung|Apple|Other or null",
  "deviceModel": "string or null",
  "issueDescription": "clear 1-sentence summary or null",
  "issueCategory": "screen|battery|keyboard|motherboard|ssd|virus|data_recovery|networking|other or null",
  "location": "city name or null",
  "urgency": "low|normal|high|emergency or null",
  "issueClarityScore": an integer 0-25 (Rate the clarity of their issue description. Vague/nonsense = 0, specific/actionable details like brand/model/symptoms = 25),
  "locationValidScore": an integer 0-20 (Rate if the location is a valid city or area in India. Invalid/nonsense = 0, clearly valid Indian area = 20),
  "responseQualityScore": an integer 0-15 (Rate conversation legitimacy. Spam/gibberish/nonsense = 0, natural customer responses = 15)
}

Conversation:
${conversationText}

Current extracted data (preserve if not overridden): ${JSON.stringify(current)}

Return ONLY the JSON, no explanation.`;

  const raw = await callGemini(prompt, 350);
  try {
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);
    // Merge with existing, new values override
    return { ...current, ...Object.fromEntries(Object.entries(parsed).filter(([, v]) => v !== null)) };
  } catch {
    return current;
  }
}

// ── AI Genuineness Scoring ────────────────────────────────────────────────────

async function computeScore(
  data: Partial<CollectedData>
): Promise<TriageScoreBreakdown> {
  const breakdown: TriageScoreBreakdown = {
    contactVerified: 0,
    issueClarity: Number(data.issueClarityScore) || 0,
    locationValid: Number(data.locationValidScore) || 0,
    customerHistory: 0,
    responseQuality: data.hasOwnProperty("responseQualityScore") ? Number(data.responseQualityScore) : 15,
    total: 0,
  };

  // 1. Contact verified (0-25)
  const phone = data.customerPhone || "";
  const email = data.customerEmail || "";
  if (phone.replace(/\D/g, "").length >= 10) breakdown.contactVerified += 20;
  if (email.includes("@") && email.includes(".")) breakdown.contactVerified += 5;

  // 4. Customer history (0-15) — check Supabase for previous tickets
  if (phone) {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (supabaseUrl && serviceKey) {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(supabaseUrl, serviceKey);
        const cleanPhone = phone.replace(/\D/g, "").slice(-10);
        const { data: tickets } = await supabase
          .from("tickets")
          .select("id")
          .or(`customer_contact_phone.like.%${cleanPhone}`)
          .limit(5);

        if (tickets && tickets.length > 0) {
          breakdown.customerHistory = Math.min(15, 8 + tickets.length * 2);
        } else {
          breakdown.customerHistory = 8;
        }
      } else {
        breakdown.customerHistory = 8;
      }
    } catch {
      breakdown.customerHistory = 8;
    }
  } else {
    breakdown.customerHistory = 0;
  }

  breakdown.total = Math.min(
    100,
    breakdown.contactVerified +
      breakdown.issueClarity +
      breakdown.locationValid +
      breakdown.customerHistory +
      breakdown.responseQuality
  );

  return breakdown;
}

// ── State Machine Nodes ───────────────────────────────────────────────────────

const STATE_PROMPTS: Record<string, string> = {
  greeting: `You are Sai Assistant, a friendly AI assistant for Sai Systems — a premium refurbished IT products sales and services company in India.
A customer just started a conversation. Greet them warmly, introduce yourself briefly, and ask what device or service they need help with.
Be concise (2-3 sentences max). End with a clear question.`,

  collect_device: `You are Sai Assistant at Sai Systems. The customer is telling you about their device or service need.
Acknowledge what they said, confirm the details, and ask specifically what problem they're facing or what specifications they require.
Be friendly and professional. Keep it to 2-3 sentences.`,

  collect_issue: `You are Sai Assistant at Sai Systems. The customer has described their issue or requirements.
Acknowledge their needs with empathy, then politely ask for their name and phone number so the sales or support team can contact them.
Keep it to 2-3 sentences.`,

  collect_contact: `You are Sai Assistant at Sai Systems. The customer has provided contact details.
Thank them, confirm what you've collected, and let them know you're verifying their request before connecting them with the service desk.
Mention that a service team member will reach out on WhatsApp. Keep it warm and professional (2-3 sentences).`,

  ask_more: `You are Sai Assistant at Sai Systems. You need more information to properly assist this customer.
Their request seems incomplete. Ask 1-2 specific clarifying questions to better understand their issue or product preference.
Be helpful and non-judgmental. Keep it concise.`,
};

async function runStateNode(
  state: TriageState,
  userMessage: string,
  history: Array<{ role: string; content: string }>,
  collectedData: Partial<CollectedData>
): Promise<{ text: string; nextState: TriageState; action?: TriageAction }> {
  const systemPrompt = STATE_PROMPTS[state] || STATE_PROMPTS.greeting;

  const conversationContext = history.slice(-6).map((m) => `${m.role === "user" ? "Customer" : "Sai Assistant"}: ${m.content}`).join("\n");

  const prompt = `${systemPrompt}

Current collected info: ${JSON.stringify(collectedData)}
Recent conversation:
${conversationContext}
Customer just said: "${userMessage}"

Respond as Sai Assistant:`;

  const text = await callGemini(prompt, 200);

  // Determine next state based on current state and collected data
  let nextState: TriageState = state;
  let action: TriageAction | undefined;

  // Check if user explicitly wants human/WhatsApp
  const lowMsg = userMessage.toLowerCase();
  if (
    lowMsg.includes("human") ||
    lowMsg.includes("agent") ||
    lowMsg.includes("talk to someone") ||
    lowMsg.includes("speak to") ||
    lowMsg.includes("person")
  ) {
    return {
      text: "Of course! Let me connect you with our service team right away. 💬 One moment...",
      nextState: "escalated",
      action: "human_transfer",
    };
  }

  switch (state) {
    case "greeting":
      nextState = "collect_device";
      break;
    case "collect_device":
      nextState = collectedData.deviceBrand ? "collect_issue" : "collect_device";
      break;
    case "collect_issue":
      nextState = collectedData.issueDescription ? "collect_contact" : "collect_issue";
      break;
    case "collect_contact":
      nextState = collectedData.customerPhone ? "verify" : "collect_contact";
      break;
    case "verify":
    case "ask_more":
      nextState = "verify";
      break;
    default:
      nextState = state;
  }

  return { text: text || getFallbackResponse(state), nextState, action };
}

function getFallbackResponse(state: TriageState): string {
  const fallbacks: Record<string, string> = {
    greeting: "Hello! 👋 I'm Sai Assistant, your AI assistant at Sai Systems. How can I help you with refurbished laptops/desktops or IT services today?",
    collect_device: "Got it! What issue are you experiencing or what specific requirements do you have?",
    collect_issue: "I understand. To proceed, could I get your name and phone number please?",
    collect_contact: "Thank you! I'm verifying your request now and will connect you with our team shortly.",
    ask_more: "Could you provide a bit more detail about what you need?",
    verify: "Checking your request now...",
  };
  return fallbacks[state] || "I'm here to help! Could you tell me more about what you need?";
}

// ── Main Triage Function ──────────────────────────────────────────────────────

export interface TriageInput {
  sessionId: string;
  currentState: TriageState;
  userMessage: string;
  history: Array<{ role: string; content: string }>;
  collectedData: Partial<CollectedData>;
}

export async function runTriage(input: TriageInput): Promise<TriageResult> {
  const { sessionId, currentState, userMessage, history, collectedData } = input;

  // Update history with latest message
  const updatedHistory = [
    ...history,
    { role: "user", content: userMessage },
  ];

  // Parallelize data extraction and conversation node selection to cut response time in half
  const [updatedData, stateNodeResult] = await Promise.all([
    extractData(updatedHistory, collectedData),
    runStateNode(currentState, userMessage, updatedHistory, collectedData),
  ]);

  const { text, nextState, action } = stateNodeResult;

  // If we've reached verify state, compute score
  if (nextState === "verify" || currentState === "verify") {
    const score = await computeScore(updatedData);

    let finalState: TriageState;
    let finalAction: TriageAction | undefined;
    let responseText = text;

    if (score.total >= 90) {
      finalState = "auto_approve";
      finalAction = "create_ticket";
      responseText = `✅ Great news! Your request has been verified and I've created a service ticket for you.

📋 **Summary:**
${updatedData.deviceBrand ? `💻 Device: ${updatedData.deviceBrand} ${updatedData.deviceModel || ""}` : ""}
${updatedData.issueDescription ? `🔧 Issue: ${updatedData.issueDescription}` : ""}
${updatedData.customerName ? `👤 Name: ${updatedData.customerName}` : ""}

Our service team will contact you on WhatsApp at **${updatedData.customerPhone || "your number"}** shortly. Expected response: within 30 minutes. 🙏`;

    } else if (score.total >= 70) {
      finalState = "service_desk_review";
      finalAction = "human_transfer";
      responseText = `Thank you for the details! 🙏 I've flagged your request to our service desk team for review.

A team member will WhatsApp you at **${updatedData.customerPhone || "your number"}** to confirm the service. This usually takes 15-30 minutes.

Is there anything else you'd like to add before I pass this along?`;

    } else {
      finalState = "ask_more";
      // Generate targeted clarification question locally instead of hitting LLM
      const missingFields: string[] = [];
      if (!updatedData.deviceBrand) missingFields.push("device brand and model");
      if (!updatedData.issueDescription || updatedData.issueDescription.length < 15) missingFields.push("a clear description of the problem");
      if (!updatedData.customerPhone) missingFields.push("your phone number");
      if (!updatedData.location) missingFields.push("your location/city");

      responseText = `To proceed with your request, could you please share your ${missingFields.join(" and ")}? This helps our team prepare the right solution for you! 🛠️`;
    }

    return {
      text: responseText,
      nextState: finalState,
      action: finalAction,
      collectedData: updatedData,
      score,
      sessionId,
      suggestEscalation: finalState === "service_desk_review" || finalState === "auto_approve",
    };
  }

  // Handle explicit escalation
  if (nextState === "escalated" || action === "human_transfer") {
    return {
      text,
      nextState: "escalated",
      action: "human_transfer",
      collectedData: updatedData,
      sessionId,
      suggestEscalation: true,
    };
  }

  return {
    text: text || getFallbackResponse(currentState),
    nextState,
    action,
    collectedData: updatedData,
    sessionId,
  };
}

// ── WhatsApp Message Formatter ────────────────────────────────────────────────

export function formatHandoffMessage(
  data: Partial<CollectedData>,
  ticketRef: string,
  score?: TriageScoreBreakdown
): string {
  const urgencyEmoji = {
    emergency: "🔴",
    high: "🟠",
    normal: "🟡",
    low: "🟢",
  }[data.urgency || "normal"] || "🟡";

  const lines = [
    `🔔 *NEW SERVICE REQUEST — SAI*`,
    `🎫 Ticket: *${ticketRef}*`,
    ``,
    `👤 *Customer:* ${data.customerName || "Not provided"}`,
    `📞 *Phone:* ${data.customerPhone || "Not provided"}`,
    data.customerEmail ? `✉️ *Email:* ${data.customerEmail}` : null,
    ``,
    `💻 *Device:* ${[data.deviceBrand, data.deviceModel].filter(Boolean).join(" ") || "Not specified"}`,
    `🔧 *Issue:* ${data.issueDescription || "Not described"}`,
    data.location ? `📍 *Location:* ${data.location}` : null,
    `${urgencyEmoji} *Urgency:* ${(data.urgency || "normal").toUpperCase()}`,
    ``,
    score ? `✅ *AI Verification Score:* ${score.total}/100` : null,
    score ? `   • Contact: ${score.contactVerified}/25 | Issue: ${score.issueClarity}/25` : null,
    score ? `   • Location: ${score.locationValid}/20 | History: ${score.customerHistory}/15 | Quality: ${score.responseQuality}/15` : null,
    ``,
    `🕐 *Time:* ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`,
    `📲 *Channel:* AI Chat`,
  ];

  return lines.filter((l) => l !== null).join("\n");
}
