import type { Metadata } from "next";
import Link from "next/link";
import { blogPosts as fallbackPosts } from "@/lib/data/blog-posts";
import { createServerClient } from "@/lib/supabase";
import { Clock, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "IT Tips & Blog | Sai Systems",
  description: "Expert IT tips, laptop repair guides, computer maintenance advice, and technology insights from Sai Systems.",
  alternates: { canonical: "/blog" },
};

async function getBlogs() {
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createServerClient();
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .order("published_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((post: any) => ({
          id: post.id,
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          metaTitle: post.meta_title,
          metaDescription: post.meta_description,
          keywords: post.keywords || [],
          category: post.category,
          readTime: post.read_time,
          publishedAt: post.published_at,
          author: post.author,
        }));
      }
    }
  } catch (err) {
    console.error("Error fetching blogs from database, using static fallback:", err);
  }
  return fallbackPosts;
}

export default async function BlogPage() {
  const blogs = await getBlogs();

  return (
    <div className="min-h-screen bg-[#fafafc] dark:bg-gray-950 pt-24 transition-colors">
      <div className="gradient-dark py-16 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
          IT Tips &amp; <span className="text-gradient">Blog</span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Expert advice, repair guides, and technology tips from our certified technicians.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              id={`blog-list-${post.id}`}
              className="group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 hover:border-orange-500/20 dark:hover:border-orange-500/20 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="h-44 bg-gradient-to-r from-orange-655 to-amber-550 flex items-center justify-center relative">
                  <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md text-white font-extrabold text-[10px] uppercase tracking-wider rounded-full px-3 py-1 border border-white/10">
                    {post.category}
                  </div>
                  <div className="text-5xl drop-shadow-md">📝</div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-550 mb-3">
                    <Clock size={12} />
                    <span>{post.readTime} min read</span>
                    <span>·</span>
                    <span>{new Date(post.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                  <h2 className="font-extrabold text-base text-gray-950 dark:text-white mb-2 group-hover:text-orange-500 transition-colors line-clamp-2 leading-snug">
                    {post.title}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed mb-4">
                    {post.excerpt}
                  </p>
                </div>
              </div>
              <div className="px-6 pb-6 pt-0">
                <div className="flex items-center gap-1 text-orange-655 dark:text-orange-400 text-xs font-bold uppercase tracking-wider">
                  Read More <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
