"use client";
import { useState } from "react";
import Link from "next/link";
import { Search, Filter, MessageCircle, Laptop, ShieldCheck, Tag } from "lucide-react";

interface ProductItem {
  brand: string;
  desc: string;
}

interface Category {
  title: string;
  icon: string;
  color: string;
  items: ProductItem[];
}

const productCategories: Category[] = [
  {
    title: "New Laptops",
    icon: "💻",
    color: "from-blue-600 to-blue-800",
    items: [
      { brand: "Dell Laptops", desc: "Dell Inspiron, Vostro, XPS series — latest models" },
      { brand: "HP Laptops", desc: "HP Pavilion, Envy, Spectre — great performance" },
      { brand: "Lenovo Laptops", desc: "Lenovo IdeaPad, ThinkPad, Legion series" },
      { brand: "Acer Laptops", desc: "Acer Aspire, Swift, Predator gaming series" },
      { brand: "Asus Laptops", desc: "Asus VivoBook, ZenBook, ROG gaming laptops" },
      { brand: "MSI Laptops", desc: "MSI gaming and creator laptops" },
    ],
  },
  {
    title: "Refurbished Laptops",
    icon: "♻️",
    color: "from-green-600 to-green-800",
    items: [
      { brand: "Refurbished Dell", desc: "Tested, cleaned, and certified Dell laptops" },
      { brand: "Refurbished HP", desc: "Quality-checked HP laptops at great prices" },
      { brand: "Refurbished Lenovo", desc: "Professionally refurbished Lenovo laptops" },
    ],
  },
  {
    title: "Second Hand Laptops",
    icon: "🔄",
    color: "from-orange-600 to-orange-800",
    items: [
      { brand: "Second Hand Dell", desc: "Pre-owned Dell laptops, inspected and tested" },
      { brand: "Second Hand HP", desc: "Budget-friendly used HP laptops" },
      { brand: "Second Hand Lenovo", desc: "Used Lenovo laptops in good condition" },
    ],
  },
  {
    title: "Accessories",
    icon: "🔌",
    color: "from-purple-600 to-purple-800",
    items: [
      { brand: "Laptop Batteries", desc: "Genuine replacement batteries for all brands" },
      { brand: "Chargers & Adapters", desc: "Original and compatible laptop chargers" },
      { brand: "RAM Modules", desc: "DDR4/DDR5 RAM for laptop upgrades" },
      { brand: "SSD Drives", desc: "SATA and NVMe SSD for faster performance" },
      { brand: "Hard Disks", desc: "HDD and external hard drives" },
      { brand: "Monitors", desc: "LED monitors for home and office" },
      { brand: "Keyboards & Mouse", desc: "Wired, wireless, and gaming peripherals" },
    ],
  },
];

export default function ProductsClient() {
  const [selectedTab, setSelectedTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrandFilter, setSelectedBrandFilter] = useState("All");

  const brandFilters = ["All", "Dell", "HP", "Lenovo", "Acer", "Asus", "MSI"];

  // Filter logic
  const filteredCategories = productCategories
    .map(category => {
      // If a tab is selected and doesn't match this category, hide all items
      if (selectedTab !== "All" && category.title !== selectedTab) {
        return { ...category, items: [] };
      }

      // Filter items inside category
      const filteredItems = category.items.filter(item => {
        const matchesSearch = 
          item.brand.toLowerCase().includes(searchQuery.toLowerCase()) || 
          item.desc.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesBrand = 
          selectedBrandFilter === "All" || 
          item.brand.toLowerCase().includes(selectedBrandFilter.toLowerCase());

        return matchesSearch && matchesBrand;
      });

      return { ...category, items: filteredItems };
    })
    // Remove categories that have no matching items
    .filter(category => category.items.length > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Search and Filters Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between">
        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {["All", "New Laptops", "Refurbished Laptops", "Second Hand Laptops", "Accessories"].map(tab => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-4 py-2 text-xs font-bold rounded-full border transition-all cursor-pointer whitespace-nowrap ${
                selectedTab === tab 
                  ? "bg-green-700 text-white border-green-700 shadow-md shadow-green-700/10" 
                  : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:border-green-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-3 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-850 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Brand Filters Grid */}
      <div className="flex items-center gap-2 mb-8 flex-wrap">
        <span className="text-xs text-gray-400 flex items-center gap-1 font-bold"><Tag size={12} /> Brand Filter:</span>
        {brandFilters.map(brand => (
          <button
            key={brand}
            onClick={() => setSelectedBrandFilter(brand)}
            className={`px-3 py-1 text-xs rounded-lg border transition-all cursor-pointer ${
              selectedBrandFilter === brand
                ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 font-semibold"
                : "bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 border-gray-100 dark:border-gray-800 hover:border-gray-200"
            }`}
          >
            {brand}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="space-y-12 min-h-[300px]">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 dark:bg-gray-900/40 rounded-3xl border border-gray-100 dark:border-gray-800">
            <Laptop className="mx-auto text-gray-300 dark:text-gray-700 mb-3" size={40} />
            <p className="text-gray-500 dark:text-gray-400 font-medium">No products match your search/filter criteria.</p>
            <button 
              onClick={() => { setSearchQuery(""); setSelectedTab("All"); setSelectedBrandFilter("All"); }}
              className="text-xs text-green-600 dark:text-green-400 hover:underline mt-2 font-bold"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          filteredCategories.map((cat) => (
            <div key={cat.title} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 bg-gradient-to-br ${cat.color} rounded-xl flex items-center justify-center text-xl shadow-md`}>
                  {cat.icon}
                </div>
                <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">{cat.title}</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {cat.items.map((item) => {
                  const inquiryText = `Hi Sai Systems! I am interested in purchasing/upgrading: ${item.brand}. Can you share price list and stock details?`;
                  return (
                    <div
                      key={item.brand}
                      className="card-hover bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 hover:border-green-300 dark:hover:border-green-700 flex flex-col justify-between"
                    >
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1">{item.brand}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4">{item.desc}</p>
                      </div>
                      <a
                        href={`https://wa.me/919487179676?text=${encodeURIComponent(inquiryText)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-green-700 dark:text-green-400 font-bold hover:underline flex items-center gap-1.5 self-start group"
                      >
                        <MessageCircle size={14} className="text-[#25d366]" /> Enquire Now →
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Support Box */}
      <div className="mt-16 p-6 bg-green-50 dark:bg-green-950/20 rounded-3xl text-center border border-green-100 dark:border-green-900/60 max-w-4xl mx-auto">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 flex items-center justify-center gap-2">
          <ShieldCheck className="text-green-600" size={20} /> Looking for a Custom System Config?
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 max-w-xl mx-auto">
          Need a specific laptop, RAM upgrade spec, or customized computer built? Let us source it at the best price with official warranty support.
        </p>
        <div className="flex justify-center gap-3">
          <Link href="/contact" className="px-5 py-2 bg-green-700 text-white font-bold rounded-xl text-xs hover:bg-green-800 transition-all">
            Contact Sales Desk
          </Link>
          <Link href="/book-service" className="px-5 py-2 border border-green-600 text-green-700 dark:text-green-400 font-bold rounded-xl text-xs hover:bg-green-600 hover:text-white transition-all">
            Request Quote
          </Link>
        </div>
      </div>
    </div>
  );
}
