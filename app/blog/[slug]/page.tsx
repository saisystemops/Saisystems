import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { blogPosts, getBlogPostBySlug } from "@/lib/data/blog-posts";
import { Clock, ArrowLeft, ArrowRight } from "lucide-react";
import { siteConfig } from "@/lib/config";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
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
  const post = getBlogPostBySlug(slug);
  if (!post) notFound();

  const related = blogPosts.filter((p) => p.id !== post.id && p.category === post.category).slice(0, 3);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 pt-24">
      {/* Breadcrumb */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center gap-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-green-600">Home</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-green-600">Blog</Link>
          <span>/</span>
          <span className="text-gray-700 dark:text-gray-200 line-clamp-1">{post.title}</span>
        </nav>
      </div>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-block px-3 py-1 bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 text-sm rounded-full mb-4">
            {post.category}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
            {post.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{post.readTime} min read</span>
            </div>
            <span>·</span>
            <span>By {post.author}</span>
            <span>·</span>
            <span>{new Date(post.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
          </div>
        </div>

        {/* Hero image placeholder */}
        <div className="h-64 gradient-primary rounded-2xl flex items-center justify-center mb-10">
          <div className="text-center text-white">
            <div className="text-6xl mb-2">📝</div>
            <p className="text-green-100">{post.category}</p>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-lg text-gray-600 dark:text-gray-300 font-medium mb-6 leading-relaxed">
            {post.excerpt}
          </p>
          <div
            className="text-gray-700 dark:text-gray-300 leading-relaxed [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:dark:text-white [&_h2]:mt-8 [&_h2]:mb-4 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-gray-900 [&_h3]:dark:text-white [&_h3]:mt-6 [&_h3]:mb-3 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-4 [&_li]:mb-1 [&_strong]:font-semibold [&_strong]:text-gray-900 [&_strong]:dark:text-white [&_table]:w-full [&_table]:border-collapse [&_th]:bg-green-50 [&_th]:dark:bg-green-950 [&_th]:p-2 [&_th]:text-left [&_th]:border [&_th]:border-gray-200 [&_td]:p-2 [&_td]:border [&_td]:border-gray-200"
            dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, "<br>").replace(/### /g, "<h3>").replace(/## /g, "<h2>").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/✅/g, "✅") }}
          />
        </div>

        {/* CTA */}
        <div className="mt-10 p-6 gradient-primary rounded-2xl text-center">
          <h3 className="text-2xl font-bold text-white mb-2">Need Help with Your Device?</h3>
          <p className="text-green-100 mb-4">Contact Sai Systems for expert IT support across India.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/book-service" className="px-6 py-2.5 bg-white text-green-800 font-bold rounded-xl hover:bg-green-50 transition-all">
              Book Service
            </Link>
            <a href={`tel:${siteConfig.phone}`} className="px-6 py-2.5 bg-white/20 text-white font-bold rounded-xl hover:bg-white/30 transition-all border border-white/30">
              Call Now
            </a>
          </div>
        </div>

        {/* Back */}
        <div className="mt-8 flex justify-between items-center">
          <Link href="/blog" className="inline-flex items-center gap-2 text-green-700 dark:text-green-400 hover:underline">
            <ArrowLeft size={16} /> All Articles
          </Link>
          {related.length > 0 && (
            <Link href={`/blog/${related[0].slug}`} className="inline-flex items-center gap-2 text-green-700 dark:text-green-400 hover:underline">
              {related[0].title.substring(0, 30)}... <ArrowRight size={16} />
            </Link>
          )}
        </div>
      </article>
    </div>
  );
}
