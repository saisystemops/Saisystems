import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { defaultProducts } from "@/lib/data/default-products";

function mapProductRow(item: Record<string, unknown>) {
  return {
    id: item.id as string,
    category: item.category as string,
    title: item.title as string,
    description: (item.description as string) || "",
    price: item.price as string,
    originalPrice: (item.original_price as string) || "",
    badge: (item.badge as string) || "",
    specs: Array.isArray(item.specs) ? (item.specs as string[]) : [],
    inStock: item.in_stock !== false,
    imageUrl: (item.image_url as string) || "",
    whatsappLink: (item.whatsapp_link as string) || "",
    dealTag: (item.deal_tag as string) || "",
    includedAccessory: (item.included_accessory as string) || "",
  };
}

export async function GET() {
  const supabase = createServerClient();

  // Stage 1: Try full query with all columns
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (!error && data) {
    // Success — map and return real DB products
    try {
      const mapped = data.map(mapProductRow);
      return NextResponse.json(mapped.filter((p) => p.inStock));
    } catch (mapErr) {
      console.error("Error mapping product rows:", mapErr);
    }
  }

  // Stage 2: If error is a missing column (42703), retry with only safe core columns
  // This prevents ALL products from disappearing just because a new column hasn't been added yet
  if (error && (error.code === "42703" || error.message?.includes("column"))) {
    console.warn("Column error on products table, falling back to safe column query:", error.message);
    const { data: safeData, error: safeError } = await supabase
      .from("products")
      .select("id, category, title, description, price, original_price, badge, specs, in_stock, image_url")
      .order("created_at", { ascending: false });

    if (!safeError && safeData) {
      const mapped = safeData.map((item) => ({
        id: item.id as string,
        category: item.category as string,
        title: item.title as string,
        description: (item.description as string) || "",
        price: item.price as string,
        originalPrice: (item.original_price as string) || "",
        badge: (item.badge as string) || "",
        specs: Array.isArray(item.specs) ? (item.specs as string[]) : [],
        inStock: item.in_stock !== false,
        imageUrl: (item.image_url as string) || "",
        whatsappLink: "",
        dealTag: "",
        includedAccessory: "",
      }));
      return NextResponse.json(mapped.filter((p) => p.inStock));
    }
  }

  // Stage 3: Table missing or unrecoverable error — use static fallback
  console.error("Products table unavailable, using static defaults. Supabase error:", error?.message);
  return NextResponse.json(defaultProducts);
}
export const dynamic = "force-dynamic";
