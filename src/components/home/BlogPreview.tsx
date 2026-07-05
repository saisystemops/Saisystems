import Link from "next/link";
import { blogPosts, getBlogFallbackImage } from "@/lib/data/blog-posts";
import { Clock, ArrowRight } from "lucide-react";

export default function BlogPreview() {
  const featured = blogPosts.slice(0, 3);

  return (
    <section id="blog" className="section-padding bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
          <div>
            <span className="inline-block px-4 py-1.5 bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 text-sm font-semibold rounded-full mb-3">
              Blog & Tips
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Expert{" "}
              <span className="text-gradient">IT Advice</span>
            </h2>
          </div>
          <Link
            href="/blog"
            id="view-all-blog-btn"
            className="flex items-center gap-2 px-5 py-2.5 border-2 border-green-600 text-green-700 dark:text-green-400 font-semibold rounded-xl hover:bg-green-600 hover:text-white transition-all text-sm whitespace-nowrap"
          >
            All Articles <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featured.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              id={`blog-${post.id}`}
              className="group card-hover bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-green-200 dark:hover:border-green-700"
            >
              {/* Card Image */}
              <div 
                className="h-44 bg-cover bg-center relative"
                style={{ backgroundImage: `url('${post.imageUrl || getBlogFallbackImage(post.category, post.title, post.slug)}')` }}
              >
                <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md text-white font-extrabold text-[10px] uppercase tracking-wider rounded-full px-3 py-1 border border-white/10">
                  {post.category}
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                  <Clock size={12} />
                  <span>{post.readTime} min read</span>
                  <span>·</span>
                  <span>{new Date(post.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">
                  {post.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
                  {post.excerpt}
                </p>
                <div className="flex items-center gap-1 text-green-700 dark:text-green-400 text-sm font-medium">
                  Read More <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
