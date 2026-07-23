"use client";

import React, { useRef, useEffect, useImperativeHandle, forwardRef, useState, useCallback } from "react";
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
  zoom2?: number;
  offsetX2?: number;
  offsetY2?: number;
  rotation2?: number;
  localImageFile2?: File | null;
  zoom3?: number;
  offsetX3?: number;
  offsetY3?: number;
  rotation3?: number;
  localImageFile3?: File | null;
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
  removeBg2?: boolean;
  removeBg3?: boolean;
  imageMode?: "single" | "grid3";
  activeImageTab?: number;
  layoutStyle?: "classic" | "hero-center" | "split-modern";
  bgPatternOpacity?: number;
  showLogo?: boolean;
  showQrCode?: boolean;
  showProductShadow?: boolean;
  fontFamily?: string;
  onOffsetChange?: (x: number, y: number, index: number) => void;
  badgePosition?: "center" | "left" | "right";
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

    // Track loaded state of product image 2 & 3
    const [productImg2, setProductImg2] = useState<HTMLImageElement | null>(null);
    const [productImgSrc2, setProductImgSrc2] = useState<string | null>(null);
    const [processedImg2, setProcessedImg2] = useState<HTMLCanvasElement | HTMLImageElement | null>(null);
    const [imageLoading2, setImageLoading2] = useState(false);
    const [imageLoadError2, setImageLoadError2] = useState(false);

    const [productImg3, setProductImg3] = useState<HTMLImageElement | null>(null);
    const [productImgSrc3, setProductImgSrc3] = useState<string | null>(null);
    const [processedImg3, setProcessedImg3] = useState<HTMLCanvasElement | HTMLImageElement | null>(null);
    const [imageLoading3, setImageLoading3] = useState(false);
    const [imageLoadError3, setImageLoadError3] = useState(false);

    const [isTainted, setIsTainted] = useState(false);
    const [qrImg, setQrImg] = useState<HTMLImageElement | null>(null);

    // Mouse and Touch Drag-and-Drop Image repositioning refs/handlers
    const isDraggingRef = useRef(false);
    const dragStartRef = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 });

    const handleMouseDown = (e: React.MouseEvent) => {
      isDraggingRef.current = true;
      let startOffsetX = props.offsetX;
      let startOffsetY = props.offsetY;
      if (props.activeImageTab === 2) {
        startOffsetX = props.offsetX2 || 0;
        startOffsetY = props.offsetY2 || 0;
      } else if (props.activeImageTab === 3) {
        startOffsetX = props.offsetX3 || 0;
        startOffsetY = props.offsetY3 || 0;
      }
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        offsetX: startOffsetX,
        offsetY: startOffsetY
      };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      if (props.onOffsetChange) {
        const canvasEl = canvasRef.current;
        let scale = 1;
        if (canvasEl) {
          scale = canvasEl.width / canvasEl.clientWidth;
        }
        const nextX = Math.max(-300, Math.min(300, Math.round(dragStartRef.current.offsetX + dx * scale)));
        const nextY = Math.max(-300, Math.min(300, Math.round(dragStartRef.current.offsetY + dy * scale)));
        props.onOffsetChange(nextX, nextY, props.activeImageTab || 1);
      }
    };

    const handleMouseUpOrLeave = () => {
      isDraggingRef.current = false;
    };

    const handleTouchStart = (e: React.TouchEvent) => {
      if (e.touches.length !== 1) return;
      isDraggingRef.current = true;
      let startOffsetX = props.offsetX;
      let startOffsetY = props.offsetY;
      if (props.activeImageTab === 2) {
        startOffsetX = props.offsetX2 || 0;
        startOffsetY = props.offsetY2 || 0;
      } else if (props.activeImageTab === 3) {
        startOffsetX = props.offsetX3 || 0;
        startOffsetY = props.offsetY3 || 0;
      }
      dragStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        offsetX: startOffsetX,
        offsetY: startOffsetY
      };
    };

    const handleTouchMove = (e: React.TouchEvent) => {
      if (!isDraggingRef.current || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - dragStartRef.current.x;
      const dy = e.touches[0].clientY - dragStartRef.current.y;
      if (props.onOffsetChange) {
        const canvasEl = canvasRef.current;
        let scale = 1;
        if (canvasEl) {
          scale = canvasEl.width / canvasEl.clientWidth;
        }
        const nextX = Math.max(-300, Math.min(300, Math.round(dragStartRef.current.offsetX + dx * scale)));
        const nextY = Math.max(-300, Math.min(300, Math.round(dragStartRef.current.offsetY + dy * scale)));
        props.onOffsetChange(nextX, nextY, props.activeImageTab || 1);
      }
    };

    const handleTouchEnd = () => {
      isDraggingRef.current = false;
    };

    // AI-powered async background removal using @imgly/background-removal
    const [removeBgProcessing, setRemoveBgProcessing] = useState(false);
    const [removeBgProcessing2, setRemoveBgProcessing2] = useState(false);
    const [removeBgProcessing3, setRemoveBgProcessing3] = useState(false);

    const removeImageBackgroundAI = useCallback(async (
      imgElement: HTMLImageElement,
      onDone: (result: HTMLImageElement | HTMLCanvasElement) => void,
      onFail: () => void,
      setLoading: (v: boolean) => void
    ) => {
      setLoading(true);
      try {
        // Dynamically import the library so it doesn't block initial load
        const { removeBackground } = await import("@imgly/background-removal");

        // Convert HTMLImageElement -> Blob
        const srcCanvas = document.createElement("canvas");
        srcCanvas.width = imgElement.naturalWidth || imgElement.width;
        srcCanvas.height = imgElement.naturalHeight || imgElement.height;
        const srcCtx = srcCanvas.getContext("2d");
        if (!srcCtx) { onFail(); return; }
        srcCtx.drawImage(imgElement, 0, 0);
        const blob: Blob = await new Promise((res, rej) =>
          srcCanvas.toBlob(b => b ? res(b) : rej(new Error("toBlob failed")), "image/png")
        );

        // Run the AI model
        const resultBlob = await removeBackground(blob, {
          output: { format: "image/png", quality: 0.85 },
          // Silence verbose WASM logs in production
          debug: false,
        });

        const resultUrl = URL.createObjectURL(resultBlob);
        const resultImg = new Image();
        resultImg.onload = () => {
          URL.revokeObjectURL(resultUrl);
          setLoading(false);
          onDone(resultImg);
        };
        resultImg.onerror = () => {
          URL.revokeObjectURL(resultUrl);
          setLoading(false);
          onFail();
        };
        resultImg.src = resultUrl;
      } catch (e) {
        console.error("AI background removal failed, falling back to original:", e);
        setLoading(false);
        onFail();
      }
    }, []);

    const drawFooterBadges = (
      ctx: CanvasRenderingContext2D,
      startX: number,
      startY: number,
      dealTag: string,
      accessory: string,
      fontSize = 11,
      height = 24
    ) => {
      if (!dealTag && !accessory) return;
      
      ctx.save();
      ctx.font = `bold ${fontSize}px Arial, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      
      let currentX = startX;
      
      if (dealTag) {
        const width = ctx.measureText(dealTag).width + 16;
        ctx.fillStyle = "#dc2626";
        drawRoundedRect(ctx, currentX, startY, width, height, 5);
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.fillText(dealTag, currentX + width / 2, startY + height / 2 + 1);
        currentX += width + 8;
      }
      
      if (accessory) {
        const width = ctx.measureText(accessory).width + 16;
        ctx.fillStyle = "#059669";
        drawRoundedRect(ctx, currentX, startY, width, height, 5);
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.fillText(accessory, currentX + width / 2, startY + height / 2 + 1);
      }
      ctx.restore();
    };

    const drawIncludedAccessoriesCard = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      w: number,
      h: number,
      accessoryText?: string,
      isTamil?: boolean,
      activeAccent: string = "#f97316",
      cardFill: string = "#ffffff",
      cardOutline: string = "rgba(249, 115, 22, 0.2)"
    ) => {
      ctx.save();

      // Outer container card (Clean white or dark glass rounded box matching contact card)
      ctx.fillStyle = cardFill || "white";
      drawRoundedRect(ctx, x, y, w, h, 24);
      ctx.fill();
      ctx.strokeStyle = cardOutline || "rgba(249, 115, 22, 0.25)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Header Title inside the box
      ctx.fillStyle = "#64748b";
      ctx.font = "bold 11px Arial, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(
        isTamil ? "சேர்க்கப்பட்டுள்ள இலவச பாகங்கள்" : "INCLUDED ACCESSORIES",
        x + 25,
        y + 28
      );

      // Parse raw text or default to standard included accessories
      const defaultText = "Laptop Bag, Charger, Wired Mouse, Power Adapter";
      const rawText = accessoryText && accessoryText.trim() ? accessoryText : defaultText;

      // Split items by comma, ampersand, plus, slash, or word 'and'
      let items = rawText
        .split(/[,&+|\n]|\band\b/i)
        .map((s) => s.trim())
        .filter(Boolean);

      if (items.length === 0) {
        items = ["Laptop Bag", "Charger", "Wired Mouse", "Power Adapter"];
      }

      // Format items & helper for icon selection
      const getAccessoryIcon = (name: string): string => {
        const lower = name.toLowerCase();
        if (lower.includes("bag") || lower.includes("case") || lower.includes("backpack") || lower.includes("pouch")) return "🎒";
        if (lower.includes("charger") || lower.includes("charging")) return "⚡";
        if (lower.includes("mouse")) return "🖱️";
        if (lower.includes("adapt") || lower.includes("adpot") || lower.includes("power")) return "🔌";
        if (lower.includes("keyboard")) return "⌨️";
        if (lower.includes("cable") || lower.includes("wire")) return "🧵";
        if (lower.includes("headset") || lower.includes("earphone") || lower.includes("audio") || lower.includes("headphone")) return "🎧";
        return "🎁";
      };

      const formatItemText = (str: string): string => {
        let clean = str.replace(/^(free|included)\s+/i, "");
        if (clean.toLowerCase() === "adpoter") clean = "Adapter";
        return clean.replace(/\b\w/g, (c) => c.toUpperCase());
      };

      if (h >= 140) {
        // Standard Card for 1:1 and 9:16 aspect ratios (Height ~185px)
        const itemRowY1 = y + 44;
        const itemRowY2 = y + 110;
        const itemW = (w - 50 - 10) / 2; // 2 columns

        items.slice(0, 4).forEach((item, idx) => {
          const col = idx % 2;
          const row = Math.floor(idx / 2);
          const itemX = x + 20 + col * (itemW + 10);
          const itemY = row === 0 ? itemRowY1 : itemRowY2;

          const icon = getAccessoryIcon(item);
          const label = formatItemText(item);

          // Pill container background
          ctx.fillStyle = row === 0 ? "#f0fdf4" : "#fff7ed";
          ctx.strokeStyle = row === 0 ? "#bbf7d0" : "#fed7aa";
          ctx.lineWidth = 1;
          drawRoundedRect(ctx, itemX, itemY, itemW, 52, 10);
          ctx.fill();
          ctx.stroke();

          // Emoji icon
          ctx.font = "18px Arial, sans-serif";
          ctx.textAlign = "left";
          ctx.fillText(icon, itemX + 12, itemY + 33);

          // Item text
          ctx.fillStyle = "#1e293b";
          ctx.font = "bold 12px Arial, sans-serif";
          let displayText = label;
          if (displayText.length > 18) {
            displayText = displayText.substring(0, 16) + "..";
          }
          ctx.fillText(displayText, itemX + 38, itemY + 31);
        });
      } else {
        // Compact row layout for 16:9 Landscape ratio (Height ~95px)
        const itemY = y + 40;
        const count = Math.min(items.length, 3);
        const itemW = (w - 40 - (count - 1) * 8) / count;

        items.slice(0, 3).forEach((item, idx) => {
          const itemX = x + 20 + idx * (itemW + 8);
          const icon = getAccessoryIcon(item);
          const label = formatItemText(item);

          ctx.fillStyle = "#f0fdf4";
          ctx.strokeStyle = "#bbf7d0";
          ctx.lineWidth = 1;
          drawRoundedRect(ctx, itemX, itemY, itemW, 42, 8);
          ctx.fill();
          ctx.stroke();

          ctx.font = "15px Arial, sans-serif";
          ctx.textAlign = "left";
          ctx.fillText(icon, itemX + 8, itemY + 26);

          ctx.fillStyle = "#1e293b";
          ctx.font = "bold 11px Arial, sans-serif";
          let displayText = label;
          if (displayText.length > 15) {
            displayText = displayText.substring(0, 13) + "..";
          }
          ctx.fillText(displayText, itemX + 28, itemY + 25);
        });
      }

      ctx.restore();
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
        if (srcUrl.startsWith("http") && !srcUrl.includes("/api/admin/proxy-image")) {
          srcUrl = `/api/admin/proxy-image?url=${encodeURIComponent(srcUrl)}`;
        }
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

    // Process image 1 background removal using AI
    useEffect(() => {
      if (!productImg) { setProcessedImg(null); return; }
      if (props.removeBg) {
        removeImageBackgroundAI(
          productImg,
          (result) => setProcessedImg(result),
          () => setProcessedImg(productImg),
          setRemoveBgProcessing
        );
      } else {
        setProcessedImg(productImg);
      }
    }, [productImg, props.removeBg, removeImageBackgroundAI]);

    // Handle product photo 2 loading
    useEffect(() => {
      let srcUrl = "";
      
      if (props.localImageFile2) {
        srcUrl = URL.createObjectURL(props.localImageFile2);
      } else if ((props.product as any).imageUrl2) {
        srcUrl = (props.product as any).imageUrl2;
        if (srcUrl.startsWith("http") && !srcUrl.includes("/api/admin/proxy-image")) {
          srcUrl = `/api/admin/proxy-image?url=${encodeURIComponent(srcUrl)}`;
        }
      }

      if (!srcUrl) {
        setProductImg2(null);
        setProductImgSrc2(null);
        setImageLoading2(false);
        setImageLoadError2(false);
        return;
      }

      setImageLoading2(true);
      setImageLoadError2(false);
      const img = new Image();
      if (srcUrl.startsWith("http")) {
        img.crossOrigin = "anonymous";
      }
      img.src = srcUrl;
      img.onload = () => {
        setProductImg2(img);
        setProductImgSrc2(srcUrl);
        setImageLoading2(false);
      };
      img.onerror = () => {
        console.error("Failed to load product image 2:", srcUrl);
        setProductImg2(null);
        setImageLoading2(false);
        setImageLoadError2(true);
      };

      return () => {
        if (srcUrl && srcUrl.startsWith("blob:")) {
          URL.revokeObjectURL(srcUrl);
        }
      };
    }, [(props.product as any).imageUrl2, props.localImageFile2]);

    // Process image 2 background removal using AI
    useEffect(() => {
      if (!productImg2) { setProcessedImg2(null); return; }
      if (props.removeBg2) {
        removeImageBackgroundAI(
          productImg2,
          (result) => setProcessedImg2(result),
          () => setProcessedImg2(productImg2),
          setRemoveBgProcessing2
        );
      } else {
        setProcessedImg2(productImg2);
      }
    }, [productImg2, props.removeBg2, removeImageBackgroundAI]);

    // Handle product photo 3 loading
    useEffect(() => {
      let srcUrl = "";
      
      if (props.localImageFile3) {
        srcUrl = URL.createObjectURL(props.localImageFile3);
      } else if ((props.product as any).imageUrl3) {
        srcUrl = (props.product as any).imageUrl3;
        if (srcUrl.startsWith("http") && !srcUrl.includes("/api/admin/proxy-image")) {
          srcUrl = `/api/admin/proxy-image?url=${encodeURIComponent(srcUrl)}`;
        }
      }

      if (!srcUrl) {
        setProductImg3(null);
        setProductImgSrc3(null);
        setImageLoading3(false);
        setImageLoadError3(false);
        return;
      }

      setImageLoading3(true);
      setImageLoadError3(false);
      const img = new Image();
      if (srcUrl.startsWith("http")) {
        img.crossOrigin = "anonymous";
      }
      img.src = srcUrl;
      img.onload = () => {
        setProductImg3(img);
        setProductImgSrc3(srcUrl);
        setImageLoading3(false);
      };
      img.onerror = () => {
        console.error("Failed to load product image 3:", srcUrl);
        setProductImg3(null);
        setImageLoading3(false);
        setImageLoadError3(true);
      };

      return () => {
        if (srcUrl && srcUrl.startsWith("blob:")) {
          URL.revokeObjectURL(srcUrl);
        }
      };
    }, [(props.product as any).imageUrl3, props.localImageFile3]);

    // Process image 3 background removal using AI
    useEffect(() => {
      if (!productImg3) { setProcessedImg3(null); return; }
      if (props.removeBg3) {
        removeImageBackgroundAI(
          productImg3,
          (result) => setProcessedImg3(result),
          () => setProcessedImg3(productImg3),
          setRemoveBgProcessing3
        );
      } else {
        setProcessedImg3(productImg3);
      }
    }, [productImg3, props.removeBg3, removeImageBackgroundAI]);

    // Pre-load QR Code for WhatsApp direct link
    useEffect(() => {
      const timer = setTimeout(() => {
        let waNumber = (props.whatsappChat || "917904108020").replace(/\D/g, "");
        if (waNumber.length === 10) {
          waNumber = "91" + waNumber;
        }
        const cleanTitle = props.product.title || "";
        const brand = props.brandName || "Sai Systems";
        const text = `Hi ${brand}! I am interested in your deal: ${cleanTitle}.`;
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
      }, 350);

      return () => clearTimeout(timer);
    }, [props.product.title, props.whatsappChat, props.brandName]);

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
      props.zoom2,
      props.offsetX2,
      props.offsetY2,
      props.rotation2,
      props.zoom3,
      props.offsetX3,
      props.offsetY3,
      props.rotation3,
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
      productImg2,
      processedImg2,
      productImg3,
      processedImg3,
      props.removeBg,
      props.removeBg2,
      props.removeBg3,
      props.imageMode,
      qrImg,
      props.layoutStyle,
      props.bgPatternOpacity,
      props.showLogo,
      props.showQrCode,
      props.showProductShadow,
      props.fontFamily
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
      props.zoom2,
      props.offsetX2,
      props.offsetY2,
      props.rotation2,
      props.zoom3,
      props.offsetX3,
      props.offsetY3,
      props.rotation3,
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
      productImg2,
      productImg3,
      props.removeBg,
      props.removeBg2,
      props.removeBg3,
      props.imageMode,
      qrImg,
      props.layoutStyle,
      props.bgPatternOpacity,
      props.showLogo,
      props.showQrCode,
      props.showProductShadow,
      props.fontFamily
    ]);

    const drawCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Dynamically override context font to support custom font family selector
      const activeFont = props.fontFamily || "Arial";
      if (activeFont !== "Arial") {
        const desc = Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, "font");
        if (desc && desc.set) {
          Object.defineProperty(ctx, "font", {
            get: () => desc.get?.call(ctx),
            set: (val: string) => {
              desc.set?.call(ctx, val.replace(/Arial/g, activeFont));
            },
            configurable: true
          });
        }
      }

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
      const layoutStyle = props.layoutStyle || "classic";
      const bgPatternOpacity = props.bgPatternOpacity !== undefined ? props.bgPatternOpacity : 1.0;

      // ── DIMENSIONS SETTING BY ASPECT RATIO ──────────────────────────────
      let W = 1080;
      let H = 1080;
      if (props.ratio === "9:16") {
        const isGridSpecs = layoutStyle === "hero-center" || layoutStyle === "split-modern";
        let showX = W / 2;
        let showY = isGridSpecs ? 720 : 550;
        let pedestalW = isGridSpecs ? 680 : 600;
        let pedestalH = isGridSpecs ? 120 : 100;
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

      const getSpecLabel = (text: string, index: number): string => {
        const lower = text.toLowerCase();
        if (lower.includes("intel") || lower.includes("ryzen") || lower.includes("processor") || lower.includes("cpu") || lower.includes("core i")) return "PROCESSOR";
        if (lower.includes("ram") || lower.includes("ddr") || lower.includes("memory")) return "MEMORY";
        if (lower.includes("ssd") || lower.includes("hdd") || lower.includes("storage") || lower.includes("nvme") || lower.includes("gb ssd") || lower.includes("tb hdd")) return "STORAGE";
        if (lower.includes("display") || lower.includes("screen") || lower.includes("inch") || lower.includes("ips") || lower.includes("fhd") || lower.includes("4k")) return "DISPLAY";
        if (lower.includes("windows") || lower.includes("os") || lower.includes("software") || lower.includes("pro") || lower.includes("ubuntu")) return "OS & SOFTWARE";
        if (lower.includes("warranty") || lower.includes("guarantee") || lower.includes("day")) return "WARRANTY";
        if (lower.includes("graphics") || lower.includes("nvidia") || lower.includes("rtx") || lower.includes("gtx") || lower.includes("amd")) return "GRAPHICS";
        if (lower.includes("bag") || lower.includes("charger") || lower.includes("mouse") || lower.includes("accessory")) return "INCLUDED";
        const defaults = ["PROCESSOR", "MEMORY", "DISPLAY", "OS & SOFTWARE", "WARRANTY"];
        return defaults[index % defaults.length];
      };

      const drawPlatformItem = (cx: number, cy: number, pW: number, pH: number) => {
        ctx.save();
        if (props.platformStyle === "pedestal") {
          // Outer ground drop shadow
          ctx.fillStyle = "rgba(0, 0, 0, 0.16)";
          ctx.beginPath();
          ctx.ellipse(cx, cy + pH * 0.4, pW * 0.85, pH * 0.4, 0, 0, Math.PI * 2);
          ctx.fill();

          // 3D Pedestal Bevel Base
          ctx.fillStyle = props.cardStyle === "dark" ? "rgba(30, 41, 59, 0.9)" : "rgba(203, 213, 225, 0.95)";
          ctx.beginPath();
          ctx.ellipse(cx, cy + pH * 0.22, pW * 0.75, pH * 0.32, 0, 0, Math.PI * 2);
          ctx.fill();

          // Pedestal Top Surface
          const topGrad = ctx.createLinearGradient(cx - pW * 0.5, cy, cx + pW * 0.5, cy);
          if (props.cardStyle === "dark") {
            topGrad.addColorStop(0, "rgba(51, 65, 85, 0.98)");
            topGrad.addColorStop(1, "rgba(30, 41, 59, 0.95)");
          } else {
            topGrad.addColorStop(0, "rgba(255, 255, 255, 0.98)");
            topGrad.addColorStop(1, "rgba(241, 245, 249, 0.95)");
          }
          ctx.fillStyle = topGrad;
          ctx.strokeStyle = activeAccent;
          ctx.lineWidth = Math.max(2, pW * 0.008);
          ctx.beginPath();
          ctx.ellipse(cx, cy + pH * 0.12, pW * 0.72, pH * 0.28, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Inner accent ring highlight
          ctx.fillStyle = getRgbaColor(activeAccent, 0.12);
          ctx.beginPath();
          ctx.ellipse(cx, cy + pH * 0.12, pW * 0.58, pH * 0.22, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (props.platformStyle === "ring") {
          ctx.strokeStyle = activeAccent;
          ctx.lineWidth = Math.max(3, pW * 0.012);
          ctx.save();
          ctx.shadowColor = activeAccent;
          ctx.shadowBlur = 18;
          ctx.beginPath();
          ctx.ellipse(cx, cy + pH * 0.15, pW * 0.75, pH * 0.32, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        } else {
          ctx.fillStyle = "rgba(0, 0, 0, 0.16)";
          ctx.beginPath();
          ctx.ellipse(cx, cy + pH * 0.15, pW * 0.65, pH * 0.28, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      };

      const drawImageGridItem = (
        img: HTMLCanvasElement | HTMLImageElement | null,
        cx: number,
        cy: number,
        maxW: number,
        zoom: number,
        offX: number,
        offY: number,
        rot: number,
        showShadow: boolean,
        placeholderText: string
      ) => {
        if (img) {
          ctx.save();
          const pWidth = img.width || (img as HTMLCanvasElement).width;
          const pHeight = img.height || (img as HTMLCanvasElement).height;
          const baseScale = maxW / pWidth;
          const finalScale = baseScale * zoom;
          const drawW = pWidth * finalScale;
          const drawH = pHeight * finalScale;

          if (showShadow) {
            ctx.save();
            ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
            ctx.beginPath();
            ctx.ellipse(cx + offX, cy + offY + drawH * 0.38, drawW * 0.4, drawH * 0.08, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }

          ctx.translate(cx + offX, cy + offY);
          ctx.rotate((rot * Math.PI) / 180);
          ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
          ctx.restore();
        } else {
          // Draw dashed placeholder card
          ctx.save();
          ctx.strokeStyle = "rgba(148, 163, 184, 0.45)";
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 6]);
          drawRoundedRect(ctx, cx - maxW / 2, cy - maxW / 3, maxW, (maxW * 2) / 3, 12);
          ctx.stroke();
          ctx.setLineDash([]);
          
          ctx.fillStyle = "rgba(148, 163, 184, 0.08)";
          drawRoundedRect(ctx, cx - maxW / 2, cy - maxW / 3, maxW, (maxW * 2) / 3, 12);
          ctx.fill();
          
          ctx.fillStyle = props.cardStyle === "dark" ? "#94a3b8" : "#64748b";
          ctx.font = "bold 12px Arial";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(placeholderText, cx, cy);
          ctx.restore();
        }
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
        ctx.beginPath();
        ctx.moveTo(x - 3, y); ctx.lineTo(x - 1, y + 2); ctx.lineTo(x + 3, y - 2);
        ctx.stroke();
        ctx.restore();
      };

      const drawOsIcon = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
        ctx.save();
        ctx.strokeStyle = activeAccent;
        ctx.fillStyle = getRgbaColor(activeAccent, 0.25);
        ctx.lineWidth = 1.2;
        ctx.fillRect(x - 7, y - 7, 6, 6); ctx.strokeRect(x - 7, y - 7, 6, 6);
        ctx.fillRect(x + 1, y - 7, 6, 6); ctx.strokeRect(x + 1, y - 7, 6, 6);
        ctx.fillRect(x - 7, y + 1, 6, 6); ctx.strokeRect(x - 7, y + 1, 6, 6);
        ctx.fillRect(x + 1, y + 1, 6, 6); ctx.strokeRect(x + 1, y + 1, 6, 6);
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
        ctx.moveTo(x - 2, y - 4); ctx.lineTo(x - 2, y - 8);
        ctx.moveTo(x + 2, y - 4); ctx.lineTo(x + 2, y - 8);
        ctx.moveTo(x, y + 3); ctx.lineTo(x, y + 8);
        ctx.stroke();
        ctx.restore();
      };

      const drawQrCodeCenterLogo = (ctx: CanvasRenderingContext2D, cx: number, cy: number, radius = 12) => {
        ctx.save();
        // white backing circle
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(cx, cy, radius + 2.5, 0, Math.PI * 2);
        ctx.fill();

        // green whatsapp circle
        ctx.fillStyle = "#22c55e";
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();

        // draw simple "WA" letters inside green circle
        ctx.fillStyle = "white";
        ctx.font = "bold " + Math.round(radius * 0.75) + "px Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("WA", cx, cy + 0.5);
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
        const isGridSpecs = layoutStyle === "hero-center" || layoutStyle === "split-modern";
        let showX = W / 2;
        let showY = isGridSpecs ? 720 : 550;
        let pedestalW = isGridSpecs ? 680 : 600;
        let pedestalH = isGridSpecs ? 120 : 100;
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
        ctx.strokeStyle = `rgba(100, 116, 139, ${0.04 * bgPatternOpacity})`;
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
        ctx.strokeStyle = `rgba(148, 163, 184, ${0.06 * bgPatternOpacity})`;
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
        ctx.fillStyle = `rgba(0, 0, 0, ${0.02 * bgPatternOpacity})`;
        for (let y = 0; y < footerY; y += 4) {
          ctx.fillRect(0, y, W, 2);
        }
      }

      // Theme Color & Contrast Calculations
      const darkTopThemes = ["dark", "matrix", "neon", "burgundy", "sunset", "royal", "ocean", "green", "purple", "rose", "frost", "goldrush", "teal", "cyberpunk", "hot_red", "eco_green", "midnight_blue"];
      const isDarkTopTheme = darkTopThemes.includes(props.themeColor);

      // High Contrast Header Text
      const titleTextColor = isDarkTopTheme ? "#ffffff" : "#0f172a";
      const taglineTextColor = isDarkTopTheme ? "#cbd5e1" : "#475569";

      // Card Fill & Spec Text Contrast
      let cardFill = "rgba(255, 255, 255, 0.95)";
      let cardOutline = "rgba(226, 232, 240, 0.9)";
      let cardTextMain = "#0f172a";
      let cardTextSub = "#64748b";
      let cardTextBrand = "#ea580c";

      if (props.cardStyle === "dark") {
        cardFill = "rgba(15, 23, 42, 0.94)";
        cardOutline = "rgba(51, 65, 85, 0.8)";
        cardTextMain = "#ffffff";
        cardTextSub = "#94a3b8";
      } else if (props.cardStyle === "glass") {
        if (isDarkTopTheme) {
          cardFill = "rgba(15, 23, 42, 0.85)";
          cardOutline = "rgba(255, 255, 255, 0.25)";
          cardTextMain = "#ffffff";
          cardTextSub = "#cbd5e1";
        } else {
          cardFill = "rgba(255, 255, 255, 0.9)";
          cardOutline = "rgba(226, 232, 240, 0.9)";
          cardTextMain = "#0f172a";
          cardTextSub = "#64748b";
        }
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
        const isGridSpecs = layoutStyle === "hero-center" || layoutStyle === "split-modern";
        let showX = W / 2;
        let showY = isGridSpecs ? 720 : 550;
        let pedestalW = isGridSpecs ? 680 : 600;
        let pedestalH = isGridSpecs ? 120 : 100;
        // Logo card
        const headerX = 40;
        const headerY = 80;
        if (props.showLogo !== false) {
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
          ctx.font = "900 32px Arial, sans-serif";
          ctx.fillText(brandName, headerX + 105, headerY + 50);

          ctx.fillStyle = cardTextSub;
          ctx.font = "900 12px Arial, sans-serif";
          const subText = brandSubtext;
          let textX = headerX + 105;
          for (let i = 0; i < subText.length; i++) {
            ctx.fillText(subText[i], textX, headerY + 76);
            textX += 14.5;
          }
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
        ctx.fillStyle = titleTextColor;
        let titleFontSize = 46;
        ctx.font = "900 " + titleFontSize + "px Arial, sans-serif";
        while (ctx.measureText(pTitle).width > W - 100 && titleFontSize > 20) {
          titleFontSize -= 2;
          ctx.font = "900 " + titleFontSize + "px Arial, sans-serif";
        }
        ctx.fillText(pTitle, W / 2, 230);

        ctx.fillStyle = taglineTextColor;
        ctx.font = "bold 16px Arial, sans-serif";
        ctx.fillText(tagline, W / 2, 275);
        ctx.textAlign = "left";

        // Pedestal & Showcase coordinates (Responsive Layout Styles)
        if (props.imageMode === "grid3") {
          // Image 1 (Top)
          const cx1 = showX;
          const cy1 = showY - 140;
          const pW1 = pedestalW * 0.65;
          const pH1 = pedestalH * 0.65;
          drawPlatformItem(cx1, cy1, pW1, pH1);
          drawImageGridItem(
            processedImg,
            cx1,
            cy1,
            pW1 * 0.95,
            props.zoom,
            props.offsetX,
            props.offsetY,
            props.rotation,
            props.showProductShadow !== false,
            "Image 1 (Top)"
          );

          // Image 2 (Left)
          const cx2 = showX - pedestalW * 0.28;
          const cy2 = showY + 120;
          const pW2 = pedestalW * 0.5;
          const pH2 = pedestalH * 0.5;
          drawPlatformItem(cx2, cy2, pW2, pH2);
          drawImageGridItem(
            processedImg2,
            cx2,
            cy2,
            pW2 * 0.95,
            props.zoom2 || 1.0,
            props.offsetX2 || 0,
            props.offsetY2 || 0,
            props.rotation2 || 0,
            props.showProductShadow !== false,
            "Image 2 (Left)"
          );

          // Image 3 (Right)
          const cx3 = showX + pedestalW * 0.28;
          const cy3 = showY + 120;
          const pW3 = pedestalW * 0.5;
          const pH3 = pedestalH * 0.5;
          drawPlatformItem(cx3, cy3, pW3, pH3);
          drawImageGridItem(
            processedImg3,
            cx3,
            cy3,
            pW3 * 0.95,
            props.zoom3 || 1.0,
            props.offsetX3 || 0,
            props.offsetY3 || 0,
            props.rotation3 || 0,
            props.showProductShadow !== false,
            "Image 3 (Right)"
          );
        } else {
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

            // Draw soft radial backdrop shadow
            if (props.showProductShadow !== false) {
              ctx.save();
              const shadowRadius = Math.max(120, Math.min(drawW, drawH) * 0.75);
              const shadowGrad = ctx.createRadialGradient(
                showX + props.offsetX, showY + props.offsetY, 10,
                showX + props.offsetX, showY + props.offsetY, shadowRadius
              );
              shadowGrad.addColorStop(0, "rgba(15, 23, 42, 0.35)");
              shadowGrad.addColorStop(0.35, "rgba(15, 23, 42, 0.2)");
              shadowGrad.addColorStop(1, "rgba(15, 23, 42, 0)");
              ctx.fillStyle = shadowGrad;
              ctx.beginPath();
              ctx.arc(showX + props.offsetX, showY + props.offsetY, shadowRadius, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
            }

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
        }

        // Relocated Deal Tag & Accessories badges to footer pricing area
        // Specs List (Wide cards centered or grid, Y starts at 750)
        const specStartY = isGridSpecs ? 960 : 800;
        const specCardW = isGridSpecs ? 470 : 980;
        const specCardH = isGridSpecs ? 68 : 76;
        const specSpaceY = isGridSpecs ? 80 : 88;
        specsList.forEach((specText, idx) => {
          let currentX = W / 2 - specCardW / 2;
          let currentY = specStartY + idx * specSpaceY;
          let currentW = specCardW;
          let currentH = specCardH;

          if (isGridSpecs) {
            const col = idx % 2;
            const row = Math.floor(idx / 2);
            currentX = col === 0 ? 50 : 560;
            currentY = specStartY + row * specSpaceY;
          }

          ctx.save();
          ctx.shadowColor = "rgba(0,0,0,0.02)";
          ctx.shadowBlur = 6;
          ctx.shadowOffsetY = 2;
          drawRoundedRect(ctx, currentX, currentY, currentW, currentH, 16);
          ctx.fillStyle = cardFill;
          ctx.fill();
          ctx.strokeStyle = cardOutline;
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.restore();

          const iconX = currentX + (isGridSpecs ? 25 : 35);
          const iconCenterY = currentY + currentH / 2;
          ctx.fillStyle = getRgbaColor(activeAccent, 0.08);
          ctx.beginPath();
          ctx.arc(iconX, iconCenterY, isGridSpecs ? 15 : 20, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = activeAccent;
          ctx.lineWidth = isGridSpecs ? 1.5 : 2;

          const specLabel = getSpecLabel(specText, idx);
          if (specLabel === "OS & SOFTWARE") {
            drawOsIcon(ctx, iconX, iconCenterY);
          } else if (specLabel === "WARRANTY") {
            drawShieldIcon(ctx, iconX, iconCenterY);
          } else if (specLabel === "INCLUDED") {
            drawPlugIcon(ctx, iconX, iconCenterY);
          } else if (specLabel === "GRAPHICS") {
            drawGearIcon(ctx, iconX, iconCenterY);
          } else if (specLabel === "PROCESSOR") {
            ctx.beginPath();
            ctx.rect(iconX - (isGridSpecs ? 7 : 9), iconCenterY - (isGridSpecs ? 7 : 9), isGridSpecs ? 14 : 18, isGridSpecs ? 14 : 18);
            ctx.stroke();
            const pinOffset = isGridSpecs ? 9 : 12;
            const pinLen = isGridSpecs ? 2 : 3;
            for (let i = (isGridSpecs ? -5 : -7); i <= (isGridSpecs ? 5 : 7); i += 4) {
              ctx.fillRect(iconX + i - 1, iconCenterY - pinOffset, 2, pinLen);
              ctx.fillRect(iconX + i - 1, iconCenterY + pinOffset - pinLen, 2, pinLen);
              ctx.fillRect(iconX - pinOffset, iconCenterY + i - 1, pinLen, 2);
              ctx.fillRect(iconX + pinOffset - pinLen, iconCenterY + i - 1, pinLen, 2);
            }
          } else if (specLabel === "MEMORY") {
            ctx.beginPath();
            ctx.rect(iconX - (isGridSpecs ? 9 : 12), iconCenterY - 4, isGridSpecs ? 18 : 24, 8);
            ctx.stroke();
            for (let i = (isGridSpecs ? -6 : -8); i <= (isGridSpecs ? 6 : 8); i += 4) {
              ctx.fillRect(iconX + i - 1, iconCenterY - 2, 2, 4);
            }
          } else if (specLabel === "STORAGE") {
            ctx.beginPath();
            ctx.rect(iconX - 8, iconCenterY - 8, 16, 16);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(iconX, iconCenterY - 2, 4, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillRect(iconX - 5, iconCenterY + 4, 10, 1.5);
          } else {
            ctx.beginPath();
            ctx.rect(iconX - 9, iconCenterY - 6, 18, 11);
            ctx.moveTo(iconX - 3, iconCenterY + 5);
            ctx.lineTo(iconX - 4, iconCenterY + 8);
            ctx.lineTo(iconX + 4, iconCenterY + 8);
            ctx.lineTo(iconX + 3, iconCenterY + 5);
            ctx.stroke();
          }

          const labelFontSize = isGridSpecs ? 8.5 : 10;
          const textFontSize = isGridSpecs ? 13.5 : 17;
          const gap = 4;
          const totalTextH = labelFontSize + gap + textFontSize;
          const topMargin = (currentH - totalTextH) / 2;
          const labelY = currentY + topMargin + labelFontSize;
          const valueY = labelY + gap + textFontSize;

          ctx.fillStyle = cardTextSub;
          ctx.font = `bold ${labelFontSize}px Arial, sans-serif`;
          ctx.fillText(specLabel, iconX + (isGridSpecs ? 24 : 35), labelY);

          ctx.fillStyle = cardTextMain;
          ctx.font = `bold ${textFontSize}px Arial, sans-serif`;
          ctx.fillText(specText, iconX + (isGridSpecs ? 24 : 35), valueY);
        });

        // Horizontal Policies Bar
        const trustY = isGridSpecs ? 1160 : 1210;
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
            const cleanPolicy = policy.replace(/^([\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDC00-\uDFFF])\s*/g, "");
            drawCheckmarkBullet(ctx, trustXCoords[pIdx], trustY + 38, cleanPolicy, 13);
          }
        });

        // Bottom Section: Included Accessories Card
        const cardX = 80;
        const cardY = 1530;
        drawIncludedAccessoriesCard(
          ctx,
          cardX,
          cardY,
          450,
          185,
          props.product.includedAccessory,
          props.isTamil,
          activeAccent,
          cardFill,
          cardOutline
        );

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

        const showQr = props.showQrCode !== false && qrImg;
        const contactRowW = showQr ? 290 : 430;

        // Primary Contact (Both WhatsApp & Call)
        ctx.fillStyle = "#f0fdf4";
        ctx.strokeStyle = "#bbf7d0";
        ctx.lineWidth = 1;
        drawRoundedRect(ctx, contactX + 20, contactY + 44, contactRowW, 52, 10);
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
        drawRoundedRect(ctx, contactX + 20, contactY + 110, contactRowW, 52, 10);
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
        if (showQr) {
          ctx.fillStyle = "#f1f5f9";
          drawRoundedRect(ctx, contactX + 330, contactY + 36, 110, 110, 8);
          ctx.fill();
          ctx.drawImage(qrImg, contactX + 335, contactY + 41, 100, 100);
          drawQrCodeCenterLogo(ctx, contactX + 385, contactY + 91, 12);
          
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

        if (props.showEmi) {
          ctx.font = "bold 9px Arial, sans-serif";
          ctx.fillStyle = "rgba(148, 163, 184, 0.65)";
          ctx.textAlign = "center";
          ctx.fillText(props.isTamil ? "*நிபந்தனைகளுக்கு உட்பட்டது. EMI திட்டங்கள் நிதி நிறுவன ஒப்புதலுக்கு உட்பட்டது." : "*T&C Apply. EMI schemes subject to finance partner approval.", W / 2, H - 15);
        }
      }

      // ----------------------------------------------------
      // BRANCH: LANDSCAPE LAYOUT (16:9, 1200x630)
      // ----------------------------------------------------
      else if (props.ratio === "16:9") {
        const isHorizontalSpecs = layoutStyle === "hero-center";
        let showX = isHorizontalSpecs ? W / 2 : (W * 0.55);
        let showY = isHorizontalSpecs ? 210 : 320;
        let pedestalW = isHorizontalSpecs ? 500 : 340;
        let pedestalH = isHorizontalSpecs ? 90 : 60;
        // Branding Box
        const headerX = 40;
        const headerY = 25;
        if (props.showLogo !== false) {
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
          ctx.font = "900 24px Arial, sans-serif";
          ctx.fillText("SAI", headerX + 78, headerY + 34);

          ctx.fillStyle = cardTextSub;
          ctx.font = "900 10px Arial, sans-serif";
          const subText = "SYSTEMS";
          let textX = headerX + 78;
          for (let i = 0; i < subText.length; i++) {
            ctx.fillText(subText[i], textX, headerY + 54);
            textX += 10;
          }
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
        ctx.fillStyle = titleTextColor;
        let titleFontSize = 32;
        ctx.font = "900 " + titleFontSize + "px Arial, sans-serif";
        while (ctx.measureText(pTitle).width > 480 && titleFontSize > 16) {
          titleFontSize -= 2;
          ctx.font = "900 " + titleFontSize + "px Arial, sans-serif";
        }
        ctx.fillText(pTitle, 40, 135);

        ctx.fillStyle = taglineTextColor;
        ctx.font = "bold 14px Arial, sans-serif";
        ctx.fillText(tagline || "— Professional Performance. Business Ready. —", 40, 170);

        // Spec Cards (Left Column or Horizontal Row)
        const specStartY = isHorizontalSpecs ? footerY - 58 : 205;
        const specCardW = isHorizontalSpecs ? (W - 80) : 400;
        const specCardH = isHorizontalSpecs ? 48 : (specsList.length > 4 ? 42 : 48);
        const specSpaceY = isHorizontalSpecs ? 0 : (specsList.length > 4 ? 46 : 56);
        specsList.forEach((specText, idx) => {
          let currentX = 40;
          let currentY = specStartY + idx * specSpaceY;
          let currentW = specCardW;
          let currentH = specCardH;

          if (isHorizontalSpecs) {
            const cardCount = specsList.length;
            const gap = 12;
            const totalWidth = W - 80;
            currentW = (totalWidth - (cardCount - 1) * gap) / cardCount;
            currentX = 40 + idx * (currentW + gap);
            currentY = specStartY;
          }

          ctx.save();
          drawRoundedRect(ctx, currentX, currentY, currentW, currentH, 10);
          ctx.fillStyle = cardFill;
          ctx.fill();
          ctx.strokeStyle = cardOutline;
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.restore();

          const iconX = currentX + (isHorizontalSpecs ? 20 : 25);
          const iconCenterY = currentY + currentH / 2;
          ctx.fillStyle = getRgbaColor(activeAccent, 0.08);
          ctx.beginPath();
          ctx.arc(iconX, iconCenterY, isHorizontalSpecs ? 11 : (specsList.length > 4 ? 11 : 13), 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = activeAccent;
          ctx.lineWidth = 1.5;

          const specLabel = getSpecLabel(specText, idx);
          if (specLabel === "OS & SOFTWARE") {
            drawOsIcon(ctx, iconX, iconCenterY);
          } else if (specLabel === "WARRANTY") {
            drawShieldIcon(ctx, iconX, iconCenterY);
          } else if (specLabel === "INCLUDED") {
            drawPlugIcon(ctx, iconX, iconCenterY);
          } else if (specLabel === "GRAPHICS") {
            drawGearIcon(ctx, iconX, iconCenterY);
          } else if (specLabel === "PROCESSOR") {
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
          } else {
            ctx.beginPath();
            ctx.rect(iconX - 6, iconCenterY - 4, 12, 8);
            ctx.stroke();
          }

          const labelFontSize = isHorizontalSpecs ? 8 : (specsList.length > 4 ? 8 : 8.5);
          const textFontSize = isHorizontalSpecs ? 10.5 : (specsList.length > 4 ? 11.5 : 13);
          const gap = 3;
          const totalTextH = labelFontSize + gap + textFontSize;
          const topMargin = (currentH - totalTextH) / 2;
          const labelY = currentY + topMargin + labelFontSize;
          const valueY = labelY + gap + textFontSize;

          ctx.fillStyle = cardTextSub;
          ctx.font = `bold ${labelFontSize}px Arial, sans-serif`;
          ctx.fillText(specLabel, iconX + 22, labelY);

          ctx.fillStyle = cardTextMain;
          ctx.font = `bold ${textFontSize}px Arial, sans-serif`;
          ctx.fillText(specText, iconX + 22, valueY);
        });

        // Pedestal & Showcase coordinates (Responsive Layout Styles)
        if (props.imageMode === "grid3") {
          // Image 1 (Top)
          const cx1 = showX;
          const cy1 = showY - 80;
          const pW1 = pedestalW * 0.6;
          const pH1 = pedestalH * 0.6;
          drawPlatformItem(cx1, cy1, pW1, pH1);
          drawImageGridItem(
            processedImg,
            cx1,
            cy1,
            pW1 * 0.9,
            props.zoom,
            props.offsetX,
            props.offsetY,
            props.rotation,
            props.showProductShadow !== false,
            "Image 1 (Top)"
          );

          // Image 2 (Left)
          const cx2 = showX - pedestalW * 0.28;
          const cy2 = showY + 60;
          const pW2 = pedestalW * 0.45;
          const pH2 = pedestalH * 0.45;
          drawPlatformItem(cx2, cy2, pW2, pH2);
          drawImageGridItem(
            processedImg2,
            cx2,
            cy2,
            pW2 * 0.9,
            props.zoom2 || 1.0,
            props.offsetX2 || 0,
            props.offsetY2 || 0,
            props.rotation2 || 0,
            props.showProductShadow !== false,
            "Image 2 (Left)"
          );

          // Image 3 (Right)
          const cx3 = showX + pedestalW * 0.28;
          const cy3 = showY + 60;
          const pW3 = pedestalW * 0.45;
          const pH3 = pedestalH * 0.45;
          drawPlatformItem(cx3, cy3, pW3, pH3);
          drawImageGridItem(
            processedImg3,
            cx3,
            cy3,
            pW3 * 0.9,
            props.zoom3 || 1.0,
            props.offsetX3 || 0,
            props.offsetY3 || 0,
            props.rotation3 || 0,
            props.showProductShadow !== false,
            "Image 3 (Right)"
          );
        } else {
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

            // Draw soft radial backdrop shadow
            if (props.showProductShadow !== false) {
              ctx.save();
              const shadowRadius = Math.max(120, Math.min(drawW, drawH) * 0.75);
              const shadowGrad = ctx.createRadialGradient(
                showX + props.offsetX, showY + props.offsetY, 10,
                showX + props.offsetX, showY + props.offsetY, shadowRadius
              );
              shadowGrad.addColorStop(0, "rgba(15, 23, 42, 0.35)");
              shadowGrad.addColorStop(0.35, "rgba(15, 23, 42, 0.2)");
              shadowGrad.addColorStop(1, "rgba(15, 23, 42, 0)");
              ctx.fillStyle = shadowGrad;
              ctx.beginPath();
              ctx.arc(showX + props.offsetX, showY + props.offsetY, shadowRadius, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
            }

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
        }

        // Relocated Deal Tag & Accessories badges to footer pricing area
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

        // Bottom Section: Included Accessories Card
        const cardX = 50;
        const cardY = footerY + 25;
        drawIncludedAccessoriesCard(
          ctx,
          cardX,
          cardY,
          450,
          95,
          props.product.includedAccessory,
          props.isTamil,
          activeAccent,
          cardFill,
          cardOutline
        );

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
        if (qrImg && props.showQrCode !== false) {
          ctx.save();
          ctx.fillStyle = "white";
          drawRoundedRect(ctx, W - 145, footerY + 25, 95, 95, 8);
          ctx.fill();
          ctx.drawImage(qrImg, W - 140, footerY + 30, 85, 85);
          drawQrCodeCenterLogo(ctx, W - 140 + 42.5, footerY + 30 + 42.5, 11);
          
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

        const cleanAddr = showroomAddress.replace(/^([\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDC00-\uDFFF])\s*/g, "");
        ctx.fillStyle = "rgba(148, 163, 184, 0.85)";
        ctx.font = "bold 8.5px Arial, sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(cleanAddr, W - 40, H - 12);
        
        const addrWidth = ctx.measureText(cleanAddr).width;
        drawLocationPin(ctx, W - 40 - addrWidth - 10, H - 12);

        if (props.showEmi) {
          ctx.textAlign = "left";
          ctx.font = "bold 8.5px Arial, sans-serif";
          ctx.fillStyle = "rgba(148, 163, 184, 0.65)";
          ctx.fillText(props.isTamil ? "*நிபந்தனைகளுக்கு உட்பட்டது. EMI திட்டங்கள் நிதி நிறுவன ஒப்புதலுக்கு உட்பட்டது." : "*T&C Apply. EMI schemes subject to finance partner approval.", 40, H - 12);
        }
        
        ctx.textAlign = "left"; // Reset to default
      }

      // ----------------------------------------------------
      // BRANCH: SQUARE LAYOUT (1:1, 1080x1080) - DEFAULT FALLBACK
      // ----------------------------------------------------
      else {
        const isHorizontalSpecs = layoutStyle === "hero-center";
        let showX = isHorizontalSpecs ? W / 2 : 770;
        let showY = isHorizontalSpecs ? 400 : 475;
        let pedestalW = isHorizontalSpecs ? 500 : 420;
        let pedestalH = isHorizontalSpecs ? 90 : 80;
        // Branding Logo
        const headerX = 40;
        const headerY = 40;
        if (props.showLogo !== false) {
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
          ctx.font = "900 32px Arial, sans-serif";
          ctx.fillText(brandName, headerX + 105, headerY + 50);

          ctx.fillStyle = cardTextSub;
          ctx.font = "900 12px Arial, sans-serif";
          const subText = brandSubtext;
          let textX = headerX + 105;
          for (let i = 0; i < subText.length; i++) {
            ctx.fillText(subText[i], textX, headerY + 76);
            textX += 14.5;
          }
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
        ctx.fillStyle = titleTextColor;
        let titleFontSize = 42;
        ctx.font = "900 " + titleFontSize + "px Arial, sans-serif";
        const titleMaxWidth = props.showLogo !== false ? W - 380 : W - 100;
        while (ctx.measureText(pTitle).width > titleMaxWidth && titleFontSize > 18) {
          titleFontSize -= 2;
          ctx.font = "900 " + titleFontSize + "px Arial, sans-serif";
        }
        ctx.fillText(pTitle, W - 40, 180);

        ctx.fillStyle = taglineTextColor;
        ctx.font = "bold 17px Arial, sans-serif";
        ctx.fillText(tagline, W - 40, 225);
        ctx.textAlign = "left"; // reset

        // Spec Cards (Left Column or Horizontal Row)
        const specStartY = isHorizontalSpecs ? footerY - 92 : 270;
        const specCardW = isHorizontalSpecs ? (W - 80) : 460;
        const specCardH = isHorizontalSpecs ? 68 : (specsList.length > 4 ? 54 : 74);
        const specSpaceY = isHorizontalSpecs ? 0 : (specsList.length > 4 ? 64 : 88);
        specsList.forEach((specText, idx) => {
          let currentX = 40;
          let currentY = specStartY + idx * specSpaceY;
          let currentW = specCardW;
          let currentH = specCardH;

          if (isHorizontalSpecs) {
            const cardCount = specsList.length;
            const gap = 14;
            const totalWidth = W - 80;
            currentW = (totalWidth - (cardCount - 1) * gap) / cardCount;
            currentX = 40 + idx * (currentW + gap);
            currentY = specStartY;
          }

          ctx.save();
          ctx.shadowColor = "rgba(0,0,0,0.02)";
          ctx.shadowBlur = 6;
          ctx.shadowOffsetY = 2;
          drawRoundedRect(ctx, currentX, currentY, currentW, currentH, 16);
          ctx.fillStyle = cardFill;
          ctx.fill();
          ctx.strokeStyle = cardOutline;
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.restore();

          const iconX = currentX + (isHorizontalSpecs ? 20 : 35);
          const iconCenterY = currentY + currentH / 2;
          const iconRadius = isHorizontalSpecs ? 12 : (specsList.length > 4 ? 15 : 20);
          ctx.fillStyle = getRgbaColor(activeAccent, 0.08);
          ctx.beginPath();
          ctx.arc(iconX, iconCenterY, iconRadius, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = activeAccent;
          ctx.lineWidth = 1.5;

          const specLabel = getSpecLabel(specText, idx);
          if (specLabel === "OS & SOFTWARE") {
            drawOsIcon(ctx, iconX, iconCenterY);
          } else if (specLabel === "WARRANTY") {
            drawShieldIcon(ctx, iconX, iconCenterY);
          } else if (specLabel === "INCLUDED") {
            drawPlugIcon(ctx, iconX, iconCenterY);
          } else if (specLabel === "GRAPHICS") {
            drawGearIcon(ctx, iconX, iconCenterY);
          } else if (specLabel === "PROCESSOR") {
            ctx.beginPath();
            ctx.rect(iconX - 6, iconCenterY - 6, 12, 12);
            ctx.stroke();
          } else if (specLabel === "MEMORY") {
            ctx.beginPath();
            ctx.rect(iconX - 8, iconCenterY - 3, 16, 6);
            ctx.stroke();
          } else if (specLabel === "STORAGE") {
            ctx.beginPath();
            ctx.rect(iconX - 6, iconCenterY - 6, 12, 12);
            ctx.stroke();
          } else {
            ctx.beginPath();
            ctx.rect(iconX - 8, iconCenterY - 5, 16, 10);
            ctx.stroke();
          }
          const labelFontSize = isHorizontalSpecs ? 8.5 : (specsList.length > 4 ? 9.5 : 11);
          const textFontSize = isHorizontalSpecs ? 11.5 : (specsList.length > 4 ? 15 : 18);
          const gap = 4;
          const totalTextH = labelFontSize + gap + textFontSize;
          const topMargin = (currentH - totalTextH) / 2;
          const labelY = currentY + topMargin + labelFontSize;
          const valueY = labelY + gap + textFontSize;

          ctx.fillStyle = cardTextSub;
          ctx.font = `bold ${labelFontSize}px Arial, sans-serif`;
          ctx.fillText(specLabel, iconX + 26, labelY);

          ctx.fillStyle = cardTextMain;
          ctx.font = `bold ${textFontSize}px Arial, sans-serif`;
          ctx.fillText(specText, iconX + 26, valueY);
        });

        // Pedestal & Showcase coordinates (Responsive Layout Styles)
        if (props.imageMode === "grid3") {
          // Image 1 (Top)
          const cx1 = showX;
          const cy1 = showY - 110;
          const pW1 = pedestalW * 0.62;
          const pH1 = pedestalH * 0.62;
          drawPlatformItem(cx1, cy1, pW1, pH1);
          drawImageGridItem(
            processedImg,
            cx1,
            cy1,
            pW1 * 0.92,
            props.zoom,
            props.offsetX,
            props.offsetY,
            props.rotation,
            props.showProductShadow !== false,
            "Image 1 (Top)"
          );

          // Image 2 (Left)
          const cx2 = showX - pedestalW * 0.28;
          const cy2 = showY + 90;
          const pW2 = pedestalW * 0.48;
          const pH2 = pedestalH * 0.48;
          drawPlatformItem(cx2, cy2, pW2, pH2);
          drawImageGridItem(
            processedImg2,
            cx2,
            cy2,
            pW2 * 0.92,
            props.zoom2 || 1.0,
            props.offsetX2 || 0,
            props.offsetY2 || 0,
            props.rotation2 || 0,
            props.showProductShadow !== false,
            "Image 2 (Left)"
          );

          // Image 3 (Right)
          const cx3 = showX + pedestalW * 0.28;
          const cy3 = showY + 90;
          const pW3 = pedestalW * 0.48;
          const pH3 = pedestalH * 0.48;
          drawPlatformItem(cx3, cy3, pW3, pH3);
          drawImageGridItem(
            processedImg3,
            cx3,
            cy3,
            pW3 * 0.92,
            props.zoom3 || 1.0,
            props.offsetX3 || 0,
            props.offsetY3 || 0,
            props.rotation3 || 0,
            props.showProductShadow !== false,
            "Image 3 (Right)"
          );
        } else {
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

            // Draw soft radial backdrop shadow
            if (props.showProductShadow !== false) {
              ctx.save();
              const shadowRadius = Math.max(120, Math.min(drawW, drawH) * 0.75);
              const shadowGrad = ctx.createRadialGradient(
                showX + props.offsetX, showY + props.offsetY, 10,
                showX + props.offsetX, showY + props.offsetY, shadowRadius
              );
              shadowGrad.addColorStop(0, "rgba(15, 23, 42, 0.35)");
              shadowGrad.addColorStop(0.35, "rgba(15, 23, 42, 0.2)");
              shadowGrad.addColorStop(1, "rgba(15, 23, 42, 0)");
              ctx.fillStyle = shadowGrad;
              ctx.beginPath();
              ctx.arc(showX + props.offsetX, showY + props.offsetY, shadowRadius, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
            }

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
        }

        // Static badges with position // Relocated Deal Tag & Accessories badges to footer pricing area
        // Trust policies bar (Only shown in non-hero layouts to avoid horizontal card overlapping)
        if (!isHorizontalSpecs) {
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
              const cleanPolicy = policyText.replace(/^([\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDC00-\uDFFF])\s*/g, "");
              drawCheckmarkBullet(ctx, trustXCoords[idx], trustY + 38, cleanPolicy, 13);
            }
          });
        }

        // Bottom Section: Included Accessories Card
        const cardX = 60;
        const cardY = footerY + 45;
        drawIncludedAccessoriesCard(
          ctx,
          cardX,
          cardY,
          470,
          185,
          props.product.includedAccessory,
          props.isTamil,
          activeAccent,
          cardFill,
          cardOutline
        );

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

        const showQr = props.showQrCode !== false && qrImg;
        const contactRowW = showQr ? 290 : 430;

        // Primary Contact (Both WhatsApp & Call)
        ctx.fillStyle = "#f0fdf4";
        ctx.strokeStyle = "#bbf7d0";
        ctx.lineWidth = 1;
        drawRoundedRect(ctx, contactX + 20, contactY + 44, contactRowW, 52, 10);
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
        drawRoundedRect(ctx, contactX + 20, contactY + 110, contactRowW, 52, 10);
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
        if (showQr) {
          ctx.fillStyle = "#f1f5f9";
          drawRoundedRect(ctx, contactX + 330, contactY + 36, 110, 110, 8);
          ctx.fill();
          ctx.drawImage(qrImg, contactX + 335, contactY + 41, 100, 100);
          drawQrCodeCenterLogo(ctx, contactX + 385, contactY + 91, 12);
          
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

        if (isHorizontalSpecs) {
          const cleanPolicies = trustPolicies.map((p: string) => p.replace(/^([\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDC00-\uDFFF])\s*/g, ""));
          drawCheckmarkBullet(ctx, 60, footerLineY + 25, cleanPolicies[0] || "");
          drawCheckmarkBullet(ctx, W * 0.38, footerLineY + 25, cleanPolicies[1] || "");
          drawCheckmarkBullet(ctx, W * 0.70, footerLineY + 25, cleanPolicies[2] || "");
        } else {
          const checkmarks = props.isTamil
            ? ["தரம் வாய்ந்தவை", "மொத்த விலை", "வாழ்நாள் ஆதரவு", "100% திருப்தி"]
            : ["Quality Refurbished", "Wholesale Prices", "Lifetime Support", "100% Satisfaction"];
            
          drawCheckmarkBullet(ctx, 50, footerLineY + 25, checkmarks[0]);
          drawCheckmarkBullet(ctx, W * 0.30, footerLineY + 25, checkmarks[1]);
          drawCheckmarkBullet(ctx, W * 0.55, footerLineY + 25, checkmarks[2]);
          drawCheckmarkBullet(ctx, W * 0.80, footerLineY + 25, checkmarks[3]);
        }

        ctx.fillStyle = "rgba(148, 163, 184, 0.8)";
        ctx.font = "bold 12px Arial, sans-serif";
        ctx.textAlign = "center";
        
        const addrWidth = ctx.measureText(showroomAddress).width;
        const textStartX = W / 2 - addrWidth / 2;
        drawLocationPin(ctx, textStartX - 10, H - 25);
        ctx.textAlign = "left";
        ctx.fillText(showroomAddress, textStartX, H - 25);

        if (props.showEmi) {
          ctx.font = "bold 8.5px Arial, sans-serif";
          ctx.fillStyle = "rgba(148, 163, 184, 0.65)";
          ctx.textAlign = "center";
          ctx.fillText(props.isTamil ? "*நிபந்தனைகளுக்கு உட்பட்டது. EMI திட்டங்கள் நிதி நிறுவன ஒப்புதலுக்கு உட்பட்டது." : "*T&C Apply. EMI schemes subject to finance partner approval.", W / 2, H - 8);
        }
      }

      // ----------------------------------------------------
      // Export canvas drawing is now debounced in a hook above
      // to optimize drag slider performance.
      // ----------------------------------------------------
    };

    // Helper: Rupee comma formatter
    const formatRupee = (val: string) => {
      const cleanVal = val.split(".")[0];
      const num = cleanVal.replace(/\D/g, "");
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
        const dealTag = props.product.dealTag ? `\n🔥 ${props.product.dealTag.toUpperCase()}!` : "";
        const accessoryText = props.product.includedAccessory && props.product.includedAccessory.trim()
          ? props.product.includedAccessory
          : "Laptop Bag, Charger, Wired Mouse, Power Adapter";
        const accessoryStr = `\n🎁 FREE Included Accessories: ${accessoryText}`;
        const specsList = props.product.specs || [];
        const customPhone = props.phoneSupport || "+91 87780 03397";
        const customWhatsApp = props.whatsappChat || "+91 79041 08020";

        let specsStr = "";
        specsList.forEach(s => {
          if (s) specsStr += `\n⚙️ • ${s}`;
        });

        return `🔥 DAILY DEAL AT SAI SYSTEMS! 🔥
💻 ${title.toUpperCase()} — Premium ${category} Deal! ${dealTag}

⚙️ Specifications:${specsStr}${accessoryStr}

🛡️ 365-Day Warranty | 100% Genuine Spare Parts Included

📍 Showroom: PAA Building, Y.M.R Patty, Dindigul (Near Head Post Office)
📞 Call Support: ${customPhone}
💬 WhatsApp Order: ${customWhatsApp}
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
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="max-h-[500px] max-w-full h-auto w-auto object-contain select-none rounded-xl cursor-grab active:cursor-grabbing"
            style={{ display: "block" }}
          />
          {/* Real image overlay for mobile long-press copy and save support */}
          {imgSrc && (
            <img
              src={imgSrc}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={handleMouseUpOrLeave}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="absolute top-0 bottom-0 left-0 right-0 m-auto max-h-[500px] max-w-full h-auto w-auto object-contain cursor-grab active:cursor-grabbing select-none opacity-0"
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
          {removeBgProcessing && !imageLoading && (
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-center gap-2.5 text-white text-xs">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="font-semibold text-orange-300">AI Removing Background...</span>
              <span className="text-[10px] text-slate-400">This takes 5–15 sec on first use</span>
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
