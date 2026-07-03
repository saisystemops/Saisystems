import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const SEED_ESTIMATES = [
  { service: "Laptop Repair", brand: "HP", price: "₹2,500 – ₹5,500", time: "Same Day", warranty: "365-day warranty" },
  { service: "Laptop Repair", brand: "Dell", price: "₹2,500 – ₹6,000", time: "Same Day", warranty: "365-day warranty" },
  { service: "Laptop Repair", brand: "Lenovo", price: "₹2,500 – ₹5,500", time: "Same Day", warranty: "365-day warranty" },
  { service: "Laptop Repair", brand: "Apple", price: "₹6,000 – ₹15,000", time: "1-2 Days", warranty: "180-day warranty" },
  { service: "Laptop Repair", brand: "Other", price: "₹2,500 – ₹7,000", time: "Same Day", warranty: "365-day warranty" },

  { service: "Screen Repair", brand: "HP", price: "₹2,800 – ₹5,500", time: "Same Day", warranty: "365-day warranty" },
  { service: "Screen Repair", brand: "Dell", price: "₹2,800 – ₹6,000", time: "Same Day", warranty: "365-day warranty" },
  { service: "Screen Repair", brand: "Lenovo", price: "₹2,800 – ₹5,800", time: "Same Day", warranty: "365-day warranty" },
  { service: "Screen Repair", brand: "Apple", price: "₹7,500 – ₹18,000", time: "1-2 Days", warranty: "180-day warranty" },
  { service: "Screen Repair", brand: "Other", price: "₹2,500 – ₹8,000", time: "Same Day", warranty: "365-day warranty" },

  { service: "Motherboard Repair", brand: "HP", price: "₹3,500 – ₹7,500", time: "1-2 Days", warranty: "90-day warranty" },
  { service: "Motherboard Repair", brand: "Dell", price: "₹3,500 – ₹8,000", time: "1-2 Days", warranty: "90-day warranty" },
  { service: "Motherboard Repair", brand: "Lenovo", price: "₹3,550 – ₹7,500", time: "1-2 Days", warranty: "90-day warranty" },
  { service: "Motherboard Repair", brand: "Apple", price: "₹7,000 – ₹16,000", time: "2-4 Days", warranty: "90-day warranty" },
  { service: "Motherboard Repair", brand: "Other", price: "₹3,000 – ₹12,000", time: "1-2 Days", warranty: "90-day warranty" },

  { service: "SSD Upgrade", brand: "HP", price: "₹3,500 – ₹4,800", time: "1 Hour", warranty: "3-year manufacturer warranty" },
  { service: "SSD Upgrade", brand: "Dell", price: "₹3,500 – ₹5,000", time: "1 Hour", warranty: "3-year manufacturer warranty" },
  { service: "SSD Upgrade", brand: "Lenovo", price: "₹3,500 – ₹4,800", time: "1 Hour", warranty: "3-year manufacturer warranty" },
  { service: "SSD Upgrade", brand: "Apple", price: "₹5,500 – ₹12,000", time: "2-4 Hours", warranty: "1-year warranty" },
  { service: "SSD Upgrade", brand: "Other", price: "₹3,200 – ₹5,000", time: "1 Hour", warranty: "3-year manufacturer warranty" },
];

function getLocalCachePath() {
  return path.join(process.cwd(), "src", "lib", "data", "estimates.json");
}

function readLocalCache(): typeof SEED_ESTIMATES {
  const filePath = getLocalCachePath();
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("Failed to read local pricing cache, regenerating...", err);
  }
  writeLocalCache(SEED_ESTIMATES);
  return SEED_ESTIMATES;
}

function writeLocalCache(data: typeof SEED_ESTIMATES) {
  const filePath = getLocalCachePath();
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write local pricing cache:", err);
  }
}

function checkAuth(req: NextRequest): boolean {
  const session = req.cookies.get("admin_session")?.value;
  return !!session;
}

// GET: Fetch estimator price rules
export async function GET() {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const { createServerClient } = await import("@/lib/supabase");
      const supabase = createServerClient();
      const { data, error } = await supabase
        .from("estimator_prices")
        .select("service, brand, price, time, warranty")
        .order("service", { ascending: true });

      if (!error && data && data.length > 0) {
        return NextResponse.json(data);
      }
    } catch (dbErr) {
      console.error("Failed connecting to Supabase database, falling back to local file:", dbErr);
    }
  }

  const localPrices = readLocalCache();
  return NextResponse.json(localPrices);
}

// POST: Add, Edit, or Sync Estimator Price rules
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, service, brand, price, time, warranty } = body;

    // Seeding trigger
    if (action === "sync_defaults") {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        try {
          const { createServerClient } = await import("@/lib/supabase");
          const supabase = createServerClient();
          
          await supabase.from("estimator_prices").delete().neq("service", "keep-none");
          const { error } = await supabase.from("estimator_prices").insert(SEED_ESTIMATES);
          if (error) {
            return NextResponse.json({ error: `Sync failed: ${error.message}` }, { status: 500 });
          }
        } catch (dbErr) {
          console.error("Database connection failure on price sync:", dbErr);
        }
      }
      writeLocalCache(SEED_ESTIMATES);
      return NextResponse.json({ success: true, message: "Default prices synced" });
    }

    if (!service || !brand || !price || !time || !warranty) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Try to upsert to Supabase
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const { createServerClient } = await import("@/lib/supabase");
        const supabase = createServerClient();
        await supabase.from("estimator_prices").upsert(
          {
            service,
            brand,
            price,
            time,
            warranty,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "service,brand" }
        );
      } catch (dbErr) {
        console.error("Database connection failure on price save:", dbErr);
      }
    }

    // 2. Always write to local file system cache (keeps local environment in sync)
    const localPrices = readLocalCache();
    const existingIndex = localPrices.findIndex(
      (item) =>
        item.service.toLowerCase() === service.toLowerCase() &&
        item.brand.toLowerCase() === brand.toLowerCase()
    );

    if (existingIndex !== -1) {
      localPrices[existingIndex] = { service, brand, price, time, warranty };
    } else {
      localPrices.push({ service, brand, price, time, warranty });
    }

    writeLocalCache(localPrices);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error saving price detail:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE: Delete estimator price rule
export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const service = searchParams.get("service");
    const brand = searchParams.get("brand");

    if (!service || !brand) {
      return NextResponse.json({ error: "Service and brand required" }, { status: 400 });
    }

    // 1. Delete from Supabase
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const { createServerClient } = await import("@/lib/supabase");
        const supabase = createServerClient();
        await supabase.from("estimator_prices").delete().eq("service", service).eq("brand", brand);
      } catch (dbErr) {
        console.error("Database connection failure on price delete:", dbErr);
      }
    }

    // 2. Delete from local cache
    const localPrices = readLocalCache();
    const filtered = localPrices.filter(
      (p) => !(p.service.toLowerCase() === service.toLowerCase() && p.brand.toLowerCase() === brand.toLowerCase())
    );
    writeLocalCache(filtered);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Estimator delete error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
export const dynamic = "force-dynamic";
