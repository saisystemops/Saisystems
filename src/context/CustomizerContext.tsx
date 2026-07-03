/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

export type ThemeColor = "green" | "blue" | "purple" | "orange";
export type ServicesLayout = "grid" | "tabs" | "accordion" | "carousel";
export type HeroStyle = "tech" | "gradient" | "split";
export type FontStyle = "sans" | "outfit" | "mono";

interface CustomizerContextType {
  themeColor: ThemeColor;
  setThemeColor: (color: ThemeColor) => void;
  servicesLayout: ServicesLayout;
  setServicesLayout: (layout: ServicesLayout) => void;
  heroStyle: HeroStyle;
  setHeroStyle: (style: HeroStyle) => void;
  fontStyle: FontStyle;
  setFontStyle: (font: FontStyle) => void;
}

const CustomizerContext = createContext<CustomizerContextType | undefined>(undefined);

const colorThemes = {
  green: {
    "--theme-green-50": "#f0fdf4",
    "--theme-green-100": "#dcfce7",
    "--theme-green-200": "#bbf7d0",
    "--theme-green-300": "#86efac",
    "--theme-green-400": "#4ade80",
    "--theme-green-500": "#22c55e",
    "--theme-green-600": "#16a34a",
    "--theme-green-700": "#15803d",
    "--theme-green-800": "#166534",
    "--theme-green-900": "#14532d",
    "--theme-green-950": "#052e16",
    "--green-primary": "#1a7a47",
    "--green-light": "#2ecc71",
    "--green-dark": "#145c35",
    "--green-dark-bg": "#0f1f16",
  },
  blue: {
    "--theme-green-50": "#eff6ff",
    "--theme-green-100": "#dbeafe",
    "--theme-green-200": "#bfdbfe",
    "--theme-green-300": "#93c5fd",
    "--theme-green-400": "#60a5fa",
    "--theme-green-500": "#3b82f6",
    "--theme-green-600": "#2563eb",
    "--theme-green-700": "#1d4ed8",
    "--theme-green-800": "#1e40af",
    "--theme-green-900": "#1e3a8a",
    "--theme-green-950": "#0f172a",
    "--green-primary": "#2563eb",
    "--green-light": "#60a5fa",
    "--green-dark": "#1e3a8a",
    "--green-dark-bg": "#0f172a",
  },
  purple: {
    "--theme-green-50": "#faf5ff",
    "--theme-green-100": "#f3e8ff",
    "--theme-green-200": "#e9d5ff",
    "--theme-green-300": "#d8b4fe",
    "--theme-green-400": "#a78bfa",
    "--theme-green-500": "#8b5cf6",
    "--theme-green-600": "#7c3aed",
    "--theme-green-700": "#6d28d9",
    "--theme-green-800": "#5b21b6",
    "--theme-green-900": "#4c1d95",
    "--theme-green-950": "#1e1b4b",
    "--green-primary": "#7c3aed",
    "--green-light": "#a78bfa",
    "--green-dark": "#4c1d95",
    "--green-dark-bg": "#1e1b4b",
  },
  orange: {
    "--theme-green-50": "#fff7ed",
    "--theme-green-100": "#ffedd5",
    "--theme-green-200": "#fed7aa",
    "--theme-green-300": "#fdba74",
    "--theme-green-400": "#fb923c",
    "--theme-green-500": "#f97316",
    "--theme-green-600": "#ea580c",
    "--theme-green-700": "#c2410c",
    "--theme-green-800": "#9a3412",
    "--theme-green-900": "#7c2d12",
    "--theme-green-950": "#1c0d02",
    "--green-primary": "#ea580c",
    "--green-light": "#fb923c",
    "--green-dark": "#7c2d12",
    "--green-dark-bg": "#1c0d02",
  },
};

export const CustomizerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeColor, setThemeColor] = useState<ThemeColor>("orange");
  const [servicesLayout, setServicesLayout] = useState<ServicesLayout>("grid");
  const [heroStyle, setHeroStyle] = useState<HeroStyle>("tech");
  const [fontStyle, setFontStyle] = useState<FontStyle>("sans");
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedColor = localStorage.getItem("sai-theme-color") as ThemeColor;
    const savedLayout = localStorage.getItem("sai-services-layout") as ServicesLayout;
    const savedHero = localStorage.getItem("sai-hero-style") as HeroStyle;
    const savedFont = localStorage.getItem("sai-font-style") as FontStyle;

    if (savedColor && colorThemes[savedColor]) {
      if (savedColor === "green") {
        setThemeColor("orange");
      } else {
        setThemeColor(savedColor);
      }
    } else {
      setThemeColor("orange");
    }
    if (savedLayout) setServicesLayout(savedLayout);
    if (savedHero) setHeroStyle(savedHero);
    if (savedFont) setFontStyle(savedFont);
    setMounted(true);
  }, []);

  // Apply changes to document
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    const colors = colorThemes[themeColor];
    Object.entries(colors).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
    localStorage.setItem("sai-theme-color", themeColor);
  }, [themeColor, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("sai-services-layout", servicesLayout);
  }, [servicesLayout, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("sai-hero-style", heroStyle);
  }, [heroStyle, mounted]);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.classList.remove("font-sans-mode", "font-outfit-mode", "font-mono-mode");
    if (fontStyle === "sans") {
      root.classList.add("font-sans-mode");
    } else if (fontStyle === "outfit") {
      root.classList.add("font-outfit-mode");
    } else if (fontStyle === "mono") {
      root.classList.add("font-mono-mode");
    }
    localStorage.setItem("sai-font-style", fontStyle);
  }, [fontStyle, mounted]);

  return (
    <CustomizerContext.Provider
      value={{
        themeColor,
        setThemeColor,
        servicesLayout,
        setServicesLayout,
        heroStyle,
        setHeroStyle,
        fontStyle,
        setFontStyle,
      }}
    >
      {children}
    </CustomizerContext.Provider>
  );
};

export const useCustomizer = () => {
  const context = useContext(CustomizerContext);
  if (!context) {
    throw new Error("useCustomizer must be used within a CustomizerProvider");
  }
  return context;
};
