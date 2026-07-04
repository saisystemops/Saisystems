"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { MessageCircle, ArrowRight, Tag, ShieldCheck, CheckCircle2 } from "lucide-react";
import { siteConfig } from "@/lib/config";

// Keep static array as compile-time fallback
type Product = {
  id: string;
  category: "laptops" | "desktops" | "cctv" | "spare-parts" | "accessories";
  title: string;
  description: string;
  price: string;
  originalPrice: string;
  badge: string;
  specs: string[];
  inStock?: boolean;
  imageUrl?: string;
};

const defaultStaticProducts: Product[] = [
  {
    id: "prod-1",
    category: "laptops",
    title: "HP EliteBook 840 G5",
    description: "Premium metallic business class laptop, perfect for office, students, and browsing.",
    price: "₹14,999",
    originalPrice: "₹45,000",
    badge: "Best Seller",
    specs: [
      "Intel Core i5 (8th Gen)",
      "8GB DDR4 RAM (Expandable)",
      "256GB High-Speed NVMe SSD",
      "14\" FHD IPS Anti-Glare Display"
    ]
  },
  {
    id: "prod-2",
    category: "laptops",
    title: "Dell Latitude 5490",
    description: "Military-grade durability, high battery runtime, optimized for productivity.",
    price: "₹13,999",
    originalPrice: "₹42,000",
    badge: "Value Deal",
    specs: [
      "Intel Core i5 (8th Gen)",
      "8GB DDR4 RAM",
      "256GB SSD Storage",
      "14\" HD Ergonomic Display"
    ]
  },
  {
    id: "prod-3",
    category: "laptops",
    title: "Lenovo ThinkPad T480",
    description: "Dual battery system, legendary tactile keyboard, professional developer favorite.",
    price: "₹15,499",
    originalPrice: "₹52,000",
    badge: "Premium Grade",
    specs: [
      "Intel Core i5 (8th Gen)",
      "16GB DDR4 RAM Configuration",
      "512GB High-Speed SSD",
      "14\" FHD Matte ComfortView"
    ]
  },
  {
    id: "prod-4",
    category: "desktops",
    title: "Dell OptiPlex Tiny PC",
    description: "Super compact business desktop CPU. Mounts behind monitors, silent & high performance.",
    price: "₹8,499",
    originalPrice: "₹28,000",
    badge: "Space Saver",
    specs: [
      "Intel Core i3 / i5 Processor",
      "8GB RAM DDR4 (Dual Channel)",
      "256GB M.2 Solid State Drive",
      "Supports Dual 4K LED Monitors"
    ]
  },
  {
    id: "prod-5",
    category: "desktops",
    title: "Core i5 Full Desktop Set",
    description: "Complete workstation set including CPU, LED Monitor, Keyboard, Mouse, and Cables.",
    price: "₹12,499",
    originalPrice: "₹35,000",
    badge: "Complete Setup",
    specs: [
      "Intel Core i5 Quad-Core CPU",
      "8GB DDR3/DDR4 High-Speed RAM",
      "120GB SSD + 500GB HDD Storage",
      "19\" LED HD Desktop Monitor"
    ]
  },
  {
    id: "prod-8",
    category: "spare-parts",
    title: "Crucial DDR4 8GB Laptop RAM",
    description: "High-performance memory upgrade to boost multitasking speed on any laptop.",
    price: "₹1,850",
    originalPrice: "₹3,500",
    badge: "Genuine Upgrade",
    specs: [
      "8GB DDR4 SO-DIMM Form Factor",
      "3200MHz High-Speed Frequency",
      "Low Latency CL22 Performance",
      "3-Year Replacement Warranty"
    ]
  },
  {
    id: "prod-9",
    category: "spare-parts",
    title: "Kingston 512GB NVMe M.2 SSD",
    description: "Ultra-fast read/write storage expansion for seamless booting and page load speeds.",
    price: "₹3,200",
    originalPrice: "₹6,000",
    badge: "Storage Boost",
    specs: [
      "512GB M.2 2280 PCIe NVMe SSD",
      "Up to 3500 MB/s Transfer Speed",
      "Low Power Draw, Thermally Guarded",
      "5-Year Manufacturer Warranty"
    ]
  },
  {
    id: "prod-10",
    category: "accessories",
    title: "Mi 10000mAh Power Bank",
    description: "Compact dual-port fast charging power bank for smartphones and accessories.",
    price: "₹1,299",
    originalPrice: "₹1,999",
    badge: "Best Companion",
    specs: [
      "10000mAh Lithium-Polymer Battery",
      "22.5W Fast Charging Support",
      "Dual USB-A & USB-C Input/Output",
      "Multi-Layer Device Safety Protection"
    ]
  },
  {
    id: "prod-11",
    category: "accessories",
    title: "OnePlus Nord Buds 2r",
    description: "Wireless Bluetooth earbuds with rich bass, high battery runtime, and water resistance.",
    price: "₹1,999",
    originalPrice: "₹2,499",
    badge: "Trending Audio",
    specs: [
      "12.4mm Dynamic Bass Drivers",
      "Up to 38 Hours Playback Time",
      "IP55 Water & Sweat Resistance",
      "Dual Mic AI Call Noise Cancellation"
    ]
  }
];

