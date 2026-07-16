import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth-secure";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

interface ParsedDeal {
  title: string;
  price: string;
  originalPrice: string;
  dealTag: string;
  includedAccessory: string;
  badge: string;
  specs: string[];
}

// Regex fallback parser for local setups without Gemini key
function parseDealRegex(text: string): ParsedDeal {
  const t = text.toLowerCase();
  
  // Extract processor
  let cpu = "";
  if (t.includes("i5") || t.includes("core i5")) {
    const genMatch = text.match(/(\d+)(th|rd|nd|st)\s*(gen|generation)/i);
    cpu = `Intel Core i5 ${genMatch ? genMatch[0] : "Processor"}`;
  } else if (t.includes("i7") || t.includes("core i7")) {
    const genMatch = text.match(/(\d+)(th|rd|nd|st)\s*(gen|generation)/i);
    cpu = `Intel Core i7 ${genMatch ? genMatch[0] : "Processor"}`;
  } else if (t.includes("i3") || t.includes("core i3")) {
    const genMatch = text.match(/(\d+)(th|rd|nd|st)\s*(gen|generation)/i);
    cpu = `Intel Core i3 ${genMatch ? genMatch[0] : "Processor"}`;
  } else if (t.includes("ryzen")) {
    const ryzenMatch = text.match(/ryzen\s*\d+\s*\w*/i);
    cpu = ryzenMatch ? ryzenMatch[0] : "AMD Ryzen Processor";
  } else if (t.includes("m1")) {
    cpu = "Apple M1 Chip";
  } else if (t.includes("m2")) {
    cpu = "Apple M2 Chip";
  } else {
    cpu = "Intel Dual Core Processor";
  }

  // Extract RAM
  let ram = "8GB DDR4 RAM";
  const ramMatch = text.match(/(\d+)\s*(gb|g)\s*(ram|ddr)/i);
  if (ramMatch) {
    ram = `${ramMatch[1]}GB DDR4 RAM`;
  }

  // Extract Storage
  let storage = "256GB SSD Storage";
  const ssdMatch = text.match(/(\d+)\s*(gb|tb|g|t)\s*(ssd|nvme|m\.2)/i);
  const hddMatch = text.match(/(\d+)\s*(gb|tb|g|t)\s*(hdd|sata|hard\s*disk)/i);
  if (ssdMatch) {
    storage = `${ssdMatch[1]}${ssdMatch[2].toUpperCase()} NVMe SSD`;
  } else if (hddMatch) {
    storage = `${hddMatch[1]}${hddMatch[2].toUpperCase()} SATA HDD`;
  }

  // Extract Connectivity/Screen/Camera
  const screenMatch = text.match(/(\d+(\.\d+)?)\s*(inch|")/i);
  const display = screenMatch ? `${screenMatch[1]}-inch Display` : "14\" FHD Display";
  
  let wifi = "Wi-Fi (Built-in)";
  if (t.includes("wifi 6") || t.includes("wifi-6")) {
    wifi = "Wi-Fi 6 Support";
  }

  // Build specifications list
  const specs = [cpu, ram, storage, display, wifi].filter(Boolean);

  // Extract Price (find the lowest and highest price digits)
  let price = "";
  let originalPrice = "";
  
  // Find numbers like 28000, 38,000, rs 25000, etc.
  const priceMatches = text.replace(/,/g, "").match(/(?:rs|₹)?\s*(\d{4,5})\b/gi);
  if (priceMatches && priceMatches.length > 0) {
    const prices = priceMatches.map(m => parseInt(m.replace(/\D/g, ""), 10)).sort((a, b) => a - b);
    if (prices.length >= 2) {
      price = String(prices[0]);
      originalPrice = String(prices[1]);
    } else if (prices.length === 1) {
      price = String(prices[0]);
    }
  }

  // Extract Title (look at first line or brand name)
  let title = "Refurbished Laptop";
  const brands = ["dell", "hp", "lenovo", "thinkpad", "macbook", "asus", "acer", "msi", "toshiba"];
  for (const brand of brands) {
    if (t.includes(brand)) {
      const idx = t.indexOf(brand);
      const sub = text.substring(idx, idx + 25);
      title = sub.split(/[,\n]/)[0].trim();
      // capitalize
      title = title.replace(/\b\w/g, c => c.toUpperCase());
      break;
    }
  }

  return {
    title: title || "Refurbished Laptop",
    price: price || "25000",
    originalPrice: originalPrice || "",
    dealTag: t.includes("hot") ? "🔥 HOT DEAL" : t.includes("special") ? "⚡ SPECIAL OFFER" : "Refurbished",
    includedAccessory: t.includes("bag") ? "🎁 FREE Laptop Bag" : t.includes("mouse") ? "🎁 FREE Mouse" : "",
    badge: "🛡️ 365-Day Warranty",
    specs: specs.slice(0, 5)
  };
}

export async function POST(req: NextRequest) {
  // Verify administrator session
  const sessionInfo = verifySession(req);
  if (!sessionInfo.valid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { text } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Invalid text input" }, { status: 400 });
    }

    // If Gemini API Key is configured, use Gemini to parse
    if (GEMINI_API_KEY) {
      try {
        const { GoogleGenerativeAI } = await import("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const systemPrompt = `You are a professional IT inventory parsing AI.
Parse the following raw product text describing a computer, laptop, or IT deal into a clean structured JSON object.
Return ONLY valid JSON. No backticks, no markdown formatting, no leading/trailing explanation.

JSON Format:
{
  "title": "Clean brand and model name, e.g. 'Dell Latitude 3410' or 'Lenovo ThinkPad L490'",
  "price": "Deal price as a simple numeric string, e.g. '28000'",
  "originalPrice": "Original price as a simple numeric string (or empty string if not mentioned), e.g. '38000'",
  "dealTag": "A promotional label, e.g., '🔥 HOT DEAL', '⚡ SPECIAL OFFER', 'LIMITED STOCK' or 'Refurbished'",
  "includedAccessory": "Included free accessories, e.g., '🎁 FREE Laptop Bag' or '🎁 FREE Laptop Bag & Mouse' or ''",
  "badge": "Warranty or condition note, e.g., '🛡️ 365-Day Warranty' or '🛡️ 6-Month Warranty'",
  "specs": [
    "Array of exactly 4 or 5 brief formatted specification strings. Examples:
    'Intel Core i5 10th Gen',
    '8GB DDR4 RAM',
    '256GB NVMe SSD',
    '14\" FHD Anti-Glare Display',
    'Wi-Fi (Built-in)'"
  ]
}`;

        const promptText = `Parse this description:\n\n${text}`;
        
        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: promptText }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 500,
          },
          systemInstruction: systemPrompt
        });

        const rawJsonText = result.response.text().trim();
        // Clean markdown block wrappers if model outputs them anyway
        const cleanJsonText = rawJsonText
          .replace(/^```json\s*/i, "")
          .replace(/^```\s*/, "")
          .replace(/```$/, "")
          .trim();

        const parsed = JSON.parse(cleanJsonText) as ParsedDeal;
        return NextResponse.json({ success: true, data: parsed });
      } catch (geminiErr) {
        console.error("Gemini parse failed, falling back to regex parser:", geminiErr);
      }
    }

    // Local Regex Fallback
    const fallbackData = parseDealRegex(text);
    return NextResponse.json({ success: true, data: fallbackData, fallback: true });

  } catch (err) {
    console.error("Parse deal API error:", err);
    return NextResponse.json({ error: "Failed to process text" }, { status: 500 });
  }
}
