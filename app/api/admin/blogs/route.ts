import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth-secure";
import { z } from "zod";
import { blogPosts } from "@/lib/data/blog-posts";

export const dynamic = "force-dynamic";

const blogPostSchema = z.object({
  id: z.string().optional(),
  slug: z.string().min(2),
  title: z.string().min(2),
  excerpt: z.string().min(5),
  content: z.string().min(10),
  meta_title: z.string().min(2),
  meta_description: z.string().min(5),
  keywords: z.array(z.string()).default([]),
  category: z.string().min(2),
  read_time: z.number().int().min(1).default(5),
  published_at: z.string().optional(),
  author: z.string().default("Sai Systems Team"),
  image_url: z.string().optional(),
});

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
        .from("blogs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json({ success: false, message: "Database not configured." }, { status: 500 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = verifySession(req);
    if (!session.valid) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ success: false, message: "Database not configured." }, { status: 500 });
    }

    const { createServerClient } = await import("@/lib/supabase");
    const supabase = createServerClient();
    const body = await req.json();

    // ── Seed Trigger ──────────────────────────────────────────────────────────
    if (body.action === "seed") {
      let seeded = 0;
      for (const post of blogPosts) {
        const { error } = await supabase
          .from("blogs")
          .upsert({
            slug: post.slug,
            title: post.title,
            excerpt: post.excerpt,
            content: post.content,
            meta_title: post.metaTitle,
            meta_description: post.metaDescription,
            keywords: post.keywords,
            category: post.category,
            read_time: post.readTime,
            published_at: new Date(post.publishedAt).toISOString(),
            author: post.author
          }, { onConflict: "slug" });

        if (error) {
          console.error(`Seed error on slug ${post.slug}:`, error.message);
        } else {
          seeded++;
        }
      }
      return NextResponse.json({ success: true, message: `Seeded ${seeded} blog posts into the database.` });
    }

    // ── Regular Save/Update ───────────────────────────────────────────────────
    const data = blogPostSchema.parse(body);
    const dbPayload = {
      slug: data.slug,
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      meta_title: data.meta_title,
      meta_description: data.meta_description,
      keywords: data.keywords,
      category: data.category,
      read_time: data.read_time,
      author: data.author,
      published_at: data.published_at ? new Date(data.published_at).toISOString() : new Date().toISOString(),
      image_url: data.image_url || "",
    };

    const fallbackPayload = {
      slug: data.slug,
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      meta_title: data.meta_title,
      meta_description: data.meta_description,
      keywords: data.keywords,
      category: data.category,
      read_time: data.read_time,
      author: data.author,
      published_at: data.published_at ? new Date(data.published_at).toISOString() : new Date().toISOString(),
    };

    if (data.id) {
      // Update
      let { data: updated, error } = await supabase
        .from("blogs")
        .update(dbPayload)
        .eq("id", data.id)
        .select()
        .maybeSingle();

      // Fallback if image_url column is missing in Supabase blogs table
      if (error && (error.code === "42703" || error.message?.includes("image_url"))) {
        const retryResult = await supabase
          .from("blogs")
          .update(fallbackPayload)
          .eq("id", data.id)
          .select()
          .maybeSingle();
        updated = retryResult.data;
        error = retryResult.error;
      }

      if (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 550 });
      }
      return NextResponse.json({ success: true, data: updated });
    } else {
      // Insert (check unique slug first to avoid unhandled PG constraints)
      const { data: existing } = await supabase
        .from("blogs")
        .select("id")
        .eq("slug", data.slug)
        .maybeSingle();

      if (existing) {
        return NextResponse.json({ success: false, message: "A blog post with this URL slug already exists. Please choose a unique title/slug." }, { status: 400 });
      }

      let { data: inserted, error } = await supabase
        .from("blogs")
        .insert(dbPayload)
        .select()
        .maybeSingle();

      // Fallback if image_url column is missing in Supabase blogs table
      if (error && (error.code === "42703" || error.message?.includes("image_url"))) {
        const retryResult = await supabase
          .from("blogs")
          .insert(fallbackPayload)
          .select()
          .maybeSingle();
        inserted = retryResult.data;
        error = retryResult.error;
      }

      if (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 550 });
      }
      return NextResponse.json({ success: true, data: inserted });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = verifySession(req);
    if (!session.valid) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "Missing blog ID parameter." }, { status: 400 });
    }

    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { createServerClient } = await import("@/lib/supabase");
      const supabase = createServerClient();
      
      const { error } = await supabase
        .from("blogs")
        .delete()
        .eq("id", id);

      if (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: "Blog post deleted successfully." });
    }

    return NextResponse.json({ success: false, message: "Database not configured." }, { status: 500 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
