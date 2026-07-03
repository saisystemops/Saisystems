"use client";
import Link from "next/link";
import { Laptop, Monitor, Shield, ArrowUpRight, Cpu, Activity, MessageCircle, Smartphone } from "lucide-react";
import { siteConfig } from "@/lib/config";

const bentoServices = [
  {
    id: "serv-refurbished",
    title: "Refurbished IT Hardware Sales",
    tagline: "Wholesale & Retail Showroom",
    description: "Dindigul's premier destination for certified refurbished laptops, desktops, and accessories. Thoroughly vetted under a 40-point verification checklist with active physical service warranty.",
    features: ["HP, Dell, Lenovo Business Series", "Wholesale package pricing", "365-day service guarantee", "Original battery & charger packs"],
    icon: Laptop,
    class: "md:col-span-2 md:row-span-2 bg-gradient-to-br from-gray-900 via-gray-900 to-orange-950/20 border-orange-500/10 hover:border-orange-500/30 shadow-orange-950/20",
    link: "/services/sales-and-service-new-old-second-hand",
    iconColor: "text-orange-500 bg-orange-500/10 border-orange-500/20",
    buttonText: "Request Wholesale Price List"
  },
  {
    id: "serv-cctv",
    title: "CCTV & Security Networking",
    tagline: "Ultra HD Surveillance Systems",
    description: "Professional camera installation and business LAN setups. Protect your premises with intelligent DVR/NVR solutions.",
    features: ["HD Color Night Vision", "Smartphone App Link", "Annual Maintenance Contracts (AMC)"],
    icon: Shield,
    class: "md:col-span-1 bg-gray-900/60 border-white/5 hover:border-orange-500/20",
    link: "/services/cctv-camera-installation-service",
    iconColor: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    buttonText: "Browse CCTV Packs"
  },
  {
    id: "serv-laptop",
    title: "Chip-Level Laptop Repairing",
    tagline: "Advanced Circuit Troubleshooting",
    description: "Motherboard repairs, short-circuit diagnostics, screen fixes, and custom upgrades by certified chip-level technicians.",
    features: ["IC replacement & soldering", "FHD panel replacement", "Charging port resolution"],
    icon: Cpu,
    class: "md:col-span-1 bg-gray-900/60 border-white/5 hover:border-orange-500/20",
    link: "/services/laptop-motherboard-repair",
    iconColor: "text-rose-500 bg-rose-500/10 border-rose-500/20",
    buttonText: "Book Motherboard Check"
  },
  {
    id: "serv-computer",
    title: "Workstation & Desktop CPU Setup",
    tagline: "Custom Assembled Computers",
    description: "High-performance PC setups for offices, schools, and custom gaming builds. Fast troubleshooting for hardware crashes.",
    features: ["Office workstation sets", "SSD and RAM upgrades", "Power supply diagnostics"],
    icon: Monitor,
    class: "md:col-span-1 bg-gray-900/60 border-white/5 hover:border-orange-500/20",
    link: "/services/desktop-cpu-setup-assembly",
    iconColor: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    buttonText: "Get Desktop Quote"
  },
  {
    id: "serv-spares",
    title: "Spare Parts & Accessories Desk",
    tagline: "Genuine Hardware Upgrades",
    description: "Supercharge your devices with original RAM modules, high-speed SSDs, replacement batteries, original laptop charger adapters, and premium mobile accessories.",
    features: ["RAM & SSD Installations", "Original Charger Adapters", "Replacement Laptop Batteries", "Premium Phone Accessories"],
    icon: Smartphone,
    class: "md:col-span-2 bg-gradient-to-r from-gray-900 to-orange-950/15 border-white/5 hover:border-orange-500/20",
    link: "/products",
    iconColor: "text-orange-500 bg-orange-500/10 border-orange-500/20",
    buttonText: "Explore Accessories & Spares"
  }
];

export default function ServicesSection() {
  const getWhatsAppLink = (title: string) => {
    return `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(`Hi Sai Systems! I would like to get details or book support for: ${title}.`)}`;
  };

  return (
    <section id="services" className="section-padding bg-gray-950 text-white relative">
      {/* Background visual ornaments */}
      <div className="absolute top-[30%] left-[-10%] w-[35%] h-[35%] rounded-full bg-orange-950/10 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider rounded-full mb-4">
            Our Expertise
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4 tracking-tight">
            Hardware Sales, Repair &amp; <span className="text-gradient">CCTV Services</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base font-medium">
            From wholesale refurbished computer sales to advanced chip-level motherboard repairing and CCTV setup. Select a service category to begin.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[minmax(180px,auto)]">
          {bentoServices.map((service) => (
            <div
              key={service.id}
              className={`group rounded-3xl p-6 border backdrop-blur-sm transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 ${service.class}`}
            >
              {/* Top details */}
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 duration-300 ${service.iconColor}`}>
                    <service.icon size={22} />
                  </div>
                  <Link
                    href={service.link}
                    className="w-9 h-9 rounded-full bg-white/5 border border-white/10 hover:border-orange-500/30 text-gray-400 hover:text-white flex items-center justify-center transition-all hover:rotate-45"
                  >
                    <ArrowUpRight size={16} />
                  </Link>
                </div>

                <div className="text-[10px] uppercase font-extrabold tracking-wider text-orange-500/80 mb-1">
                  {service.tagline}
                </div>
                <h3 className="text-xl font-black text-white tracking-tight mb-2 group-hover:text-orange-500 transition-colors">
                  {service.title}
                </h3>
                <p className="text-xs text-gray-400 font-medium leading-relaxed mb-4">
                  {service.description}
                </p>

                {/* Bullets */}
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
                  {service.features.map((feat, index) => (
                    <li key={index} className="flex items-center gap-2 text-[11px] text-gray-300 font-semibold">
                      <Activity size={10} className="text-orange-500 flex-shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Bottom Actions */}
              <div className="flex gap-2 mt-auto">
                <a
                  href={getWhatsAppLink(service.title)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-[#25d366] text-white text-xs font-black rounded-xl hover:bg-[#20bd5a] transition-all hover:scale-[1.02] shadow-sm cursor-pointer"
                >
                  <MessageCircle size={14} /> {service.buttonText}
                </a>
                <Link
                  href={service.link}
                  className="px-4 flex items-center justify-center bg-white/5 border border-white/10 text-gray-300 text-xs font-bold rounded-xl hover:border-orange-500 hover:text-white transition-all hover:scale-[1.02]"
                >
                  Learn More
                </Link>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
