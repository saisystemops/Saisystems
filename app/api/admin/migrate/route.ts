import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { verifySession } from "@/lib/auth-secure";

function checkAuth(req: NextRequest): boolean {
  const sessionInfo = verifySession(req);
  return sessionInfo.valid;
}

/**
 * GET /api/admin/migrate
 * Runs safe one-time migrations to add missing columns to existing tables.
 * This is idempotent — safe to call multiple times (IF NOT EXISTS).
 */
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerClient();
  const results: { migration: string; status: string; error?: string }[] = [];

  // Migration 1: Add deal_tag column to products table
  try {
    const { error } = await supabase.rpc("exec_sql", {
      sql: "ALTER TABLE products ADD COLUMN IF NOT EXISTS deal_tag TEXT DEFAULT '';",
    });
    if (error) {
      // Supabase may not expose exec_sql by default; try direct insert check instead
      results.push({ migration: "add deal_tag column", status: "rpc_unavailable", error: error.message });
    } else {
      results.push({ migration: "add deal_tag column", status: "success" });
    }
  } catch (err: unknown) {
    results.push({ migration: "add deal_tag column", status: "error", error: String(err) });
  }

  // Migration 2: Verify whatsapp_link column exists on products table
  try {
    // Test by attempting to select that column
    const { error } = await supabase.from("products").select("whatsapp_link").limit(1);
    if (error && error.code === "42703") {
      results.push({ migration: "check whatsapp_link column", status: "MISSING — run SQL manually", error: error.message });
    } else {
      results.push({ migration: "check whatsapp_link column", status: "exists ✓" });
    }
  } catch (err: unknown) {
    results.push({ migration: "check whatsapp_link column", status: "error", error: String(err) });
  }

  // Migration 3: Verify deal_tag column exists on products table
  try {
    const { error } = await supabase.from("products").select("deal_tag").limit(1);
    if (error && error.code === "42703") {
      results.push({ migration: "check deal_tag column", status: "MISSING — run SQL manually", error: error.message });
    } else {
      results.push({ migration: "check deal_tag column", status: "exists ✓" });
    }
  } catch (err: unknown) {
    results.push({ migration: "check deal_tag column", status: "error", error: String(err) });
  }

  // Migration 4: Verify included_accessory column exists on products table
  try {
    const { error } = await supabase.from("products").select("included_accessory").limit(1);
    if (error && error.code === "42703") {
      results.push({ migration: "check included_accessory column", status: "MISSING — run SQL manually", error: error.message });
    } else {
      results.push({ migration: "check included_accessory column", status: "exists ✓" });
    }
  } catch (err: unknown) {
    results.push({ migration: "check included_accessory column", status: "error", error: String(err) });
  }

  const needsManualSQL = results.some((r) => r.status.includes("MISSING"));

  const sqlToRun: string[] = [];
  if (results.find(r => r.migration === "check whatsapp_link column" && r.status.includes("MISSING"))) {
    sqlToRun.push("ALTER TABLE products ADD COLUMN IF NOT EXISTS whatsapp_link TEXT DEFAULT '';");
  }
  if (results.find(r => r.migration === "check deal_tag column" && r.status.includes("MISSING"))) {
    sqlToRun.push("ALTER TABLE products ADD COLUMN IF NOT EXISTS deal_tag TEXT DEFAULT '';");
  }
  if (results.find(r => r.migration === "check included_accessory column" && r.status.includes("MISSING"))) {
    sqlToRun.push("ALTER TABLE products ADD COLUMN IF NOT EXISTS included_accessory TEXT DEFAULT '';");
  }

  return NextResponse.json({
    message: needsManualSQL
      ? "⚠️ Some columns are missing. Run the SQL commands below in your Supabase SQL Editor."
      : "✅ All columns verified. Database is ready.",
    manualSQL: sqlToRun,
    results,
  });
}

export const dynamic = "force-dynamic";
