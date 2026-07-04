"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem("cookie_consent_choice");
    if (!consent) {
      // Show banner after a tiny delay for page transition smoothness
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie_consent_choice", "accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookie_consent_choice", "declined");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          className="fixed bottom-20 sm:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md bg-slate-950/95 dark:bg-slate-900/98 text-white backdrop-blur-xl border border-slate-800/80 rounded-3xl p-5 shadow-2xl z-[9999] overflow-hidden"
        >
          {/* Subtle glow border */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-orange-500 to-amber-500" />
          
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-orange-500/10 text-orange-400 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-sm uppercase tracking-wider text-slate-200">
                  Cookie & Privacy Consent
                </h4>
                <button 
                  onClick={handleDecline}
                  className="text-slate-400 hover:text-white transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <p className="text-xs text-slate-355 dark:text-slate-400 leading-relaxed font-medium">
                We use cookies to analyze traffic, remember choices, and improve your service booking experience. By clicking "Accept All", you agree to our policies.
              </p>
              
              <div className="pt-2 flex items-center justify-between gap-3">
                <Link 
                  href="/privacy-policy" 
                  className="text-[10px] font-bold text-slate-400 hover:text-orange-400 underline transition-colors"
                >
                  Privacy Policy
                </Link>
                
                <div className="flex gap-2">
                  <button
                    onClick={handleDecline}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-[10px] tracking-wider uppercase transition-all"
                  >
                    Decline
                  </button>
                  <button
                    onClick={handleAccept}
                    className="px-4 py-1.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:opacity-95 text-white font-bold rounded-xl text-[10px] tracking-wider uppercase transition-all shadow-md active:scale-95"
                  >
                    Accept All
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
