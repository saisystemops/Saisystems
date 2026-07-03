/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";


export async function GET() {
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { createServerClient } = await import("@/lib/supabase");
      const supabase = createServerClient();
      
      const { data, error } = await supabase
        .from("vendors")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
      }

      // Map to frontend expected format
      const parsed = (data || []).map((v: any) => ({
        id: v.id,
        companyName: v.company_name,
        type: v.type || "vendor",
        email: v.email || "",
        phone: v.phone || "",
        website: v.website || "",
        coverageCities: v.coverage_cities || [],
        servicesOffered: v.services_offered || [],
        contractStart: v.contract_start || "",
        contractEnd: v.contract_end || "",
        slaResponseHrs: Number(v.sla_response_hrs || 4),
        slaResolutionHrs: Number(v.sla_resolution_hrs || 24),
        rating: Number(v.rating || 0),
        performanceScore: Number(v.performance_score || 50),
        outstandingAmount: Number(v.outstanding_amount || 0),
        escalationContact1: v.escalation_contact_1 || "",
        escalationPhone1: v.escalation_phone_1 || "",
        escalationContact2: v.escalation_contact_2 || "",
        escalationPhone2: v.escalation_phone_2 || "",
        contacts: [
          {
            name: v.escalation_contact_1 || "Technical Contact",
            role: "Account Coordinator",
            phone: v.escalation_phone_1 || v.phone || "",
            email: v.email || "",
          }
        ],
      }));

      return NextResponse.json({ success: true, data: parsed });
    }

    return NextResponse.json({ success: true, data: [] });
  } catch (error) {
    console.error("Fetch vendors error:", error);
    return NextResponse.json({ success: false, message: "Fetch failed." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const id = `v-${Date.now()}`;

    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { createServerClient } = await import("@/lib/supabase");
      const supabase = createServerClient();
      
      const { data, error } = await supabase
        .from("vendors")
        .insert({
          company_name: body.companyName,
          type: body.type || "vendor",
          email: body.email || null,
          phone: body.phone || null,
          website: body.website || null,
          coverage_cities: body.coverageCities || [],
          services_offered: body.servicesOffered || [],
          contract_start: body.contractStart || null,
          contract_end: body.contractEnd || null,
          sla_response_hrs: body.slaResponseHrs || 4,
          sla_resolution_hrs: body.slaResolutionHrs || 24,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json({ success: true, data: { id, ...body } }, { status: 201 });
  } catch (error) {
    console.error("Create vendor error:", error);
    return NextResponse.json({ success: false, message: "Creation failed" }, { status: 400 });
  }
}
