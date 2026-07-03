import { NextRequest, NextResponse } from "next/server";

/**
 * Manual handoff endpoint — service desk or customer can trigger escalation
 * POST /api/ai-chat/handoff
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, collectedData, reason = "manual" } = body;

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId required" }, { status: 400 });
    }

    const year = new Date().getFullYear();
    const rand = Math.floor(100000 + Math.random() * 900000);
    const ticketRef = `SAI-${year}-${rand}`;

    // Build WhatsApp message
    const { formatHandoffMessage } = await import("@/lib/triage-engine");
    const waMessage = formatHandoffMessage(collectedData || {}, ticketRef);

    // Save to handoff queue
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (url && key) {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(url, key);

      // Create ticket
      const { data: ticket } = await supabase
        .from("tickets")
        .insert({
          ticket_ref: ticketRef,
          title: `${collectedData?.deviceBrand || "Device"} - ${collectedData?.issueDescription?.slice(0, 80) || "Support Request"}`,
          description: `${collectedData?.issueDescription || "Manual handoff request"}\n\nReason: ${reason}`,
          customer_name: collectedData?.customerName || null,
          customer_contact_name: collectedData?.customerName || null,
          customer_contact_phone: collectedData?.customerPhone || null,
          category: collectedData?.issueCategory || "general",
          priority: "normal",
          status: "new",
          site_city: collectedData?.location || "Hyderabad",
          source: "ai-chat",
        })
        .select("id")
        .single();

      // Create handoff entry
      await supabase.from("handoff_queue").insert({
        session_id: sessionId,
        ticket_ref: ticketRef,
        ticket_id: ticket?.id || null,
        customer_name: collectedData?.customerName || "Unknown",
        customer_phone: collectedData?.customerPhone || "",
        device_info: `${collectedData?.deviceBrand || ""} ${collectedData?.deviceModel || ""}`.trim(),
        issue_summary: collectedData?.issueDescription || "No description",
        urgency: collectedData?.urgency || "normal",
        collected_data: collectedData || {},
        whatsapp_message: waMessage,
        status: "pending",
        manual_trigger: true,
      });
    }

    // Send WhatsApp
    let whatsappSent = false;
    const token = process.env.WHATSAPP_API_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const serviceDesk = process.env.WHATSAPP_SERVICE_DESK_NUMBER || "919487179676";

    if (token && phoneNumberId) {
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
            to: serviceDesk.replace(/\D/g, ""),
            type: "text",
            text: { body: waMessage },
          }),
        }
      );
      whatsappSent = res.ok;
    }

    return NextResponse.json({
      success: true,
      ticketRef,
      whatsappSent,
      message: "Customer escalated to service desk",
    });
  } catch (error) {
    console.error("Manual handoff error:", error);
    return NextResponse.json({ error: "Handoff failed" }, { status: 500 });
  }
}
