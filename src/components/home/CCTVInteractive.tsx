"use client";
import { useState } from "react";
import Link from "next/link";
import { Camera, Eye, Smartphone, Shield, ArrowRight, MessageCircle } from "lucide-react";
import { siteConfig } from "@/lib/config";

export default function CCTVInteractive() {
  const [resolution, setResolution] = useState<"sd" | "hd">("hd");
  const [mode, setMode] = useState<"day" | "night">("day");

  return (
    <section className="section-padding bg-gray-950 text-white relative overflow-hidden">
      {/* Glow effects */}
      <div className="absolute top-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-orange-950/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-amber-950/10 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Title */}
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider rounded-full mb-4">
            IT Security &amp; Safety
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4 tracking-tight">
            Premium <span className="text-gradient">CCTV Camera</span> Installation
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base font-medium">
            Don&apos;t compromise on safety. Secure your shop, home, or warehouse with our Ultra HD IP cameras featuring color night vision and mobile app tracking.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* LEFT: Simulation Screen Controller */}
          <div className="lg:col-span-7 bg-gray-900/60 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <Camera size={18} className="text-orange-500" />
                <span className="font-extrabold text-sm uppercase tracking-wider">Live Camera Simulator</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-red-600 rounded-full animate-ping" />
                <span className="text-xs font-bold uppercase text-red-500 tracking-wider">Live Feed</span>
              </div>
            </div>

            {/* Simulated Display monitor */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-950 border border-white/5">
              {/* Main Simulated Image View using clean CSS filters */}
              <div 
                className="absolute inset-0 bg-cover bg-center transition-all duration-500"
                style={{ 
                  backgroundImage: "url('/images/cctv-simulation.png')",
                  filter: `${resolution === "sd" ? "blur(3.5px) contrast(0.85)" : "blur(0px) contrast(1.05)"} ${mode === "night" ? "grayscale(1) brightness(0.65) sepia(0.1)" : ""}`
                }}
              />

              {/* Night vision green or blue tint overlays */}
              {mode === "night" && (
                <div className="absolute inset-0 bg-blue-500/5 mix-blend-color pointer-events-none" />
              )}

              {/* Status indicator bar in feed */}
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg text-[10px] font-mono tracking-wider flex items-center gap-2">
                <span className="text-orange-400">CAM_01: Dindigul Showroom</span>
                <span>{mode === "day" ? "Day-Mode" : "Color-Infrared"}</span>
                <span>{resolution === "hd" ? "1080P Ultra-HD" : "CIF Low-Res"}</span>
              </div>

              {/* Dynamic watermark text overlay */}
              <div className="absolute bottom-3 right-3 text-[10px] font-mono text-white/50 bg-black/40 px-2 py-1 rounded">
                SAI_SYS_SEC · 2026-07-03
              </div>
            </div>

            {/* Controls panel */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              {/* Quality Select */}
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Resolution Quality</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setResolution("sd")}
                    className={`py-2 text-xs font-extrabold rounded-xl transition-all ${
                      resolution === "sd" ? "bg-orange-600 text-white" : "bg-white/5 text-gray-400 hover:text-white"
                    }`}
                  >
                    Analog SD
                  </button>
                  <button
                    onClick={() => setResolution("hd")}
                    className={`py-2 text-xs font-extrabold rounded-xl transition-all ${
                      resolution === "hd" ? "bg-orange-600 text-white" : "bg-white/5 text-gray-400 hover:text-white"
                    }`}
                  >
                    Ultra-HD IP
                  </button>
                </div>
              </div>

              {/* Night vs Day Mode */}
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Night Surveillance</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setMode("day")}
                    className={`py-2 text-xs font-extrabold rounded-xl transition-all ${
                      mode === "day" ? "bg-orange-600 text-white" : "bg-white/5 text-gray-400 hover:text-white"
                    }`}
                  >
                    Daylight Mode
                  </button>
                  <button
                    onClick={() => setMode("night")}
                    className={`py-2 text-xs font-extrabold rounded-xl transition-all ${
                      mode === "night" ? "bg-orange-600 text-white" : "bg-white/5 text-gray-400 hover:text-white"
                    }`}
                  >
                    Night-Vision
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT: Smartphone Notification Showcase */}
          <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-6">
            
            {/* Benefits Cards */}
            <div className="space-y-4">
              <div className="flex gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-orange-500/20 transition-all">
                <div className="w-10 h-10 rounded-xl bg-orange-600/10 border border-orange-600/30 flex items-center justify-center flex-shrink-0 text-orange-400">
                  <Smartphone size={20} />
                </div>
                <div>
                  <h4 className="font-extrabold text-white text-base">Mobile App Remote Monitoring</h4>
                  <p className="text-xs text-gray-400 mt-1">Connect your cameras to your Android or iPhone device and monitor live footage from anywhere globally.</p>
                </div>
              </div>

              <div className="flex gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-orange-500/20 transition-all">
                <div className="w-10 h-10 rounded-xl bg-orange-600/10 border border-orange-600/30 flex items-center justify-center flex-shrink-0 text-orange-400">
                  <Eye size={20} />
                </div>
                <div>
                  <h4 className="font-extrabold text-white text-base">Smart Motion &amp; Intruder Alerts</h4>
                  <p className="text-xs text-gray-400 mt-1">Configure instantaneous mobile notifications when unauthorized motion is detected after showroom closing hours.</p>
                </div>
              </div>

              <div className="flex gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-orange-500/20 transition-all">
                <div className="w-10 h-10 rounded-xl bg-orange-600/10 border border-orange-600/30 flex items-center justify-center flex-shrink-0 text-orange-400">
                  <Shield size={20} />
                </div>
                <div>
                  <h4 className="font-extrabold text-white text-base">Annual Maintenance Contracts (AMC)</h4>
                  <p className="text-xs text-gray-400 mt-1">Complete peace of mind with prompt servicing, wiring fixes, backup replacements, and monthly health checks.</p>
                </div>
              </div>
            </div>

            {/* Handoff call to actions */}
            <div className="pt-4 flex flex-wrap gap-3">
              <Link
                href="/book-service"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-extrabold rounded-2xl hover:from-orange-500 hover:to-amber-500 transition-all text-sm"
              >
                Request CCTV Quote <ArrowRight size={16} />
              </Link>
              <a
                href={`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent("Hi! I am looking to install a new CCTV system or service existing cameras. Please share packages.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-6 py-4 bg-[#25d366] text-white font-extrabold rounded-2xl hover:bg-[#20bd5a] transition-all text-sm"
              >
                <MessageCircle size={16} /> WhatsApp Deal
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
