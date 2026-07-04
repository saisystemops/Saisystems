import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { defaultProducts } from "@/lib/data/default-products";

export async function GET() {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) {
      return NextResponse.json(defaultProducts);
    }

    // Map database keys to frontend schema (e.g. original_price -> originalPrice)
    const mapped = data.map((item) => ({
      id: item.id,
      category: item.category,
      title: item.title,
      description: item.description || "",
      price: item.price,
      originalPrice: item.original_price || "",
      badge: item.badge || "",
      specs: Array.isArray(item.specs) ? item.specs : [],
      inStock: item.in_stock !== false, // Defaults to true if not specified
      imageUrl: item.image_url || "",
    }));

    // Filter out products that are out of stock
    const activeProducts = mapped.filter((p) => p.inStock);

    return NextResponse.json(activeProducts);
  } catch (err) {
    console.error("Fetch products API error:", err);
    // Static compile-time fallbacks are always active/in-stock
    return NextResponse.json(defaultProducts);
  }
}
export const dynamic = "force-dynamic";
