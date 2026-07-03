// Real royalty-free images from Unsplash for every section
// All URLs use Unsplash's CDN with optimized parameters
// Format: https://images.unsplash.com/photo-ID?w=WIDTH&q=80&auto=format&fit=crop

export const heroImages = {
  main: "/images/hero-main.png",
  secondary: "/images/hero-secondary.png",
  technician: "/images/hero-technician.png",
  office: "/images/hero-office.png",
};

export const serviceImages: Record<string, string> = {
  // Laptop services
  "laptop-repair-services": "/images/laptop-repair.png",
  "laptop-hardware-repair": "/images/laptop-hardware.png",
  "laptop-repair": "/images/laptop-repair.jpg",
  "laptop-motherboard-repair": "/images/laptop-motherboard.png",
  "laptop-chip-level-repair": "/images/laptop-chip-repair.png",
  "laptop-screen-repair": "/images/laptop-screen-repair.png",
  "laptop-keyboard-repair": "/images/laptop-keyboard.png",
  "laptop-battery-repair": "/images/laptop-battery.png",
  "laptop-charger-repair": "/images/laptop-charger.png",
  "laptop-adapter-repair": "/images/laptop-adapter.png",
  "laptop-doorstep-service": "/images/laptop-doorstep.png",
  "doorstep-laptop-service": "/images/laptop-doorstep.png",
  // Computer services
  "sales-and-service-new-old-second-hand": "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&q=80&auto=format&fit=crop",
  "desktop-cpu-setup-assembly": "/images/computer-hardware.png",
  "setup-box-stb-repair-services": "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800&q=80&auto=format&fit=crop",
  "computer-repair-services": "/images/computer-repair.jpg",
  "desktop-repair-services": "/images/desktop-repair.png",
  "computer-repair-at-home": "/images/computer-repair-home.png",
  "computer-cpu-repair": "/images/cpu-repair.png",
  "home-computer-service": "/images/computer-repair-home.png",
  "computer-accessory-services": "/images/computer-accessories.png",
  "computer-hardware-services": "/images/computer-hardware.png",
  // Networking
  "computer-networking-services": "/images/computer-networking.jpg",
  "computer-networking": "/images/computer-networking.jpg",
  // Hardware
  "ssd-upgrade": "https://images.unsplash.com/photo-1563770660941-20978e870e26?w=800&q=80&auto=format&fit=crop",
  "ram-upgrade": "https://images.unsplash.com/photo-1591799265444-d66432b91588?w=800&q=80&auto=format&fit=crop",
  "data-recovery": "https://images.unsplash.com/photo-1597852074816-d933c7d2b988?w=800&q=80&auto=format&fit=crop",
  "virus-removal": "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800&q=80&auto=format&fit=crop",
  // Peripherals
  "computer-monitor-repair": "/images/computer-monitor.jpg",
  "computer-printer-repair": "/images/printer-repair.png",
  "projector-repair": "https://images.unsplash.com/photo-1505330622279-bf7d7fc918f4?w=800&q=80&auto=format&fit=crop",
  "computer-hard-disk-services": "/images/hard-disk-repair.png",
  "external-hard-disk-services": "/images/external-hard-disk.png",
  // Business/IT
  "it-amc-support": "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80&auto=format&fit=crop",
  "business-it-support": "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80&auto=format&fit=crop",
  "antivirus-installation": "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800&q=80&auto=format&fit=crop",
  // Products
  "refurbished-laptop-sales": "https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=800&q=80&auto=format&fit=crop",
  "computer-accessories": "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800&q=80&auto=format&fit=crop",
  // Fallback
  "default": "/images/default.jpg",
};

export const brandImages: Record<string, string> = {
  HP: "/images/brands/hp.svg",
  Dell: "/images/brands/dell.svg",
  Lenovo: "/images/brands/lenovo.svg",
  Acer: "/images/brands/acer.svg",
  Asus: "/images/brands/asus.svg",
  MSI: "/images/brands/msi.svg",
  Samsung: "/images/brands/samsung.svg",
  Toshiba: "/images/brands/toshiba.svg",
};

export const teamImages = [
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1562788869-4ed32648eb72?w=400&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80&auto=format&fit=crop",
];

export const sectionImages = {
  workshop: "/images/section-workshop.png",
  repair: "/images/section-repair.png",
  customer: "/images/section-customer.png",
  networking: "/images/section-networking.png",
  laptop: "/images/section-laptop.png",
  office: "/images/section-office.png",
  about: "/images/section-about.png",
};

export function getServiceImage(slug: string): string {
  return serviceImages[slug] || serviceImages["default"];
}
