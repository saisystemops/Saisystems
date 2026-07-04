import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { Product } from "@/lib/data/default-products";

interface Ticket {
  id: string;
  ticket_ref: string;
  title: string;
  description: string;
  customer_name: string | null;
  customer_contact_phone: string | null;
  category: string;
  priority: string;
  status: string;
  site_city: string;
  created_at: string;
}

function checkAuth(req: NextRequest): boolean {
  const session = req.cookies.get("admin_session")?.value;
  return !!session;
}

// GET: Check Supabase status, load tickets, and fetch full products list
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createServerClient();

    // Check if tables exist
    const { error: prodErr } = await supabase.from("products").select("id").limit(1);
    const { error: userErr } = await supabase.from("admin_users").select("id").limit(1);

    const productsTableReady = !prodErr || (prodErr.code !== "PGRST116" && !prodErr.message?.includes("does not exist"));
    const adminUsersTableReady = !userErr || (userErr.code !== "PGRST116" && !userErr.message?.includes("does not exist"));

    // Fetch tickets & leads
    let tickets: Ticket[] = [];
    const { data: ticketData, error: ticketErr } = await supabase
      .from("tickets")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (!ticketErr && ticketData) {
      tickets = ticketData as unknown as Ticket[];
    }

    // Fetch full products list
    let products: Product[] = [];
    const { data: prodData, error: fetchProdErr } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (!fetchProdErr && prodData) {
      products = prodData.map((item) => ({
        id: item.id,
        category: item.category,
        title: item.title,
        description: item.description || "",
        price: item.price,
        originalPrice: item.original_price || "",
        badge: item.badge || "",
        specs: Array.isArray(item.specs) ? item.specs : [],
        inStock: item.in_stock !== false,
        imageUrl: item.image_url || "",
      }));
    }

    return NextResponse.json({
      dbStatus: {
        productsTable: productsTableReady ? "ready" : "missing",
        adminUsersTable: adminUsersTableReady ? "ready" : "missing",
      },
      tickets,
      products,
    });
  } catch (err) {
    console.error("Admin GET status/products API error:", err);
    return NextResponse.json({ error: "Failed to fetch database status" }, { status: 500 });
  }
}

// POST: Create a product
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, product } = body;
    const supabase = createServerClient();

    if (action === "create" && product) {
      const { id, category, title, description, price, originalPrice, badge, specs, inStock, imageUrl } = product;

      // Clean up any existing product with this ID to prevent duplicate keys
      await supabase.from("products").delete().eq("id", id);

      const { error } = await supabase.from("products").insert({
        id,
        category,
        title,
        description,
        price,
        original_price: originalPrice,
        badge,
        specs: Array.isArray(specs) ? specs : [],
        in_stock: inStock !== false,
        image_url: imageUrl || "",
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, id });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("Admin create API error:", err);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}

// PUT: Edit a product
export async function PUT(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { product } = await req.json();
    if (!product || !product.id) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    const supabase = createServerClient();
    const { error } = await supabase
      .from("products")
      .update({
        category: product.category,
        title: product.title,
        description: product.description,
        price: product.price,
        original_price: product.originalPrice,
        badge: product.badge,
        specs: Array.isArray(product.specs) ? product.specs : [],
        in_stock: product.inStock !== false,
        image_url: product.imageUrl || "",
      })
      .eq("id", product.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admin edit API error:", err);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

// DELETE: Delete a product
export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    const supabase = createServerClient();
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admin delete API error:", err);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
export const dynamic = "force-dynamic";
