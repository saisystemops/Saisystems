"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Wrench, Cpu, AlertTriangle, ArrowRight, HelpCircle, Check, ShieldCheck, Zap, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { services } from "@/lib/data/services";
import { brands } from "@/lib/data/brands";

interface Estimate {
  service: string;
  brand: string;
  price: string;
  time: string;
  warranty: string;
}

const ESTIMATES_DB: Estimate[] = [
  { service: "Laptop Repair", brand: "HP", price: "₹2,500 – ₹5,500", time: "Same Day", warranty: "365-day warranty" },
  { service: "Laptop Repair", brand: "Dell", price: "₹2,500 – ₹6,000", time: "Same Day", warranty: "365-day warranty" },
  { service: "Laptop Repair", brand: "Lenovo", price: "₹2,500 – ₹5,500", time: "Same Day", warranty: "365-day warranty" },
  { service: "Laptop Repair", brand: "Apple", price: "₹6,000 – ₹15,000", time: "1-2 Days", warranty: "180-day warranty" },
  { service: "Laptop Repair", brand: "Other", price: "₹2,500 – ₹7,000", time: "Same Day", warranty: "365-day warranty" },

  { service: "Screen Repair", brand: "HP", price: "₹2,800 – ₹5,500", time: "Same Day", warranty: "365-day warranty" },
  { service: "Screen Repair", brand: "Dell", price: "₹2,800 – ₹6,000", time: "Same Day", warranty: "365-day warranty" },
  { service: "Screen Repair", brand: "Lenovo", price: "₹2,800 – ₹5,800", time: "Same Day", warranty: "365-day warranty" },
  { service: "Screen Repair", brand: "Apple", price: "₹7,500 – ₹18,000", time: "1-2 Days", warranty: "180-day warranty" },
  { service: "Screen Repair", brand: "Other", price: "₹2,500 – ₹8,000", time: "Same Day", warranty: "365-day warranty" },

  { service: "Motherboard Repair", brand: "HP", price: "₹3,500 – ₹7,500", time: "1-2 Days", warranty: "90-day warranty" },
  { service: "Motherboard Repair", brand: "Dell", price: "₹3,500 – ₹8,000", time: "1-2 Days", warranty: "90-day warranty" },
  { service: "Motherboard Repair", brand: "Lenovo", price: "₹3,550 – ₹7,500", time: "1-2 Days", warranty: "90-day warranty" },
  { service: "Motherboard Repair", brand: "Apple", price: "₹7,000 – ₹16,000", time: "2-4 Days", warranty: "90-day warranty" },
  { service: "Motherboard Repair", brand: "Other", price: "₹3,000 – ₹12,000", time: "1-2 Days", warranty: "90-day warranty" },

  { service: "SSD Upgrade", brand: "HP", price: "₹3,500 – ₹4,800", time: "1 Hour", warranty: "3-year manufacturer warranty" },
  { service: "SSD Upgrade", brand: "Dell", price: "₹3,500 – ₹5,000", time: "1 Hour", warranty: "3-year manufacturer warranty" },
  { service: "SSD Upgrade", brand: "Lenovo", price: "₹3,500 – ₹4,800", time: "1 Hour", warranty: "3-year manufacturer warranty" },
  { service: "SSD Upgrade", brand: "Apple", price: "₹5,500 – ₹12,000", time: "2-4 Hours", warranty: "1-year warranty" },
  { service: "SSD Upgrade", brand: "Other", price: "₹3,200 – ₹5,000", time: "1 Hour", warranty: "3-year manufacturer warranty" },
];

