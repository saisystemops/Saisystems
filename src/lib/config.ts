// ── Site Configuration ─────────────────────────────────────────────────────────
// UPDATE ALL VALUES MARKED WITH "← UPDATE" BEFORE DEPLOYING
export const siteConfig = {
  name: "Sai Systems",
  tagline: "New & Refurbished Laptops, Computers, Spare Parts, Mobile Accessories & CCTV Services",
  description:
    "Wholesale and retail of new & refurbished laptops, computers, genuine spare parts, mobile accessories, CCTV setups, and professional IT services in Dindigul.",
  url: "https://saisystems.org.in",
  phone: "+91 79041 08020",
  whatsapp: "917904108020",
  secondaryPhone: "+91 87780 03397",
  email: "saisysops@gmail.com",
  adminEmail: "saisysops@gmail.com",
  address: {
    street: "PAA Building, 8/25 B, Shop No-A3, Y.M.R Patty (Landmark: Head Post Office)",
    city: "Dindigul",
    state: "Tamil Nadu",
    pincode: "624001",
    country: "India",
  },
  social: {
    facebook: "https://facebook.com/saisystems.dindigul",
    instagram: "https://www.instagram.com/saisystems.dindigul",
    linkedin: "https://linkedin.com/company/saisystems",
    youtube: "https://youtube.com/@saisystems",
    twitter: "https://twitter.com/saisystems",
  },
  businessHours: "Mon–Sat: 9:00 AM – 7:30 PM | Sun: Closed",
  established: "2018",
  gstNumber: "33NACPS2186E1ZI",
  rating: 4.9,
  reviewCount: 380,
  technicianCount: 15,
  customerCount: 5000,

  // WhatsApp predefined messages
  whatsappMessages: [
    { label: "💻 Buy Refurbished Laptop", message: "Hi! I'm interested in buying a refurbished laptop. Please share the available stock and price list." },
    { label: "🖥️ Buy Refurbished Desktop", message: "Hi! I'm interested in buying a refurbished desktop. Please share details and pricing." },
    { label: "⚙️ Spare Parts & Upgrades", message: "Hi! I'm looking for genuine laptop/computer spare parts or hardware upgrades. Please share availability and options." },
    { label: "🔌 Mobile & PC Accessories", message: "Hi! I'm looking for premium mobile chargers, power banks, adapters, or computer accessories. Please share options." },
    { label: "🛡️ CCTV Installation", message: "Hi! I need CCTV installation or security camera service. Please share options." },
    { label: "🌐 Networking Setup", message: "Hi! I want to set up a network/WiFi for my office or home. Please discuss options." },
    { label: "📦 Wholesale Inquiry", message: "Hi! I am a retailer and want to make a wholesale inquiry for laptops/desktops." },
    { label: "📱 Repair Support", message: "Hi! I need chip-level repair or service for my device." },
    { label: "🗓️ Book Service", message: "Hi! I want to book a service appointment. Please help." },
  ],

  // Analytics IDs (fill in after setup)
  analytics: {
    ga4Id: process.env.NEXT_PUBLIC_GA4_ID || "", // G-XXXXXXXXXX
    gtmId: process.env.NEXT_PUBLIC_GTM_ID || "", // GTM-XXXXXXX
    metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || "", // Meta Pixel ID
    clarityId: process.env.NEXT_PUBLIC_CLARITY_ID || "", // Microsoft Clarity ID
  },

  seo: {
    keywords: [
      "refurbished laptops dindigul",
      "second hand laptop wholesale",
      "refurbished computer retail",
      "genuine computer spare parts",
      "mobile accessories wholesale dindigul",
      "cctv camera installation",
      "office networking setup",
      "laptop chip level repair",
      "used desktops retail",
      "sai systems dindigul",
      "saisystems.org.in",
      "computer repairs ymr patty",
    ],
    ogImage: "/og-image.jpg",
    twitterHandle: "@saisystems",
  },
};

export type SiteConfig = typeof siteConfig;
