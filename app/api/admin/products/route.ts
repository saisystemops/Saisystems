import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { Product } from "@/lib/data/default-products";

import { verifySession } from "@/lib/auth-secure";

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
  estimate_price?: number | null;
  notes?: string | null;
}

function checkAuth(req: NextRequest): boolean {
  const sessionInfo = verifySession(req);
  return sessionInfo.valid;
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
    const { error: blogErr } = await supabase.from("blogs").select("id").limit(1);

    const productsTableReady = !prodErr || (prodErr.code !== "PGRST116" && !prodErr.message?.includes("does not exist"));
    const adminUsersTableReady = !userErr || (userErr.code !== "PGRST116" && !userErr.message?.includes("does not exist"));
    const blogsTableReady = !blogErr || (blogErr.code !== "PGRST116" && !blogErr.message?.includes("does not exist"));

    // Fetch tickets & leads
    let tickets: Ticket[] = [];
    const { data: ticketData, error: ticketErr } = await supabase
      .from("tickets")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (!ticketErr && ticketData) {
      tickets = ticketData.map((item: any) => ({
        id: item.id,
        ticket_ref: item.ticket_ref,
        title: item.title,
        description: item.description,
        customer_name: item.customer_name,
        customer_contact_phone: item.customer_contact_phone,
        category: "ticket",
        priority: item.priority || "normal",
        status: item.status || "new",
        site_city: item.site_city || "Online Chat",
        created_at: item.created_at,
        estimate_price: item.estimate_price,
        notes: item.notes,
      }));
    }

    // Fetch form quote leads
    let leads: Ticket[] = [];
    const { data: leadData, error: leadErr } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (!leadErr && leadData) {
      leads = leadData.map((lead) => ({
        id: lead.id,
        ticket_ref: `LEAD-${String(lead.id).substring(0, 4).toUpperCase()}`,
        title: `Free Quote: ${lead.service_type} (${lead.brand})`,
        description: lead.problem_description || "",
        customer_name: lead.name,
        customer_contact_phone: lead.mobile,
        category: "lead",
        priority: "medium",
        status: lead.status || "new",
        site_city: lead.email || "Website Form",
        created_at: lead.created_at,
        estimate_price: lead.estimate_price,
        notes: lead.notes,
      }));
    }

    // Fetch appointments bookings
    let appointments: Ticket[] = [];
    const { data: apptData, error: apptErr } = await supabase
      .from("appointments")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (!apptErr && apptData) {
      appointments = apptData.map((item) => ({
        id: item.id,
        ticket_ref: item.booking_ref,
        title: `Appointment: ${item.service_type} (${item.brand} ${item.model || ""})`,
        description: `${item.problem_description || "Doorstep service booking"}\nTime: ${item.appointment_date} at ${item.time_slot}`,
        customer_name: item.customer_name,
        customer_contact_phone: item.customer_mobile,
        category: "appointment",
        priority: "high",
        status: item.status || "pending",
        site_city: `${item.service_mode} service`,
        created_at: item.created_at,
        estimate_price: item.estimate_price,
        notes: item.notes,
      }));
    }

    // Combine and sort by created_at descending (newest first)
    const combinedTickets = [...tickets, ...leads, ...appointments].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // Fetch full products list — with column-error resilience
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
        whatsappLink: item.whatsapp_link || "",
        dealTag: item.deal_tag || "",
      }));
    } else if (fetchProdErr && (fetchProdErr.code === "42703" || fetchProdErr.message?.includes("column"))) {
      // One or more columns missing (e.g. deal_tag, whatsapp_link) — retry with safe core columns only
      console.warn("Column error fetching products, retrying with safe columns:", fetchProdErr.message);
      const { data: safeData } = await supabase
        .from("products")
        .select("id, category, title, description, price, original_price, badge, specs, in_stock, image_url")
        .order("created_at", { ascending: false });
      if (safeData) {
        products = safeData.map((item) => ({
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
          whatsappLink: "",
          dealTag: "",
        }));
      }
    }


    return NextResponse.json({
      dbStatus: {
        productsTable: productsTableReady ? "ready" : "missing",
        adminUsersTable: adminUsersTableReady ? "ready" : "missing",
        blogsTable: blogsTableReady ? "ready" : "missing",
      },
      tickets: combinedTickets,
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
      const { category, title, description, price, originalPrice, badge, specs, inStock, imageUrl, whatsappLink } = product;

      // Auto-generate a unique ID based on title + millisecond timestamp
      // This guarantees every product insert is unique, even same-named products
      const baseId = (title || "product")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
        .substring(0, 30);
      const uniqueId = `${baseId}-${Date.now()}`;

      // Stage 1: Full insert with all columns
      let { error } = await supabase.from("products").insert({
        id: uniqueId,
        category,
        title,
        description,
        price,
        original_price: originalPrice,
        badge,
        specs: Array.isArray(specs) ? specs : [],
        in_stock: inStock !== false,
        image_url: imageUrl || "",
        whatsapp_link: whatsappLink || "",
        deal_tag: product.dealTag || "",
      });

      // Stage 2: Fallback without deal_tag if that column is missing
      if (error && (error.code === "42703" || error.message?.includes("deal_tag"))) {
        console.warn("deal_tag column missing, retrying without it:", error.message);
        const retry2 = await supabase.from("products").insert({
          id: uniqueId,
          category,
          title,
          description,
          price,
          original_price: originalPrice,
          badge,
          specs: Array.isArray(specs) ? specs : [],
          in_stock: inStock !== false,
          image_url: imageUrl || "",
          whatsapp_link: whatsappLink || "",
        });
        error = retry2.error;
      }

      // Stage 3: Fallback without whatsapp_link if that column is also missing
      if (error && (error.code === "42703" || error.message?.includes("whatsapp_link"))) {
        console.warn("whatsapp_link column missing, retrying without it:", error.message);
        const retry3 = await supabase.from("products").insert({
          id: uniqueId,
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
        error = retry3.error;
      }

      if (error) {
        console.error("Product insert final error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, id: uniqueId });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("Admin create API error:", err);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}

// PUT: Edit a product (also used for stock toggle)
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

    // Stage 1: Full update with all columns — targets ONLY this product's ID
    let { error } = await supabase
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
        whatsapp_link: product.whatsappLink || "",
        deal_tag: product.dealTag || "",
      })
      .eq("id", product.id); // ← strictly targets one row only by unique ID

    // Stage 2: Fallback without deal_tag if that column is missing
    if (error && (error.code === "42703" || error.message?.includes("deal_tag"))) {
      console.warn("deal_tag column missing on update, retrying without it:", error.message);
      const retry2 = await supabase
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
          whatsapp_link: product.whatsappLink || "",
        })
        .eq("id", product.id);
      error = retry2.error;
    }

    // Stage 3: Fallback without whatsapp_link if that column is also missing
    if (error && (error.code === "42703" || error.message?.includes("whatsapp_link"))) {
      console.warn("whatsapp_link column missing on update, retrying without it:", error.message);
      const retry3 = await supabase
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
      error = retry3.error;
    }

    if (error) {
      console.error("Product update final error:", error);
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
