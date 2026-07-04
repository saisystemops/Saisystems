"use client";
import { Shield, RefreshCw, CheckSquare, Award } from "lucide-react";

const metrics = [
  {
    icon: <CheckSquare className="w-6 h-6" />,
    title: "40-Point Inspection",
    subtitle: "Hardware QA Check",
    description: "Every refurbished laptop and desktop undergoes rigorous hardware diagnostics, keyboard matrix checks, battery runtime analysis, and clean thermal repasting before display.",
    color: "bg-white dark:bg-gray-900/60 border-gray-200/80 dark:border-gray-800 hover:border-orange-500/30",
    iconColor: "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 border-orange-100 dark:border-orange-900/50"
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "365-Day Warranty",
    subtitle: "Official Service Shield",
    description: "Your trust is protected. All hardware items carry an official 365-day service desk warranty. Any component issues are resolved directly by our technicians for free.",
    color: "bg-white dark:bg-gray-900/60 border-gray-200/80 dark:border-gray-800 hover:border-orange-500/30",
    iconColor: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900/50"
  },
  {
    icon: <RefreshCw className="w-6 h-6" />,
    title: "Wholesale & Retail pricing",
    subtitle: "Direct Showroom Deals",
    description: "We procure laptops and desktops in high-volume bulk corporate lots. This lets us sell them at unbeatable wholesale rates to both retail shops and individual buyers.",
    color: "bg-white dark:bg-gray-900/60 border-gray-200/80 dark:border-gray-800 hover:border-orange-500/30",
    iconColor: "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 border-orange-100 dark:border-orange-900/50"
  },
  {
    icon: <Award className="w-6 h-6" />,
    title: "Certified Tech Support",
    subtitle: "Dindigul Service Desk",
    description: "No remote call centers. Get direct, face-to-face support from certified hardware engineers at our physical showroom next to the Dindigul Head Post Office.",
    color: "bg-white dark:bg-gray-900/60 border-gray-200/80 dark:border-gray-800 hover:border-orange-500/30",
    iconColor: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900/50"
  }
];

export default function WhyChooseUs() {
  return (
    <section id="why-us" className="py-20 bg-gray-50 dark:bg-gray-950 relative border-t border-b border-gray-150 dark:border-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-orange-500/10 border border-orange-500/30 text-orange-600 dark:text-orange-400 text-xs font-bold uppercase tracking-wider rounded-full mb-4">
            The Sai Guarantee
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
            Designed For Complete <span className="text-gradient">Peace of Mind</span>
          </h2>
          <p className="text-gray-700 dark:text-gray-400 max-w-2xl mx-auto text-sm md:text-base font-semibold leading-relaxed">
            We don&apos;t just supply IT hardware — we back every purchase with rigorous testing, local service support, and transparent wholesale pricing.
          </p>
        </div>

        {/* Bento Board Trust Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {metrics.map((m, idx) => (
            <div
              key={idx}
              className={`group ${m.color} backdrop-blur-sm rounded-3xl p-6 sm:p-8 border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:hover:shadow-orange-950/10`}
            >
              <div className="flex flex-col sm:flex-row gap-5 items-start">
                <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center flex-shrink-0 group-hover:scale-110 duration-300 ${m.iconColor}`}>
                  {m.icon}
                </div>
                <div>
                  <div className="text-[10px] uppercase font-extrabold tracking-wider text-orange-600 dark:text-orange-400 mb-1">
                    {m.subtitle}
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white mb-2">
                    {m.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-semibold">
                    {m.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Verification banner */}
        <div className="mt-14 p-6 bg-gradient-to-r from-orange-600 to-amber-600 rounded-3xl text-center shadow-lg shadow-orange-950/20">
          <h3 className="text-lg sm:text-xl font-black text-white mb-1">Visit Our Dindigul Showroom Today</h3>
          <p className="text-white/90 text-xs sm:text-sm font-semibold max-w-2xl mx-auto">
            Inspect refurbished laptops live, check display quality, test typing tactile keys, and check camera night vision performance with our technicians.
          </p>
        </div>

      </div>
    </section>
  );
}
