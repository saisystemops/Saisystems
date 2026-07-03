/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";


export async function GET() {
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { createServerClient } = await import("@/lib/supabase");
      const supabase = createServerClient();
      
      const { data, error } = await supabase
        .from("engineers")
        .select(`
          *,
          contacts:contact_id (
            name,
            city,
            state,
            daily_rate,
            availability,
            rating,
            trust_score
          )
        `);

      if (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
      }

      // Map to frontend expected format
      const parsed = (data || []).map((e: any) => ({
        id: e.id,
        contactId: e.contact_id,
        name: e.contacts?.name || "Unknown Engineer",
        city: e.contacts?.city || "Hyderabad",
        state: e.contacts?.state || "Telangana",
        primarySkill: e.primary_skill || "General Support",
        secondarySkills: e.secondary_skills || [],
        certifications: e.certifications_verified || [],
        rating: Number(e.contacts?.rating || e.customer_rating || 0),
        trustScore: Number(e.contacts?.trust_score || 50),
        dailyRate: Number(e.contacts?.daily_rate || e.daily_rate || 0),
        availability: e.contacts?.availability || "available",
        emergencySupport: e.on_call || e.emergency_response_time_hrs <= 4,
        experience: Number(e.total_experience_years || 0),
        jobsCompleted: Number(e.jobs_completed || 0),
        onCall: e.on_call || false,
      }));

      return NextResponse.json({ success: true, data: parsed });
    }

    return NextResponse.json({ success: true, data: [] });
  } catch (error) {
    console.error("Fetch engineers error:", error);
    return NextResponse.json({ success: false, message: "Fetch failed." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const id = `e-${Date.now()}`;

    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { createServerClient } = await import("@/lib/supabase");
      const supabase = createServerClient();
      
      const { data, error } = await supabase
        .from("engineers")
        .insert({
          contact_id: body.contactId,
          primary_skill: body.primarySkill,
          secondary_skills: body.secondarySkills || [],
          certifications_verified: body.certifications || [],
          total_experience_years: body.experience || 0,
          on_call: body.onCall || false,
          jobs_completed: body.jobsCompleted || 0,
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
    console.error("Create engineer error:", error);
    return NextResponse.json({ success: false, message: "Creation failed" }, { status: 400 });
  }
}
