import type { Metadata } from "next";
import HeroSection from "@/components/home/HeroSection";
import ProductCatalogSection from "@/components/home/ProductCatalogSection";
import CCTVInteractive from "@/components/home/CCTVInteractive";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import BrandsSection from "@/components/home/BrandsSection";
import LeadForm from "@/components/home/LeadForm";
import Testimonials from "@/components/home/Testimonials";
import FAQAccordion from "@/components/home/FAQAccordion";
import BlogPreview from "@/components/home/BlogPreview";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: `${siteConfig.name} | Refurbished Laptops, Desktops, CCTV & IT Services Dindigul`,
  description: siteConfig.description,
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ProductCatalogSection />
      <CCTVInteractive />
      <WhyChooseUs />
      <BrandsSection />
      <LeadForm />
      <Testimonials />
      <FAQAccordion limit={10} />
      <BlogPreview />
    </>
  );
}
