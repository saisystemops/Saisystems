"use client";

import React, { useRef, useEffect, useImperativeHandle, forwardRef, useState } from "react";
import toast from "react-hot-toast";

export interface PromoBannerCanvasProps {
  product: {
    category?: string;
    title?: string;
    price?: string | number;
    originalPrice?: string | number;
    dealTag?: string;
    includedAccessory?: string;
    badge?: string;
    specs?: string[];
    imageUrl?: string;
  };
  ratio: "1:1" | "9:16" | "16:9";
  themeColor: string;
  bgPattern: "none" | "grid" | "circuit" | "fiber";
  platformStyle: "pedestal" | "ring" | "shadow";
  cardStyle: "glass" | "light" | "dark";
  accentColor: string;
  zoom: number;
  offsetX: number;
  offsetY: number;
  rotation: number;
  localImageFile: File | null;
  brandName?: string;
  brandSubtext?: string;
  tagline?: string;
  phoneSupport?: string;
  whatsappChat?: string;
  showroomAddress?: string;
  trustPolicies?: string[];
  isTamil?: boolean;
  showEmi?: boolean;
  emiTenure?: number;
  customEmiText?: string;
  removeBg?: boolean;
}

export interface PromoBannerCanvasHandle {
  downloadPNG: () => void;
  copyImageToClipboard: () => Promise<boolean>;
  getSocialCaption: () => string;
}

