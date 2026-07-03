"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Phone, MessageCircle, CalendarDays, Star, Shield, Zap, Award, CheckCircle, Cpu, HardDrive, Monitor, ShieldAlert, ChevronLeft, ChevronRight } from "lucide-react";
import { siteConfig } from "@/lib/config";
import { trackCallClick, trackWhatsAppClick, trackBookingClick } from "@/lib/analytics";

const stats = [
  { value: "8+", label: "Years Excellence" },
  { value: "365-Day", label: "Service Warranty" },
  { value: "Wholesale", label: "Price Guarantee" },
  { value: "4.9★", label: "Google Rating" },
];

const badges = [
  { icon: Shield, text: "365-Day Warranty" },
  { icon: Zap, text: "Same-Day Handover" },
  { icon: Award, text: "Certified Technicians" },
  { icon: CheckCircle, text: "Free Consultation" },
];

export default function HeroSection() {
  const [deals, setDeals] = useState<any[]>([
    {
      title: "Lenovo ThinkPad T480",
      price: "₹15,499",
      originalPrice: "₹52,000",
      badge: "Premium Grade",
      category: "laptops",
      specs: ["Intel Core i5", "16GB DDR4 RAM", "512GB High-Speed SSD"]
    },
    {
      title: "HP EliteBook 840 G5",
      price: "₹14,999",
      originalPrice: "₹45,000",
      badge: "Best Seller",
      category: "laptops",
      specs: ["Intel Core i5", "8GB DDR4 RAM", "256GB NVMe SSD"]
    },
    {
      title: "Dell Latitude 5490",
      price: "₹13,999",
      originalPrice: "₹42,000",
      badge: "Value Deal",
      category: "laptops",
      specs: ["Intel Core i5", "8GB DDR4 RAM", "256GB SSD Storage"]
    }
  ]);

  const [dealCctv, setDealCctv] = useState({
    title: "4-Camera Full HD CCTV Kit",
    price: "₹7,999"
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const loadHeroDeals = async () => {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const featured = data.filter((p: any) => 
              p.category === "laptops" || p.category === "desktops" || p.category === "cctv"
            );
            if (featured.length > 0) {
              const mappedDeals = featured.slice(0, 6).map((p: any) => ({
                title: p.title,
                price: p.price,
                originalPrice: p.originalPrice || "",
                badge: p.badge || "Hot Deal",
                category: p.category,
                specs: Array.isArray(p.specs) ? p.specs : []
              }));
              setDeals(mappedDeals);
            }

            const cctv = data.find((p: any) => p.category === "cctv");
            if (cctv) {
              setDealCctv({
                title: cctv.title,
                price: cctv.price
              });
            }
          }
        }
      } catch (err) {
        console.error("Failed to load hero deals dynamically:", err);
      }
    };
    loadHeroDeals();
  }, []);

  // Automatic slideshow
  useEffect(() => {
    if (deals.length <= 1) return;
    const timer = setInterval(() => {
      handleNext();
    }, 5500);
    return () => clearInterval(timer);
  }, [deals, currentIndex]);

  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % deals.length);
      setIsTransitioning(false);
    }, 200);
  };

  const handlePrev = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + deals.length) % deals.length);
      setIsTransitioning(false);
    }, 200);
  };

  const currentDeal = deals[currentIndex] || deals[0];
  const specLabels = currentDeal.category === "cctv" 
    ? ["Cameras", "Channels", "Storage"]
    : ["Processor", "Memory", "Storage"];

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-950 pt-28 pb-16">
      {/* Ambient background image with soft overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero-bg.png"
          alt="Ambient Tech Background"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-20 pointer-events-none"
        />
        {/* Dark radial and linear gradients for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/30 via-gray-950/80 to-gray-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,transparent_20%,#030712_90%)]" />
      </div>

      {/* Premium Cyber-Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(234,88,12,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(234,88,12,0.04)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] z-0" />
      
      {/* Background glow orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-orange-950/15 blur-[120px] z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-amber-950/15 blur-[120px] z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* LEFT SIDE: Copy & Call-to-actions */}
          <div className="lg:col-span-7 text-left">
            {/* Glowing Brand Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-500/10 border border-orange-500/30 rounded-full text-orange-400 text-xs sm:text-sm font-semibold mb-6 backdrop-blur-sm shadow-inner">
              <Star size={14} className="fill-orange-400 animate-spin-slow" />
              <span>Dindigul&apos;s Trusted IT Showroom since 2018</span>
            </div>

            {/* Premium Gold/Copper Gradient Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-none tracking-tight mb-6">
              Premium New &amp; Refurbished Laptops &amp; Desktops
              <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-400 to-amber-300">
                At Wholesale Prices.
              </span>
            </h1>

            {/* Description */}
            <p className="text-gray-300 text-base sm:text-lg mb-8 leading-relaxed max-w-2xl font-medium">
              We supply certified new &amp; refurbished laptops, computers, genuine spare parts, and mobile accessories for wholesale and retail. Also specializing in professional CCTV configurations, office networking, and expert chip-level servicing in Dindigul.
            </p>

            {/* Call-to-action buttons */}
            <div className="flex flex-wrap gap-3.5 mb-10">
              <Link
                href="/book-service"
                id="hero-book-btn"
                onClick={() => trackBookingClick("hero")}
                className="flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-extrabold rounded-2xl hover:from-orange-500 hover:to-amber-500 transition-all hover:-translate-y-0.5 shadow-lg shadow-orange-950/40 hover:shadow-orange-950/60 cursor-pointer text-sm sm:text-base"
              >
                <CalendarDays size={18} /> Book Consultation
              </Link>
              
              <a
                href="#catalog"
                id="hero-catalog-btn"
                className="flex items-center gap-2 px-6 py-4 bg-white/5 border border-white/10 hover:border-orange-500/30 backdrop-blur-sm text-white font-extrabold rounded-2xl hover:bg-white/10 transition-all hover:-translate-y-0.5 cursor-pointer text-sm sm:text-base"
              >
                Browse Catalog
              </a>

              <a
                href={`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent("Hi Sai Systems! I am looking for a refurbished laptop/desktop or CCTV setup.")}`}
                id="hero-whatsapp-btn"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick("hero_whatsapp")}
                className="flex items-center gap-2 px-6 py-4 bg-[#25d366] text-white font-extrabold rounded-2xl hover:bg-[#20bd5a] transition-all hover:-translate-y-0.5 shadow-md cursor-pointer text-sm sm:text-base"
              >
                <MessageCircle size={18} /> Chat Live
              </a>
            </div>

            {/* Dynamic trust badges */}
            <div className="flex flex-wrap gap-3.5 border-t border-gray-900 pt-8">
              {badges.map((badge, idx) => (
                <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-gray-300 text-xs font-semibold backdrop-blur-sm">
                  <badge.icon size={13} className="text-orange-400" />
                  <span>{badge.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT SIDE: Interactive 3D floating Spec & CCTV mockup card */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            {/* Rotating glowing cyber-circles in background */}
            <div className="absolute w-72 h-72 border border-orange-500/10 rounded-full animate-spin-slow z-0" />
            <div className="absolute w-80 h-80 border border-dashed border-amber-500/10 rounded-full animate-spin-slow z-0" style={{ animationDirection: "reverse" }} />
            
            {/* The Floating Spec Board */}
            <div className={`relative z-10 w-full max-w-md bg-gray-900/60 border border-white/10 rounded-3xl p-6 backdrop-blur-md shadow-2xl glow-gold animate-float transition-all duration-200 ${isTransitioning ? "opacity-30 scale-[0.98] blur-[2px]" : "opacity-100 scale-100 blur-0"}`}>
              {/* Card top */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-rose-500 rounded-full" />
                  <span className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-2.5 py-0.5 bg-orange-600/20 text-orange-400 border border-orange-600/30 text-[10px] uppercase font-bold tracking-widest rounded-full">
                    {currentDeal.badge}
                  </div>
                  <div className="flex items-center gap-1 bg-white/5 border border-white/5 px-1.5 py-0.5 rounded-md">
                    <button 
                      onClick={handlePrev} 
                      className="p-0.5 text-gray-400 hover:text-white transition-colors"
                      title="Previous Offer"
                    >
                      <ChevronLeft size={12} />
                    </button>
                    <span className="text-[9px] font-mono font-bold text-gray-500">{currentIndex + 1}/{deals.length}</span>
                    <button 
                      onClick={handleNext} 
                      className="p-0.5 text-gray-400 hover:text-white transition-colors"
                      title="Next Offer"
                    >
                      <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Product Info Mockup */}
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase font-extrabold tracking-wider text-orange-400">
                      {currentDeal.category === "cctv" ? "Full Surveillance Kit" : "Refurbished Grade A++"}
                    </span>
                    <h3 className="text-xl font-black text-white mt-0.5">{currentDeal.title}</h3>
                  </div>
                  <div className="text-right">
                    {currentDeal.originalPrice && <span className="text-xs text-gray-400 line-through">{currentDeal.originalPrice}</span>}
                    <div className="text-lg font-black text-orange-400">{currentDeal.price}</div>
                  </div>
                </div>

                {/* Specs row */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="bg-white/5 border border-white/5 rounded-xl p-2.5 text-center">
                    <Cpu className="w-4 h-4 text-orange-400 mx-auto mb-1.5" />
                    <div className="text-[10px] font-bold text-gray-400 uppercase">{specLabels[0]}</div>
                    <div className="text-xs font-extrabold text-white mt-0.5">{currentDeal.specs[0] || "Intel i5"}</div>
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-xl p-2.5 text-center">
                    <Cpu className="w-4 h-4 text-orange-400 mx-auto mb-1.5" />
                    <div className="text-[10px] font-bold text-gray-400 uppercase">{specLabels[1]}</div>
                    <div className="text-xs font-extrabold text-white mt-0.5">{currentDeal.specs[1] || "16GB DDR4"}</div>
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-xl p-2.5 text-center">
                    <HardDrive className="w-4 h-4 text-orange-400 mx-auto mb-1.5" />
                    <div className="text-[10px] font-bold text-gray-400 uppercase">{specLabels[2]}</div>
                    <div className="text-xs font-extrabold text-white mt-0.5">{currentDeal.specs[2] || "512GB SSD"}</div>
                  </div>
                </div>

                {/* Dynamic secondary banner */}
                <div className="bg-gray-950/70 border border-white/5 rounded-2xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-orange-600/10 border border-orange-600/30 flex items-center justify-center flex-shrink-0">
                      <Monitor className="w-4 h-4 text-orange-400" />
                    </div>
                    {currentDeal.category === "laptops" ? (
                      <div>
                        <div className="text-[10px] font-bold text-orange-400 uppercase">Surveillance offer</div>
                        <div className="text-xs font-extrabold text-white">{dealCctv.title}</div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-[10px] font-bold text-orange-400 uppercase">Refurbished laptop</div>
                        <div className="text-xs font-extrabold text-white">HP EliteBook 840 G5</div>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] text-gray-400 font-bold">Inclusive Pack</div>
                    <div className="text-xs font-black text-white">
                      {currentDeal.category === "laptops" ? `${dealCctv.price}*` : "₹14,999*"}
                    </div>
                  </div>
                </div>

                {/* Warranty indicator */}
                <div className="flex items-center gap-2 text-xs text-gray-400 bg-white/5 rounded-xl px-3 py-2 border border-white/5">
                  <Shield size={14} className="text-orange-400" />
                  <span>Includes **365-Day Physical Service Warranty**</span>
                </div>
              </div>
            </div>

            {/* Secondary delayed floating element (trust rating card) */}
            <div className="absolute bottom-[-16px] left-[-16px] z-20 bg-gray-900 border border-white/10 p-3.5 rounded-2xl flex items-center gap-3 shadow-xl animate-float-delayed">
              <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center font-black text-white text-base">
                8+
              </div>
              <div>
                <div className="text-xs font-extrabold text-white">Years Trust</div>
                <div className="text-[10px] text-gray-400">Dindigul Showroom</div>
              </div>
            </div>
          </div>

        </div>

        {/* Stats bottom row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 pt-10 border-t border-gray-900">
          {stats.map((s, idx) => (
            <div key={idx} className="bg-gray-900/40 border border-white/5 rounded-2xl p-4 text-center backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">{s.value}</div>
              <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-1">{s.label}</div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
