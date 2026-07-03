import type { Metadata } from "next";
import BookingWizard from "@/components/booking/BookingWizard";
import Image from "next/image";
import { heroImages } from "@/lib/images";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Book Computer & Laptop Repair Service | Sai Systems",
  description: "Book a computer or laptop repair appointment online. Select service, choose time, and confirm. Free diagnosis. Same-day service available. 365-day warranty.",
  alternates: { canonical: "/book-service" },
};

export default function BookServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero */}
      <div className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={heroImages.technician}
            alt="Book laptop repair service"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950/95 to-gray-900/80" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center pt-16">
          <span className="inline-block px-4 py-1.5 bg-orange-500/20 border border-orange-500/30 text-orange-400 text-sm font-semibold rounded-full mb-4">
            📅 Online Booking
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-4">
            Book Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">
              Service Session
            </span>
          </h1>
          <p className="text-gray-300 max-w-xl mx-auto">
            Select your service, pick a date & time, and get a WhatsApp confirmation instantly.
            <br />
            <span className="text-green-400 font-semibold">Free diagnosis · 365-day warranty · No hidden charges</span>
          </p>
        </div>
      </div>

      {/* Booking form */}
      <div className="max-w-2xl mx-auto px-4 py-12 -mt-8">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8">
          <Suspense fallback={
            <div className="text-center py-12">
              <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">Loading booking form...</p>
            </div>
          }>
            <BookingWizard />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
