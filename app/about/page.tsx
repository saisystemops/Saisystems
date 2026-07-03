import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "About Us | Sai Systems",
  description: "Learn about Sai Systems — India's trusted refurbished IT hardware sales & services company in Dindigul, Tamil Nadu since 2018.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 pt-24">
      <div className="gradient-dark py-16 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          About <span className="text-gradient">Sai Systems</span>
        </h1>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Trusted Refurbished IT Products Sales &amp; Services since {siteConfig.established}.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Mission */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            At Sai Systems, our mission is to provide premium quality refurbished laptops, desktops, and IT services
            at affordable wholesale and retail rates. We strive to offer our clients certified, 100-point tested hardware
            that delivers high-performance and absolute reliability, supported by our dedicated repair and networking desk.
          </p>
        </div>

        {/* Story */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Story</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            Founded in {siteConfig.established}, Sai Systems started with a simple vision — to make high-quality computers
            accessible and affordable for everyone in Dindigul and across Tamil Nadu. Over the years, we have grown into
            a leading distributor of refurbished IT products, catering to retail customers, corporate setups, and resellers alike.
          </p>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Today, our team of certified technicians handles everything from chip-level motherboard repair to
            enterprise network setup and CCTV camera installation, always with a strict commitment to quality, transparency, and client satisfaction.
          </p>
        </div>

        {/* Values */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Our Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: "🎯", title: "Transparency", description: "Free inspection and honest quotes — no surprise charges." },
              { icon: "⚡", title: "Speed", description: "Fast delivery and same-day support for business customers." },
              { icon: "🔒", title: "Trust", description: "Your data and devices are treated with 100% security." },
              { icon: "💡", title: "Innovation", description: "Thorough testing with advanced diagnostics tools." },
              { icon: "🤝", title: "Partnership", description: "Long-term wholesale relationships and retail trust." },
              { icon: "✅", title: "Quality", description: "Genuine components and certified hardware testing checks." },
            ].map((v) => (
              <div key={v.title} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                <span className="text-2xl">{v.icon}</span>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{v.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{v.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { value: "5,000+", label: "Customers Served" },
            { value: "8+", label: "Years in Business" },
            { value: "15+", label: "Expert Technicians" },
            { value: "99%", label: "Customer Satisfaction" },
          ].map((s) => (
            <div key={s.label} className="text-center p-4 bg-green-50 dark:bg-green-950/30 rounded-2xl">
              <div className="text-2xl font-bold text-green-700 dark:text-green-400 mb-1">{s.value}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Target customers */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Who We Serve</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {["🏠 Home Users", "🎓 Students", "🏢 Small Businesses", "🏛️ Corporate Offices",
              "🏫 Schools & Colleges", "🏥 Hospitals", "🚀 Startups", "🌐 Enterprises"].map((c) => (
              <div key={c} className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl text-sm text-gray-700 dark:text-gray-200">
                {c}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
