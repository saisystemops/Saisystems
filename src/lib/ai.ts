// Gemini AI integration for the chat assistant
// Falls back to rule-based responses if no API key

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AIResponse {
  text: string;
  intent?: string;
  action?: "book_service" | "get_quote" | "check_status" | "whatsapp_handoff" | "create_ticket" | "human_transfer";
  data?: Record<string, unknown>;
}

const SYSTEM_PROMPT = `You are Sai Assistant, an AI assistant for Sai Systems — a professional computer and laptop repair company in India. 

Your role is to:
1. Help customers book computer/laptop repair services
2. Provide instant quotes for common repairs
3. Check repair status
4. Create support tickets
5. Answer questions about services

Available services: Laptop Repair, Computer Repair, Screen Replacement, Motherboard Repair, Battery Replacement, Keyboard Repair, SSD Upgrade, RAM Upgrade, Virus Removal, Data Recovery, Networking Setup, Printer Repair, Monitor Repair, IT AMC Support, Business IT Support.

Supported brands: HP, Dell, Lenovo, Acer, Asus, MSI, Samsung, Toshiba, Compaq, HCL, Panasonic.

Price ranges (approximate):
- Laptop Screen Repair: ₹2,500 – ₹8,000
- Battery Replacement: ₹1,200 – ₹3,500
- Keyboard Replacement: ₹1,500 – ₹4,000
- Motherboard Repair: ₹3,000 – ₹12,000
- SSD Upgrade (512GB): ₹3,500 – ₹5,000
- RAM Upgrade (8GB): ₹2,500 – ₹4,000
- Virus Removal: ₹800 – ₹1,500
- Data Recovery: ₹2,000 – ₹8,000

USPs:
- Free diagnosis
- 365-day warranty on all repairs
- Doorstep service available
- Genuine spare parts
- Certified technicians with 10+ years experience
- Same-day service for many issues

When collecting info for booking: ask for device brand, model, issue description, customer name, phone.
Be concise, friendly, and professional. Respond in 2-3 sentences max unless listing services.
Always end with a clear next step or question.

If the user wants to:
- Book: Guide them step by step
- Get quote: Ask device brand, model, and problem
- Check status: Ask for ticket number or phone number
- Talk to human: Offer WhatsApp handoff

IMPORTANT: Always respond in English. Use ₹ for Indian Rupees.`;

