import type { Metadata } from "next";
import ProductsClient from "@/components/products/ProductsClient";

export const metadata: Metadata = {
  title: "Products | Sai Systems",
  description: "Buy new laptops, refurbished laptops, second-hand laptops, and computer accessories from Sai Systems. HP, Dell, Lenovo, Acer, Asus, and more.",
  alternates: { canonical: "/products" },
};

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 pt-24">
      <div className="gradient-dark py-16 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Our <span className="text-gradient">Products</span>
        </h1>
        <p className="text-gray-300 max-w-2xl mx-auto">
          New laptops, refurbished systems, second-hand laptops, and accessories — all quality-checked with warranty.
        </p>
      </div>

      <ProductsClient />
    </div>
  );
}

