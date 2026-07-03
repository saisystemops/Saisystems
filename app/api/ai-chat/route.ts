import { NextRequest, NextResponse } from "next/server";
import { runTriage, formatHandoffMessage } from "@/lib/triage-engine";
import type { TriageState, CollectedData } from "@/lib/triage-engine";

// ── Ticket reference generator ────────────────────────────────────────────────
function generateTicketRef(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `SAI-${year}-${rand}`;
}

// ── Create ticket in Supabase ─────────────────────────────────────────────────
async function createTicket(data: Partial<CollectedData>, ticketRef: string): Promise<string | null> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return null;

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(url, key);

    const { data: ticket, error } = await supabase
      .from("tickets")
      .insert({
        ticket_ref: ticketRef,
        title: `${data.deviceBrand || "Device"} - ${data.issueDescription?.slice(0, 80) || "Repair Request"}`,
        description: data.issueDescription || "Request via AI Chat",
        customer_name: data.customerName || null,
        customer_contact_name: data.customerName || null,
        customer_contact_phone: data.customerPhone || null,
        category: data.issueCategory || "general",
        priority: data.urgency === "emergency" ? "emergency" : data.urgency === "high" ? "high" : "normal",
        status: "new",
        site_city: data.location || "Hyderabad",
        source: "ai-chat",
      })
      .select("id")
      .single();

    if (error) {
      console.error("Create ticket error:", error);
      return null;
    }
    return ticket?.id || null;
  } catch (err) {
    console.error("Ticket creation failed:", err);
    return null;
  }
}

// ── Create handoff queue entry ────────────────────────────────────────────────
async function createHandoffEntry(
  data: Partial<CollectedData>,
  ticketRef: string,
  ticketId: string | null,
  sessionId: string,
  whatsappMessage: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  score: any
): Promise<void> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return;

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(url, key);

    await supabase.from("handoff_queue").insert({
      session_id: sessionId,
      ticket_ref: ticketRef,
      ticket_id: ticketId,
      customer_name: data.customerName || "Unknown",
      customer_phone: data.customerPhone || "",
      device_info: `${data.deviceBrand || ""} ${data.deviceModel || ""}`.trim(),
      issue_summary: data.issueDescription || "",
      urgency: data.urgency || "normal",
      collected_data: data,
      ai_score: score?.total || null,
      score_breakdown: score || null,
      whatsapp_message: whatsappMessage,
      status: "pending",
    });
  } catch (err) {
    console.error("Handoff queue creation failed:", err);
  }
}

// ── Send WhatsApp notification to service desk ────────────────────────────────
async function sendWhatsAppToServiceDesk(message: string): Promise<boolean> {
  try {
    const token = process.env.WHATSAPP_API_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const serviceDesk = process.env.WHATSAPP_SERVICE_DESK_NUMBER || "919487179676";

    if (!token || !phoneNumberId) {
      console.warn("WhatsApp API not configured — message queued only");
      return false;
    }

    const cleanNumber = serviceDesk.replace(/\D/g, "");
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: cleanNumber,
          type: "text",
          text: { body: message },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error("WhatsApp send failed:", err);
      return false;
    }
    return true;
  } catch (err) {
    console.error("WhatsApp send error:", err);
    return false;
  }
}

// ── Session store (server memory + Supabase) ──────────────────────────────────
async function saveSession(
  sessionId: string,
  state: TriageState,
  collectedData: Partial<CollectedData>,
  history: Array<{ role: string; content: string }>
): Promise<void> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return;

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(url, key);

    await supabase.from("ai_sessions").upsert(
      {
        session_id: sessionId,
        channel: "chat",
        customer_name: collectedData.customerName || null,
        customer_phone: collectedData.customerPhone || null,
        customer_email: collectedData.customerEmail || null,
        device_brand: collectedData.deviceBrand || null,
        device_model: collectedData.deviceModel || null,
        issue_description: collectedData.issueDescription || null,
        triage_state: state,
        full_history: history,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "session_id" }
    );
  } catch (err) {
    console.error("Session save error:", err);
  }
}

// ── Main Route Handler ────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      message,
      sessionId = `sess-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      currentState = "greeting" as TriageState,
      history = [],
      collectedData = {},
    } = body as {
      message: string;
      sessionId?: string;
      currentState?: TriageState;
      history?: Array<{ role: string; content: string }>;
      collectedData?: Partial<CollectedData>;
    };

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    // Run triage engine
    const result = await runTriage({
      sessionId,
      currentState,
      userMessage: message,
      history,
      collectedData,
    });

    // Update history with assistant response
    const newHistory = [
      ...history,
      { role: "user", content: message },
      { role: "assistant", content: result.text },
    ];

    // Save session to Supabase in the background (no await)
    saveSession(sessionId, result.nextState, result.collectedData, newHistory).catch((err) => {
      console.error("Background session save failed:", err);
    });

    // Handle escalation / ticket creation
    let ticketRef: string | null = null;
    let whatsappSent = false;

    if (result.suggestEscalation || result.action === "create_ticket" || result.action === "human_transfer") {
      ticketRef = generateTicketRef();
      whatsappSent = true;

      // Run ticket creation, handoff queue entry, and WhatsApp alerts in the background
      (async () => {
        const ticketId = await createTicket(result.collectedData, ticketRef!);
        const waMessage = formatHandoffMessage(result.collectedData, ticketRef!, result.score);

        // Save to handoff queue
        await createHandoffEntry(
          result.collectedData,
          ticketRef!,
          ticketId,
          sessionId,
          waMessage,
          result.score
        );

        // Send WhatsApp to service desk
        await sendWhatsAppToServiceDesk(waMessage);
      })().catch((err) => {
        console.error("Background escalation task failed:", err);
      });
    }

    return NextResponse.json({
      text: result.text,
      state: result.nextState,
      action: result.action,
      sessionId,
      collectedData: result.collectedData,
      score: result.score,
      ticketRef,
      whatsappSent,
      history: newHistory,
    });
  } catch (error) {
    console.error("AI Chat triage error:", error);
    return NextResponse.json(
      {
        text: "I'm having a little trouble right now. Please reach our team on WhatsApp for immediate help! 💬",
        action: "whatsapp_handoff",
        state: "greeting",
        sessionId: `err-${Date.now()}`,
      },
      { status: 200 }
    );
  }
}
