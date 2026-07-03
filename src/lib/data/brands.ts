export interface Brand {
  id: string;
  name: string;
  logo: string;
  description: string;
  services: string[];
}

export const brands: Brand[] = [
  {
    id: "hp",
    name: "HP",
    logo: "/images/brands/hp.svg",
    description: "Hewlett-Packard laptops, desktops, printers, and accessories",
    services: ["Laptop Repair", "Desktop Repair", "Printer Repair", "Warranty Service"],
  },
  {
    id: "dell",
    name: "Dell",
    logo: "/images/brands/dell.svg",
    description: "Dell laptops, desktops, monitors, and server systems",
    services: ["Laptop Repair", "Desktop Repair", "Monitor Repair", "Server Support"],
  },
  {
    id: "lenovo",
    name: "Lenovo",
    logo: "/images/brands/lenovo.svg",
    description: "Lenovo ThinkPad, IdeaPad, and Legion series repair and support",
    services: ["Laptop Repair", "Desktop Repair", "Tablet Support", "Accessory Sales"],
  },
  {
    id: "acer",
    name: "Acer",
    logo: "/images/brands/acer.svg",
    description: "Acer laptop, Chromebook, and desktop repair and maintenance",
    services: ["Laptop Repair", "Desktop Repair", "Monitor Repair", "Accessory Sales"],
  },
  {
    id: "asus",
    name: "Asus",
    logo: "/images/brands/asus.svg",
    description: "Asus ROG, ZenBook, and VivoBook repair and support services",
    services: ["Laptop Repair", "Desktop Repair", "Motherboard Repair", "GPU Support"],
  },
  {
    id: "msi",
    name: "MSI",
    logo: "/images/brands/msi.svg",
    description: "MSI gaming laptop and desktop repair with chip-level expertise",
    services: ["Gaming Laptop Repair", "GPU Repair", "Motherboard Repair", "Cooling Solutions"],
  },
  {
    id: "samsung",
    name: "Samsung",
    logo: "/images/brands/samsung.svg",
    description: "Samsung laptop, monitor, and SSD support and repair",
    services: ["Laptop Repair", "Monitor Repair", "SSD Support", "Screen Replacement"],
  },
  {
    id: "toshiba",
    name: "Toshiba",
    logo: "/images/brands/toshiba.svg",
    description: "Toshiba laptop and hard drive repair and data recovery",
    services: ["Laptop Repair", "Hard Disk Recovery", "Screen Repair", "Battery Replacement"],
  },
  {
    id: "hcl",
    name: "HCL",
    logo: "/images/brands/hcl.svg",
    description: "HCL laptop and desktop repair and AMC services",
    services: ["Laptop Repair", "Desktop Repair", "AMC Services", "Hardware Upgrade"],
  },
  {
    id: "panasonic",
    name: "Panasonic",
    logo: "/images/brands/panasonic.svg",
    description: "Panasonic Toughbook and laptop repair services",
    services: ["Laptop Repair", "Toughbook Service", "Battery Replacement", "Hardware Repair"],
  },
  {
    id: "compaq",
    name: "Compaq",
    logo: "/images/brands/compaq.svg",
    description: "Compaq desktop and laptop repair and refurbishment",
    services: ["Laptop Repair", "Desktop Repair", "Refurbishment", "Hardware Upgrade"],
  },
  {
    id: "mi",
    name: "MI",
    logo: "/images/brands/mi.svg",
    description: "Xiaomi/Mi laptop and accessories repair and support",
    services: ["Laptop Repair", "Screen Repair", "Battery Replacement", "Accessory Support"],
  },
  {
    id: "intel",
    name: "Intel",
    logo: "/images/brands/intel.svg",
    description: "Intel processor and NUC system support and upgrades",
    services: ["CPU Support", "NUC Repair", "Thermal Solutions", "Performance Upgrade"],
  },
  {
    id: "foxin",
    name: "Foxin",
    logo: "/images/brands/foxin.svg",
    description: "Foxin power supplies, cabinet cooling, peripherals and laptop chargers support",
    services: ["Power Supply Repair", "Laptop Adapter Service", "Cabinet Cooling Fix", "Accessory Sales"],
  },
  {
    id: "zebronics",
    name: "Zebronics",
    logo: "/images/brands/zebronics.svg",
    description: "Zebronics peripheral and accessory sales and support",
    services: ["Keyboard/Mouse", "Speaker Repair", "Webcam Setup", "Accessory Sales"],
  },
];
