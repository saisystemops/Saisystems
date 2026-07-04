"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Loader2, CheckCircle2, ChevronRight, MessageCircle, AlertCircle, Wrench, Shield, Clock } from "lucide-react";
import { siteConfig } from "@/lib/config";

function TrackPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const refParam = searchParams.get("ref") || searchParams.get("q") || "";

  const [query, setQuery] = useState(refParam);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError("");
    setResults([]);
    setSelectedItem(null);

    try {
      const res = await fetch(`/api/track?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data.success) {
        setResults(data.data || []);
        if (data.data && data.data.length === 1) {
          setSelectedItem(data.data[0]);
        }
      } else {
        setError(data.message || "Failed to find tracking logs.");
      }
    } catch (err) {
      console.error(err);
      setError("Network connection issue. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (refParam) {
      setQuery(refParam);
      handleSearch(refParam);
    }
  }, [refParam]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/track?ref=${encodeURIComponent(query)}`);
    handleSearch(query);
  };

  const getStatusStep = (status: string): number => {
    const s = status.toLowerCase();
    if (s === "new" || s === "pending") return 1;
    if (s === "diagnosing" || s === "open") return 2;
    if (s === "estimate" || s === "pending_approval") return 3;
    if (s === "progress" || s === "repair") return 4;
    if (s === "repaired" || s === "ready" || s === "delivered" || s === "solved" || s === "closed") return 5;
    return 1;
  };

  const getStatusLabel = (status: string): string => {
    const s = status.toLowerCase();
    if (s === "new" || s === "pending") return "Booking Confirmed";
    if (s === "diagnosing" || s === "open") return "Under Diagnosis";
    if (s === "estimate" || s === "pending_approval") return "Estimate Prepared";
    if (s === "progress" || s === "repair") return "Repair In Progress";
    if (s === "repaired" || s === "ready") return "Ready for Delivery";
    if (s === "delivered" || s === "solved" || s === "closed") return "Delivered & Complete";
    return status;
  };

  const currentStep = selectedItem ? getStatusStep(selectedItem.status) : 1;

  const steps = [
    { label: "Booked", desc: "Service session scheduled" },
    { label: "Diagnosis", desc: "Technician inspecting hardware" },
    { label: "Estimate", desc: "Cost breakdown prepared" },
    { label: "Repairing", desc: "Fixing components" },
    { label: "Ready", desc: "Quality checks passed" },
  ];

  return (
    <div className="min-h-screen bg-[#fafafc] dark:bg-gray-950 pt-24 pb-16 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Header segment */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-955 dark:text-white mb-3">
            Track Your <span className="text-gradient">Service Progress</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto leading-relaxed">
            Enter your booking reference (e.g., <code className="font-mono text-orange-655 font-bold">SAI-XXXXXX</code>) or mobile phone number to view live technician logs, status updates, and cost estimates.
          </p>
        </div>

        {/* Search card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm mb-8 transition-colors">
          <form onSubmit={onSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                required
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. SAI-123456 or 9876543210"
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium text-gray-900 dark:text-white"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-sm rounded-2xl transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Track"}
            </button>
          </form>
          {error && (
            <p className="text-rose-500 text-xs mt-3 flex items-center gap-1.5 font-bold">
              <AlertCircle size={14} /> {error}
            </p>
          )}
        </div>

        {/* Search results */}
        {loading && (
          <div className="text-center py-16">
            <Loader2 className="w-10 h-10 animate-spin text-orange-600 mx-auto mb-3" />
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Retrieving status details...</p>
          </div>
        )}

        {!loading && results.length > 1 && !selectedItem && (
          <div className="space-y-4">
            <h3 className="text-sm font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest px-2">Multiple repairs matching phone</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {results.map((item) => (
                <button
                  key={item.ref}
                  onClick={() => setSelectedItem(item)}
                  className="w-full text-left bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 hover:border-orange-500/30 transition-all flex flex-col justify-between h-36 cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono text-gray-400 font-bold">{item.ref}</span>
                      <span className="px-2 py-0.5 bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[9px] font-black rounded uppercase">
                        {getStatusLabel(item.status)}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-sm text-gray-955 dark:text-white line-clamp-1 leading-snug mb-1">{item.service}</h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">{item.device}</p>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-orange-500 uppercase tracking-wider">
                    View Details <ChevronRight size={10} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {!loading && results.length === 0 && refParam && (
          <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1">Repair Record Not Found</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed mb-6">
              We couldn't find any service session or ticket matching <code className="font-mono bg-slate-50 dark:bg-slate-800 px-1 py-0.5 rounded text-orange-500 font-bold">{refParam}</code>. Please double-check your code.
            </p>
            <Link
              href="/book-service"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-black rounded-xl"
            >
              Book New Service Session
            </Link>
          </div>
        )}

        {/* Selected Incident Details */}
        {!loading && selectedItem && (
          <div className="space-y-6">
            
            {/* Status overview card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-105 dark:border-slate-800 pb-4 mb-6 gap-4">
                <div>
                  <span className="font-mono text-xs text-gray-450 font-bold uppercase tracking-wider">{selectedItem.ref}</span>
                  <h2 className="text-lg font-black text-gray-955 dark:text-white tracking-tight mt-1">{selectedItem.service}</h2>
                  <p className="text-xs text-gray-550 dark:text-gray-400 mt-0.5">{selectedItem.device}</p>
                </div>
                <div className="sm:text-right">
                  <span className="px-3 py-1 bg-orange-500/10 text-orange-655 dark:text-orange-400 text-xs font-black rounded-full uppercase tracking-wider">
                    {getStatusLabel(selectedItem.status)}
                  </span>
                  <p className="text-[10px] text-gray-450 mt-1.5 font-medium">
                    Opened: {new Date(selectedItem.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
              </div>

              {/* Progress timeline */}
              <div className="py-6 px-2">
                <div className="relative">
                  <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-800 md:left-0 md:right-0 md:top-[15px] md:bottom-auto md:w-auto md:h-0.5" />
                  
                  <div className="flex flex-col gap-6 md:flex-row md:justify-between md:gap-2 relative z-10">
                    {steps.map((s, index) => {
                      const stepNum = index + 1;
                      const isCompleted = currentStep >= stepNum;
                      const isActive = currentStep === stepNum;

                      return (
                        <div key={s.label} className="flex gap-4 md:flex-col md:items-center md:text-center md:gap-2 flex-1">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all flex-shrink-0 ${
                            isCompleted
                              ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                              : "bg-slate-100 dark:bg-slate-850 text-gray-400"
                          } ${isActive ? "ring-4 ring-orange-500/10 scale-110" : ""}`}>
                            {isCompleted ? <CheckCircle2 size={16} /> : stepNum}
                          </div>
                          
                          <div className="md:max-w-[120px]">
                            <h4 className={`text-xs font-black tracking-tight ${isCompleted ? "text-gray-955 dark:text-white" : "text-gray-400"}`}>{s.label}</h4>
                            <p className="text-[10px] text-gray-450 dark:text-gray-500 leading-normal mt-0.5">{s.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Estimate and Comments card */}
            {(selectedItem.estimatePrice !== null || selectedItem.notes) && (
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm transition-colors grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Cost Estimate panel */}
                {selectedItem.estimatePrice !== null && (
                  <div className="p-5 bg-gradient-to-br from-orange-500/5 to-amber-500/5 dark:from-orange-550/10 dark:to-amber-550/5 border border-orange-500/10 rounded-2xl flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-black text-orange-655 dark:text-orange-400 uppercase tracking-wider block mb-1">Pricing Estimate (EST)</span>
                      <h3 className="text-3xl font-black text-gray-955 dark:text-white">₹{selectedItem.estimatePrice.toLocaleString("en-IN")}</h3>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-1.5 flex items-center gap-1">
                        <Shield size={10} className="text-emerald-500" /> Standard Repair Warranty
                      </p>
                    </div>
                    
                    {currentStep === 3 && (
                      <a
                        href={`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(
                          `Hi! I approve the repair estimate of ₹${selectedItem.estimatePrice} for my device under reference ${selectedItem.ref}. Please proceed with repair.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-6 flex items-center justify-center gap-1.5 py-2.5 bg-[#25d366] hover:bg-[#22c35e] text-white text-[11px] font-black rounded-xl shadow-lg shadow-green-500/10 uppercase tracking-wider transition-all"
                      >
                        <MessageCircle size={13} /> Approve Estimate
                      </a>
                    )}
                  </div>
                )}

                {/* Technician Notes Panel */}
                {selectedItem.notes && (
                  <div className="md:col-span-2 space-y-3">
                    <span className="text-[10px] font-black text-gray-450 dark:text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <Wrench size={11} className="text-orange-500" /> Technician Notes
                    </span>
                    <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 rounded-2xl">
                      <p className="text-xs text-gray-655 dark:text-gray-300 leading-relaxed font-semibold italic">
                        &ldquo;{selectedItem.notes}&rdquo;
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-[9px] text-gray-400 font-bold uppercase tracking-wider px-1">
                      <Clock size={10} /> Updated: {new Date(selectedItem.createdAt).toLocaleDateString("en-IN", { hour: "numeric", minute: "numeric", hour12: true })}
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* Back button selection */}
            {results.length > 1 && (
              <div className="text-center">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="px-5 py-2.5 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-extrabold text-xs rounded-xl hover:opacity-90 transition-all cursor-pointer animate-pulse"
                >
                  ← Back to repair list
                </button>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#fafafc] dark:bg-gray-950">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    }>
      <TrackPageContent />
    </Suspense>
  );
}
