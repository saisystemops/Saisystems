import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { brands } from "@/lib/data/brands";

export const metadata: Metadata = {
  title: "Supported Brands | Sai Systems",
  description: "Sai Systems supports all major computer and laptop brands — HP, Dell, Lenovo, Acer, Asus, MSI, Samsung, Toshiba, and more.",
  alternates: { canonical: "/brands" },
};

export default function BrandsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 pt-24">
      {/* Hero */}
      <div className="gradient-dark py-16 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Brands We <span className="text-gradient">Support</span>
        </h1>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Our certified technicians are trained to repair and maintain all major computer and laptop brands.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {brands.map((brand) => (
            <div
              key={brand.id}
              id={`brand-page-${brand.id}`}
              className="card-hover bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 hover:border-green-200 dark:hover:border-green-800"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-md relative overflow-hidden flex-shrink-0 border border-gray-100 dark:border-gray-800">
                  <Image
                    src={brand.logo}
                    alt={`${brand.name} logo`}
                    fill
                    sizes="64px"
                    className="object-contain p-1"
                  />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">{brand.name}</h2>
                  <p className="text-xs text-gray-500">{brand.description}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {brand.services.map((svc) => (
                  <span key={svc} className="px-2 py-1 bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 text-xs rounded-full">
                    {svc}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/book-service"
            className="inline-flex items-center gap-2 px-8 py-3.5 gradient-primary text-white font-bold rounded-2xl hover:opacity-90 transition-all shadow-lg">
            Book Repair for Your Brand
          </Link>
        </div>
      </div>
    </div>
  );
}
