import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "Terms & Conditions | Sai Systems",
  description: "Terms and conditions for using Sai Systems services.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 pt-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Terms &amp; Conditions</h1>
        <p className="text-gray-400 text-sm mb-8">Last updated: June 2025</p>

        <div className="space-y-8 text-gray-600 dark:text-gray-300">
          {[
            { title: "1. Acceptance of Terms", body: "By using Sai Systems' services, you agree to these terms. If you do not agree, please do not use our services." },
            { title: "2. Services", body: "We provide computer repair, laptop repair, networking, IT support, and related services. All services are subject to availability and technical feasibility." },
            { title: "3. Pricing and Payment", body: "Prices are provided as quotations after free diagnosis. Payment is due upon service completion. We accept cash, UPI, bank transfer, and card payments." },
            { title: "4. Warranty", body: "All repairs carry a 365-day service warranty. This covers the specific issue repaired. The warranty does not cover new damage, physical damage, or issues unrelated to the original repair." },
            { title: "5. Data Responsibility", body: "While we take care to protect your data, we recommend backing up your data before submitting your device. Sai Systems is not liable for data loss arising from hardware failure." },
            { title: "6. Limitation of Liability", body: "Our liability is limited to the service amount paid. We are not liable for consequential, indirect, or incidental damages." },
            { title: "7. Customer Responsibilities", body: "Customers are responsible for providing accurate information, paying agreed amounts, and collecting their device within 30 days of repair completion." },
            { title: "8. Governing Law", body: "These terms are governed by Indian law. Any disputes shall be resolved under the jurisdiction of courts in India." },
            { title: "9. Contact", body: `For any queries regarding these terms, contact us at ${siteConfig.email}.` },
          ].map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{section.title}</h2>
              <p>{section.body}</p>
            </section>
          ))}
        </div>
        <div className="mt-8">
          <Link href="/" className="text-orange-600 dark:text-orange-400 hover:underline text-sm">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
