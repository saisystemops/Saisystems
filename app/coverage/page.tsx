"use client";
import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, AlertTriangle, Search, MapPin, Truck, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

export default function CoveragePage() {
  const [pincode, setPincode] = useState("");
  const [checked, setChecked] = useState(false);
  const [available, setAvailable] = useState(false);

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincode.trim() || pincode.trim().length !== 6) return;

    // Standard Dindigul district pincodes start with '624'
    const isAvailable = pincode.trim().startsWith("624");
    setAvailable(isAvailable);
    setChecked(true);
  };

  const getAreaName = () => {
    const code = pincode.trim();
    if (code === "624001") return "Central Dindigul (Bazaar, Vivekananda Nagar)";
    if (code === "624002") return "Balakrishnapuram";
    if (code === "624003") return "Trichy Road Area";
    if (code === "624004") return "Palani Road / Siluvathur Road";
    if (code === "624005") return "Dindigul Collectorate Area";
    if (code === "624601") return "Palani Central";
    if (code === "624201") return "Batlagundu";
    if (code === "624301") return "Kodaikanal";
    return "Dindigul District Area";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-block px-4 py-1.5 bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-bold uppercase tracking-wider rounded-full mb-3">
            📍 Service Availability
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-3">
            Doorstep Service <span className="text-gradient">Coverage Checker</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-sm md:text-base">
            Check if our certified technicians support free doorstep pickup and same-day service in your area.
          </p>
        </div>

        {/* Checker Card */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-6 md:p-8">
          <form onSubmit={handleCheck} className="space-y-4 sm:space-y-0 sm:flex sm:gap-4 items-end">
            <div className="flex-1">
              <label className="block text-xs font-bold uppercase text-gray-400 dark:text-gray-500 mb-2">Enter 6-Digit Pincode</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-4 top-3.5 text-gray-450" />
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                  placeholder="e.g., 624001"
                  required
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer hover:from-green-700 transition-all shrink-0"
            >
              <Search size={16} />
              Check Availability
            </button>
          </form>

          {/* Results display */}
          {checked && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 space-y-4"
            >
              {available ? (
                <div className="p-5 bg-green-500/10 border border-green-500/20 text-green-800 dark:text-green-400 rounded-2xl flex items-start gap-4">
                  <div className="p-2.5 bg-green-500 text-white rounded-xl">
                    <Truck size={24} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-lg text-gray-900 dark:text-white">🚀 Yes! Doorstep Service is Available</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                      We support free pick-up, diagnostics, and on-site repair in **{getAreaName()}** (Pincode: {pincode}).
                    </p>
                    <div className="flex gap-4 mt-4 flex-wrap">
                      <Link href="/book-service" className="px-4 py-2 bg-green-700 text-white text-xs font-bold rounded-lg hover:bg-green-850">
                        Book Doorstep Repair
                      </Link>
                      <Link href="/contact" className="px-4 py-2 border border-green-500/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-lg hover:bg-green-500/5">
                        Ask on WhatsApp
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-5 bg-red-500/10 border border-red-500/20 text-red-800 dark:text-red-400 rounded-2xl flex items-start gap-4">
                  <div className="p-2.5 bg-red-500 text-white rounded-xl">
                    <ShieldAlert size={24} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-lg text-gray-900 dark:text-white">🏪 Center Drop-In Service Only</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                      Doorstep service is currently out of bounds for pincode {pincode}. However, you can bring your device to our fully equipped service center in Dindigul Bazaar for priority troubleshooting.
                    </p>
                    <div className="flex gap-4 mt-4 flex-wrap">
                      <Link href="/contact" className="px-4 py-2 bg-red-700 text-white text-xs font-bold rounded-lg hover:bg-red-850">
                        Get Store Directions
                      </Link>
                      <Link href={`https://wa.me/919487179676?text=${encodeURIComponent(`Hi! I am in area pincode ${pincode} and need repair support. Is a custom pickup option available?`)}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 border border-red-500/30 text-red-700 dark:text-red-400 text-xs font-bold rounded-lg hover:bg-red-500/5">
                        Ask on WhatsApp
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Coverage description */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          💡 Doorstep pick-up and delivery are 100% free across Dindigul district. Same-day repair service is supported for screens, RAM, SSD upgrades, and battery replacements.
        </div>
      </div>
    </div>
  );
}
