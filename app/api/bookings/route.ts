/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { siteConfig } from "@/lib/config";

const schema = z.object({
  serviceType: z.string().min(1),
  brand: z.string().min(1),
  model: z.string().min(1),
  date: z.string().min(1),
  timeSlot: z.string().min(1),
  problemDescription: z.string().min(10),
  name: z.string().min(2),
  mobile: z.string().regex(/^[6-9]\d{9}$/),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  serviceMode: z.enum(["doorstep", "drop-in"]),
});

function generateRef() {
  return `SAI-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
}


export async function GET(req: NextRequest) {
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { createServerClient } = await import("@/lib/supabase");
      const supabase = createServerClient();
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json({ success: true, data: [] });
  } catch (error) {
    console.error("Fetch bookings error:", error);
    return NextResponse.json({ success: false, message: "Fetch failed." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Honeypot spam protection
    if (body.website) {
      return NextResponse.json({ success: true, bookingRef: "SAI-MOCK-SPAM", message: "Booking created successfully" });
    }

    const data = schema.parse(body);
    const bookingRef = generateRef();

    // Save to Supabase if configured
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      try {
        const { createServerClient } = await import("@/lib/supabase");
        const supabase = createServerClient();
        await supabase.from("appointments").insert({
          booking_ref: bookingRef,
          service_type: data.serviceType,
          brand: data.brand,
          model: data.model,
          appointment_date: data.date,
          time_slot: data.timeSlot,
          problem_description: data.problemDescription,
          customer_name: data.name,
          customer_mobile: data.mobile,
          customer_email: data.email || null,
          address: data.address || null,
          service_mode: data.serviceMode,
          status: "pending",
        });
      } catch (dbError) {
        console.error("DB save error:", dbError);
        // Continue anyway — don't fail the user
      }
    }

    // Send confirmation email
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);

        // Customer confirmation
        if (data.email) {
          await resend.emails.send({
            from: "bookings@saisystems.org.in",
            to: data.email,
            subject: `Booking Confirmed — ${bookingRef} | Sai Systems`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #16a34a, #059669); padding: 24px; border-radius: 12px 12px 0 0;">
                  <h1 style="color: white; margin: 0;">Booking Confirmed! ✅</h1>
                  <p style="color: #d1fae5; margin: 8px 0 0;">Reference: <strong>${bookingRef}</strong></p>
                </div>
                <div style="padding: 24px; background: #f9fafb; border: 1px solid #e5e7eb;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="padding: 8px 0; color: #6b7280;">Service</td><td style="padding: 8px 0; font-weight: bold;">${data.serviceType}</td></tr>
                    <tr><td style="padding: 8px 0; color: #6b7280;">Device</td><td style="padding: 8px 0; font-weight: bold;">${data.brand} ${data.model}</td></tr>
                    <tr><td style="padding: 8px 0; color: #6b7280;">Date</td><td style="padding: 8px 0; font-weight: bold;">${data.date}</td></tr>
                    <tr><td style="padding: 8px 0; color: #6b7280;">Time</td><td style="padding: 8px 0; font-weight: bold;">${data.timeSlot}</td></tr>
                    <tr><td style="padding: 8px 0; color: #6b7280;">Mode</td><td style="padding: 8px 0; font-weight: bold;">${data.serviceMode === "doorstep" ? "🏠 Doorstep Service" : "🏪 Drop-In Service"}</td></tr>
                  </table>
                  <p style="color: #374151; margin-top: 16px;">Our team will contact you within 30 minutes to confirm. For urgent queries, WhatsApp us at ${siteConfig.phone}</p>
                </div>
              </div>
            `,
          });
        }

        const serviceLower = data.serviceType.toLowerCase();
        const isSales = 
          serviceLower.includes("sales") || 
          serviceLower.includes("sell") || 
          serviceLower.includes("buy") || 
          serviceLower.includes("purchase") || 
          serviceLower.includes("trade-in");
        
        const targetEmail = isSales 
          ? "saisysops@gmail.com" 
          : "saisysops@gmail.com";

        const ccEmail = process.env.ADMIN_EMAIL && process.env.ADMIN_EMAIL !== targetEmail 
          ? process.env.ADMIN_EMAIL 
          : undefined;

        // Admin notification
        await resend.emails.send({
          from: "bookings@saisystems.org.in",
          to: targetEmail,
          cc: ccEmail,
          subject: `🔔 New Booking (${isSales ? "Sales" : "Service"}): ${data.serviceType} — ${data.name} (${bookingRef})`,
          html: `<p>New booking received:<br><strong>Ref:</strong> ${bookingRef}<br><strong>Department:</strong> ${isSales ? "Sales" : "Services"}<br><strong>Service:</strong> ${data.serviceType}<br><strong>Customer:</strong> ${data.name} — ${data.mobile}<br><strong>Device:</strong> ${data.brand} ${data.model}<br><strong>Date:</strong> ${data.date} at ${data.timeSlot}<br><strong>Mode:</strong> ${data.serviceMode}<br><strong>Issue:</strong> ${data.problemDescription}</p>`,
        });
      } catch (emailError) {
        console.error("Email error:", emailError);
      }
    }

    return NextResponse.json({ success: true, bookingRef });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, errors: error.issues }, { status: 400 });
    }
    console.error("Booking error:", error);
    return NextResponse.json({ success: false, message: "Booking failed. Please try again." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { ref, status, technician } = body;

    if (!ref) {
      return NextResponse.json({ success: false, message: "Reference is required" }, { status: 400 });
    }

    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { createServerClient } = await import("@/lib/supabase");
      const supabase = createServerClient();
      
      const updateData: Record<string, any> = {};
      if (status) updateData.status = status;
      if (technician !== undefined) updateData.assigned_technician = technician;
      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from("appointments")
        .update(updateData)
        .eq("booking_ref", ref)
        .select()
        .single();

      if (error) {
        console.error("Supabase update error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json({ success: true, message: "Demo mode: update simulated successfully" });
  } catch (error) {
    console.error("Update booking error:", error);
    return NextResponse.json({ success: false, message: "Update failed." }, { status: 500 });
  }
}
