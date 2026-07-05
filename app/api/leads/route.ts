import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifySession } from "@/lib/auth-secure";

const schema = z.object({
  name: z.string().min(2),
  mobile: z.string().regex(/^[6-9]\d{9}$/),
  email: z.string().email().optional().or(z.literal("")),
  serviceType: z.string().min(1),
  brand: z.string().min(1),
  problemDescription: z.string().min(10),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Honeypot spam protection
    if (body.website) {
      return NextResponse.json({ success: true, message: "Lead submitted successfully" });
    }

    const data = schema.parse(body);

    // Save to Supabase (only when env vars are configured)
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const { createServerClient } = await import("@/lib/supabase");
        const supabase = createServerClient();
        const { error } = await supabase.from("leads").insert({
          name: data.name,
          mobile: data.mobile,
          email: data.email || null,
          service_type: data.serviceType,
          brand: data.brand,
          problem_description: data.problemDescription,
          status: "new",
        });
        if (error) {
          throw error;
        }
      } catch (dbError) {
        console.error("DB save error (leads):", dbError);
      }
    }

    // Send email notification (only when Resend is configured)
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        
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

        // If ADMIN_EMAIL is set and is different, we CC it for tracking
        const ccEmail = process.env.ADMIN_EMAIL && process.env.ADMIN_EMAIL !== targetEmail 
          ? process.env.ADMIN_EMAIL 
          : undefined;

        await resend.emails.send({
          from: "leads@saisystems.org.in",
          to: targetEmail,
          cc: ccEmail,
          subject: `New ${isSales ? "Sales" : "Service"} Request: ${data.serviceType} — ${data.name}`,
          html: `
            <h2>New ${isSales ? "Sales Inquiry" : "Service Request"}</h2>
            <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; border: 1px solid #ddd; font-family: sans-serif;">
              <tr style="background-color: #f2f2f2;">
                <th align="left" style="padding: 8px;">Field</th>
                <th align="left" style="padding: 8px;">Details</th>
              </tr>
              <tr><td style="padding: 8px; font-weight: bold;">Name</td><td style="padding: 8px;">${data.name}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold;">Mobile</td><td style="padding: 8px;">${data.mobile}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold;">Email</td><td style="padding: 8px;">${data.email || "—"}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold;">Department</td><td style="padding: 8px;">${isSales ? "Sales" : "Services"}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold;">Requested Option</td><td style="padding: 8px;">${data.serviceType}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold;">Device Brand</td><td style="padding: 8px;">${data.brand}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold;">Problem / Details</td><td style="padding: 8px;">${data.problemDescription}</td></tr>
            </table>
          `,
        });
      } catch (emailError) {
        console.error("Email notification error (leads):", emailError);
      }
    }

    return NextResponse.json({ success: true, message: "Lead submitted successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, errors: error.issues }, { status: 400 });
    }
    console.error("Lead submission error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = verifySession(req);
  if (!session.valid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Admin: Get all leads
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const { createServerClient } = await import("@/lib/supabase");
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }
  return NextResponse.json([]);
}
