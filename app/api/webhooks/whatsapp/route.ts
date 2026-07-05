import { NextRequest, NextResponse } from "next/server";
import { askFlowise } from "@/lib/flowise";

// ─────────────────────────────────────────────────────────────────────────────
// WhatsApp Cloud API Inbound Webhook
// Route: /api/webhooks/whatsapp
//
// SETUP STEPS (all free):
// 1. Go to developers.facebook.com → Create App → WhatsApp product
// 2. Set Webhook URL: https://yourdomain.com/api/webhooks/whatsapp
// 3. Set Verify Token: same value as WHATSAPP_VERIFY_TOKEN env var
// 4. Subscribe to: messages
// 5. Get Phone Number ID + Access Token → add to .env.local
// ─────────────────────────────────────────────────────────────────────────────

const WHATSAPP_TOKEN = process.env.WHATSAPP_API_TOKEN || "";
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || "";
const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "sai_verify_token_2026";
const SERVICE_DESK_NUMBER = (process.env.WHATSAPP_SERVICE_DESK_NUMBER || "918778003397").replace(/\D/g, "");

// ── Message dedup (prevents processing same message twice) ────────────────────
const processedMessages = new Map<string, number>();

// ── GET: Meta webhook verification handshake ──────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === WHATSAPP_VERIFY_TOKEN) {
    console.log("✅ WhatsApp webhook verified");
    return new NextResponse(challenge, { status: 200 });
  }

  console.error("❌ WhatsApp webhook verification failed");
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// ── POST: Inbound messages from WhatsApp ──────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // WhatsApp sends updates in this structure
    const entry = body?.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    // Ignore non-message events (status updates, etc.)
    if (!value?.messages?.length) {
      return NextResponse.json({ status: "ok" });
    }

    const message = value.messages[0];
    const msgId = message.id;

    // Dedup — WhatsApp sometimes delivers the same message twice
    const now = Date.now();
    // Clean up old dedup entries (older than 5 minutes)
    for (const [id, timestamp] of processedMessages.entries()) {
      if (now - timestamp > 5 * 60 * 1000) {
        processedMessages.delete(id);
      }
    }

    if (processedMessages.has(msgId)) {
      return NextResponse.json({ status: "duplicate" });
    }
    processedMessages.set(msgId, now);

    // Extract message details
    const customerPhone = message.from; // e.g. "919876543210"
    const customerName = value?.contacts?.[0]?.profile?.name || "Customer";
    const messageType = message.type;

    // Handle text messages only (ignore media, location, etc. for now)
    let userText = "";
    if (messageType === "text") {
      userText = message.text?.body?.trim() || "";
    } else if (messageType === "interactive") {
      // Button reply
      userText = message.interactive?.button_reply?.title || message.interactive?.list_reply?.title || "";
    } else {
      // For media/audio/location: acknowledge and ask for text
      await sendWhatsAppMessage(
        customerPhone,
        "Hi! I received your message. Please describe your issue in text so I can help you better. 😊"
      );
      return NextResponse.json({ status: "ok" });
    }

    if (!userText) return NextResponse.json({ status: "ok" });

    // Mark as read + show typing indicator
    await markAsRead(customerPhone, msgId);

    // Save message to Supabase
    await saveMessage(customerPhone, customerName, "customer", userText);

    // Send to Flowise / Dify / Gemini
    const aiResponse = await askFlowise(userText, customerPhone);

    // Clean AI response text (remove [HANDOFF] tag before sending)
    const replyText = aiResponse.text.replace(/\[HANDOFF\]/gi, "").trim();

    // Send reply to customer
    await sendWhatsAppMessage(customerPhone, replyText);

    // Save AI response
    await saveMessage(customerPhone, "Sai Assistant AI", "ai", replyText);

    // Handle handoff
    if (aiResponse.intent === "handoff") {
      await handleHandoff(customerPhone, customerName);
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
    // Always return 200 to WhatsApp (otherwise it retries aggressively)
    return NextResponse.json({ status: "error_handled" }, { status: 200 });
  }
}

// ── Send WhatsApp text message ────────────────────────────────────────────────
export async function sendWhatsAppMessage(to: string, text: string): Promise<boolean> {
  if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    console.warn("WhatsApp API not configured");
    return false;
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "text",
          text: { body: text, preview_url: false },
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

// ── Mark message as read ──────────────────────────────────────────────────────
async function markAsRead(to: string, messageId: string): Promise<void> {
  if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) return;
  try {
    await fetch(`https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        status: "read",
        message_id: messageId,
      }),
    });
  } catch {
    // non-critical
  }
}

// ── Save message to Supabase ──────────────────────────────────────────────────
async function saveMessage(
  phone: string,
  name: string,
  sender: "customer" | "ai" | "agent",
  content: string
): Promise<void> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return;

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(url, key);

    await supabase.from("wa_conversations").insert({
      customer_phone: phone,
      customer_name: name,
      sender,
      content,
      channel: "whatsapp",
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Save message error:", err);
  }
}

// ── Handle escalation to human agent ─────────────────────────────────────────
async function handleHandoff(customerPhone: string, customerName: string): Promise<void> {
  try {
    // Fetch last 20 messages for this customer
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    let historyText = "No previous messages.";

    if (url && key) {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(url, key);

      const { data: msgs } = await supabase
        .from("wa_conversations")
        .select("sender, content, created_at")
        .eq("customer_phone", customerPhone)
        .order("created_at", { ascending: true })
        .limit(20);

      if (msgs && msgs.length > 0) {
        historyText = msgs
          .map((m) => {
            const label =
              m.sender === "customer" ? `👤 ${customerName}` :
              m.sender === "ai" ? "🤖 Sai Assistant" : "👨‍💼 Agent";
            return `${label}: ${m.content}`;
          })
          .join("\n");
      }
    }

    // Format the agent notification message
    const cleanPhone = customerPhone.replace(/\D/g, "");
    const waLink = `https://wa.me/${cleanPhone}`;

    const agentMessage = [
      `🔔 *NEW CUSTOMER — NEEDS HUMAN HELP*`,
      ``,
      `👤 *Name:* ${customerName}`,
      `📞 *Phone:* +${cleanPhone}`,
      `🔗 *Continue chat:* ${waLink}`,
      ``,
      `📜 *CHAT HISTORY*`,
      `─────────────────`,
      historyText,
      `─────────────────`,
      ``,
      `👆 Tap the link above to open WhatsApp and continue the conversation directly.`,
    ].join("\n");

    // Send to service desk agent's WhatsApp
    await sendWhatsAppMessage(SERVICE_DESK_NUMBER, agentMessage);

    // Also notify the customer
    await sendWhatsAppMessage(
      customerPhone,
      `✅ You've been connected to our service team!\n\nA team member will reply to you here on WhatsApp shortly. Our response time is usually within 15–30 minutes.\n\nThank you for your patience! 🙏`
    );

    // Save handoff to Supabase handoff_queue
    if (url && key) {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(url, key);

      await supabase.from("handoff_queue").insert({
        session_id: customerPhone,
        customer_name: customerName,
        customer_phone: customerPhone,
        issue_summary: "WhatsApp conversation — see chat history",
        whatsapp_message: agentMessage,
        status: "pending",
        channel: "whatsapp",
      });
    }
  } catch (err) {
    console.error("Handoff error:", err);
  }
}
