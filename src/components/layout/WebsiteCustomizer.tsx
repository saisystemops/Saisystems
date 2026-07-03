"use client";
import React, { useState } from "react";
import { useCustomizer, ThemeColor, ServicesLayout, HeroStyle, FontStyle } from "@/context/CustomizerContext";
import { Settings, X, RotateCcw, Check, Sparkles } from "lucide-react";

export default function WebsiteCustomizer() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    themeColor,
    setThemeColor,
    servicesLayout,
    setServicesLayout,
    heroStyle,
    setHeroStyle,
    fontStyle,
    setFontStyle,
  } = useCustomizer();

  const colors: { id: ThemeColor; name: string; class: string }[] = [
    { id: "green", name: "Sai", class: "bg-green-600" },
    { id: "blue", name: "Ocean Blue", class: "bg-blue-600" },
    { id: "purple", name: "Cyber Purple", class: "bg-purple-600" },
    { id: "orange", name: "Sunset Orange", class: "bg-orange-600" },
  ];

  const services: { id: ServicesLayout; name: string; desc: string }[] = [
    { id: "grid", name: "Modern Cards", desc: "Clean responsive grid layout" },
    { id: "tabs", name: "Category Tabs", desc: "Interactive category tab switching" },
    { id: "carousel", name: "Carousel Slider", desc: "Horizontal swipe card list" },
    { id: "accordion", name: "Compact List", desc: "Category-grouped clean list" },
  ];

  const heroes: { id: HeroStyle; name: string; desc: string }[] = [
    { id: "tech", name: "Technician", desc: "Professional background image" },
    { id: "gradient", name: "Tech Particles", desc: "Clean gradient with floating dots" },
    { id: "split", name: "Split Column", desc: "Modern split style page frame" },
  ];

  const fonts: { id: FontStyle; name: string }[] = [
    { id: "sans", name: "Inter (Modern Sans)" },
    { id: "outfit", name: "Outfit (Premium)" },
    { id: "mono", name: "Fira Code (Tech)" },
  ];

  const handleReset = () => {
    setThemeColor("green");
    setServicesLayout("grid");
    setHeroStyle("tech");
    setFontStyle("sans");
  };

  return (
    <>
      {/* Floating Gear Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-5 bottom-24 z-40 p-3.5 bg-green-700 hover:bg-green-800 text-white rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95 group focus:outline-none"
        aria-label="Customize Website Design"
      >
        <Settings size={22} className="animate-spin-slow group-hover:rotate-45 transition-transform duration-500" />
      </button>

      {/* Overlay Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity duration-300"
        />
      )}

      {/* Settings Drawer Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-80 sm:w-96 bg-white dark:bg-gray-950 shadow-2xl z-50 border-l border-gray-100 dark:border-gray-800 transition-transform duration-300 transform flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Sparkles className="text-green-600" size={18} />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Design Options</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              title="Reset to Defaults"
              aria-label="Reset to default design options"
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-850 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all"
            >
              <RotateCcw size={16} />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close design customization panel"
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-850 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Contents */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Theme Colors */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              Theme Color Scheme
            </label>
            <div className="grid grid-cols-2 gap-3">
              {colors.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setThemeColor(c.id)}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border-2 text-left transition-all ${
                    themeColor === c.id
                      ? "border-green-600 bg-green-50/20 text-green-800 dark:text-green-400"
                      : "border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full ${c.class} flex-shrink-0 flex items-center justify-center`}>
                    {themeColor === c.id && <Check size={10} className="text-white" />}
                  </span>
                  <span className="text-xs font-bold">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Typography */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              Typography Font
            </label>
            <div className="flex flex-col gap-2">
              {fonts.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFontStyle(f.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border-2 text-left transition-all ${
                    fontStyle === f.id
                      ? "border-green-600 bg-green-50/20 text-green-800 dark:text-green-400"
                      : "border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <span className="text-xs font-semibold">{f.name}</span>
                  {fontStyle === f.id && <Check size={14} className="text-green-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Hero Layout */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              Hero Section Style
            </label>
            <div className="flex flex-col gap-2">
              {heroes.map((h) => (
                <button
                  key={h.id}
                  onClick={() => setHeroStyle(h.id)}
                  className={`flex flex-col p-3 rounded-xl border-2 text-left transition-all ${
                    heroStyle === h.id
                      ? "border-green-600 bg-green-50/20 text-green-800 dark:text-green-400"
                      : "border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <span className="text-xs font-bold flex items-center justify-between">
                    {h.name}
                    {heroStyle === h.id && <Check size={14} className="text-green-600 inline ml-1" />}
                  </span>
                  <span className="text-[10px] text-gray-400 mt-0.5">{h.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Services Layout */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              Services Grid Style
            </label>
            <div className="flex flex-col gap-2">
              {services.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setServicesLayout(s.id)}
                  className={`flex flex-col p-3 rounded-xl border-2 text-left transition-all ${
                    servicesLayout === s.id
                      ? "border-green-600 bg-green-50/20 text-green-800 dark:text-green-400"
                      : "border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <span className="text-xs font-bold flex items-center justify-between">
                    {s.name}
                    {servicesLayout === s.id && <Check size={14} className="text-green-600 inline ml-1" />}
                  </span>
                  <span className="text-[10px] text-gray-400 mt-0.5">{s.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-center">
          <p className="text-[10px] text-gray-400 font-medium leading-normal">
            Select layouts to instantly update the site view. Design options are cached in your browser.
          </p>
        </div>
      </div>

    </>
  );
}
