export type Product = {
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
  whatsappLink?: string;
};

export const defaultProducts: Product[] = [
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
