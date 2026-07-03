"use client";
import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import StickyBottomBar from "@/components/layout/StickyBottomBar";
import AIChatWidget from "@/components/ai/AIChatWidget";
import WebsiteCustomizer from "@/components/layout/WebsiteCustomizer";

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <main>{children}</main>;
  }

  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <WhatsAppButton />
      <AIChatWidget />
      <StickyBottomBar />
      <WebsiteCustomizer />
    </>
  );
}