export default function ProductCatalogSection() {
  const [activeTab, setActiveTab] = useState<"laptops" | "desktops" | "cctv" | "spare-parts" | "accessories">("laptops");
  const [productsList, setProductsList] = useState<Product[]>(defaultStaticProducts);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setProductsList(data);
          }
        }
      } catch (err) {
        console.error("Failed to load dynamic showroom items, using fallbacks:", err);
      }
    };
    loadProducts();
  }, []);

  const filteredProducts = productsList.filter(p => p.category === activeTab);

  const getWhatsAppMsg = (product: Product) => {
    const prefix = product.category === "spare-parts" || product.category === "accessories" ? "New Product" : "Refurbished Product";
    return encodeURIComponent(`Hi Sai Systems! I'm interested in the ${prefix}: ${product.title} (Price: ${product.price}). Please share availability and details.`);
  };

  const getTabLabel = (tab: typeof activeTab) => {
    switch (tab) {
      case "laptops": return "Refurbished Laptops";
      case "desktops": return "New Desktops";
      case "cctv": return "CCTV Kits";
      case "spare-parts": return "Spare Parts";
      case "accessories": return "Mobile Accessories";
    }
  };

  return (
    <section id="catalog" className="py-20 bg-gray-50 dark:bg-gray-950/40 relative border-t border-b border-gray-150 dark:border-gray-900">
      {/* Background soft blur */}
      <div className="absolute top-[20%] right-[-10%] w-[30%] h-[30%] rounded-full bg-orange-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 bg-orange-500/10 border border-orange-500/30 text-orange-600 dark:text-orange-400 text-xs font-bold uppercase tracking-wider rounded-full mb-4">
            Showroom Catalog
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
            Explore Hot Showroom <span className="text-gradient">Products &amp; Deals</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-sm md:text-base font-semibold leading-relaxed">
            Browse our top-selling laptops, desktops, surveillance packages, genuine replacement spare parts, and premium mobile accessories.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-12">
          {(["laptops", "desktops", "spare-parts", "accessories"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl font-extrabold capitalize text-xs sm:text-sm md:text-base transition-all border duration-300 ${
                activeTab === tab
                  ? "bg-gradient-to-r from-orange-600 to-amber-600 border-orange-500 text-white shadow-lg shadow-orange-950/20"
                  : "bg-white dark:bg-gray-900/50 text-gray-600 dark:text-gray-400 border-gray-200/80 dark:border-gray-800/80 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-700"
              }`}
            >
              {getTabLabel(tab)}
            </button>
          ))}
        </div>

        {/* Catalog Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group relative bg-white dark:bg-gray-900/40 backdrop-blur-sm rounded-3xl p-6 border border-gray-200/80 dark:border-gray-800/80 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-orange-500/20"
              >
                {/* Badge */}
                {product.badge && (
                  <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 text-[10px] uppercase font-extrabold tracking-wider rounded-xl">
                    {product.badge}
                  </div>
                )}

                {/* Product Image */}
                {product.imageUrl ? (
                  <div className="relative w-full h-40 mb-4 mt-8 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-950/60 border border-gray-200/50 dark:border-white/5 flex items-center justify-center">
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="max-h-full max-w-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="pt-8" />
                )}

                {/* Title & Price */}
                <div className="mb-4">
                  <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white group-hover:text-orange-500 transition-colors">
                    {product.title}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed min-h-[40px]">
                    {product.description}
                  </p>
                  <div className="flex items-baseline gap-2 mt-3">
                    <span className="text-xl font-black text-orange-600 dark:text-orange-500">{product.price}</span>
                    <span className="text-xs text-gray-400 line-through font-medium">{product.originalPrice}</span>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 ml-auto bg-emerald-500/10 px-2 py-0.5 rounded-md">Genuine</span>
                  </div>
                </div>

                {/* Specifications list */}
                <div className="space-y-2 border-t border-gray-150 dark:border-gray-800/80 pt-4 mb-6">
                  {product.specs.map((spec, specIdx) => (
                    <div key={specIdx} className="flex items-center gap-2.5 text-xs text-gray-600 dark:text-gray-400 font-semibold">
                      <CheckCircle2 size={14} className="text-orange-500 flex-shrink-0" />
                      <span>{spec}</span>
                    </div>
                  ))}
                </div>

                {/* Bottom Buttons */}
                <div className="flex gap-2">
                  <a
                    href={`https://wa.me/${siteConfig.whatsapp}?text=${getWhatsAppMsg(product)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-[#25d366] text-white text-xs font-black rounded-xl hover:bg-[#20bd5a] transition-all hover:scale-[1.02]"
                  >
                    <MessageCircle size={14} /> Get Price List
                  </a>
                  <Link
                    href="/book-service"
                    className="px-3.5 flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:border-orange-500 hover:text-orange-500 transition-all hover:scale-[1.02]"
                  >
                    <ArrowRight size={14} />
                  </Link>
                </div>

                {/* Trust Stamp */}
                <div className="mt-4 flex items-center justify-center gap-1 text-[10px] text-gray-400 border-t border-gray-100 dark:border-gray-900/60 pt-3">
                  <ShieldCheck size={11} className="text-orange-400" />
                  <span>100% Quality Inspected &amp; Warranted</span>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-6 bg-white dark:bg-gray-900/40 backdrop-blur-sm border border-gray-250/80 dark:border-gray-855 rounded-3xl max-w-xl mx-auto shadow-sm">
            <div className="w-14 h-14 mx-auto mb-4 bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 rounded-2xl flex items-center justify-center">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-base font-black text-gray-900 dark:text-white mb-2">No active deals in this category</h3>
            <p className="text-xs text-gray-500 dark:text-gray-450 max-w-sm mx-auto mb-6 leading-relaxed font-bold">
              We are currently updating our showroom stock for {getTabLabel(activeTab).toLowerCase()}. New systems and genuine accessories are added daily!
            </p>
            <a
              href={`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(`Hi Sai Systems! I am looking for refurbished deals and models in ${getTabLabel(activeTab)}. Please send me the latest pricing list.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#25d366] hover:bg-[#20bd5a] text-white text-xs font-black rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer"
            >
              <MessageCircle size={15} /> WhatsApp Support for Price List
            </a>
          </div>
        )}

        {/* Bottom helper info */}
        <div className="mt-12 text-center bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 p-4 rounded-2xl max-w-xl mx-auto flex items-center justify-center gap-2">
          <Tag size={16} className="text-orange-400" />
          <span className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Need custom PC configurations or bulk wholesale lots? WhatsApp us for direct deals!</span>
        </div>

      </div>
    </section>
  );
}
