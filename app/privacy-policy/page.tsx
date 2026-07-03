import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "Privacy Policy | Sai Systems",
  description: "Read the privacy policy for Sai Systems — how we collect, use, and protect your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 pt-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Privacy Policy</h1>
        <p className="text-gray-400 text-sm mb-8">Last updated: June 2025</p>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-8 text-gray-600 dark:text-gray-300">
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">1. Information We Collect</h2>
            <p>We collect information you provide when booking services or filling contact forms — including your name, phone number, email address, and device details. We also collect website usage data through analytics tools.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">2. How We Use Your Information</h2>
            <p>We use your information to: provide the requested service, send service updates and quotations, improve our services, and communicate important notices. We do not sell or share your personal information with third parties for marketing.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">3. Data Security</h2>
            <p>We implement industry-standard security measures to protect your personal information. Our website uses HTTPS encryption, and data is stored securely in encrypted databases.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">4. Cookies</h2>
            <p>Our website uses cookies to improve user experience and analyze website traffic. You can choose to disable cookies in your browser settings, though some website features may not work correctly.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">5. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal information. To exercise these rights, contact us at <a href={`mailto:${siteConfig.email}`} className="text-green-600 hover:underline">{siteConfig.email}</a>.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">6. Contact Us</h2>
            <p>For privacy-related queries, contact Sai Systems at {siteConfig.email} or {siteConfig.phone}.</p>
          </section>
        </div>
        <div className="mt-8">
          <Link href="/" className="text-green-600 hover:underline text-sm">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
