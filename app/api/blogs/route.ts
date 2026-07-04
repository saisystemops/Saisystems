import { NextRequest, NextResponse } from "next/server";
import { blogPosts } from "@/lib/data/blog-posts";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { createServerClient } = await import("@/lib/supabase");
      const supabase = createServerClient();
      
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .order("published_at", { ascending: false });

      if (error) {
        console.error("Supabase blogs fetch error, falling back to static:", error.message);
        return NextResponse.json({ success: true, data: blogPosts, fallback: true });
      }

      // If the database has zero blogs, fallback to static articles so the site is never blank
      if (!data || data.length === 0) {
        return NextResponse.json({ success: true, data: blogPosts, fallback: true });
      }

      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json({ success: true, data: blogPosts, fallback: true });
  } catch (error: any) {
    console.error("Public blogs API error, falling back to static:", error);
    return NextResponse.json({ success: true, data: blogPosts, fallback: true });
  }
}
