// Analytics utilities — GA4, GTM, Meta Pixel, Microsoft Clarity
"use client";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    fbq?: (...args: unknown[]) => void;
    clarity?: (action: string, ...args: unknown[]) => void;
  }
}

// ── Google Analytics 4 ──────────────────────────────────────────────────────

export function trackEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, params);
  }
}

// ── Specific Tracking Events ─────────────────────────────────────────────────

export function trackCallClick(phone: string) {
  trackEvent("call_click", { phone_number: phone });
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("trackCustom", "CallClick", { phone });
  }
}

export function trackWhatsAppClick(message: string) {
  trackEvent("whatsapp_click", { message_type: message });
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("trackCustom", "WhatsAppClick", { message });
  }
}

export function trackBookingClick(service?: string) {
  trackEvent("booking_click", { service_type: service });
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("Lead", { service });
  }
}

export function trackFormSubmit(formName: string, data?: Record<string, unknown>) {
  trackEvent("form_submit", { form_name: formName, ...data });
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("Lead", { form_name: formName });
  }
}

export function trackQuoteRequest(service?: string) {
  trackEvent("quote_request", { service_type: service });
}

export function trackAIChatMessage(messageCount: number) {
  trackEvent("ai_chat_message", { message_count: messageCount });
}

export function trackVideoPlay(videoTitle: string) {
  trackEvent("video_play", { video_title: videoTitle });
}

export function trackPageView(url: string, title: string) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("config", process.env.NEXT_PUBLIC_GA4_ID || "", {
      page_path: url,
      page_title: title,
    });
  }
}
