import { testimonials } from "@/lib/data/testimonials";
import { Star, Quote } from "lucide-react";

export default function Testimonials() {
  return (
    <section id="testimonials" className="section-padding bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 text-sm font-semibold rounded-full mb-4">
            Customer Reviews
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            What Our{" "}
            <span className="text-gradient">Customers Say</span>
          </h2>
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <div className="flex">
              {[1,2,3,4,5].map(i => (
                <Star key={i} size={18} className="text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">4.9/5</span>
            <span>based on 500+ reviews</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={t.id}
              id={`testimonial-${t.id}`}
              className="card-hover bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 hover:border-green-200 dark:hover:border-green-700 relative"
            >
              {/* Quote icon */}
              <Quote className="absolute top-4 right-4 text-green-200 dark:text-green-900 w-10 h-10" />

              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>

              {/* Review */}
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4 line-clamp-5">
                &ldquo;{t.review}&rdquo;
              </p>

              {/* Service badge */}
              <span className="inline-block px-2 py-0.5 bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 text-xs rounded-full mb-4">
                {t.service}
              </span>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {t.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.role} · {t.location}</p>
                </div>
                <span className="ml-auto text-xs text-gray-400">{t.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