const PromoBannerCanvas = forwardRef<PromoBannerCanvasHandle, PromoBannerCanvasProps>(
  (props, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [logoLoaded, setLogoLoaded] = useState(false);
    const logoImgRef = useRef<HTMLImageElement | null>(null);
    const [imgSrc, setImgSrc] = useState<string>("");
    
    // Track loaded state of product image
    const [productImg, setProductImg] = useState<HTMLImageElement | null>(null);
    const [productImgSrc, setProductImgSrc] = useState<string | null>(null);
    const [processedImg, setProcessedImg] = useState<HTMLCanvasElement | HTMLImageElement | null>(null);
    const [imageLoading, setImageLoading] = useState(false);
    const [imageLoadError, setImageLoadError] = useState(false);
    const [isTainted, setIsTainted] = useState(false);
    const [qrImg, setQrImg] = useState<HTMLImageElement | null>(null);

    // Custom helper to remove white/light studio backgrounds dynamically
    const removeImageBackground = (img: HTMLImageElement): HTMLCanvasElement => {
      const tempCanvas = document.createElement("canvas");
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;
      tempCanvas.width = w;
      tempCanvas.height = h;
      
      const tempCtx = tempCanvas.getContext("2d");
      if (!tempCtx) return tempCanvas;

      tempCtx.drawImage(img, 0, 0);
      try {
        const imgData = tempCtx.getImageData(0, 0, w, h);
        const data = imgData.data;

        // Scan pixels and convert light/white colors to transparent
        // Threshold: 235 is perfect for studio white/light backgrounds
        const threshold = 235;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          if (r > threshold && g > threshold && b > threshold) {
            // Apply soft feathering to edges based on proximity to pure white (255)
            const avg = (r + g + b) / 3;
            const alpha = Math.max(0, Math.min(255, (255 - avg) * (255 / (255 - threshold))));
            data[i + 3] = Math.round(alpha);
          }
        }
        tempCtx.putImageData(imgData, 0, 0);
      } catch (e) {
        console.error("Failed to read image pixels (likely CORS limitation):", e);
      }
      return tempCanvas;
    };

    // Pre-load official logo-feather.png on mount
    useEffect(() => {
      const img = new Image();
      img.src = "/logo-feather.png";
      img.onload = () => {
        logoImgRef.current = img;
        setLogoLoaded(true);
      };
      img.onerror = () => {
        console.error("Failed to load /logo-feather.png");
      };
    }, []);

    // Handle product photo loading (from either URL or local file upload)
    useEffect(() => {
      let srcUrl = "";
      
      if (props.localImageFile) {
        srcUrl = URL.createObjectURL(props.localImageFile);
      } else if (props.product.imageUrl) {
        srcUrl = props.product.imageUrl;
      }

      if (!srcUrl) {
        setProductImg(null);
        setProductImgSrc(null);
        setImageLoading(false);
        setImageLoadError(false);
        return;
      }

      setImageLoading(true);
      setImageLoadError(false);
      const img = new Image();
      if (srcUrl.startsWith("http")) {
        img.crossOrigin = "anonymous";
      }
      img.src = srcUrl;
      img.onload = () => {
        setProductImg(img);
        setProductImgSrc(srcUrl);
        setImageLoading(false);
      };
      img.onerror = () => {
        console.error("Failed to load product image:", srcUrl);
        setProductImg(null);
        setImageLoading(false);
        setImageLoadError(true);
      };

      return () => {
        if (srcUrl && srcUrl.startsWith("blob:")) {
          URL.revokeObjectURL(srcUrl);
        }
      };
    }, [props.product.imageUrl, props.localImageFile]);

    // Process image background removal dynamically
    useEffect(() => {
      if (!productImg) {
        setProcessedImg(null);
        return;
      }

      if (props.removeBg) {
        try {
          const processed = removeImageBackground(productImg);
          setProcessedImg(processed);
        } catch (e) {
          console.error("Failed to run background remover, fallback to raw image:", e);
          setProcessedImg(productImg);
        }
      } else {
        setProcessedImg(productImg);
      }
    }, [productImg, props.removeBg]);

    // Pre-load QR Code for WhatsApp direct link
    useEffect(() => {
      const waNumber = "917904108020";
      const cleanTitle = props.product.title || "";
      const text = `Hi Sai Systems! I am interested in your deal: ${cleanTitle}.`;
      const qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`)}`;
      
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = qrDataUrl;
      img.onload = () => {
        setQrImg(img);
      };
      img.onerror = () => {
        console.error("Failed to load QR code image");
        setQrImg(null);
      };
    }, [props.product.title]);

    // Triggers redraw whenever any property changes
    useEffect(() => {
      drawCanvas();
    }, [
      props.product,
      props.ratio,
      props.themeColor,
      props.bgPattern,
      props.platformStyle,
      props.cardStyle,
      props.accentColor,
      props.zoom,
      props.offsetX,
      props.offsetY,
      props.rotation,
      props.brandName,
      props.brandSubtext,
      props.tagline,
      props.phoneSupport,
      props.whatsappChat,
      props.showroomAddress,
      props.trustPolicies,
      props.isTamil,
      props.showEmi,
      logoLoaded,
      productImg,
      processedImg,
      props.removeBg,
      qrImg
    ]);

    // Debounce toDataURL to prevent lagging during active drag interactions
    useEffect(() => {
      const timer = setTimeout(() => {
        const canvas = canvasRef.current;
        if (canvas) {
          try {
            setImgSrc(canvas.toDataURL("image/png"));
            setIsTainted(false);
          } catch (e) {
            console.error("Tainted canvas during base64 export:", e);
            setIsTainted(true);
          }
        }
      }, 250); // 250ms debounce
      return () => clearTimeout(timer);
    }, [
      props.product,
      props.ratio,
      props.themeColor,
      props.bgPattern,
      props.platformStyle,
      props.cardStyle,
      props.accentColor,
      props.zoom,
      props.offsetX,
      props.offsetY,
      props.rotation,
      props.brandName,
      props.brandSubtext,
      props.tagline,
      props.phoneSupport,
      props.whatsappChat,
      props.showroomAddress,
      props.trustPolicies,
      props.isTamil,
      props.showEmi,
      logoLoaded,
      productImg,
      qrImg
    ]);

    const drawCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // ── DESTRUCTURING PROPS WITH DEFAULTS ──────────────────────────────
      const brandName = props.brandName || "SAI";
      const brandSubtext = props.brandSubtext || "SYSTEMS";
      const tagline = props.tagline || (props.isTamil 
        ? "— சிறந்த தரம். மலிவு விலை. உன்னத சேவை. —"
        : "— Professional Performance. Business Ready. —"
      );
      const phoneSupport = props.phoneSupport || "+91 87780 03397";
      const whatsappChat = props.whatsappChat || "+91 79041 08020";
      const showroomAddress = props.showroomAddress || (props.isTamil 
        ? "ஷோரூம் முகவரி: பிஏஏ கட்டிடம், 8/25 பி, கடை எண்-ஏ3, ஒய்.எம்.ஆர் பட்டி (அடையாளம்: தலைமை தபால் நிலையம் அருகில்), திண்டுக்கல் - 624001"
        : "showroom address: paa building, 8/25 b, shop no-a3, y.m.r patty (landmark: head post office), dindigul, tamil nadu - 624001"
      );
      
      const defaultPolicies = props.isTamil
        ? ["🛡️ 365 நாட்கள் உத்தரவாதம்", "⚙️ 100% அசல் உதிரிபாகங்கள்", "🔌 சார்ஜர் இலவசம்"]
        : ["🛡️ 365-Day Warranty", "⚙️ 100% Genuine Parts", "🔌 Charger Included"];
      const trustPolicies = props.trustPolicies || defaultPolicies;

      // ── DIMENSIONS SETTING BY ASPECT RATIO ──────────────────────────────
      let W = 1080;
      let H = 1080;
      if (props.ratio === "9:16") {
        W = 1080;
        H = 1920;
      } else if (props.ratio === "16:9") {
        W = 1200;
        H = 630;
      }

      canvas.width = W;
      canvas.height = H;
      ctx.clearRect(0, 0, W, H);

      // ── COLOR CONFIGURATIONS & HELPERS ─────────────────────────────────
      const accents: Record<string, string> = {
        orange: "#f97316",
        cyan: "#06b6d4",
        gold: "#fbbf24",
        green: "#10b981",
        purple: "#a855f7"
      };
      const activeAccent = accents[props.accentColor] || props.accentColor || accents.orange;

      const getRgbaColor = (color: string, alpha: number): string => {
        const defaultColor = `rgba(249, 115, 22, ${alpha})`;
        if (!color) return defaultColor;
        if (color.startsWith("rgba")) return color;
        if (color.startsWith("rgb")) {
          return color.replace("rgb", "rgba").replace(")", `, ${alpha})`);
        }
        if (color.startsWith("#")) {
          let hex = color.slice(1);
          if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
          }
          if (hex.length === 6) {
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
          }
          if (hex.length === 8) {
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
          }
        }
        const standardAccents: Record<string, string> = {
          orange: "249, 115, 22",
          cyan: "6, 182, 212",
          gold: "251, 191, 36",
          green: "16, 185, 129",
          purple: "168, 85, 247"
        };
        const normalized = color.toLowerCase();
        if (standardAccents[normalized]) {
          return `rgba(${standardAccents[normalized]}, ${alpha})`;
        }
        return defaultColor;
      };

      const bgGradients: Record<string, string[]> = {
        orange: ["#fef8f6", "#fff1eb", "#f97316", "#2c1203", "#111827"],
        blue: ["#f8fafc", "#f1f5f9", "#2563eb", "#0b1b3d", "#061026"],
        gold: ["#fafafa", "#f4f4f5", "#d97706", "#1c160c", "#09090b"],
        slate: ["#f8fafc", "#f1f5f9", "#64748b", "#0f172a", "#090d16"],
        green: ["#f0fdf4", "#dcfce7", "#16a34a", "#022c22", "#011611"],
        purple: ["#faf5ff", "#f3e8ff", "#a855f7", "#2e1065", "#0f052d"],
        sunset: ["#fff7ed", "#ffedd5", "#f97316", "#450a0a", "#18000a"],
        ocean: ["#f0fdfa", "#ccfbf1", "#0d9488", "#115e59", "#042f2e"],
        rose: ["#fff1f2", "#ffe4e6", "#f43f5e", "#4c0519", "#1f0005"],
        silver: ["#f8fafc", "#f1f5f9", "#94a3b8", "#1e293b", "#0f172a"],
        dark: ["#1e293b", "#0f172a", "#475569", "#020617", "#000000"],
        neon: ["#1e1b4b", "#0c0a09", "#d946ef", "#03001e", "#7303c0"],
        mint: ["#f0fdf4", "#f0fdf4", "#34d399", "#064e3b", "#022c22"],
        royal: ["#faf5ff", "#f3e8ff", "#7c3aed", "#1e1b4b", "#090514"],
        matrix: ["#022c22", "#000000", "#10b981", "#000000", "#000000"],
        minimal: ["#ffffff", "#f8fafc", "#0f172a", "#ffffff", "#f1f5f9"],
        burgundy: ["#ffe4e6", "#fecdd3", "#be123c", "#4c0519", "#1a0005"],
        frost: ["#f0f9ff", "#e0f2fe", "#0284c7", "#0c4a6e", "#031b29"],
        goldrush: ["#fef9c3", "#fef08a", "#eab308", "#451a03", "#1c0b00"],
        teal: ["#ecfeff", "#cffafe", "#06b6d4", "#164e63", "#082f49"]
      };
      const activeBgGrad = bgGradients[props.themeColor] || bgGradients.orange;

      // ── VECTOR ICON DRAWING HELPERS ────────────────────────────────────
      const drawCheckmarkBullet = (ctx: CanvasRenderingContext2D, x: number, y: number, text: string, fontSize = 12) => {
        ctx.save();
        ctx.fillStyle = "#22c55e";
        ctx.beginPath();
        ctx.arc(x, y - 4, 6, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = "white";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x - 3, y - 4);
        ctx.lineTo(x - 1, y - 2);
        ctx.lineTo(x + 3, y - 6);
        ctx.stroke();
        ctx.restore();

        ctx.fillStyle = props.cardStyle === "dark" ? "#f8fafc" : "#1e293b";
        ctx.font = `bold ${fontSize}px Arial, sans-serif`;
        ctx.fillText(text, x + 12, y);
      };

      const drawLocationPin = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
        ctx.save();
        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.arc(x, y - 5, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x - 4, y - 5);
        ctx.lineTo(x, y + 2);
        ctx.lineTo(x + 4, y - 5);
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(x, y - 5, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      };

      const drawPhoneIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, color = "#f97316") => {
        ctx.save();
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x + 16, y, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.font = "bold 9px Arial";
        ctx.fillText("PH", x + 9, y + 3);
        ctx.restore();
      };

      const drawWhatsAppIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, color = "#22c55e") => {
        ctx.save();
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x + 16, y, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.font = "bold 9px Arial";
        ctx.fillText("WA", x + 8, y + 3);
        ctx.restore();
      };

      const drawShieldIcon = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
        ctx.save();
        ctx.strokeStyle = activeAccent;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x, y - 8);
        ctx.lineTo(x + 7, y - 5);
        ctx.lineTo(x + 7, y + 1);
        ctx.quadraticCurveTo(x + 7, y + 7, x, y + 10);
        ctx.quadraticCurveTo(x - 7, y + 7, x - 7, y + 1);
        ctx.lineTo(x - 7, y - 5);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
      };

      const drawGearIcon = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
        ctx.save();
        ctx.strokeStyle = activeAccent;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.stroke();
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI) / 4;
          ctx.beginPath();
          ctx.moveTo(x + Math.cos(angle) * 4, y + Math.sin(angle) * 4);
          ctx.lineTo(x + Math.cos(angle) * 7, y + Math.sin(angle) * 7);
          ctx.stroke();
        }
        ctx.restore();
      };

      const drawPlugIcon = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
        ctx.save();
        ctx.strokeStyle = activeAccent;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x - 4, y - 4, 8, 7);
        ctx.beginPath();
        ctx.moveTo(x - 2, y - 4);
        ctx.lineTo(x - 2, y - 8);
        ctx.moveTo(x + 2, y - 4);
        ctx.lineTo(x + 2, y - 8);
        ctx.moveTo(x, y + 3);
        ctx.lineTo(x, y + 8);
        ctx.stroke();
        ctx.restore();
      };

      // ── SHARED PRICING INFO & EMI MATH ────────────────────────────────
      const getPricingInfo = (price: string | number | undefined, originalPrice: string | number | undefined) => {
        const priceVal = formatRupee(String(price || "25000"));
        let originalVal = String(originalPrice || "");
        if (originalVal) originalVal = formatRupee(originalVal);

        const dealNum = parseFloat(String(price || "").replace(/,/g, ""));
        const origNum = parseFloat(String(originalPrice || "").replace(/,/g, ""));
        
        let savingsLabel = "";
        let emiLabel = "";
        
        if (props.customEmiText) {
          emiLabel = props.customEmiText;
        } else if (dealNum) {
          const tenure = props.emiTenure || 12;
          const emiVal = Math.round(dealNum / tenure);
          emiLabel = props.isTamil
            ? `மாதாந்திர EMI: ₹${formatRupee(String(emiVal))} (${tenure} மாதங்கள்)*`
            : `Easy EMI starts at ₹${formatRupee(String(emiVal))} (${tenure} Months)*`;
        }

        if (dealNum && origNum && origNum > dealNum) {
          const savings = origNum - dealNum;
          const pct = Math.round((savings / origNum) * 100);
          savingsLabel = props.isTamil
            ? `சேமிப்பு ₹${formatRupee(String(savings))} (${pct}% தள்ளுபடி)`
            : `SAVE ₹${formatRupee(String(savings))} (${pct}% OFF)`;
        }

        return { priceVal, originalVal, savingsLabel, emiLabel };
      };

      const { priceVal, originalVal, savingsLabel, emiLabel } = getPricingInfo(props.product.price, props.product.originalPrice);

      // Determine vertical limit where bottom blue section starts
      let footerY = H * 0.65; 
      if (props.ratio === "9:16") {
        footerY = 1370; // Dedicated vertical split for Story
      } else if (props.ratio === "16:9") {
        footerY = 441;  // Dedicated vertical split for Landscape
      }

      // Draw Top Half Background Gradient
      const gradTop = ctx.createLinearGradient(0, 0, 0, footerY);
      gradTop.addColorStop(0, activeBgGrad[0]);
      gradTop.addColorStop(1, activeBgGrad[1]);
      ctx.fillStyle = gradTop;
      ctx.fillRect(0, 0, W, footerY);

      // Draw Bottom Half Background Gradient
      const gradBot = ctx.createLinearGradient(0, footerY, 0, H);
      gradBot.addColorStop(0, activeBgGrad[3]);
      gradBot.addColorStop(1, activeBgGrad[4]);
      ctx.fillStyle = gradBot;
      ctx.fillRect(0, footerY, W, H - footerY);

      // Draw colored divider stripe
      ctx.fillStyle = activeAccent;
      ctx.fillRect(0, footerY - 6, W, 6);

      // ----------------------------------------------------
      // 2. BACKGROUND PATTERNS
      // ----------------------------------------------------
      if (props.bgPattern === "grid") {
        ctx.strokeStyle = "rgba(100, 116, 139, 0.04)";
        ctx.lineWidth = 1;
        const gridSpacing = 40;
        for (let x = 0; x < W; x += gridSpacing) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, footerY);
          ctx.stroke();
        }
        for (let y = 0; y < footerY; y += gridSpacing) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(W, y);
          ctx.stroke();
        }
      } else if (props.bgPattern === "circuit") {
        ctx.strokeStyle = "rgba(148, 163, 184, 0.06)";
        ctx.lineWidth = 2.5;
        // Top left circuit line
        ctx.beginPath();
        ctx.moveTo(50, 150);
        ctx.lineTo(W * 0.25, 150);
        ctx.lineTo(W * 0.30, 200);
        ctx.lineTo(W * 0.45, 200);
        ctx.stroke();
        
        ctx.fillStyle = activeAccent;
        ctx.beginPath();
        ctx.arc(W * 0.45, 200, 5, 0, Math.PI * 2);
        ctx.fill();

        // Top right circuit line
        ctx.beginPath();
        ctx.moveTo(W - 50, 150);
        ctx.lineTo(W * 0.75, 150);
        ctx.lineTo(W * 0.70, 200);
        ctx.lineTo(W * 0.55, 200);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(W * 0.55, 200, 5, 0, Math.PI * 2);
        ctx.fill();
      } else if (props.bgPattern === "fiber") {
        ctx.fillStyle = "rgba(0, 0, 0, 0.02)";
        for (let y = 0; y < footerY; y += 4) {
          ctx.fillRect(0, y, W, 2);
        }
      }

      // Card Fill Color based on props.cardStyle
      let cardFill = "rgba(255, 255, 255, 0.93)";
      let cardTextBrand = "#ea580c";
      let cardTextSub = "#64748b";
      let cardOutline = "rgba(226, 232, 240, 0.8)";
      
      if (props.cardStyle === "dark") {
        cardFill = "rgba(15, 23, 42, 0.95)";
        cardOutline = "rgba(51, 65, 85, 0.8)";
        cardTextSub = "#94a3b8";
      } else if (props.cardStyle === "glass") {
        cardFill = "rgba(255, 255, 255, 0.75)";
        cardOutline = "rgba(255, 255, 255, 0.5)";
      }

      const pTitle = props.product.title || "Dell Latitude 3410";
      const pBadge = props.product.badge || "";
      const pCategory = (props.product.category || "Laptops").toUpperCase();
      const dealTag = props.product.dealTag || "";
      const accessory = props.product.includedAccessory || "";

      let specsList = props.product.specs && props.product.specs.length > 0
        ? props.product.specs
        : ["Intel Core i5 Processor", "8GB DDR4 RAM", "256GB SSD Storage", "Wi-Fi (Built-in)"];

      specsList = specsList.filter(spec => {
        const cleanSpec = spec.toLowerCase().replace(/[^a-z0-9]/g, "");
        const isAccessoryText = cleanSpec.includes("bag") || cleanSpec.includes("charger") || cleanSpec.includes("accessory") || cleanSpec.includes("accessories");
        
        if (accessory) {
          const cleanAccessory = accessory.toLowerCase().replace(/[^a-z0-9]/g, "");
          const isDup = cleanSpec.includes(cleanAccessory) || cleanAccessory.includes(cleanSpec) ||
                        (cleanSpec.includes("bag") && cleanAccessory.includes("bag")) ||
                        (cleanSpec.includes("charger") && cleanAccessory.includes("charger"));
          return !isAccessoryText && !isDup;
        }
        return !isAccessoryText;
      });

      // Price format and discount calculations are now globally destructured above.

      // ----------------------------------------------------
      // BRANCH: STORY LAYOUT (9:16, 1080x1920)
      // ----------------------------------------------------
      if (props.ratio === "9:16") {
        // Logo card
        const headerX = 40;
        const headerY = 80;
        ctx.save();
        ctx.shadowColor = "rgba(15, 23, 42, 0.05)";
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 4;
        drawRoundedRect(ctx, headerX, headerY, 270, 100, 16);
        ctx.fillStyle = cardFill;
        ctx.fill();
        ctx.strokeStyle = cardOutline;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();

        if (logoImgRef.current) {
          ctx.drawImage(logoImgRef.current, headerX + 15, headerY + 12, 76, 76);
        } else {
          ctx.fillStyle = activeAccent;
          ctx.beginPath();
          ctx.arc(headerX + 45, headerY + 50, 25, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "white";
          ctx.font = "bold 20px Arial";
          ctx.fillText("S", headerX + 38, headerY + 57);
        }

        ctx.fillStyle = "#ea580c";
        ctx.font = "black 28px Arial, sans-serif";
        ctx.fillText(brandName, headerX + 105, headerY + 50);

        ctx.fillStyle = cardTextSub;
        ctx.font = "black 11px Arial, sans-serif";
        const subText = brandSubtext;
        let textX = headerX + 105;
        for (let i = 0; i < subText.length; i++) {
          ctx.fillText(subText[i], textX, headerY + 76);
          textX += 13;
        }

        // Category Tag (Top Right)
        ctx.font = "bold 11px Arial, sans-serif";
        const catWidth = ctx.measureText(pCategory).width + 30;
        ctx.fillStyle = "rgba(254, 215, 170, 0.7)";
        ctx.strokeStyle = "rgba(251, 146, 60, 0.4)";
        ctx.lineWidth = 1;
        drawRoundedRect(ctx, W - 40 - catWidth, 114, catWidth, 32, 6);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#c2410c";
        ctx.textAlign = "center";
        ctx.fillText(pCategory, W - 40 - catWidth / 2, 134);
        ctx.textAlign = "left";

        // Title and Subtitle (Centered - Shifted Up)
        ctx.textAlign = "center";
        ctx.fillStyle = "#0f172a";
        let titleFontSize = 46;
        ctx.font = "900 " + titleFontSize + "px Arial, sans-serif";
        while (ctx.measureText(pTitle).width > W - 100 && titleFontSize > 28) {
          titleFontSize -= 2;
          ctx.font = "900 " + titleFontSize + "px Arial, sans-serif";
        }
        ctx.fillText(pTitle, W / 2, 230);

        ctx.fillStyle = "#64748b";
        ctx.font = "bold 16px Arial, sans-serif";
        ctx.fillText(tagline, W / 2, 275);
        ctx.textAlign = "left";

        // Pedestal & Showcase (Shifted Up)
        const showX = W / 2;
        const showY = 490;
        const pedestalW = 600;
        const pedestalH = 100;

        if (props.platformStyle === "pedestal") {
          ctx.fillStyle = "rgba(15, 23, 42, 0.1)";
          ctx.beginPath();
          ctx.ellipse(showX, showY + 80, pedestalW * 0.9, pedestalH * 0.9, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
          ctx.strokeStyle = activeAccent;
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.ellipse(showX, showY + 60, pedestalW * 0.8, pedestalH * 0.8, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = getRgbaColor(activeAccent, 0.13);
          ctx.beginPath();
          ctx.ellipse(showX, showY + 60, pedestalW * 0.7, pedestalH * 0.7, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (props.platformStyle === "ring") {
          ctx.strokeStyle = activeAccent;
          ctx.lineWidth = 6;
          ctx.save();
          ctx.shadowColor = activeAccent;
          ctx.shadowBlur = 20;
          ctx.beginPath();
          ctx.ellipse(showX, showY + 70, pedestalW * 0.75, pedestalH * 0.5, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        } else {
          ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
          ctx.beginPath();
          ctx.ellipse(showX, showY + 85, pedestalW * 0.6, pedestalH * 0.4, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        if (props.product.category === "desktops") {
          ctx.fillStyle = "#334155";
          ctx.strokeStyle = "#475569";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(showX - 40, showY + 60);
          ctx.lineTo(showX - 25, showY);
          ctx.lineTo(showX + 25, showY);
          ctx.lineTo(showX + 40, showY + 60);
          ctx.fill();
          ctx.stroke();
        }

        if (processedImg) {
          ctx.save();
          const pWidth = processedImg.width || (processedImg as HTMLCanvasElement).width;
          const pHeight = processedImg.height || (processedImg as HTMLCanvasElement).height;
          const baseScale = (pedestalW * 0.95) / pWidth;
          const finalScale = baseScale * props.zoom;
          const drawW = pWidth * finalScale;
          const drawH = pHeight * finalScale;
          ctx.translate(showX + props.offsetX, showY + props.offsetY);
          ctx.rotate((props.rotation * Math.PI) / 180);
          ctx.drawImage(processedImg, -drawW / 2, -drawH / 2, drawW, drawH);
          ctx.restore();
        } else {
          ctx.save();
          ctx.fillStyle = "#334155";
          ctx.strokeStyle = "#475569";
          ctx.lineWidth = 4;
          drawRoundedRect(ctx, showX - 160, showY - 140, 320, 210, 10);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = "#f1f5f9";
          ctx.fillRect(showX - 148, showY - 128, 296, 174);
          ctx.fillStyle = "rgba(148, 163, 184, 0.2)";
          ctx.font = "bold 20px Arial";
          ctx.fillText(`${brandName} ${brandSubtext}`, showX - 70, showY - 30);
          ctx.fillStyle = "#1e293b";
          ctx.fillRect(showX - 200, showY + 70, 400, 15);
          ctx.restore();
        }

        // Floating Badges (Shifted Up, dynamic tracking)
        const zoomOffset = (props.zoom - 1) * 120;
        const badgeX = W / 2 - 165 + props.offsetX;
        const badgeY = 305 + props.offsetY - zoomOffset;
        if (dealTag) {
          ctx.save();
          ctx.fillStyle = "#dc2626";
          ctx.shadowColor = "rgba(220, 38, 38, 0.4)";
          ctx.shadowBlur = 10;
          drawRoundedRect(ctx, badgeX, badgeY, 150, 36, 8);
          ctx.fill();
          ctx.fillStyle = "white";
          ctx.font = "bold 12px Arial";
          ctx.fillText(dealTag, badgeX + 14, badgeY + 22);
          ctx.restore();
        }
        if (accessory) {
          ctx.save();
          ctx.fillStyle = "#059669";
          ctx.shadowColor = "rgba(5, 150, 105, 0.4)";
          ctx.shadowBlur = 10;
          drawRoundedRect(ctx, badgeX + 165, badgeY, 190, 36, 8);
          ctx.fill();
          ctx.fillStyle = "white";
          ctx.font = "bold 12px Arial";
          ctx.fillText(accessory, badgeX + 180, badgeY + 22);
          ctx.restore();
        }

        // Specs List (Wide cards centered, Y starts at 750)
        const specStartY = 750;
        const specCardW = 980;
        const specCardH = 76;
        const specSpaceY = 88;
        specsList.forEach((specText, idx) => {
          const currentY = specStartY + idx * specSpaceY;
          ctx.save();
          ctx.shadowColor = "rgba(0,0,0,0.02)";
          ctx.shadowBlur = 6;
          ctx.shadowOffsetY = 2;
          drawRoundedRect(ctx, W / 2 - specCardW / 2, currentY, specCardW, specCardH, 16);
          ctx.fillStyle = cardFill;
          ctx.fill();
          ctx.strokeStyle = cardOutline;
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.restore();

          const iconX = W / 2 - specCardW / 2 + 35;
          const iconCenterY = currentY + specCardH / 2;
          ctx.fillStyle = getRgbaColor(activeAccent, 0.08);
          ctx.beginPath();
          ctx.arc(iconX, iconCenterY, 20, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = activeAccent;
          ctx.lineWidth = 2;

          const specLabel = getSpecLabel(specText, idx);
          if (specLabel === "PROCESSOR") {
            ctx.beginPath();
            ctx.rect(iconX - 9, iconCenterY - 9, 18, 18);
            ctx.stroke();
            for (let i = -7; i <= 7; i += 4) {
              ctx.fillRect(iconX + i - 1, iconCenterY - 12, 2, 3);
              ctx.fillRect(iconX + i - 1, iconCenterY + 9, 2, 3);
              ctx.fillRect(iconX - 12, iconCenterY + i - 1, 3, 2);
              ctx.fillRect(iconX + 9, iconCenterY + i - 1, 3, 2);
            }
          } else if (specLabel === "MEMORY") {
            ctx.beginPath();
            ctx.rect(iconX - 12, iconCenterY - 6, 24, 12);
            ctx.stroke();
            for (let i = -8; i <= 8; i += 4) {
              ctx.fillRect(iconX + i - 1, iconCenterY - 4, 2, 8);
            }
          } else if (specLabel === "STORAGE") {
            ctx.beginPath();
            ctx.rect(iconX - 10, iconCenterY - 10, 20, 20);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(iconX, iconCenterY - 3, 5, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillRect(iconX - 6, iconCenterY + 5, 12, 2);
          } else if (specLabel === "WARRANTY") {
            drawShieldIcon(ctx, iconX, iconCenterY);
          } else if (specLabel === "INCLUDED") {
            drawPlugIcon(ctx, iconX, iconCenterY);
          } else if (specLabel === "DISPLAY") {
            // Draw a monitor box
            ctx.beginPath();
            ctx.rect(iconX - 12, iconCenterY - 8, 24, 14);
            ctx.moveTo(iconX - 4, iconCenterY + 6);
            ctx.lineTo(iconX - 6, iconCenterY + 10);
            ctx.lineTo(iconX + 6, iconCenterY + 10);
            ctx.lineTo(iconX + 4, iconCenterY + 6);
            ctx.stroke();
          } else if (specLabel === "GRAPHICS") {
            // Draw dual gear / GPU fan symbol
            drawGearIcon(ctx, iconX, iconCenterY);
          } else {
            ctx.beginPath();
            ctx.arc(iconX, iconCenterY + 6, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(iconX, iconCenterY + 6, 10, Math.PI, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(iconX, iconCenterY + 6, 17, Math.PI, Math.PI * 2);
            ctx.stroke();
          }

          ctx.fillStyle = "#94a3b8";
          ctx.font = "bold 10px Arial, sans-serif";
          ctx.fillText(specLabel, iconX + 35, currentY + 23);

          ctx.fillStyle = "#1e293b";
          ctx.font = "bold 18px Arial, sans-serif";
          ctx.fillText(specText, iconX + 35, currentY + 45);
        });

        // Horizontal Policies Bar
        const trustY = 1230;
        ctx.save();
        ctx.fillStyle = cardFill;
        ctx.strokeStyle = cardOutline;
        ctx.lineWidth = 1;
        drawRoundedRect(ctx, 50, trustY, W - 100, 66, 14);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        const trustXCoords = [80, 420, 760];
        trustPolicies.forEach((policy: string, pIdx: number) => {
          if (trustXCoords[pIdx] !== undefined) {
            const cleanPolicy = policy.replace(/^[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDC00-\uDFFF]\s*/g, "");
            drawCheckmarkBullet(ctx, trustXCoords[pIdx], trustY + 38, cleanPolicy, 13);
          }
        });

        // Bottom Pricing
        const { priceVal, originalVal, savingsLabel, emiLabel } = getPricingInfo(props.product.price, props.product.originalPrice);
        const priceY = 1560;
        const priceX = 80;
        ctx.fillStyle = activeAccent;
        ctx.font = "black 12px Arial, sans-serif";
        ctx.fillText(props.isTamil ? "சிறப்பு சலுகை விலை" : "SPECIAL DEAL PRICE", priceX, priceY);

        ctx.fillStyle = "white";
        ctx.font = "bold 58px Arial, sans-serif";
        ctx.fillText(`₹${priceVal}`, priceX, priceY + 54);
        const priceValWidth = ctx.measureText(`₹${priceVal}`).width;

        if (originalVal) {
          ctx.fillStyle = "#94a3b8";
          ctx.font = "bold 26px Arial";
          const origX = priceX + priceValWidth + 20;
          ctx.fillText(`₹${originalVal}`, origX, priceY + 46);
          ctx.strokeStyle = "#ef4444";
          ctx.lineWidth = 3.5;
          const origWidth = ctx.measureText(`₹${originalVal}`).width;
          ctx.beginPath();
          ctx.moveTo(origX - 2, priceY + 37);
          ctx.lineTo(origX + origWidth + 2, priceY + 37);
          ctx.stroke();

          if (savingsLabel) {
            ctx.fillStyle = "#f59e0b";
            drawRoundedRect(ctx, priceX, priceY + 76, 320, 36, 6);
            ctx.fill();
            ctx.fillStyle = "#0f172a";
            ctx.font = "bold 12px Arial";
            ctx.fillText(savingsLabel, priceX + 16, priceY + 99);
          }
        }

        if (props.showEmi && emiLabel) {
          ctx.fillStyle = activeAccent;
          ctx.font = "bold 14px Arial, sans-serif";
          ctx.fillText(emiLabel, priceX, originalVal ? priceY + 132 : priceY + 95);
        }

        // Contact Box
        const contactX = W - 510;
        const contactY = 1530;
        ctx.save();
        ctx.fillStyle = "white";
        drawRoundedRect(ctx, contactX, contactY, 470, 185, 24);
        ctx.fill();
        ctx.fillStyle = "#94a3b8";
        ctx.font = "bold 11px Arial";
        ctx.fillText(props.isTamil ? "உடனே ஆர்டர் செய்ய" : "GET THIS DEAL INSTANTLY", contactX + 25, contactY + 28);

        // Primary Contact (Both WhatsApp & Call)
        ctx.fillStyle = "#f0fdf4";
        ctx.strokeStyle = "#bbf7d0";
        ctx.lineWidth = 1;
        drawRoundedRect(ctx, contactX + 20, contactY + 44, 290, 52, 10);
        ctx.fill();
        ctx.stroke();
        
        drawWhatsAppIcon(ctx, contactX + 25, contactY + 70);
        drawPhoneIcon(ctx, contactX + 60, contactY + 70);
        ctx.fillStyle = "#64748b";
        ctx.font = "bold 10px Arial";
        ctx.fillText(props.isTamil ? "முதன்மை (அழைப்பு & WhatsApp)" : "Primary Contact (Call & WA)", contactX + 102, contactY + 64);
        ctx.fillStyle = "#15803d";
        ctx.font = "bold 18px Arial";
        ctx.fillText(whatsappChat, contactX + 102, contactY + 85);

        // Secondary Contact (Both WhatsApp & Call)
        ctx.fillStyle = "#fff7ed";
        ctx.strokeStyle = "#fed7aa";
        ctx.lineWidth = 1;
        drawRoundedRect(ctx, contactX + 20, contactY + 110, 290, 52, 10);
        ctx.fill();
        ctx.stroke();
        
        drawWhatsAppIcon(ctx, contactX + 25, contactY + 136);
        drawPhoneIcon(ctx, contactX + 60, contactY + 136);
        ctx.fillStyle = "#64748b";
        ctx.font = "bold 10px Arial";
        ctx.fillText(props.isTamil ? "மாற்று எண் (அழைப்பு & WhatsApp)" : "Secondary Contact (Call & WA)", contactX + 102, contactY + 130);
        ctx.fillStyle = "#c2410c";
        ctx.font = "bold 18px Arial";
        ctx.fillText(phoneSupport, contactX + 102, contactY + 151);

        // WhatsApp QR Code
        if (qrImg) {
          ctx.fillStyle = "#f1f5f9";
          drawRoundedRect(ctx, contactX + 330, contactY + 36, 110, 110, 8);
          ctx.fill();
          ctx.drawImage(qrImg, contactX + 335, contactY + 41, 100, 100);
          
          ctx.fillStyle = "#64748b";
          ctx.font = "bold 10px Arial, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(props.isTamil ? "ஸ்கேன் செய்ய" : "SCAN TO ORDER", contactX + 385, contactY + 165);
        }
        ctx.restore();

        // Footer Address
        const footerLineY = H - 110;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(40, footerLineY);
        ctx.lineTo(W - 40, footerLineY);
        ctx.stroke();

        const checkmarks = props.isTamil
          ? ["தரம் வாய்ந்தவை", "மொத்த விலை", "வாழ்நாள் ஆதரவு", "100% திருப்தி"]
          : ["Quality Refurbished", "Wholesale Prices", "Lifetime Support", "100% Satisfaction"];
          
        drawCheckmarkBullet(ctx, 50, footerLineY + 25, checkmarks[0]);
        drawCheckmarkBullet(ctx, W * 0.30, footerLineY + 25, checkmarks[1]);
        drawCheckmarkBullet(ctx, W * 0.55, footerLineY + 25, checkmarks[2]);
        drawCheckmarkBullet(ctx, W * 0.80, footerLineY + 25, checkmarks[3]);

        ctx.fillStyle = "rgba(148, 163, 184, 0.8)";
        ctx.font = "bold 12px Arial, sans-serif";
        ctx.textAlign = "center";
        
        const addrWidth = ctx.measureText(showroomAddress).width;
        const textStartX = W / 2 - addrWidth / 2;
        drawLocationPin(ctx, textStartX - 10, H - 40);
        ctx.textAlign = "left";
        ctx.fillText(showroomAddress, textStartX, H - 40);
      }

      // ----------------------------------------------------
      // BRANCH: LANDSCAPE LAYOUT (16:9, 1200x630)
      // ----------------------------------------------------
      else if (props.ratio === "16:9") {
        // Branding Box
        const headerX = 40;
        const headerY = 25;
        ctx.save();
        ctx.shadowColor = "rgba(15, 23, 42, 0.03)";
        ctx.shadowBlur = 6;
        drawRoundedRect(ctx, headerX, headerY, 220, 72, 12);
        ctx.fillStyle = cardFill;
        ctx.fill();
        ctx.strokeStyle = cardOutline;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();

        if (logoImgRef.current) {
          ctx.drawImage(logoImgRef.current, headerX + 10, headerY + 8, 56, 56);
        } else {
          ctx.fillStyle = activeAccent;
          ctx.beginPath();
          ctx.arc(headerX + 38, headerY + 36, 18, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = "#ea580c";
        ctx.font = "black 20px Arial, sans-serif";
        ctx.fillText("SAI", headerX + 78, headerY + 34);

        ctx.fillStyle = cardTextSub;
        ctx.font = "black 9px Arial, sans-serif";
        const subText = "SYSTEMS";
        let textX = headerX + 78;
        for (let i = 0; i < subText.length; i++) {
          ctx.fillText(subText[i], textX, headerY + 54);
          textX += 10;
        }

        // Category Tag
        ctx.font = "bold 10px Arial, sans-serif";
        const catWidth = ctx.measureText(pCategory).width + 20;
        ctx.fillStyle = "rgba(254, 215, 170, 0.7)";
        ctx.strokeStyle = "rgba(251, 146, 60, 0.4)";
        ctx.lineWidth = 1;
        drawRoundedRect(ctx, 280, 48, catWidth, 26, 6);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#c2410c";
        ctx.fillText(pCategory, 290, 65);

        // Title and subtitle
        ctx.fillStyle = "#0f172a";
        let titleFontSize = 32;
        ctx.font = "900 " + titleFontSize + "px Arial, sans-serif";
        while (ctx.measureText(pTitle).width > 480 && titleFontSize > 22) {
          titleFontSize -= 2;
          ctx.font = "900 " + titleFontSize + "px Arial, sans-serif";
        }
        ctx.fillText(pTitle, 40, 135);

        ctx.fillStyle = "#64748b";
        ctx.font = "bold 14px Arial, sans-serif";
        ctx.fillText(tagline || "— Professional Performance. Business Ready. —", 40, 170);

        // Spec Cards (Left vertical stack, compact)
        const specStartY = 205;
        const specCardW = 400;
        const specCardH = specsList.length > 4 ? 42 : 48;
        const specSpaceY = specsList.length > 4 ? 46 : 56;
        specsList.forEach((specText, idx) => {
          const currentY = specStartY + idx * specSpaceY;
          ctx.save();
          drawRoundedRect(ctx, 40, currentY, specCardW, specCardH, 10);
          ctx.fillStyle = cardFill;
          ctx.fill();
          ctx.strokeStyle = cardOutline;
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.restore();

          const iconX = 65;
          const iconCenterY = currentY + specCardH / 2;
          ctx.fillStyle = getRgbaColor(activeAccent, 0.08);
          ctx.beginPath();
          ctx.arc(iconX, iconCenterY, specsList.length > 4 ? 11 : 13, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = activeAccent;
          ctx.lineWidth = 1.5;

          const specLabel = getSpecLabel(specText, idx);
          if (specLabel === "PROCESSOR") {
            ctx.beginPath();
            ctx.rect(iconX - 5, iconCenterY - 5, 10, 10);
            ctx.stroke();
          } else if (specLabel === "MEMORY") {
            ctx.beginPath();
            ctx.rect(iconX - 7, iconCenterY - 3, 14, 6);
            ctx.stroke();
          } else if (specLabel === "STORAGE") {
            ctx.beginPath();
            ctx.rect(iconX - 5, iconCenterY - 5, 10, 10);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(iconX, iconCenterY - 1, 2, 0, Math.PI * 2);
            ctx.stroke();
          } else if (specLabel === "WARRANTY") {
            drawShieldIcon(ctx, iconX, iconCenterY);
          } else if (specLabel === "INCLUDED") {
            drawPlugIcon(ctx, iconX, iconCenterY);
          } else if (specLabel === "DISPLAY") {
            ctx.beginPath();
            ctx.rect(iconX - 7, iconCenterY - 5, 14, 9);
            ctx.moveTo(iconX - 3, iconCenterY + 4);
            ctx.lineTo(iconX + 3, iconCenterY + 4);
            ctx.stroke();
          } else if (specLabel === "GRAPHICS") {
            drawGearIcon(ctx, iconX, iconCenterY);
          } else {
            ctx.beginPath();
            ctx.arc(iconX, iconCenterY + 3, 1.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(iconX, iconCenterY + 3, 5, Math.PI, Math.PI * 2);
            ctx.stroke();
          }
          ctx.fillStyle = "#94a3b8";
          ctx.font = "bold 8px Arial, sans-serif";
          ctx.fillText(specLabel, iconX + 22, currentY + (specsList.length > 4 ? 13 : 16));

          ctx.fillStyle = "#1e293b";
          ctx.font = "bold 13px Arial, sans-serif";
          ctx.fillText(specText, iconX + 22, currentY + (specsList.length > 4 ? 28 : 34));
        });

        // Showcase & Pedestal (Middle Column)
        const showX = W * 0.55;
        const showY = 320;
        const pedestalW = 340;
        const pedestalH = 60;

        if (props.platformStyle === "pedestal") {
          ctx.fillStyle = "rgba(15, 23, 42, 0.1)";
          ctx.beginPath();
          ctx.ellipse(showX, showY + 60, pedestalW * 0.9, pedestalH * 0.9, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
          ctx.strokeStyle = activeAccent;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.ellipse(showX, showY + 45, pedestalW * 0.8, pedestalH * 0.8, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        } else if (props.platformStyle === "ring") {
          ctx.strokeStyle = activeAccent;
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.ellipse(showX, showY + 55, pedestalW * 0.75, pedestalH * 0.5, 0, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
          ctx.beginPath();
          ctx.ellipse(showX, showY + 65, pedestalW * 0.6, pedestalH * 0.4, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        if (props.product.category === "desktops") {
          ctx.fillStyle = "#334155";
          ctx.strokeStyle = "#475569";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(showX - 25, showY + 45);
          ctx.lineTo(showX - 15, showY);
          ctx.lineTo(showX + 15, showY);
          ctx.lineTo(showX + 25, showY + 45);
          ctx.fill();
          ctx.stroke();
        }

        if (processedImg) {
          ctx.save();
          const pWidth = processedImg.width || (processedImg as HTMLCanvasElement).width;
          const pHeight = processedImg.height || (processedImg as HTMLCanvasElement).height;
          const baseScale = (pedestalW * 0.85) / pWidth;
          const finalScale = baseScale * props.zoom;
          const drawW = pWidth * finalScale;
          const drawH = pHeight * finalScale;
          ctx.translate(showX + props.offsetX, showY + props.offsetY);
          ctx.rotate((props.rotation * Math.PI) / 180);
          ctx.drawImage(processedImg, -drawW / 2, -drawH / 2, drawW, drawH);
          ctx.restore();
        } else {
          ctx.save();
          ctx.fillStyle = "#334155";
          ctx.strokeStyle = "#475569";
          ctx.lineWidth = 3;
          drawRoundedRect(ctx, showX - 110, showY - 100, 220, 140, 8);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = "#f1f5f9";
          ctx.fillRect(showX - 102, showY - 92, 204, 116);
          ctx.fillStyle = "rgba(148, 163, 184, 0.2)";
          ctx.font = "bold 14px Arial";
          ctx.fillText("SAI SYSTEMS", showX - 50, showY - 25);
          ctx.fillStyle = "#1e293b";
          ctx.fillRect(showX - 130, showY + 40, 260, 10);
          ctx.restore();
        }

        // Floating Badges (Dynamic tracking)
        const zoomOffset = (props.zoom - 1) * 80;
        const badgeX = showX - 120 + props.offsetX;
        const badgeY = showY - 120 + props.offsetY - zoomOffset;
        if (dealTag) {
          ctx.save();
          ctx.fillStyle = "#dc2626";
          drawRoundedRect(ctx, badgeX, badgeY, 130, 32, 8);
          ctx.fill();
          ctx.fillStyle = "white";
          ctx.font = "bold 11px Arial";
          ctx.fillText(dealTag, badgeX + 10, badgeY + 20);
          ctx.restore();
        }
        if (accessory) {
          ctx.save();
          ctx.fillStyle = "#059669";
          drawRoundedRect(ctx, badgeX + 140, badgeY, 160, 32, 8);
          ctx.fill();
          ctx.fillStyle = "white";
          ctx.font = "bold 11px Arial";
          ctx.fillText(accessory, badgeX + 150, badgeY + 20);
          ctx.restore();
        }

        // Trust Policies (Stacked vertically on the Right)
        const trustX = 920;
        const trustStartY = 130;
        const trustSpaceY = 70;
        const policies = ["🛡️ 365-Day Warranty", "⚙️ 100% Genuine Parts", "🔌 Charger Included"];
        policies.forEach((policyText, idx) => {
          const currentY = trustStartY + idx * trustSpaceY;
          ctx.save();
          drawRoundedRect(ctx, trustX, currentY, 240, 52, 10);
          ctx.fillStyle = cardFill;
          ctx.fill();
          ctx.strokeStyle = cardOutline;
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.fillStyle = "#475569";
          ctx.font = "bold 12px Arial";
          ctx.fillText(policyText, trustX + 25, currentY + 31);
          ctx.restore();
        });

        // Bottom pricing section
        const priceY = footerY + 70;
        const priceX = 50;
        ctx.fillStyle = activeAccent;
        ctx.font = "black 10px Arial, sans-serif";
        ctx.fillText(props.isTamil ? "சிறப்பு சலுகை விலை" : "SPECIAL DEAL PRICE", priceX, priceY - 20);

        ctx.fillStyle = "white";
        ctx.font = "bold 46px Arial, sans-serif";
        ctx.fillText(`₹${priceVal}`, priceX, priceY + 20);
        const priceValWidth = ctx.measureText(`₹${priceVal}`).width;

        if (originalVal) {
          ctx.fillStyle = "#94a3b8";
          ctx.font = "bold 20px Arial";
          const origX = priceX + priceValWidth + 18;
          ctx.fillText(`₹${originalVal}`, origX, priceY + 14);
          ctx.strokeStyle = "#ef4444";
          ctx.lineWidth = 2.5;
          const origWidth = ctx.measureText(`₹${originalVal}`).width;
          ctx.beginPath();
          ctx.moveTo(origX - 2, priceY + 7);
          ctx.lineTo(origX + origWidth + 2, priceY + 7);
          ctx.stroke();

          if (savingsLabel) {
            ctx.fillStyle = "#f59e0b";
            drawRoundedRect(ctx, priceX, priceY + 32, 250, 20, 4);
            ctx.fill();
            ctx.fillStyle = "#0f172a";
            ctx.font = "bold 9.5px Arial";
            ctx.fillText(savingsLabel, priceX + 10, priceY + 46);
          }
        }

        if (props.showEmi && emiLabel) {
          ctx.fillStyle = activeAccent;
          ctx.font = "bold 11px Arial, sans-serif";
          ctx.fillText(emiLabel, priceX, originalVal ? priceY + 68 : priceY + 32);
        }

        // Bottom contact rows (drawn horizontally next to price)
        const contactRowY = footerY + 75;
        const waRowX = 530;
        const callRowX = 810;

        // Primary Contact details
        drawWhatsAppIcon(ctx, waRowX, contactRowY);
        drawPhoneIcon(ctx, waRowX + 32, contactRowY);
        ctx.fillStyle = "#94a3b8";
        ctx.font = "bold 8.5px Arial";
        ctx.fillText(props.isTamil ? "முதன்மை (அழைப்பு & WA)" : "Primary (Call & WA)", waRowX + 72, contactRowY - 8);
        ctx.fillStyle = "#22c55e";
        ctx.font = "bold 16px Arial";
        ctx.fillText(whatsappChat, waRowX + 72, contactRowY + 12);

        // Secondary contact details
        drawWhatsAppIcon(ctx, callRowX, contactRowY);
        drawPhoneIcon(ctx, callRowX + 32, contactRowY);
        ctx.fillStyle = "#94a3b8";
        ctx.font = "bold 8.5px Arial";
        ctx.fillText(props.isTamil ? "மாற்று எண் (அழைப்பு & WA)" : "Secondary (Call & WA)", callRowX + 72, contactRowY - 8);
        ctx.fillStyle = "#f97316";
        ctx.font = "bold 16px Arial";
        ctx.fillText(phoneSupport, callRowX + 72, contactRowY + 12);

        // WhatsApp QR Code
        if (qrImg) {
          ctx.save();
          ctx.fillStyle = "white";
          drawRoundedRect(ctx, W - 145, footerY + 25, 95, 95, 8);
          ctx.fill();
          ctx.drawImage(qrImg, W - 140, footerY + 30, 85, 85);
          
          ctx.fillStyle = "#94a3b8";
          ctx.font = "bold 9px Arial, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(props.isTamil ? "வாட்ஸ்அப் செய்ய" : "SCAN TO ORDER", W - 97, footerY + 135);
          ctx.restore();
        }

        // Address Footer
        const footerLineY = H - 50;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(40, footerLineY);
        ctx.lineTo(W - 40, footerLineY);
        ctx.stroke();

        const cleanAddr = showroomAddress.replace(/^[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDC00-\uDFFF]\s*/g, "");
        ctx.fillStyle = "rgba(148, 163, 184, 0.85)";
        ctx.font = "bold 8.5px Arial, sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(cleanAddr, W - 40, H - 12);
        
        const addrWidth = ctx.measureText(cleanAddr).width;
        drawLocationPin(ctx, W - 40 - addrWidth - 10, H - 12);
        
        ctx.textAlign = "left"; // Reset to default
      }

      // ----------------------------------------------------
      // BRANCH: SQUARE LAYOUT (1:1, 1080x1080) - DEFAULT FALLBACK
      // ----------------------------------------------------
      else {
        // Branding Logo
        const headerX = 40;
        const headerY = 40;
        ctx.save();
        ctx.shadowColor = "rgba(15, 23, 42, 0.05)";
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 4;
        drawRoundedRect(ctx, headerX, headerY, 270, 100, 16);
        ctx.fillStyle = cardFill;
        ctx.fill();
        ctx.strokeStyle = cardOutline;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();

        if (logoImgRef.current) {
          ctx.drawImage(logoImgRef.current, headerX + 15, headerY + 12, 76, 76);
        } else {
          ctx.fillStyle = activeAccent;
          ctx.beginPath();
          ctx.arc(headerX + 45, headerY + 50, 25, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "white";
          ctx.font = "bold 20px Arial";
          ctx.fillText("S", headerX + 38, headerY + 57);
        }

        ctx.fillStyle = "#ea580c";
        ctx.font = "black 28px Arial, sans-serif";
        ctx.fillText(brandName, headerX + 105, headerY + 50);

        ctx.fillStyle = cardTextSub;
        ctx.font = "black 11px Arial, sans-serif";
        const subText = brandSubtext;
        let textX = headerX + 105;
        for (let i = 0; i < subText.length; i++) {
          ctx.fillText(subText[i], textX, headerY + 76);
          textX += 13;
        }

        // Category Tag
        ctx.font = "bold 11px Arial, sans-serif";
        const catWidth = ctx.measureText(pCategory).width + 30;
        ctx.fillStyle = "rgba(254, 215, 170, 0.7)";
        ctx.strokeStyle = "rgba(251, 146, 60, 0.4)";
        ctx.lineWidth = 1;
        drawRoundedRect(ctx, W - 40 - catWidth, 40, catWidth, 32, 6);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#c2410c";
        ctx.fillText(pCategory, W - 40 - catWidth / 2 - (ctx.measureText(pCategory).width / 2), 60);

        // Product Title and subtitle (Aligned Right, auto-scales down to avoid logo overlaps)
        ctx.textAlign = "right";
        ctx.fillStyle = "#0f172a";
        let titleFontSize = 42;
        ctx.font = "900 " + titleFontSize + "px Arial, sans-serif";
        while (ctx.measureText(pTitle).width > W - 380 && titleFontSize > 24) {
          titleFontSize -= 2;
          ctx.font = "900 " + titleFontSize + "px Arial, sans-serif";
        }
        ctx.fillText(pTitle, W - 40, 180);

        ctx.fillStyle = "#64748b";
        ctx.font = "bold 17px Arial, sans-serif";
        ctx.fillText(tagline, W - 40, 225);
        ctx.textAlign = "left"; // reset

        // Spec Cards (Left Column)
        const specStartY = 270;
        const specCardW = 460;
        const specCardH = specsList.length > 4 ? 54 : 74;
        const specSpaceY = specsList.length > 4 ? 64 : 88;
        specsList.forEach((specText, idx) => {
          const currentY = specStartY + idx * specSpaceY;
          ctx.save();
          ctx.shadowColor = "rgba(0,0,0,0.02)";
          ctx.shadowBlur = 6;
          ctx.shadowOffsetY = 2;
          drawRoundedRect(ctx, 40, currentY, specCardW, specCardH, 16);
          ctx.fillStyle = cardFill;
          ctx.fill();
          ctx.strokeStyle = cardOutline;
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.restore();

          const iconX = 75;
          const iconCenterY = currentY + specCardH / 2;
          const iconRadius = specsList.length > 4 ? 15 : 20;
          ctx.fillStyle = getRgbaColor(activeAccent, 0.08);
          ctx.beginPath();
          ctx.arc(iconX, iconCenterY, iconRadius, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = activeAccent;
          ctx.lineWidth = 2;

          const specLabel = getSpecLabel(specText, idx);
          if (specLabel === "PROCESSOR") {
            ctx.beginPath();
            ctx.rect(iconX - 9, iconCenterY - 9, 18, 18);
            ctx.stroke();
            for (let i = -7; i <= 7; i += 4) {
              ctx.fillRect(iconX + i - 1, iconCenterY - 12, 2, 3);
              ctx.fillRect(iconX + i - 1, iconCenterY + 9, 2, 3);
              ctx.fillRect(iconX - 12, iconCenterY + i - 1, 3, 2);
              ctx.fillRect(iconX + 9, iconCenterY + i - 1, 3, 2);
            }
          } else if (specLabel === "MEMORY") {
            ctx.beginPath();
            ctx.rect(iconX - 12, iconCenterY - 6, 24, 12);
            ctx.stroke();
            for (let i = -8; i <= 8; i += 4) {
              ctx.fillRect(iconX + i - 1, iconCenterY - 4, 2, 8);
            }
          } else if (specLabel === "STORAGE") {
            ctx.beginPath();
            ctx.rect(iconX - 10, iconCenterY - 10, 20, 20);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(iconX, iconCenterY - 3, 5, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillRect(iconX - 6, iconCenterY + 5, 12, 2);
          } else if (specLabel === "WARRANTY") {
            drawShieldIcon(ctx, iconX, iconCenterY);
          } else if (specLabel === "INCLUDED") {
            drawPlugIcon(ctx, iconX, iconCenterY);
          } else if (specLabel === "DISPLAY") {
            ctx.beginPath();
            ctx.rect(iconX - 12, iconCenterY - 8, 24, 14);
            ctx.moveTo(iconX - 4, iconCenterY + 6);
            ctx.lineTo(iconX - 6, iconCenterY + 10);
            ctx.lineTo(iconX + 6, iconCenterY + 10);
            ctx.lineTo(iconX + 4, iconCenterY + 6);
            ctx.stroke();
          } else if (specLabel === "GRAPHICS") {
            drawGearIcon(ctx, iconX, iconCenterY);
          } else {
            ctx.beginPath();
            ctx.arc(iconX, iconCenterY + 6, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(iconX, iconCenterY + 6, 10, Math.PI, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(iconX, iconCenterY + 6, 17, Math.PI, Math.PI * 2);
            ctx.stroke();
          }
          const labelFontSize = specsList.length > 4 ? 9.5 : 11;
          const textFontSize = specsList.length > 4 ? 15 : 20;
          const labelYOffset = specsList.length > 4 ? 18 : 23;
          const textYOffset = specsList.length > 4 ? 38 : 47;

          ctx.fillStyle = "#94a3b8";
          ctx.font = `bold ${labelFontSize}px Arial, sans-serif`;
          ctx.fillText(specLabel, 120, currentY + labelYOffset);

          ctx.fillStyle = "#1e293b";
          ctx.font = `bold ${textFontSize}px Arial, sans-serif`;
          ctx.fillText(specText, 120, currentY + textYOffset);
        });

        // Pedestal & Showcase (Right Column)
        const showX = 770;
        const showY = 475;
        const pedestalW = 420;
        const pedestalH = 80;

        if (props.platformStyle === "pedestal") {
          ctx.fillStyle = "rgba(15, 23, 42, 0.1)";
          ctx.beginPath();
          ctx.ellipse(showX, showY + 80, pedestalW * 0.9, pedestalH * 0.9, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
          ctx.strokeStyle = activeAccent;
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.ellipse(showX, showY + 60, pedestalW * 0.8, pedestalH * 0.8, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = getRgbaColor(activeAccent, 0.13);
          ctx.beginPath();
          ctx.ellipse(showX, showY + 60, pedestalW * 0.7, pedestalH * 0.7, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (props.platformStyle === "ring") {
          ctx.strokeStyle = activeAccent;
          ctx.lineWidth = 6;
          ctx.save();
          ctx.shadowColor = activeAccent;
          ctx.shadowBlur = 20;
          ctx.beginPath();
          ctx.ellipse(showX, showY + 70, pedestalW * 0.75, pedestalH * 0.5, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        } else {
          ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
          ctx.beginPath();
          ctx.ellipse(showX, showY + 85, pedestalW * 0.6, pedestalH * 0.4, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        if (props.product.category === "desktops") {
          ctx.fillStyle = "#334155";
          ctx.strokeStyle = "#475569";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(showX - 40, showY + 60);
          ctx.lineTo(showX - 25, showY);
          ctx.lineTo(showX + 25, showY);
          ctx.lineTo(showX + 40, showY + 60);
          ctx.fill();
          ctx.stroke();
        }

        if (processedImg) {
          ctx.save();
          const pWidth = processedImg.width || (processedImg as HTMLCanvasElement).width;
          const pHeight = processedImg.height || (processedImg as HTMLCanvasElement).height;
          const baseScale = (pedestalW * 0.9) / pWidth;
          const finalScale = baseScale * props.zoom;
          const drawW = pWidth * finalScale;
          const drawH = pHeight * finalScale;
          ctx.translate(showX + props.offsetX, showY + props.offsetY);
          ctx.rotate((props.rotation * Math.PI) / 180);
          ctx.drawImage(processedImg, -drawW / 2, -drawH / 2, drawW, drawH);
          ctx.restore();
        } else {
          ctx.save();
          ctx.fillStyle = "#334155";
          ctx.strokeStyle = "#475569";
          ctx.lineWidth = 4;
          drawRoundedRect(ctx, showX - 160, showY - 140, 320, 210, 10);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = "#f1f5f9";
          ctx.fillRect(showX - 148, showY - 128, 296, 174);
          ctx.fillStyle = "rgba(148, 163, 184, 0.2)";
          ctx.font = "bold 20px Arial";
          ctx.fillText("SAI SYSTEMS", showX - 70, showY - 30);
          ctx.fillStyle = "#1e293b";
          ctx.fillRect(showX - 200, showY + 70, 400, 15);
          ctx.restore();
        }

        // Floating Badges (Dynamic tracking)
        const zoomOffset = (props.zoom - 1) * 120;
        const badgeX = showX - 150 + props.offsetX;
        const badgeY = showY - 160 + props.offsetY - zoomOffset;
        if (dealTag) {
          ctx.save();
          ctx.fillStyle = "#dc2626";
          ctx.shadowColor = "rgba(220, 38, 38, 0.4)";
          ctx.shadowBlur = 10;
          drawRoundedRect(ctx, badgeX, badgeY, 170, 42, 10);
          ctx.fill();
          ctx.fillStyle = "white";
          ctx.font = "bold 13px Arial";
          ctx.fillText(dealTag, badgeX + 16, badgeY + 26);
          ctx.restore();
        }
        if (accessory) {
          ctx.save();
          ctx.fillStyle = "#059669";
          ctx.shadowColor = "rgba(5, 150, 105, 0.4)";
          ctx.shadowBlur = 10;
          drawRoundedRect(ctx, badgeX + 185, badgeY, 210, 42, 10);
          ctx.fill();
          ctx.fillStyle = "white";
          ctx.font = "bold 13px Arial";
          ctx.fillText(accessory, badgeX + 200, badgeY + 26);
          ctx.restore();
        }

        // Trust policies bar
        const trustY = footerY - 95;
        ctx.save();
        ctx.fillStyle = cardFill;
        ctx.strokeStyle = cardOutline;
        ctx.lineWidth = 1;
        drawRoundedRect(ctx, 40, trustY, W - 80, 66, 14);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        const trustXCoords = [80, 410, 760];
        trustPolicies.forEach((policyText: string, idx: number) => {
          if (trustXCoords[idx] !== undefined) {
            const cleanPolicy = policyText.replace(/^[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDC00-\uDFFF]\s*/g, "");
            drawCheckmarkBullet(ctx, trustXCoords[idx], trustY + 38, cleanPolicy, 13);
          }
        });

        // Pricing details
        const priceY = footerY + 80;
        const priceX = 60;
        ctx.fillStyle = activeAccent;
        ctx.font = "black 12px Arial, sans-serif";
        ctx.fillText(props.isTamil ? "சிறப்பு சலுகை விலை" : "SPECIAL DEAL PRICE", priceX, priceY - 24);

        ctx.fillStyle = "white";
        ctx.font = "bold 58px Arial, sans-serif";
        ctx.fillText(`₹${priceVal}`, priceX, priceY + 24);
        const priceValWidth = ctx.measureText(`₹${priceVal}`).width;

        if (originalVal) {
          ctx.fillStyle = "#94a3b8";
          ctx.font = "bold 26px Arial";
          const origX = priceX + priceValWidth + 24;
          ctx.fillText(`₹${originalVal}`, origX, priceY + 16);
          ctx.strokeStyle = "#ef4444";
          ctx.lineWidth = 3.5;
          const origWidth = ctx.measureText(`₹${originalVal}`).width;
          ctx.beginPath();
          ctx.moveTo(origX - 2, priceY + 7);
          ctx.lineTo(origX + origWidth + 2, priceY + 7);
          ctx.stroke();

          if (savingsLabel) {
            ctx.fillStyle = "#f59e0b";
            drawRoundedRect(ctx, priceX, priceY + 54, 320, 36, 6);
            ctx.fill();
            ctx.fillStyle = "#0f172a";
            ctx.font = "bold 12px Arial";
            ctx.fillText(savingsLabel, priceX + 16, priceY + 77);
          }
        }

        if (props.showEmi && emiLabel) {
          ctx.fillStyle = activeAccent;
          ctx.font = "bold 14px Arial, sans-serif";
          ctx.fillText(emiLabel, priceX, originalVal ? priceY + 110 : priceY + 73);
        }

        // Contact Box
        const contactX = W - 510;
        const contactY = footerY + 45;
        ctx.save();
        ctx.fillStyle = "white";
        drawRoundedRect(ctx, contactX, contactY, 470, 185, 24);
        ctx.fill();
        ctx.fillStyle = "#94a3b8";
        ctx.font = "bold 11px Arial";
        ctx.fillText(props.isTamil ? "உடனே ஆர்டர் செய்ய" : "GET THIS DEAL INSTANTLY", contactX + 25, contactY + 28);

        // Primary Contact (Both WhatsApp & Call)
        ctx.fillStyle = "#f0fdf4";
        ctx.strokeStyle = "#bbf7d0";
        ctx.lineWidth = 1;
        drawRoundedRect(ctx, contactX + 20, contactY + 44, 290, 52, 10);
        ctx.fill();
        ctx.stroke();
        
        drawWhatsAppIcon(ctx, contactX + 25, contactY + 70);
        drawPhoneIcon(ctx, contactX + 60, contactY + 70);
        ctx.fillStyle = "#64748b";
        ctx.font = "bold 10px Arial";
        ctx.fillText(props.isTamil ? "முதன்மை (அழைப்பு & WhatsApp)" : "Primary Contact (Call & WA)", contactX + 102, contactY + 64);
        ctx.fillStyle = "#15803d";
        ctx.font = "bold 18px Arial";
        ctx.fillText(whatsappChat, contactX + 102, contactY + 85);

        // Secondary Contact (Both WhatsApp & Call)
        ctx.fillStyle = "#fff7ed";
        ctx.strokeStyle = "#fed7aa";
        ctx.lineWidth = 1;
        drawRoundedRect(ctx, contactX + 20, contactY + 110, 290, 52, 10);
        ctx.fill();
        ctx.stroke();
        
        drawWhatsAppIcon(ctx, contactX + 25, contactY + 136);
        drawPhoneIcon(ctx, contactX + 60, contactY + 136);
        ctx.fillStyle = "#64748b";
        ctx.font = "bold 10px Arial";
        ctx.fillText(props.isTamil ? "மாற்று எண் (அழைப்பு & WhatsApp)" : "Secondary Contact (Call & WA)", contactX + 102, contactY + 130);
        ctx.fillStyle = "#c2410c";
        ctx.font = "bold 18px Arial";
        ctx.fillText(phoneSupport, contactX + 102, contactY + 151);

        // WhatsApp QR Code
        if (qrImg) {
          ctx.fillStyle = "#f1f5f9";
          drawRoundedRect(ctx, contactX + 330, contactY + 36, 110, 110, 8);
          ctx.fill();
          ctx.drawImage(qrImg, contactX + 335, contactY + 41, 100, 100);
          
          ctx.fillStyle = "#64748b";
          ctx.font = "bold 10px Arial, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(props.isTamil ? "ஸ்கேன் செய்ய" : "SCAN TO ORDER", contactX + 385, contactY + 165);
        }
        ctx.restore();

        // Footer line & address
        const footerLineY = H - 85;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(40, footerLineY);
        ctx.lineTo(W - 40, footerLineY);
        ctx.stroke();

        const checkmarks = props.isTamil
          ? ["தரம் வாய்ந்தவை", "மொத்த விலை", "வாழ்நாள் ஆதரவு", "100% திருப்தி"]
          : ["Quality Refurbished", "Wholesale Prices", "Lifetime Support", "100% Satisfaction"];
          
        drawCheckmarkBullet(ctx, 50, footerLineY + 25, checkmarks[0]);
        drawCheckmarkBullet(ctx, W * 0.30, footerLineY + 25, checkmarks[1]);
        drawCheckmarkBullet(ctx, W * 0.55, footerLineY + 25, checkmarks[2]);
        drawCheckmarkBullet(ctx, W * 0.80, footerLineY + 25, checkmarks[3]);

        ctx.fillStyle = "rgba(148, 163, 184, 0.8)";
        ctx.font = "bold 12px Arial, sans-serif";
        ctx.textAlign = "center";
        
        const addrWidth = ctx.measureText(showroomAddress).width;
        const textStartX = W / 2 - addrWidth / 2;
        drawLocationPin(ctx, textStartX - 10, H - 25);
        ctx.textAlign = "left";
        ctx.fillText(showroomAddress, textStartX, H - 25);
      }

      // ----------------------------------------------------
      // Export canvas drawing is now debounced in a hook above
      // to optimize drag slider performance.
      // ----------------------------------------------------
    };

    // Helper: Rupee comma formatter
    const formatRupee = (val: string) => {
      const num = val.replace(/\D/g, "");
      if (!num) return "";
      const lastThree = num.substring(num.length - 3);
      const otherBits = num.substring(0, num.length - 3);
      if (otherBits !== "") {
        return otherBits.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree;
      }
      return lastThree;
    };

    // Helper: centering Y coordinates for icons
    const iconCenterTextY = (centerY: number) => {
      return centerY + 4.5;
    };

    // Helper: Rounded Rectangle path
    const drawRoundedRect = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      width: number,
      height: number,
      radius: number
    ) => {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
    };

    // ----------------------------------------------------
    // IMPERATIVE HANDLERS EXPOSED TO PARENT
    // ----------------------------------------------------
    useImperativeHandle(ref, () => ({
      downloadPNG: () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const link = document.createElement("a");
        const cleanTitle = (props.product.title || "deal").toLowerCase().replace(/[^a-z0-9]+/g, "-");
        link.download = `sai-deal-${cleanTitle}-${props.ratio.replace(":", "x")}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        toast.success("Promo banner downloaded successfully!");
      },
      
      copyImageToClipboard: async (): Promise<boolean> => {
        const canvas = canvasRef.current;
        if (!canvas) return false;
        
        try {
          return new Promise<boolean>((resolve) => {
            canvas.toBlob(async (blob) => {
              if (!blob) {
                toast.error("Failed to compile image bytes.");
                resolve(false);
                return;
              }
              try {
                await navigator.clipboard.write([
                  new ClipboardItem({
                    [blob.type]: blob
                  })
                ]);
                toast.success("Promo Banner copied directly to clipboard! Paste (Ctrl+V) in WhatsApp now.");
                resolve(true);
              } catch (writeErr) {
                console.error("Clipboard write blocked:", writeErr);
                toast.error("Clipboard blocked! Please right-click the image preview to copy or click Download.");
                resolve(false);
              }
            }, "image/png");
          });
        } catch (err) {
          console.error("Copy image error:", err);
          toast.error("Failed to copy image to clipboard.");
          return false;
        }
      },
      
      getSocialCaption: (): string => {
        const title = props.product.title || "Refurbished Laptop";
        const category = props.product.category || "Laptops";
        const original = props.product.originalPrice ? `₹${props.product.originalPrice}` : "";
        const deal = `₹${props.product.price || "25,000"}`;
        const dealTag = props.product.dealTag ? `\n🔥 ${props.product.dealTag.toUpperCase()}!` : "";
        const accessory = props.product.includedAccessory ? `\n🎁 FREE Accessories: ${props.product.includedAccessory}` : "";
        const specsList = props.product.specs || [];

        let specsStr = "";
        specsList.forEach(s => {
          if (s) specsStr += `\n⚙️ • ${s}`;
        });

        return `🔥 DAILY DEAL AT SAI SYSTEMS! 🔥
💻 ${title.toUpperCase()} — Premium ${category} Deal! ${dealTag}

⚙️ Specifications:${specsStr}

💥 Special Deal Price: ${deal}${original ? ` (Was ${original})` : ""} ${accessory}
🛡️ 365-Day Warranty | 100% Genuine Spare Parts Included

📍 Showroom: PAA Building, Y.M.R Patty, Dindigul (Near Head Post Office)
📞 Call Support: +91 87780 03397
💬 WhatsApp Order: +91 79041 08020
🌐 Browse catalog: saisystems.org.in

#RefurbishedLaptops #DindigulDeals #SaiSystems #DellLatitude #LaptopsWholesale`;
      }
    }));

    // Draw loading overlay or preview screen container
    return (
      <div className="flex flex-col items-center justify-center bg-slate-950 dark:bg-slate-900 rounded-2xl p-4 shadow-inner border border-slate-800 w-full overflow-hidden">
        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5 w-full justify-between">
          <span>📷 Live canvas preview ({props.ratio === "16:9" ? 1200 : 1080}x{props.ratio === "9:16" ? 1920 : props.ratio === "16:9" ? 630 : 1080}px)</span>
          {imageLoading && <span className="text-orange-500 animate-pulse text-[9px] font-black">Loading image...</span>}
        </div>
        <div className="relative border border-slate-700/80 rounded-xl overflow-hidden max-w-full bg-slate-900 shadow-2xl flex items-center justify-center min-h-[300px] w-full">
          {/* Main Canvas component shown directly in DOM for 60fps interaction */}
          <canvas
            ref={canvasRef}
            className="max-h-[500px] max-w-full h-auto w-auto object-contain select-none rounded-xl"
            style={{ display: "block" }}
          />
          {/* Real image overlay for mobile long-press copy and save support */}
          {imgSrc && (
            <img
              src={imgSrc}
              className="absolute top-0 bottom-0 left-0 right-0 m-auto max-h-[500px] max-w-full h-auto w-auto object-contain cursor-pointer select-none opacity-0"
              alt={`Promotional banner for ${props.product.title || "Product"}`}
              title="Right-click or long-press to copy/save"
            />
          )}
          {/* Loading Indicator */}
          {imageLoading && (
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex flex-col items-center justify-center gap-2 text-white text-xs">
              <span className="animate-spin text-lg">⏳</span>
              <span>Fetching remote product photo...</span>
            </div>
          )}
        </div>
        
        {/* Error and Tainted Canvas warnings */}
        {imageLoadError && (
          <div className="mt-3 text-[11px] text-rose-500 bg-rose-500/10 border border-rose-500/20 px-3.5 py-2 rounded-lg w-full text-center font-medium">
            ⚠️ Failed to load product image. Check image URL or upload a local file.
          </div>
        )}
        {isTainted && (
          <div className="mt-3 text-[11px] text-amber-500 bg-amber-500/10 border border-amber-500/20 px-3.5 py-2 rounded-lg w-full text-center font-medium">
            ⚠️ Tainted Canvas detected: The image host does not allow direct saving. Please upload a local image file to enable PNG Download & Copy.
          </div>
        )}
      </div>
    );
  }
);

const getSpecLabel = (text: string, idx: number): string => {
  const t = text.toLowerCase();
  
  // Content check first
  if (t.includes("i3") || t.includes("i5") || t.includes("i7") || t.includes("i9") || t.includes("ryzen") || t.includes("amd") || t.includes("intel") || t.includes("core") || t.includes("processor") || t.includes("cpu")) return "PROCESSOR";
  if (t.includes("ram") || t.includes("ddr") || t.includes("gb memory") || t.includes("memory")) return "MEMORY";
  if (t.includes("ssd") || t.includes("hdd") || t.includes("tb storage") || t.includes("storage") || t.includes("nvme") || t.includes("hard drive")) return "STORAGE";
  if (t.includes("wifi") || t.includes("wi-fi") || t.includes("bluetooth") || t.includes("lan") || t.includes("connectivity") || t.includes("ports")) return "CONNECTIVITY";
  if (t.includes("warranty") || t.includes("year") || t.includes("month")) return "WARRANTY";
  if (t.includes("bag") || t.includes("mouse") || t.includes("charger") || t.includes("box") || t.includes("included")) return "INCLUDED";
  if (t.includes("windows") || t.includes("os") || t.includes("mac") || t.includes("operating") || t.includes("ubuntu")) return "OS & SOFTWARE";
  if (t.includes("graphic") || t.includes("nvidia") || t.includes("intel hd") || t.includes("gpu") || t.includes("geforce")) return "GRAPHICS";
  if (t.includes("screen") || t.includes("display") || t.includes("inch") || t.includes("fhd") || t.includes("ips") || t.includes("panel")) return "DISPLAY";

  // Position fallback
  if (idx === 0) return "PROCESSOR";
  if (idx === 1) return "MEMORY";
  if (idx === 2) return "STORAGE";
  if (idx === 3) return "CONNECTIVITY";
  return "SPECIFICATION";
};

PromoBannerCanvas.displayName = "PromoBannerCanvas";

export default PromoBannerCanvas;
