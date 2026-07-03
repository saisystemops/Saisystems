import type { Metadata } from "next";
import Link from "next/link";
import { blogPosts } from "@/lib/data/blog-posts";
import { Clock, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "IT Tips & Blog | Sai Systems",
  description: "Expert IT tips, laptop repair guides, computer maintenance advice, and technology insights from Sai Systems.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 pt-24">
      <div className="gradient-dark py-16 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          IT Tips &amp; <span className="text-gradient">Blog</span>
        </h1>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Expert advice, repair guides, and technology tips from our certified technicians.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              id={`blog-list-${post.id}`}
              className="group card-hover bg-gray-50 dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:border-green-200 dark:hover:border-green-800"
            >
              <div className="h-44 gradient-primary flex items-center justify-center">
                <div className="text-center text-white p-4">
                  <div className="text-4xl mb-2">📝</div>
                  <div className="text-xs bg-white/20 rounded-full px-3 py-1">{post.category}</div>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                  <Clock size={12} />
                  <span>{post.readTime} min read</span>
                  <span>·</span>
                  <span>{new Date(post.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>
                <h2 className="font-bold text-gray-900 dark:text-white mb-2 group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors line-clamp-2">
                  {post.title}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">{post.excerpt}</p>
                <div className="flex items-center gap-1 text-green-700 dark:text-green-400 text-sm font-medium">
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
