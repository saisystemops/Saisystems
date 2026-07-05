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
      // Validate that id is a valid UUID before querying to avoid postgres errors
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      if (!isUuid) {
        return NextResponse.json({ success: false, message: "Contact not found" }, { status: 404 });
      }

      const { createServerClient } = await import("@/lib/supabase");
      const supabase = createServerClient();
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
      }

      if (!data) {
        return NextResponse.json({ success: false, message: "Contact not found" }, { status: 404 });
      }

      const parsed = {
        id: data.id,
        name: data.name,
        type: data.contact_type || "other",
        phone: data.phone || "",
        email: data.email || "",
        city: data.city || "",
        state: data.state || "",
        skills: data.skills || [],
        rating: Number(data.rating || 0),
        trust: Number(data.trust_score || 50),
        availability: data.availability || "available",
        daily_rate: Number(data.daily_rate || 0),
        certs: data.certifications || [],
        experience: Number(data.experience_years || 0),
        company: data.current_employer || "Freelance",
        role: data.job_title || `${(data.contact_type || "other").toUpperCase()} Specialist`,
      };

      return NextResponse.json({ success: true, data: parsed });
    }

    return NextResponse.json({ success: false, message: "Contact not found (database not connected)" }, { status: 404 });
  } catch (error) {
    console.error("Fetch contact by id error:", error);
    return NextResponse.json({ success: false, message: "Fetch failed." }, { status: 500 });
  }
}
