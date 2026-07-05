/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth-secure";

export async function GET(req: NextRequest) {
  try {
    const session = verifySession(req);
    if (!session.valid) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { createServerClient } = await import("@/lib/supabase");
      const supabase = createServerClient();
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
      }

      // Map to frontend expected format
      const parsed = (data || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        type: c.contact_type || "other",
        phone: c.phone || "",
        email: c.email || "",
        city: c.city || "",
        state: c.state || "",
        skills: c.skills || [],
        rating: Number(c.rating || 0),
        trust: Number(c.trust_score || 50),
        availability: c.availability || "available",
        daily_rate: Number(c.daily_rate || 0),
        certs: c.certifications || [],
      }));

      return NextResponse.json({ success: true, data: parsed });
    }

    return NextResponse.json({ success: true, data: [] });
  } catch (error) {
    console.error("Fetch contacts error:", error);
    return NextResponse.json({ success: false, message: "Fetch failed." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = verifySession(req);
    if (!session.valid) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }
    const body = await req.json();
    const id = `c-${Date.now()}`;

    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { createServerClient } = await import("@/lib/supabase");
      const supabase = createServerClient();
      const { data, error } = await supabase
        .from("contacts")
        .insert({
          name: body.name,
          contact_type: body.type || "other",
          phone: body.phone || null,
          email: body.email || null,
          city: body.city || null,
          state: body.state || null,
          skills: body.skills || [],
          rating: body.rating || 0,
          trust_score: body.trust || 50,
          availability: body.availability || "available",
          daily_rate: body.daily_rate || 0,
          certifications: body.certs || [],
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
    console.error("Create contact error:", error);
    return NextResponse.json({ success: false, message: "Creation failed" }, { status: 400 });
  }
}