export default function PricingEstimator() {
  const [selectedService, setSelectedService] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedIssue, setSelectedIssue] = useState("");
  const [step, setStep] = useState(0);
  const [estimates, setEstimates] = useState<Estimate[]>(ESTIMATES_DB);

  useEffect(() => {
    const loadPrices = async () => {
      try {
        const res = await fetch("/api/estimator");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setEstimates(data);
          }
        }
      } catch (err) {
        console.error("Failed to load live estimator rates:", err);
      }
    };
    loadPrices();
  }, []);

  const issueOptions = [
    { id: "screen", label: "Broken / Flickering Screen", service: "Screen Repair" },
    { id: "battery", label: "Battery Drain / Won't Charge", service: "Laptop Repair" },
    { id: "keyboard", label: "Keys Not Working", service: "Laptop Repair" },
    { id: "dead", label: "Motherboard Issue / Dead Device", service: "Motherboard Repair" },
    { id: "slow", label: "Slow Performance / SSD Upgrade", service: "SSD Upgrade" },
    { id: "virus", label: "Virus infection / Pop-ups", service: "Laptop Repair" },
    { id: "data", label: "Lost Files / Hard Drive Recovery", service: "Laptop Repair" },
  ];

  const handleServiceSelect = (val: string) => {
    setSelectedService(val);
    setStep(1);
  };

  const handleBrandSelect = (val: string) => {
    setSelectedBrand(val);
    setStep(2);
  };

  const handleIssueSelect = (val: string) => {
    setSelectedIssue(val);
    setStep(3);
  };

  // Calculate price estimate
  const getEstimate = (): Estimate => {
    // Find matching service in our issues options
    const issueObj = issueOptions.find(o => o.label === selectedIssue);
    const serviceName = issueObj ? issueObj.service : selectedService;
    
    const matched = estimates.find(
      e => e.service.toLowerCase() === serviceName.toLowerCase() && e.brand.toLowerCase() === selectedBrand.toLowerCase()
    );

    if (matched) return matched;

    // Default Fallback
    if (serviceName.includes("Screen")) {
      return { service: serviceName, brand: selectedBrand, price: "₹2,800 – ₹6,000", time: "Same Day", warranty: "365-day warranty" };
    }
    if (serviceName.includes("Motherboard")) {
      return { service: serviceName, brand: selectedBrand, price: "₹3,500 – ₹9,000", time: "1-2 Days", warranty: "90-day warranty" };
    }
    if (serviceName.includes("SSD") || serviceName.includes("Upgrade")) {
      return { service: serviceName, brand: selectedBrand, price: "₹3,500 – ₹5,000", time: "1 Hour", warranty: "3-year warranty" };
    }
    return { service: serviceName, brand: selectedBrand, price: "₹1,200 – ₹4,500", time: "Same Day / 24 hrs", warranty: "365-day warranty" };
  };

  const estimate = step === 3 ? getEstimate() : null;
  const problemDesc = `Required repair/upgrade for ${selectedBrand} Laptop. Problem: ${selectedIssue}. Got estimate: ${estimate?.price}.`;

  const resetAll = () => {
    setSelectedService("");
    setSelectedBrand("");
    setSelectedIssue("");
    setStep(0);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        {/* Page Header */}
        <div className="text-center mb-10">
          <span className="inline-block px-4 py-1.5 bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-bold uppercase tracking-wider rounded-full mb-3">
            💰 Pricing Calculator
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-3">
            Interactive Repair <span className="text-gradient">Cost Estimator</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-sm md:text-base">
            Get an instant price range and warranty duration for your repair in 3 quick clicks. No hidden charges.
          </p>
        </div>

        {/* Wizard Container */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-green-50/5 rounded-full blur-3xl -z-10" />

          {/* Progress Tracker */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100 dark:border-gray-800">
            {["Device", "Brand", "Problem", "Estimate"].map((label, idx) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  idx <= step 
                    ? "bg-green-600 text-white" 
                    : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                }`}>
                  {idx < step ? <Check size={12} /> : idx + 1}
                </div>
                <span className={`text-xs font-semibold hidden sm:inline ${idx <= step ? "text-gray-900 dark:text-white" : "text-gray-400"}`}>
                  {label}
                </span>
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* Step 0: Select Device Type */}
            {step === 0 && (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Wrench size={18} className="text-green-600" />
                  1. Select your device category:
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { id: "Laptop Repair", label: "Laptop", icon: "💻" },
                    { id: "Computer Repair", label: "Desktop PC", icon: "🖥️" },
                    { id: "Networking Services", label: "Networking / Router", icon: "🌐" },
                  ].map((dev) => (
                    <button
                      key={dev.id}
                      onClick={() => handleServiceSelect(dev.id)}
                      className="p-5 bg-gray-50 hover:bg-green-50/50 dark:bg-gray-800/40 dark:hover:bg-green-950/20 border-2 border-gray-100 dark:border-gray-800 hover:border-green-500 dark:hover:border-green-800 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all cursor-pointer group"
                    >
                      <span className="text-4xl group-hover:scale-110 transition-transform">{dev.icon}</span>
                      <span className="font-bold text-sm text-gray-900 dark:text-white">{dev.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 1: Select Brand */}
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Cpu size={18} className="text-green-600" />
                  2. Select device manufacturer/brand:
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {brands.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => handleBrandSelect(b.name)}
                      className="p-4 bg-gray-50 hover:bg-green-50/50 dark:bg-gray-800/40 dark:hover:bg-green-950/20 border-2 border-gray-100 dark:border-gray-800 hover:border-green-500 dark:hover:border-green-800 rounded-xl flex flex-col items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <span className="font-bold text-sm text-gray-900 dark:text-white">{b.name}</span>
                    </button>
                  ))}
                  <button
                    onClick={() => handleBrandSelect("Other")}
                    className="p-4 bg-gray-50 hover:bg-green-50/50 dark:bg-gray-800/40 dark:hover:bg-green-950/20 border-2 border-gray-100 dark:border-gray-800 hover:border-green-500 dark:hover:border-green-800 rounded-xl flex flex-col items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span className="font-bold text-sm text-gray-900 dark:text-white">Other Brand</span>
                  </button>
                </div>
                <button
                  onClick={() => setStep(0)}
                  className="text-xs text-gray-500 hover:underline flex items-center gap-1 mt-4"
                >
                  ← Go back to category
                </button>
              </motion.div>
            )}

            {/* Step 2: Select Issue */}
            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <AlertTriangle size={18} className="text-green-600" />
                  3. What is the issue or service needed?
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {issueOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => handleIssueSelect(opt.label)}
                      className="p-4 bg-gray-50 hover:bg-green-50/50 dark:bg-gray-800/40 dark:hover:bg-green-950/20 border-2 border-gray-100 dark:border-gray-800 hover:border-green-500 dark:hover:border-green-800 rounded-xl text-left flex items-center gap-3 transition-all cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 flex items-center justify-center text-xs shrink-0 font-bold">
                        ⚙️
                      </div>
                      <span className="font-semibold text-sm text-gray-900 dark:text-white">{opt.label}</span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="text-xs text-gray-500 hover:underline flex items-center gap-1 mt-4"
                >
                  ← Go back to brand
                </button>
              </motion.div>
            )}

            {/* Step 3: Show estimate */}
            {step === 3 && estimate && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8 text-center py-4"
              >
                <div className="max-w-md mx-auto">
                  <div className="inline-block p-3 bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 rounded-full mb-4">
                    <ShieldCheck size={32} />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Cost Estimate Calculated</h3>
                  <p className="text-gray-500 text-sm mb-6">
                    Based on your selection of {selectedBrand} · {selectedIssue}
                  </p>

                  {/* Pricing Cards */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-inner space-y-4 mb-6">
                    <div className="flex items-center justify-between py-2 border-b border-gray-200/50 dark:border-gray-700">
                      <span className="text-sm text-gray-500 flex items-center gap-1.5"><Zap size={14} className="text-green-500" /> Estimated Cost</span>
                      <span className="text-xl font-extrabold text-green-600 dark:text-green-400">{estimate.price}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-200/50 dark:border-gray-700">
                      <span className="text-sm text-gray-500 flex items-center gap-1.5"><Clock size={14} className="text-green-500" /> Turnaround Time</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{estimate.time}</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-500 flex items-center gap-1.5"><HelpCircle size={14} className="text-green-500" /> Warranty Offered</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{estimate.warranty}</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 leading-relaxed mb-8">
                    * Rates are approximate and depend on standard models and spare parts availability. Diagnosis is 100% free even if you choose not to proceed.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Link
                      href={`/book-service?service=${encodeURIComponent(estimate.service)}&brand=${encodeURIComponent(selectedBrand)}&problem=${encodeURIComponent(problemDesc)}`}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-xl shadow-lg transition-all"
                    >
                      Book Doorstep Service <ArrowRight size={16} />
                    </Link>
                    <button
                      onClick={resetAll}
                      className="px-6 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer"
                    >
                      Check Another Rate
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
