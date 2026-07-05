import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("q")?.trim() || "";

    if (!query || query.length < 4) {
      return NextResponse.json({ success: false, message: "Search query must be at least 4 characters long." }, { status: 400 });
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ success: false, message: "Database not configured." }, { status: 500 });
    }

    const supabase = createServerClient();
    const cleanQuery = query.replace(/\D/g, ""); // Clean phone number lookup

    const results: any[] = [];

    // Search appointments
    let apptPromise: any = Promise.resolve({ data: [] as any[], error: null as any });
    if (query.toUpperCase().startsWith("SAI-")) {
      apptPromise = supabase.from("appointments").select("*").eq("booking_ref", query);
    } else if (cleanQuery.length >= 10) {
      apptPromise = supabase.from("appointments").select("*").ilike("customer_mobile", `%${cleanQuery}`);
    } else {
      apptPromise = supabase.from("appointments").select("*").ilike("booking_ref", `%${query}%`);
    }

    // Search tickets
    let tktPromise: any = Promise.resolve({ data: [] as any[], error: null as any });
    if (query.toUpperCase().startsWith("TKT-")) {
      tktPromise = supabase.from("tickets").select("*").eq("ticket_ref", query);
    } else if (cleanQuery.length >= 10) {
      tktPromise = supabase.from("tickets").select("*").ilike("customer_contact_phone", `%${cleanQuery}`);
    } else {
      tktPromise = supabase.from("tickets").select("*").ilike("ticket_ref", `%${query}%`);
    }

    // Search leads
    let leadPromise: any = Promise.resolve({ data: [] as any[], error: null as any });
    if (query.toUpperCase().startsWith("LEAD-")) {
      const leadId = query.substring(5);
      leadPromise = supabase.from("leads").select("*").eq("id", leadId);
    } else if (cleanQuery.length >= 10) {
      leadPromise = supabase.from("leads").select("*").ilike("mobile", `%${cleanQuery}`);
    }

    const [apptRes, tktRes, leadRes] = await Promise.all([apptPromise, tktPromise, leadPromise]);

    // Format appointments
    if (apptRes && apptRes.data) {
      apptRes.data.forEach((item: any) => {
        results.push({
          id: item.id,
          ref: item.booking_ref,
          type: "appointment",
          name: maskName(item.customer_name),
          service: item.service_type,
          device: `${item.brand} ${item.model}`.trim(),
          status: item.status || "pending",
          estimatePrice: item.estimate_price ? Number(item.estimate_price) : null,
          notes: item.notes || null,
          createdAt: item.created_at,
          appointmentDate: item.appointment_date,
          timeSlot: item.time_slot,
          serviceMode: item.service_mode,
        });
      });
    }

    // Format tickets
    if (tktRes && tktRes.data) {
      tktRes.data.forEach((item: any) => {
        results.push({
          id: item.id,
          ref: item.ticket_ref,
          type: "ticket",
          name: maskName(item.customer_name || item.customer_contact_name),
          service: item.title,
          device: extractDevice(item.title),
          status: item.status || "new",
          estimatePrice: item.estimate_price ? Number(item.estimate_price) : null,
          notes: item.notes || null,
          createdAt: item.created_at,
        });
      });
    }

    // Format leads
    if (leadRes && leadRes.data) {
      leadRes.data.forEach((item: any) => {
        const leadRef = `LEAD-${String(item.id).substring(0, 4).toUpperCase()}`;
        results.push({
          id: item.id,
          ref: leadRef,
          type: "lead",
          name: maskName(item.name),
          service: `Free Quote: ${item.service_type}`,
          device: `${item.brand} ${item.problem_description ? `(${item.problem_description.slice(0, 20)}...)` : ""}`,
          status: item.status || "new",
          estimatePrice: item.estimate_price ? Number(item.estimate_price) : null,
          notes: item.notes || null,
          createdAt: item.created_at,
        });
      });
    }

    return NextResponse.json({ success: true, data: results });
  } catch (error: any) {
    console.error("Public tracking search error:", error);
    return NextResponse.json({ success: false, message: "Tracking search encountered an error." }, { status: 500 });
  }
}

function maskName(name: string | null | undefined): string {
  if (!name) return "Valued Customer";
  const trimName = name.trim();
  if (trimName.length <= 2) return trimName;
  const first = trimName[0];
  const last = trimName[trimName.length - 1];
  return `${first}${"*".repeat(trimName.length - 2)}${last}`;
}

function extractDevice(title: string): string {
  if (!title) return "Device";
  const parts = title.split(" - ");
  return parts[0] || "Device";
}
