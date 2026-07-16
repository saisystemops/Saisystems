import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth-secure";

/**
 * POST /api/webhooks/whatsapp/send
 * Sends an agent reply to a customer via WhatsApp API
 * and saves it to Supabase wa_conversations
 */
export async function POST(req: NextRequest) {
  try {
    const session = verifySession(req);
    if (!session.valid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { to, message, senderName: _senderName = "Agent" } = body;

    if (!to || !message) {
      return NextResponse.json({ error: "to and message required" }, { status: 400 });
    }

    const WHATSAPP_TOKEN = process.env.WHATSAPP_API_TOKEN || "";
    const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || "";
    const cleanPhone = to.replace(/\D/g, "");

    let sent = false;

    if (WHATSAPP_TOKEN && WHATSAPP_PHONE_NUMBER_ID) {
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
            to: cleanPhone,
            type: "text",
            text: { body: message },
          }),
        }
      );
      sent = res.ok;
    }

    // Save to Supabase
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (url && key) {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(url, key);

      await supabase.from("wa_conversations").insert({
        customer_phone: cleanPhone,
        customer_name: "Customer",
        sender: "agent",
        content: message,
        channel: "whatsapp",
      });
    }

    return NextResponse.json({ success: true, sent });
  } catch (err) {
    console.error("Agent send error:", err);
    return NextResponse.json({ error: "Send failed" }, { status: 500 });
  }
}
