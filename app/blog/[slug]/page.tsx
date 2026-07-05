import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { blogPosts as fallbackPosts, getBlogPostBySlug, getBlogFallbackImage } from "@/lib/data/blog-posts";
import { createServerClient } from "@/lib/supabase";
import { Clock, ArrowLeft, ArrowRight } from "lucide-react";
import { siteConfig } from "@/lib/config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Props {
  params: Promise<{ slug: string }>;
}

async function getBlogPost(slug: string) {
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createServerClient();
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          slug: data.slug,
          title: data.title,
          excerpt: data.excerpt,
          content: data.content,
          metaTitle: data.meta_title,
          metaDescription: data.meta_description,
          keywords: data.keywords || [],
          category: data.category,
          readTime: data.read_time,
          publishedAt: data.published_at,
          author: data.author,
          imageUrl: data.image_url || "",
        };
      }
    }
  } catch (err) {
    console.error(`Error loading database blog by slug ${slug}:`, err);
  }
  return getBlogPostBySlug(slug) || null;
}

export async function generateStaticParams() {
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createServerClient();
      const { data } = await supabase.from("blogs").select("slug");
      if (data && data.length > 0) {
        return data.map((p: any) => ({ slug: p.slug }));
      }
    }
  } catch (err) {
    console.error("Static params blogs query failed:", err);
  }
  return fallbackPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return {};
  return {
    title: post.metaTitle,
    description: post.metaDescription,
    keywords: post.keywords,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: post.metaTitle,
      description: post.metaDescription,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) notFound();

  // Load related suggestions from fallback lists
  const related = fallbackPosts.filter((p) => p.slug !== post.slug && p.category === post.category).slice(0, 3);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 pt-24 transition-colors">
      {/* Breadcrumb */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center gap-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-orange-500">Home</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-orange-500">Blog</Link>
          <span>/</span>
          <span className="text-gray-700 dark:text-gray-200 line-clamp-1">{post.title}</span>
        </nav>
      </div>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-block px-3 py-1 bg-orange-500/10 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400 text-xs font-bold uppercase rounded-full mb-4">
            {post.category}
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-gray-950 dark:text-white mb-4 leading-tight tracking-tight">
            {post.title}
          </h1>
          <div className="flex items-center gap-4 text-xs font-medium text-gray-400">
            <div className="flex items-center gap-1">
              <Clock size={13} />
              <span>{post.readTime} min read</span>
            </div>
            <span>·</span>
            <span>By {post.author}</span>
            <span>·</span>
            <span>{new Date(post.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
          </div>
        </div>

        {/* Hero image */}
        <div 
          className="h-64 bg-cover bg-center rounded-3xl mb-10 shadow-sm relative overflow-hidden"
          style={{ backgroundImage: `url('${post.imageUrl || getBlogFallbackImage(post.category, post.title, post.slug)}')` }}
        >
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute bottom-6 left-6 text-white z-10">
            <p className="bg-white/20 backdrop-blur-md border border-white/10 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider inline-block">
              {post.category}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-sm sm:text-base text-gray-655 dark:text-gray-300 font-bold mb-6 leading-relaxed border-l-4 border-orange-500 pl-4 py-1 italic bg-slate-50 dark:bg-slate-900/50 p-4 rounded-r-2xl">
            {post.excerpt}
          </p>
          <div
            className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed [&_h2]:text-2xl [&_h2]:font-black [&_h2]:text-gray-950 [&_h2]:dark:text-white [&_h2]:mt-8 [&_h2]:mb-4 [&_h2]:tracking-tight [&_h3]:text-xl [&_h3]:font-black [&_h3]:text-gray-950 [&_h3]:dark:text-white [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:tracking-tight [&_p]:mb-4 [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-4 [&_li]:mb-1 [&_strong]:font-extrabold [&_strong]:text-gray-955 [&_strong]:dark:text-white [&_table]:w-full [&_table]:border-collapse [&_th]:bg-orange-500/10 [&_th]:dark:bg-orange-550/15 [&_th]:p-2 [&_th]:text-left [&_th]:border [&_th]:border-gray-200 dark:[&_th]:border-gray-800 [&_td]:p-2 [&_td]:border [&_td]:border-gray-200 dark:[&_td]:border-gray-800 font-medium"
            dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, "<br>").replace(/### /g, "<h3>").replace(/## /g, "<h2>").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/✅/g, "✅") }}
          />
        </div>

        {/* CTA */}
        <div className="mt-12 p-8 bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl text-center shadow-lg relative overflow-hidden">
          <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
          <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Need Help with Your Device?</h3>
          <p className="text-white/80 mb-6 text-sm font-medium">Contact Sai Systems for expert certified IT support and doorstep pickup.</p>
          <div className="flex flex-wrap justify-center gap-3 relative z-10">
            <Link href="/book-service" className="px-6 py-3 bg-white text-orange-600 hover:bg-orange-50 font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md">
              Book Service
            </Link>
            <a href={`tel:${siteConfig.phone}`} className="px-6 py-3 bg-white/20 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider hover:bg-white/30 transition-all border border-white/30">
              Call Now
            </a>
          </div>
        </div>

        {/* Back */}
        <div className="mt-8 flex justify-between items-center border-t border-gray-100 dark:border-gray-900 pt-6">
          <Link href="/blog" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 hover:underline">
            <ArrowLeft size={16} /> All Articles
          </Link>
          {related.length > 0 && (
            <Link href={`/blog/${related[0].slug}`} className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 hover:underline">
              {related[0].title.substring(0, 30)}... <ArrowRight size={16} />
            </Link>
          )}
        </div>
      </article>
    </div>
  );
}
