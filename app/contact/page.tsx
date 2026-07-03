import type { Metadata } from "next";
import ContactClient from "@/components/contact/ContactClient";

export const metadata: Metadata = {
  title: "Contact Us | Sai Systems",
  description: "Contact Sai Systems for refurbished laptop/desktop sales, printer/scanner services, CCTV camera setup, and business networking in Dindigul.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 pt-24">
      <div className="gradient-dark py-16 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Contact <span className="text-gradient">Us</span>
        </h1>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Get in touch with our team for sales, service, or setup inquiries. We are happy to help!
        </p>
      </div>

      <ContactClient />
    </div>
  );
}
