import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { testimonials as defaultTestimonials } from "@/lib/data/testimonials";

export async function GET() {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .eq("approved", true)
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      // Fallback to static defaults if database table is not seeded/configured yet
      return NextResponse.json(defaultTestimonials);
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error("Failed to load testimonials:", err);
    return NextResponse.json(defaultTestimonials);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Check if it is a sync action
    if (body.action === "sync_defaults") {
      const supabase = createServerClient();
      
      // Let's check if the table already has data to prevent duplicate seedings
      const { data: existing } = await supabase.from("testimonials").select("id").limit(1);
      if (existing && existing.length > 0) {
        return NextResponse.json({ message: "Reviews already seeded", success: true });
      }

      // Seed all default testimonials
      const seedData = defaultTestimonials.map((t) => ({
        name: t.name,
        review: t.review,
        service: t.service,
        rating: Number(t.rating),
        location: t.location || "Dindigul",
        role: t.role || "Customer",
        date: t.date,
        approved: true
      }));

      const { data, error } = await supabase.from("testimonials").insert(seedData).select();
      if (error) {
        console.error("Supabase seed testimonials error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, count: data?.length || 0 });
    }

    const { name, review, service, rating, location, role } = body;

    if (!name || !review || !service || !rating) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createServerClient();

    // Format current date as e.g. "July 2026"
    const dateFormatted = new Date().toLocaleString("en-US", {
      month: "long",
      year: "numeric"
    });

    const { data, error } = await supabase
      .from("testimonials")
      .insert([
        {
          name,
          review,
          service,
          rating: Number(rating),
          location: location || "Dindigul",
          role: role || "Customer",
          date: dateFormatted,
          approved: true // Auto-approved by default; admin can hide or delete
        }
      ])
      .select();

    if (error) {
      console.error("Supabase insert review error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data[0]);
  } catch (err) {
    console.error("Failed to submit review:", err);
    const errorVal = err as Error;
    return NextResponse.json({ error: errorVal.message || "Server error" }, { status: 500 });
  }
}
