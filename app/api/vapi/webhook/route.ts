import { NextRequest, NextResponse } from "next/server";

/**
 * Vapi Voice Agent Webhook Handler
 * POST /api/vapi/webhook
 *
 * Handles inbound voice call events from Vapi and drives
 * the same triage engine as the chat widget.
 *
 * Event types handled:
 *  - assistant-request   → provide assistant config
 *  - call-start          → initialize triage session
 *  - transcript          → process speech transcript through triage
 *  - call-end            → finalize, create ticket if needed
 *  - function-call       → handle tool calls from Vapi assistant
 */

// ── Vapi types ────────────────────────────────────────────────────────────────
interface VapiMessage {
  type: "assistant-request" | "call-start" | "call-end" | "transcript" | "function-call" | "status-update";
  call?: {
    id: string;
    phoneNumber?: string;
    customer?: { number?: string; name?: string };
  };
  transcript?: string;
  functionCall?: {
    name: string;
    parameters: Record<string, unknown>;
  };
  status?: string;
}

// ── In-memory voice session store (production: use Supabase) ─────────────────
const voiceSessions = new Map<string, {
  state: string;
  collectedData: Record<string, string | number | undefined>;
  history: Array<{ role: string; content: string }>;
}>();

// ── Vapi assistant configuration ──────────────────────────────────────────────
function getAssistantConfig() {
  return {
    name: "Sai Assistant",
    voice: {
      provider: "11labs",
      voiceId: "21m00Tcm4TlvDq8ikWAM", // Rachel voice — professional, friendly
    },
    model: {
      provider: "openai",
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are Sai Assistant, a professional and warm AI assistant for Sai Systems — a laptop and computer repair company in India.

Your goal is to gather information from the customer to create a service request:
1. Greet and ask what device they have (brand + model)
2. Ask what problem they're facing
3. Ask for their name
4. Confirm their phone number (you already have it from the call)

Keep responses SHORT (under 20 words). Be conversational and natural for voice.
Use simple language. No markdown, no lists. Just natural speech.

When you have device, issue, and name confirmed, call the function "escalate_to_service_desk".

If the customer asks to speak to someone, call "escalate_to_service_desk" immediately.`,
        },
      ],
      functions: [
        {
          name: "escalate_to_service_desk",
          description: "Escalate the customer to the human service desk after collecting their information",
          parameters: {
            type: "object",
            properties: {
              customerName: { type: "string", description: "Customer's name" },
              deviceBrand: { type: "string", description: "Device brand (HP, Dell, etc.)" },
              deviceModel: { type: "string", description: "Device model" },
              issueDescription: { type: "string", description: "Description of the issue" },
              urgency: { type: "string", enum: ["low", "normal", "high", "emergency"] },
            },
            required: ["issueDescription"],
          },
        },
      ],
    },
    firstMessage: "Hello! I'm Sai Assistant from Sai Systems. How can I help you with your laptop or computer today?",
    endCallMessage: "Thank you for calling Sai Systems. Our team will contact you shortly. Goodbye!",
    recordingEnabled: true,
    maxDurationSeconds: 600, // 10 min max
  };
}

// ── Handle function calls from Vapi ──────────────────────────────────────────
async function handleEscalation(
  callId: string,
  customerPhone: string | undefined,
  params: Record<string, unknown>
): Promise<void> {
  try {
    const collectedData = {
      customerName: params.customerName as string | undefined,
      customerPhone: customerPhone?.replace(/\D/g, "").slice(-10),
      deviceBrand: params.deviceBrand as string | undefined,
      deviceModel: params.deviceModel as string | undefined,
      issueDescription: params.issueDescription as string | undefined,
      urgency: (params.urgency as "low" | "normal" | "high" | "emergency") || "normal",
    };

    const year = new Date().getFullYear();
    const rand = Math.floor(100000 + Math.random() * 900000);
    const ticketRef = `SAI-${year}-${rand}`;

    const { formatHandoffMessage } = await import("@/lib/triage-engine");
    const waMessage = `📞 *VOICE CALL REQUEST — SAI*\n` + formatHandoffMessage(collectedData, ticketRef);

    // Save to Supabase
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (url && key) {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(url, key);

      const { data: ticket } = await supabase
        .from("tickets")
        .insert({
          ticket_ref: ticketRef,
          title: `[VOICE] ${collectedData.deviceBrand || "Device"} - ${collectedData.issueDescription?.slice(0, 80)}`,
          description: collectedData.issueDescription || "Voice call request",
          customer_name: collectedData.customerName || null,
          customer_contact_name: collectedData.customerName || null,
          customer_contact_phone: collectedData.customerPhone || null,
          priority: collectedData.urgency === "emergency" ? "emergency" : "normal",
          status: "new",
          source: "voice",
        })
        .select("id")
        .single();

      await supabase.from("handoff_queue").insert({
        session_id: callId,
        ticket_ref: ticketRef,
        ticket_id: ticket?.id || null,
        customer_name: collectedData.customerName || "Voice Caller",
        customer_phone: collectedData.customerPhone || "",
        device_info: `${collectedData.deviceBrand || ""} ${collectedData.deviceModel || ""}`.trim(),
        issue_summary: collectedData.issueDescription || "",
        urgency: collectedData.urgency || "normal",
        collected_data: collectedData,
        whatsapp_message: waMessage,
        status: "pending",
        channel: "voice",
      });
    }

    // Send WhatsApp to service desk
    const token = process.env.WHATSAPP_API_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const serviceDesk = (process.env.WHATSAPP_SERVICE_DESK_NUMBER || "918778003397").replace(/\D/g, "");

    if (token && phoneNumberId) {
      await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: serviceDesk,
          type: "text",
          text: { body: waMessage },
        }),
      });
    }
  } catch (err) {
    console.error("Vapi escalation error:", err);
  }
}

// ── Main webhook handler ──────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as VapiMessage;

    switch (body.type) {
      case "assistant-request": {
        // Vapi requests assistant configuration for this call
        return NextResponse.json({ assistant: getAssistantConfig() });
      }

      case "call-start": {
        const callId = body.call?.id || "unknown";
        const phone = body.call?.customer?.number;
        voiceSessions.set(callId, {
          state: "greeting",
          collectedData: { customerPhone: phone },
          history: [],
        });
        return NextResponse.json({ received: true });
      }

      case "function-call": {
        const callId = body.call?.id || "unknown";
        const phone = body.call?.customer?.number;
        const fnName = body.functionCall?.name;
        const params = body.functionCall?.parameters || {};

        if (fnName === "escalate_to_service_desk") {
          // Run async — don't block voice response
          handleEscalation(callId, phone, params).catch(console.error);
          return NextResponse.json({
            result: `Perfect! I've created a service request and our team will call you back shortly. Your ticket reference is ready. Is there anything else I can help you with?`,
          });
        }

        return NextResponse.json({ result: "Acknowledged" });
      }

      case "call-end": {
        const callId = body.call?.id;
        if (callId) voiceSessions.delete(callId);
        return NextResponse.json({ received: true });
      }

      case "transcript":
      case "status-update":
      default:
        return NextResponse.json({ received: true });
    }
  } catch (err) {
    console.error("Vapi webhook error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 200 }); // Always 200 for Vapi
  }
}

// Vapi sends GET to verify webhook URL
export async function GET() {
  return NextResponse.json({ status: "Vapi webhook active", service: "Sai Systems" });
}