// Intelligent rule-based fallback (no API key required)
function ruleBasedResponse(message: string): AIResponse {
  const msg = message.toLowerCase();

  if (msg.includes("book") || msg.includes("appointment") || msg.includes("schedule")) {
    return {
      text: "I'd love to help you book a service! 📅 Please visit our **Book Service** page, or tell me: what device do you have (brand + model) and what's the issue?",
      intent: "booking",
      action: "book_service",
    };
  }
  if (msg.includes("quote") || msg.includes("price") || msg.includes("cost") || msg.includes("how much") || msg.includes("rate")) {
    return {
      text: "I can give you a quick estimate! 💰 Please share: **1) Your device brand & model** and **2) The problem you're facing** — and I'll provide an approximate quote instantly.",
      intent: "quote",
    };
  }
  if (msg.includes("status") || msg.includes("track") || msg.includes("repair status")) {
    return {
      text: "To check your repair status, please share your **ticket number** or **registered phone number**. Alternatively, log into your customer portal for live updates. 🔍",
      intent: "status",
      action: "check_status",
    };
  }
  if (msg.includes("laptop screen") || msg.includes("broken screen") || msg.includes("cracked screen")) {
    return {
      text: "Laptop screen repairs typically cost **₹2,500 – ₹8,000** depending on your brand and screen type (HD/FHD/4K). We use genuine screens with a **365-day warranty**. Want me to book a free diagnosis?",
      intent: "service_inquiry",
    };
  }
  if (msg.includes("battery") || msg.includes("not charging")) {
    return {
      text: "Battery replacement costs **₹1,200 – ₹3,500** depending on your laptop model. We provide genuine batteries with **6-month warranty**. Free diagnosis included! Should I check availability for doorstep service?",
      intent: "service_inquiry",
    };
  }
  if (msg.includes("motherboard") || msg.includes("chip level") || msg.includes("not turning on") || msg.includes("dead laptop")) {
    return {
      text: "Motherboard/chip-level repairs range from **₹3,000 – ₹12,000** depending on the fault. Our certified engineers handle BGA reballing and IC-level repairs. Want a free diagnosis first?",
      intent: "service_inquiry",
    };
  }
  if (msg.includes("ssd") || msg.includes("slow laptop") || msg.includes("slow computer")) {
    return {
      text: "An **SSD upgrade** is the fastest way to speed up your laptop! A 512GB SSD upgrade costs **₹3,500 – ₹5,000** (including migration of all your data). Turnaround time: same day! Want to book?",
      intent: "service_inquiry",
    };
  }
  if (msg.includes("virus") || msg.includes("malware") || msg.includes("hacked") || msg.includes("antivirus")) {
    return {
      text: "Virus/malware removal costs **₹800 – ₹1,500** and takes 2-4 hours. We also install genuine antivirus software (K7, Quick Heal) at discounted rates. Want to book an appointment?",
      intent: "service_inquiry",
    };
  }
  if (msg.includes("whatsapp") || msg.includes("human") || msg.includes("agent") || msg.includes("talk to")) {
    return {
      text: "Connecting you to our WhatsApp team! 💬 Click the button below to chat directly with our support team — they're available Mon-Sat, 9 AM to 7 PM.",
      intent: "handoff",
      action: "whatsapp_handoff",
    };
  }
  if (msg.includes("data recovery") || msg.includes("lost data") || msg.includes("deleted files")) {
    return {
      text: "Data recovery services range from **₹2,000 – ₹8,000** depending on the type of loss (logical/physical). We have a **high success rate** for HDD, SSD, and pen drives. No recovery = no charge! Want to book?",
      intent: "service_inquiry",
    };
  }
  if (msg.includes("networking") || msg.includes("wifi") || msg.includes("internet") || msg.includes("router")) {
    return {
      text: "We handle home and business networking setup, WiFi configuration, structured cabling, and troubleshooting. Charges start from **₹500** for basic setup. Doorstep service available! Want to book?",
      intent: "service_inquiry",
    };
  }
  if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey") || msg.includes("namaste") || msg.includes("start")) {
    return {
      text: "Hello! 👋 I'm **Sai Assistant**, your AI assistant at Sai Systems. I can help you **book a repair**, **get a quote**, **track your repair**, or answer any questions. What can I help you with today?",
      intent: "greeting",
    };
  }
  if (msg.includes("service") || msg.includes("repair") || msg.includes("fix")) {
    return {
      text: "We offer **30+ repair services** including laptop, computer, screen, motherboard, battery, keyboard, SSD upgrade, data recovery, virus removal, networking, and more. Which device needs attention?",
      intent: "services",
    };
  }

  return {
    text: "Great question! 😊 For the most accurate answer, could you tell me more about your issue? Or I can connect you with our team on **WhatsApp** for immediate assistance.",
    intent: "fallback",
    action: "whatsapp_handoff",
  };
}

export async function chatWithSaiAssistant(
  messages: ChatMessage[],
  userMessage: string
): Promise<AIResponse> {
  // Try Gemini first
  if (GEMINI_API_KEY) {
    try {
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const history = messages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      const chat = model.startChat({
        history,
        systemInstruction: SYSTEM_PROMPT,
        generationConfig: {
          maxOutputTokens: 300,
          temperature: 0.7,
        },
      });

      const result = await chat.sendMessage(userMessage);
      const text = result.response.text();

      // Detect intent from response
      let action: AIResponse["action"] = undefined;
      if (text.toLowerCase().includes("whatsapp") || text.toLowerCase().includes("connect you")) {
        action = "whatsapp_handoff";
      }

      return { text, action };
    } catch (error) {
      console.error("Gemini AI error:", error);
      // Fall through to rule-based
    }
  }

  // Rule-based fallback
  return ruleBasedResponse(userMessage);
}
