import type { Metadata } from "next";
import { faqs, faqCategories } from "@/lib/data/faqs";
import FAQAccordion from "@/components/home/FAQAccordion";

export const metadata: Metadata = {
  title: "FAQ — Frequently Asked Questions | Sai Systems",
  description: "50+ FAQs covering laptop repair, computer repair, networking, antivirus, motherboard repair, screen replacement, battery replacement, and data recovery.",
  alternates: { canonical: "/faq" },
};

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 pt-24">
      <div className="gradient-dark py-16 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Frequently Asked <span className="text-gradient">Questions</span>
        </h1>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Find answers to the most common questions about our services. Can&apos;t find what you&apos;re looking for? Contact us!
        </p>
      </div>

      <FAQAccordion limit={faqs.length} />
    </div>
  );
}
