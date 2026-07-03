"use client";
import { Phone, MessageCircle, CalendarDays, Search, Tag } from "lucide-react";
import { siteConfig } from "@/lib/config";
import { trackCallClick, trackWhatsAppClick, trackBookingClick } from "@/lib/analytics";

const buttons = [
  {
    id: "sticky-call-btn",
    icon: Phone,
    label: "Call",
    bg: "bg-green-700",
    action: () => {
      trackCallClick(siteConfig.phone);
      window.location.href = `tel:${siteConfig.phone}`;
    },
  },
  {
    id: "sticky-whatsapp-btn",
    icon: MessageCircle,
    label: "WhatsApp",
    bg: "bg-[#25d366]",
    action: () => {
      const msg = encodeURIComponent("Hi! I need assistance with my device. Can you help?");
      trackWhatsAppClick("sticky_bar");
      window.open(`https://wa.me/${siteConfig.whatsapp}?text=${msg}`, "_blank");
    },
  },
  {
    id: "sticky-book-btn",
    icon: CalendarDays,
    label: "Book",
    bg: "bg-emerald-700",
    action: () => {
      trackBookingClick();
      window.location.href = "/book-service";
    },
  },
  {
    id: "sticky-quote-btn",
    icon: Tag,
    label: "Quote",
    bg: "bg-orange-600",
    action: () => {
      trackBookingClick("quote");
      window.location.href = "/book-service#get-quote";
    },
  },
];

export default function StickyBottomBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-gray-900/95 backdrop-blur-sm border-t border-gray-800 px-2 py-2 safe-area-pb">
      <div className="flex items-center justify-around gap-1">
        {buttons.map((btn) => (
          <button
            key={btn.id}
            id={btn.id}
            onClick={btn.action}
            className={`${btn.bg} flex flex-col items-center justify-center gap-0.5 flex-1 py-2 rounded-xl text-white transition-all active:scale-95`}
          >
            <btn.icon size={18} />
            <span className="text-[10px] font-semibold">{btn.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
