"use client";
import { useState } from "react";
import { faqs, faqCategories } from "@/lib/data/faqs";
import { ChevronDown } from "lucide-react";

export default function FAQAccordion({ limit = 10 }: { limit?: number }) {
  const [open, setOpen] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories = ["All", ...faqCategories];
  const filtered = activeCategory === "All"
    ? faqs.slice(0, limit)
    : faqs.filter((f) => f.category === activeCategory).slice(0, limit);

  return (
    <section id="faq" className="section-padding bg-white dark:bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 text-sm font-semibold rounded-full mb-4">
            FAQ
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Frequently Asked{" "}
            <span className="text-gradient">Questions</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Have a question? We&apos;ve got answers. Browse by category or{" "}
            <a href="/faq" className="text-green-600 hover:underline">view all 50 FAQs</a>.
          </p>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 text-sm rounded-full transition-all ${
                activeCategory === cat
                  ? "gradient-primary text-white shadow-md"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-950"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {filtered.map((faq) => (
            <div
              key={faq.id}
              className="bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden"
            >
              <button
                id={`faq-${faq.id}`}
                onClick={() => setOpen(open === faq.id ? null : faq.id)}
                className="w-full flex items-center justify-between px-6 py-4 text-left group"
              >
                <span className="font-medium text-gray-900 dark:text-white group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  size={18}
                  className={`text-green-600 flex-shrink-0 transition-transform duration-300 ${
                    open === faq.id ? "rotate-180" : ""
                  }`}
                />
              </button>
              {open === faq.id && (
                <div className="px-6 pb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <a
            href="/faq"
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-green-600 text-green-700 dark:text-green-400 font-semibold rounded-xl hover:bg-green-600 hover:text-white transition-all"
          >
            View All 50 FAQs
          </a>
        </div>
      </div>
    </section>
  );
}
