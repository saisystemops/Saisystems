import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth-secure";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = verifySession(req);
    if (!session.valid) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;

    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { createServerClient } = await import("@/lib/supabase");
      const supabase = createServerClient();

      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      if (!isUuid) {
        return NextResponse.json({ success: false, message: "Engineer profile not found" }, { status: 404 });
      }

      // Query by either engineer id or contact_id
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
            trust_score,
            phone,
            email
          )
        `)
        .or(`id.eq.${id},contact_id.eq.${id}`)
        .maybeSingle();

      if (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
      }

      if (!data) {
        return NextResponse.json({ success: false, message: "Engineer profile not found" }, { status: 404 });
      }

      const parsed = {
        id: data.id,
        name: data.contacts?.name || "Unknown Engineer",
        contactId: data.contact_id,
        city: data.contacts?.city || "Hyderabad",
        state: data.contacts?.state || "Telangana",
        primarySkill: data.primary_skill || "General Support",
        secondarySkills: data.secondary_skills || [],
        certifications: data.certifications_verified || [],
        rating: Number(data.contacts?.rating || data.customer_rating || 0),
        trustScore: Number(data.contacts?.trust_score || 50),
        dailyRate: Number(data.contacts?.daily_rate || data.daily_rate || 0),
        emergencyRate: Number(data.contacts?.daily_rate ? Math.round(data.contacts.daily_rate * 1.5) : (data.daily_rate ? Math.round(data.daily_rate * 1.5) : 0)),
        availability: data.contacts?.availability || "available",
        emergencySupport: data.on_call || data.emergency_response_time_hrs <= 4,
        experience: Number(data.total_experience_years || 0),
        enterpriseExperience: Number(data.enterprise_experience_years || 0),
        jobsCompleted: Number(data.jobs_completed || 0),
        onCall: data.on_call || false,
        phone: data.contacts?.phone || "",
        email: data.contacts?.email || "",
        bio: data.bio || "No biography provided yet.",
        bgVerified: data.bg_verified || false,
      };

      return NextResponse.json({ success: true, data: parsed });
    }

    return NextResponse.json({ success: false, message: "Database not connected" }, { status: 404 });
  } catch (error) {
    console.error("Fetch engineer details by id error:", error);
    return NextResponse.json({ success: false, message: "Fetch failed." }, { status: 500 });
  }
}
