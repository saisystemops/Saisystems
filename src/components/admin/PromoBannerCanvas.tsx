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
  themeColor: "orange" | "blue" | "gold" | "slate" | "green";
  bgPattern: "none" | "grid" | "circuit" | "fiber";
  platformStyle: "pedestal" | "ring" | "shadow";
  cardStyle: "glass" | "light" | "dark";
  accentColor: "orange" | "cyan" | "gold" | "green" | "purple";
  zoom: number;
  offsetX: number;
  offsetY: number;
  rotation: number;
  localImageFile: File | null;
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
        // Local file upload
        srcUrl = URL.createObjectURL(props.localImageFile);
      } else if (props.product.imageUrl) {
        // Database URL
        srcUrl = props.product.imageUrl;
      }

      if (!srcUrl) {
        setProductImg(null);
        setProductImgSrc(null);
        return;
      }

      // Check if source changed to prevent infinite reloads
      if (srcUrl === productImgSrc) return;

      const img = new Image();
      // Allow cross-origin requests for safety if loading external URLs
      if (srcUrl.startsWith("http")) {
        img.crossOrigin = "anonymous";
      }
      img.src = srcUrl;
      img.onload = () => {
        setProductImg(img);
        setProductImgSrc(srcUrl);
      };
      img.onerror = () => {
        console.error("Failed to load product image:", srcUrl);
        setProductImg(null);
      };

      // Cleanup object URL if created
      return () => {
        if (props.localImageFile && srcUrl) {
          URL.revokeObjectURL(srcUrl);
        }
      };
    }, [props.product.imageUrl, props.localImageFile, productImgSrc]);

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
      logoLoaded,
      productImg
    ]);

    const drawCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // ----------------------------------------------------
      // 1. DIMENSIONS SETTING BY ASPECT RATIO
      // ----------------------------------------------------
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

      // Color Palette Configurations
      const accents = {
        orange: "#f97316",
        cyan: "#06b6d4",
        gold: "#fbbf24",
        green: "#10b981",
        purple: "#a855f7"
      };
      const activeAccent = accents[props.accentColor] || accents.orange;

      const bgGradients = {
        orange: ["#fef8f6", "#fff1eb", "#f97316", "#2c1203", "#111827"], // [LightStart, LightEnd, AccentColor, DarkEnd, BottomEnd]
        blue: ["#f8fafc", "#f1f5f9", "#2563eb", "#0b1b3d", "#061026"],
        gold: ["#fafafa", "#f4f4f5", "#d97706", "#1c160c", "#09090b"],
        slate: ["#f8fafc", "#f1f5f9", "#64748b", "#0f172a", "#090d16"],
        green: ["#f0fdf4", "#dcfce7", "#16a34a", "#022c22", "#011611"]
      };
      const activeBgGrad = bgGradients[props.themeColor] || bgGradients.orange;

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

      const specsList = props.product.specs && props.product.specs.length > 0
        ? props.product.specs
        : ["Intel Core i5 Processor", "8GB DDR4 RAM", "256GB SSD Storage", "Wi-Fi (Built-in)"];

      let priceVal = String(props.product.price || "25000");
      let originalVal = String(props.product.originalPrice || "");
      priceVal = formatRupee(priceVal);
      if (originalVal) originalVal = formatRupee(originalVal);

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
        ctx.fillText("SAI", headerX + 105, headerY + 50);

        ctx.fillStyle = cardTextSub;
        ctx.font = "black 11px Arial, sans-serif";
        const subText = "SYSTEMS";
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
        drawRoundedRect(ctx, W / 2 - catWidth / 2, 220, catWidth, 32, 6);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#c2410c";
        ctx.textAlign = "center";
        ctx.fillText(pCategory, W / 2, 240);
        ctx.textAlign = "left";

        // Title and Subtitle (Centered)
        ctx.textAlign = "center";
        ctx.fillStyle = "#0f172a";
        let titleFontSize = 46;
        ctx.font = "900 " + titleFontSize + "px Arial, sans-serif";
        while (ctx.measureText(pTitle).width > W - 100 && titleFontSize > 28) {
          titleFontSize -= 2;
          ctx.font = "900 " + titleFontSize + "px Arial, sans-serif";
        }
        ctx.fillText(pTitle, W / 2, 310);

        ctx.fillStyle = "#64748b";
        ctx.font = "bold 16px Arial, sans-serif";
        ctx.fillText("— Professional Performance. Business Ready. —", W / 2, 355);
        ctx.textAlign = "left";

        // Pedestal & Showcase
        const showX = W / 2;
        const showY = 560;
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
          ctx.fillStyle = activeAccent + "22";
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

        if (productImg) {
          ctx.save();
          const pWidth = productImg.width;
          const pHeight = productImg.height;
          const baseScale = (pedestalW * 0.95) / pWidth;
          const finalScale = baseScale * props.zoom;
          const drawW = pWidth * finalScale;
          const drawH = pHeight * finalScale;
          ctx.translate(showX + props.offsetX, showY + props.offsetY);
          ctx.rotate((props.rotation * Math.PI) / 180);
          ctx.drawImage(productImg, -drawW / 2, -drawH / 2, drawW, drawH);
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

        // Floating Badges
        const badgeX = W / 2 - 180;
        const badgeY = 440;
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

        // Specs List (Wide cards centered, lower Y starts at 800)
        const specStartY = 800;
        const specCardW = 980;
        const specCardH = 70;
        const specSpaceY = 82;
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
          ctx.fillStyle = activeAccent + "15";
          ctx.beginPath();
          ctx.arc(iconX, iconCenterY, 20, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = activeAccent;
          ctx.lineWidth = 2;

          if (idx === 0) {
            ctx.beginPath();
            ctx.rect(iconX - 9, iconCenterY - 9, 18, 18);
            ctx.stroke();
            for (let i = -7; i <= 7; i += 4) {
              ctx.fillRect(iconX + i - 1, iconCenterY - 12, 2, 3);
              ctx.fillRect(iconX + i - 1, iconCenterY + 9, 2, 3);
              ctx.fillRect(iconX - 12, iconCenterY + i - 1, 3, 2);
              ctx.fillRect(iconX + 9, iconCenterY + i - 1, 3, 2);
            }
          } else if (idx === 1) {
            ctx.beginPath();
            ctx.rect(iconX - 12, iconCenterY - 6, 24, 12);
            ctx.stroke();
            for (let i = -8; i <= 8; i += 4) {
              ctx.fillRect(iconX + i - 1, iconCenterY - 4, 2, 8);
            }
          } else if (idx === 2) {
            ctx.beginPath();
            ctx.rect(iconX - 10, iconCenterY - 10, 20, 20);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(iconX, iconCenterY - 3, 5, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillRect(iconX - 6, iconCenterY + 5, 12, 2);
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

          const specLabel = ["PROCESSOR", "MEMORY", "STORAGE", "CONNECTIVITY"][idx] || "SPECIFICATION";
          ctx.fillStyle = "#94a3b8";
          ctx.font = "bold 10px Arial, sans-serif";
          ctx.fillText(specLabel, iconX + 35, currentY + 23);

          ctx.fillStyle = "#1e293b";
          ctx.font = "bold 18px Arial, sans-serif";
          ctx.fillText(specText, iconX + 35, currentY + 45);
        });

        // Horizontal Policies Bar
        const trustY = 1250;
        ctx.save();
        ctx.fillStyle = cardFill;
        ctx.strokeStyle = cardOutline;
        ctx.lineWidth = 1;
        drawRoundedRect(ctx, 50, trustY, W - 100, 66, 14);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#475569";
        ctx.font = "bold 13px Arial";
        ctx.fillText("🛡️ 365-Day Warranty", 90, trustY + 38);
        ctx.fillText("⚙️ 100% Genuine Parts", 430, trustY + 38);
        ctx.fillText("🔌 Charger Included", 770, trustY + 38);
        ctx.restore();

        // Bottom Pricing
        const priceY = 1480;
        const priceX = 80;
        ctx.fillStyle = activeAccent;
        ctx.font = "black 12px Arial, sans-serif";
        ctx.fillText("SPECIAL DEAL PRICE", priceX, priceY);

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

          const dealNum = parseFloat(String(props.product.price).replace(/,/g, ""));
          const origNum = parseFloat(String(props.product.originalPrice).replace(/,/g, ""));
          if (dealNum && origNum && origNum > dealNum) {
            const savings = origNum - dealNum;
            const pct = Math.round(((origNum - dealNum) / origNum) * 100);
            const savingsLabel = `SAVE ₹${formatRupee(String(savings))} (${pct}% OFF)`;
            ctx.fillStyle = "#f59e0b";
            drawRoundedRect(ctx, priceX, priceY + 76, 320, 36, 6);
            ctx.fill();
            ctx.fillStyle = "#0f172a";
            ctx.font = "bold 12px Arial";
            ctx.fillText(savingsLabel, priceX + 16, priceY + 99);
          }
        }

        // Contact Box
        const contactX = W - 440;
        const contactY = 1450;
        ctx.save();
        ctx.fillStyle = "white";
        drawRoundedRect(ctx, contactX, contactY, 360, 185, 24);
        ctx.fill();
        ctx.fillStyle = "#94a3b8";
        ctx.font = "bold 11px Arial";
        ctx.fillText("GET THIS DEAL INSTANTLY", contactX + 30, contactY + 28);

        // WhatsApp
        ctx.fillStyle = "#f0fdf4";
        ctx.strokeStyle = "#bbf7d0";
        ctx.lineWidth = 1;
        drawRoundedRect(ctx, contactX + 25, contactY + 44, 310, 52, 10);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#22c55e";
        ctx.beginPath();
        ctx.arc(contactX + 50, contactY + 70, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.font = "bold 11px Arial";
        ctx.fillText("WA", contactX + 41, iconCenterTextY(contactY + 70));
        ctx.fillStyle = "#64748b";
        ctx.font = "bold 11px Arial";
        ctx.fillText("WhatsApp Chat", contactX + 78, contactY + 64);
        ctx.fillStyle = "#15803d";
        ctx.font = "bold 19px Arial";
        ctx.fillText("+91 79041 08020", contactX + 78, contactY + 85);

        // Phone Support
        ctx.fillStyle = "#fff7ed";
        ctx.strokeStyle = "#fed7aa";
        drawRoundedRect(ctx, contactX + 25, contactY + 110, 310, 52, 10);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#f97316";
        ctx.beginPath();
        ctx.arc(contactX + 50, contactY + 136, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.font = "bold 11px Arial";
        ctx.fillText("PH", contactX + 42, iconCenterTextY(contactY + 136));
        ctx.fillStyle = "#64748b";
        ctx.font = "bold 11px Arial";
        ctx.fillText("Call Support", contactX + 78, contactY + 130);
        ctx.fillStyle = "#c2410c";
        ctx.font = "bold 19px Arial";
        ctx.fillText("+91 87780 03397", contactX + 78, contactY + 151);
        ctx.restore();

        // Footer Address
        const footerLineY = H - 110;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(40, footerLineY);
        ctx.lineTo(W - 40, footerLineY);
        ctx.stroke();

        ctx.fillStyle = "#94a3b8";
        ctx.font = "bold 12px Arial";
        ctx.fillText("✔ Quality Refurbished", 60, footerLineY + 25);
        ctx.fillText("✔ Wholesale Prices", W * 0.32, footerLineY + 25);
        ctx.fillText("✔ Lifetime Support", W * 0.58, footerLineY + 25);
        ctx.fillText("✔ 100% Satisfaction", W * 0.82, footerLineY + 25);

        const address = "📍 showroom address: paa building, 8/25 b, shop no-a3, y.m.r patty (landmark: head post office), dindigul, tamil nadu - 624001";
        ctx.fillStyle = "rgba(148, 163, 184, 0.8)";
        ctx.font = "bold 12px Arial, sans-serif";
        const addrWidth = ctx.measureText(address).width;
        ctx.fillText(address, W / 2 - addrWidth / 2, H - 40);
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
        ctx.fillText("— Professional Performance. Business Ready. —", 40, 170);

        // Spec Cards (Left vertical stack, compact)
        const specStartY = 205;
        const specCardW = 400;
        const specCardH = 48;
        const specSpaceY = 56;
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
          ctx.fillStyle = activeAccent + "15";
          ctx.beginPath();
          ctx.arc(iconX, iconCenterY, 13, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = activeAccent;
          ctx.lineWidth = 1.5;

          if (idx === 0) {
            ctx.beginPath();
            ctx.rect(iconX - 6, iconCenterY - 6, 12, 12);
            ctx.stroke();
          } else if (idx === 1) {
            ctx.beginPath();
            ctx.rect(iconX - 8, iconCenterY - 4, 16, 8);
            ctx.stroke();
          } else if (idx === 2) {
            ctx.beginPath();
            ctx.rect(iconX - 6, iconCenterY - 6, 12, 12);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(iconX, iconCenterY - 2, 3, 0, Math.PI * 2);
            ctx.stroke();
          } else {
            ctx.beginPath();
            ctx.arc(iconX, iconCenterY + 4, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(iconX, iconCenterY + 4, 6, Math.PI, Math.PI * 2);
            ctx.stroke();
          }

          const specLabel = ["PROCESSOR", "MEMORY", "STORAGE", "CONNECTIVITY"][idx] || "SPECIFICATION";
          ctx.fillStyle = "#94a3b8";
          ctx.font = "bold 8px Arial, sans-serif";
          ctx.fillText(specLabel, iconX + 22, currentY + 16);

          ctx.fillStyle = "#1e293b";
          ctx.font = "bold 13px Arial, sans-serif";
          ctx.fillText(specText, iconX + 22, currentY + 34);
        });

        // Showcase & Pedestal (Middle Column)
        const showX = W * 0.58;
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

        if (productImg) {
          ctx.save();
          const pWidth = productImg.width;
          const pHeight = productImg.height;
          const baseScale = (pedestalW * 0.85) / pWidth;
          const finalScale = baseScale * props.zoom;
          const drawW = pWidth * finalScale;
          const drawH = pHeight * finalScale;
          ctx.translate(showX + props.offsetX, showY + props.offsetY);
          ctx.rotate((props.rotation * Math.PI) / 180);
          ctx.drawImage(productImg, -drawW / 2, -drawH / 2, drawW, drawH);
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

        // Floating Badges
        const badgeX = showX - 120;
        const badgeY = showY - 120;
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
        ctx.fillText("SPECIAL DEAL PRICE", priceX, priceY - 20);

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

          const dealNum = parseFloat(String(props.product.price).replace(/,/g, ""));
          const origNum = parseFloat(String(props.product.originalPrice).replace(/,/g, ""));
          if (dealNum && origNum && origNum > dealNum) {
            const savings = origNum - dealNum;
            const pct = Math.round(((origNum - dealNum) / origNum) * 100);
            const savingsLabel = `SAVE ₹${formatRupee(String(savings))} (${pct}% OFF)`;
            ctx.fillStyle = "#f59e0b";
            drawRoundedRect(ctx, priceX, priceY + 36, 270, 26, 4);
            ctx.fill();
            ctx.fillStyle = "#0f172a";
            ctx.font = "bold 10px Arial";
            ctx.fillText(savingsLabel, priceX + 12, priceY + 53);
          }
        }

        // Bottom contact rows (drawn horizontally next to price)
        const contactRowY = footerY + 75;
        const waRowX = 530;
        const callRowX = 850;

        // WhatsApp Details
        ctx.fillStyle = "#22c55e";
        ctx.beginPath();
        ctx.arc(waRowX + 16, contactRowY, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.font = "bold 10px Arial";
        ctx.fillText("WA", waRowX + 8, contactRowY + 4);

        ctx.fillStyle = "#94a3b8";
        ctx.font = "bold 9px Arial";
        ctx.fillText("WhatsApp Chat", waRowX + 42, contactRowY - 8);
        ctx.fillStyle = "#22c55e";
        ctx.font = "bold 17px Arial";
        ctx.fillText("+91 79041 08020", waRowX + 42, contactRowY + 12);

        // Call details
        ctx.fillStyle = "#f97316";
        ctx.beginPath();
        ctx.arc(callRowX + 16, contactRowY, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.font = "bold 10px Arial";
        ctx.fillText("PH", callRowX + 9, contactRowY + 4);

        ctx.fillStyle = "#94a3b8";
        ctx.font = "bold 9px Arial";
        ctx.fillText("Call Support", callRowX + 42, contactRowY - 8);
        ctx.fillStyle = "#f97316";
        ctx.font = "bold 17px Arial";
        ctx.fillText("+91 87780 03397", callRowX + 42, contactRowY + 12);

        // Address Footer
        const footerLineY = H - 50;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(40, footerLineY);
        ctx.lineTo(W - 40, footerLineY);
        ctx.stroke();

        const address = "📍 showroom address: paa building, 8/25 b, shop no-a3, y.m.r patty (landmark: head post office), dindigul, tamil nadu - 624001";
        ctx.fillStyle = "rgba(148, 163, 184, 0.8)";
        ctx.font = "bold 10px Arial, sans-serif";
        const addrWidth = ctx.measureText(address).width;
        ctx.fillText(address, W / 2 - addrWidth / 2, H - 20);
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
        ctx.fillText("SAI", headerX + 105, headerY + 50);

        ctx.fillStyle = cardTextSub;
        ctx.font = "black 11px Arial, sans-serif";
        const subText = "SYSTEMS";
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
        ctx.fillText("— Professional Performance. Business Ready. —", W - 40, 225);
        ctx.textAlign = "left"; // reset

        // Spec Cards (Left Column)
        const specStartY = 270;
        const specCardW = 460;
        const specCardH = 74;
        const specSpaceY = 88;
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
          ctx.fillStyle = activeAccent + "15";
          ctx.beginPath();
          ctx.arc(iconX, iconCenterY, 20, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = activeAccent;
          ctx.lineWidth = 2;

          if (idx === 0) {
            ctx.beginPath();
            ctx.rect(iconX - 9, iconCenterY - 9, 18, 18);
            ctx.stroke();
            for (let i = -7; i <= 7; i += 4) {
              ctx.fillRect(iconX + i - 1, iconCenterY - 12, 2, 3);
              ctx.fillRect(iconX + i - 1, iconCenterY + 9, 2, 3);
              ctx.fillRect(iconX - 12, iconCenterY + i - 1, 3, 2);
              ctx.fillRect(iconX + 9, iconCenterY + i - 1, 3, 2);
            }
          } else if (idx === 1) {
            ctx.beginPath();
            ctx.rect(iconX - 12, iconCenterY - 6, 24, 12);
            ctx.stroke();
            for (let i = -8; i <= 8; i += 4) {
              ctx.fillRect(iconX + i - 1, iconCenterY - 4, 2, 8);
            }
          } else if (idx === 2) {
            ctx.beginPath();
            ctx.rect(iconX - 10, iconCenterY - 10, 20, 20);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(iconX, iconCenterY - 3, 5, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillRect(iconX - 6, iconCenterY + 5, 12, 2);
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

          const specLabel = ["PROCESSOR", "MEMORY", "STORAGE", "CONNECTIVITY"][idx] || "SPECIFICATION";
          ctx.fillStyle = "#94a3b8";
          ctx.font = "bold 11px Arial, sans-serif";
          ctx.fillText(specLabel, 120, currentY + 23);

          ctx.fillStyle = "#1e293b";
          ctx.font = "bold 20px Arial, sans-serif";
          ctx.fillText(specText, 120, currentY + 47);
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
          ctx.fillStyle = activeAccent + "22";
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

        if (productImg) {
          ctx.save();
          const pWidth = productImg.width;
          const pHeight = productImg.height;
          const baseScale = (pedestalW * 0.9) / pWidth;
          const finalScale = baseScale * props.zoom;
          const drawW = pWidth * finalScale;
          const drawH = pHeight * finalScale;
          ctx.translate(showX + props.offsetX, showY + props.offsetY);
          ctx.rotate((props.rotation * Math.PI) / 180);
          ctx.drawImage(productImg, -drawW / 2, -drawH / 2, drawW, drawH);
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

        // Floating Badges
        const badgeX = showX - 150;
        const badgeY = showY - 160;
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
        ctx.fillStyle = "#475569";
        ctx.font = "bold 13px Arial";
        ctx.fillText("🛡️ 365-Day Warranty", 80, trustY + 38);
        ctx.fillText("⚙️ 100% Genuine Spare Parts", 410, trustY + 38);
        ctx.fillText("🔌 Charger & Box Included", 760, trustY + 38);
        ctx.restore();

        // Pricing details
        const priceY = footerY + 80;
        const priceX = 60;
        ctx.fillStyle = activeAccent;
        ctx.font = "black 12px Arial, sans-serif";
        ctx.fillText("SPECIAL DEAL PRICE", priceX, priceY - 24);

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

          const dealNum = parseFloat(String(props.product.price).replace(/,/g, ""));
          const origNum = parseFloat(String(props.product.originalPrice).replace(/,/g, ""));
          if (dealNum && origNum && origNum > dealNum) {
            const savings = origNum - dealNum;
            const pct = Math.round(((origNum - dealNum) / origNum) * 100);
            const savingsLabel = `SAVE ₹${formatRupee(String(savings))} (${pct}% OFF)`;
            ctx.fillStyle = "#f59e0b";
            drawRoundedRect(ctx, priceX, priceY + 54, 300, 36, 6);
            ctx.fill();
            ctx.fillStyle = "#0f172a";
            ctx.font = "bold 12px Arial";
            ctx.fillText(savingsLabel, priceX + 16, priceY + 77);
          }
        }

        // Contact buttons
        const contactX = W - 420;
        const contactY = footerY + 45;
        ctx.save();
        ctx.fillStyle = "white";
        drawRoundedRect(ctx, contactX, contactY, 360, 185, 24);
        ctx.fill();
        ctx.fillStyle = "#94a3b8";
        ctx.font = "bold 11px Arial";
        ctx.fillText("GET THIS DEAL INSTANTLY", contactX + 30, contactY + 28);

        // WhatsApp
        ctx.fillStyle = "#f0fdf4";
        ctx.strokeStyle = "#bbf7d0";
        ctx.lineWidth = 1;
        drawRoundedRect(ctx, contactX + 25, contactY + 44, 310, 52, 10);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#22c55e";
        ctx.beginPath();
        ctx.arc(contactX + 50, contactY + 70, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.font = "bold 11px Arial";
        ctx.fillText("WA", contactX + 41, iconCenterTextY(contactY + 70));
        ctx.fillStyle = "#64748b";
        ctx.font = "bold 11px Arial";
        ctx.fillText("WhatsApp Chat", contactX + 78, contactY + 64);
        ctx.fillStyle = "#15803d";
        ctx.font = "bold 19px Arial";
        ctx.fillText("+91 79041 08020", contactX + 78, contactY + 85);

        // Phone call
        ctx.fillStyle = "#fff7ed";
        ctx.strokeStyle = "#fed7aa";
        drawRoundedRect(ctx, contactX + 25, contactY + 110, 310, 52, 10);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#f97316";
        ctx.beginPath();
        ctx.arc(contactX + 50, contactY + 136, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.font = "bold 11px Arial";
        ctx.fillText("PH", contactX + 42, iconCenterTextY(contactY + 136));
        ctx.fillStyle = "#64748b";
        ctx.font = "bold 11px Arial";
        ctx.fillText("Call Support", contactX + 78, contactY + 130);
        ctx.fillStyle = "#c2410c";
        ctx.font = "bold 19px Arial";
        ctx.fillText("+91 87780 03397", contactX + 78, contactY + 151);
        ctx.restore();

        // Footer line & address
        const footerLineY = H - 85;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(40, footerLineY);
        ctx.lineTo(W - 40, footerLineY);
        ctx.stroke();

        ctx.fillStyle = "#94a3b8";
        ctx.font = "bold 12px Arial";
        ctx.fillText("✔ Quality Refurbished", 60, footerLineY + 25);
        ctx.fillText("✔ Wholesale Prices", W * 0.32, footerLineY + 25);
        ctx.fillText("✔ Lifetime Support", W * 0.58, footerLineY + 25);
        ctx.fillText("✔ 100% Satisfaction", W * 0.82, footerLineY + 25);

        const address = "📍 showroom address: paa building, 8/25 b, shop no-a3, y.m.r patty (landmark: head post office), dindigul, tamil nadu - 624001";
        ctx.fillStyle = "rgba(148, 163, 184, 0.8)";
        ctx.font = "bold 12px Arial, sans-serif";
        const addrWidth = ctx.measureText(address).width;
        ctx.fillText(address, W / 2 - addrWidth / 2, H - 25);
      }

      // ----------------------------------------------------
      // Export canvas drawing as Data URL for the <img> tag
      // ----------------------------------------------------
      setImgSrc(canvas.toDataURL("image/png"));
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
        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5">
          <span>📷</span> Live canvas preview ({props.ratio === "16:9" ? 1200 : 1080}x{props.ratio === "9:16" ? 1920 : props.ratio === "16:9" ? 630 : 1080}px)
        </div>
        <div className="relative border border-slate-700/80 rounded-xl overflow-hidden max-w-full bg-slate-900 shadow-2xl flex items-center justify-center min-h-[300px] w-full">
          {/* Offscreen Canvas for drawing */}
          <canvas
            ref={canvasRef}
            style={{ display: "none" }}
          />
          {/* Real image overlay for mobile long-press copy and save support */}
          {imgSrc ? (
            <img
              src={imgSrc}
              className="max-h-[500px] max-w-full h-auto w-auto object-contain cursor-pointer active:scale-[0.99] transition-transform select-none rounded-xl"
              alt="Promo Banner Preview"
              title="Long-press or right-click to copy/save"
            />
          ) : (
            <div className="text-slate-500 text-xs py-20">Generating promotional graphics...</div>
          )}
        </div>
      </div>
    );
  }
);

PromoBannerCanvas.displayName = "PromoBannerCanvas";

export default PromoBannerCanvas;
