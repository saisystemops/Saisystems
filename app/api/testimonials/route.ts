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
  } catch (err: any) {
    console.error("Failed to submit review:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
