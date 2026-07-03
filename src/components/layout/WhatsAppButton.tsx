"use client";
import { useState } from "react";
import { MessageCircle, X, ChevronUp, Phone } from "lucide-react";
import { siteConfig } from "@/lib/config";
import { trackWhatsAppClick, trackCallClick } from "@/lib/analytics";

export default function WhatsAppButton() {
  const [open, setOpen] = useState(false);

  const handleMessage = (message: string) => {
    trackWhatsAppClick(message);
    const url = `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
    setOpen(false);
  };

  return (
    <div className="fixed bottom-24 left-4 z-50 flex flex-col items-start gap-2">
      {/* Message panel */}
      {open && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-72 overflow-hidden">
          {/* Header */}
          <div className="bg-[#075E54] px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle size={16} className="text-white" />
              </div>
              <div>
                <p className="text-white text-sm font-bold">Sai Systems</p>
                <p className="text-green-200 text-xs">Typically replies instantly</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white">
              <X size={16} />
            </button>
          </div>

          {/* Chat bubble */}
          <div className="p-3 bg-[#ECE5DD] dark:bg-gray-800">
            <div className="bg-white dark:bg-gray-700 rounded-xl rounded-tl-none px-3 py-2 shadow-sm">
              <p className="text-gray-800 dark:text-gray-200 text-xs leading-relaxed">
                👋 Hi! How can we help you today? Choose a topic below or type your message:
              </p>
              <p className="text-gray-400 text-[10px] mt-1 text-right">
                {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>

          {/* Quick messages */}
          <div className="p-3 bg-white dark:bg-gray-900 space-y-1.5 max-h-56 overflow-y-auto">
            {siteConfig.whatsappMessages.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleMessage(item.message)}
                className="w-full text-left px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-green-950 border border-gray-100 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700 rounded-xl text-gray-700 dark:text-gray-200 transition-all"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Direct call button */}
          <div className="p-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
            <a
              href={`tel:${siteConfig.phone}`}
              onClick={() => trackCallClick(siteConfig.phone)}
              className="flex items-center justify-center gap-2 w-full py-2 bg-green-700 text-white text-xs font-semibold rounded-xl hover:bg-green-800 transition-all"
            >
              <Phone size={12} /> Call: {siteConfig.phone}
            </a>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        id="whatsapp-fab-btn"
        onClick={() => setOpen(!open)}
        className="relative w-14 h-14 rounded-full bg-[#25d366] text-white shadow-xl hover:shadow-[#25d366]/40 hover:scale-110 transition-all flex items-center justify-center"
        aria-label="WhatsApp Chat"
      >
        {open ? <ChevronUp size={22} /> : <MessageCircle size={24} />}
        {!open && (
          <>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center">
              1
            </span>
            <span className="absolute inset-0 rounded-full bg-[#25d366] animate-ping opacity-30" />
          </>
        )}
      </button>
    </div>
  );
}
