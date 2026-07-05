/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth-secure";

export async function GET(req: NextRequest) {
  const session = verifySession(req);
  if (!session.valid) {
    return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  }

  const results: Record<string, any> = {
    timestamp: new Date().toISOString(),
    supabase: { status: "unchecked", details: null },
    resend: { status: "unchecked", details: null },
    gemini: { status: "unchecked", details: null },
  };

  // 1. Check Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    results.supabase = {
      status: "missing_config",
      details: "NEXT_PUBLIC_SUPABASE_URL environment variable is not set.",
    };
  } else if (!supabaseServiceKey && !supabaseAnonKey) {
    results.supabase = {
      status: "missing_config",
      details: "Neither SUPABASE_SERVICE_ROLE_KEY nor NEXT_PUBLIC_SUPABASE_ANON_KEY is set.",
    };
  } else {
    try {
      const { createServerClient } = await import("@/lib/supabase");
      const client = createServerClient();
      
      const tablesToCheck = ["estimator_prices", "leads", "appointments"];
      const tableResults: Record<string, { exists: boolean; count?: number; error?: string }> = {};
      
      for (const table of tablesToCheck) {
        const { data, error, count } = await client
          .from(table)
          .select("id", { count: "exact", head: true });
          
        if (error) {
          tableResults[table] = { exists: false, error: `${error.message} (Code: ${error.code})` };
        } else {
          tableResults[table] = { exists: true, count: count ?? 0 };
        }
      }

      const allOk = tablesToCheck.every(t => tableResults[t].exists);
      if (allOk) {
        results.supabase = {
          status: "working",
          urlPrefix: supabaseUrl ? supabaseUrl.substring(0, 25) : "none",
          details: `Successfully connected to Supabase. All required tables are present: ` +
                   `estimator_prices (${tableResults.estimator_prices.count} records), ` +
                   `leads (${tableResults.leads.count} records), ` +
                   `appointments (${tableResults.appointments.count} records). SQL Editor setup is verified and complete.`,
        };
      } else {
        const missing = tablesToCheck.filter(t => !tableResults[t].exists).join(", ");
        results.supabase = {
          status: "partial_missing",
          details: `Connected to Supabase, but some tables are missing: [${missing}]. Did you run the full SQL Editor schema? Details: ${JSON.stringify(tableResults)}`,
        };
      }
    } catch (err: any) {
      results.supabase = {
        status: "exception",
        details: `Failed to initialize or connect to Supabase: ${err.message || err}`,
      };
    }
  }

  // 2. Check Resend
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    results.resend = {
      status: "missing_config",
      details: "RESEND_API_KEY environment variable is not set.",
    };
  } else {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(resendApiKey);
      
      // Test the API key by listing domains (a standard read-only call)
      const response = await resend.domains.list();
      
      if (response.error) {
        results.resend = {
          status: "auth_error",
          details: `Resend API rejected the key. Error: ${response.error.message}`,
        };
      } else {
        results.resend = {
          status: "working",
          details: "Resend API key is valid and authorized. Can list domains/send emails.",
        };
      }
    } catch (err: any) {
      results.resend = {
        status: "exception",
        details: `Failed to verify Resend API key: ${err.message || err}`,
      };
    }
  }

  // 3. Check Gemini
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    results.gemini = {
      status: "missing_config",
      details: "GEMINI_API_KEY environment variable is not set. The chatbot will run on rule-based fallbacks.",
    };
  } else {
    try {
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const response = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: "Respond only with the word 'OK'." }] }],
        generationConfig: { maxOutputTokens: 5, temperature: 0.1 },
      });
      
      const responseText = response.response.text().trim();
      
      results.gemini = {
        status: "working",
        details: `Gemini AI is connected and active. Test response: "${responseText}"`,
      };
    } catch (err: any) {
      results.gemini = {
        status: "auth_error",
        details: `Failed to authenticate or generate content with Gemini: ${err.message || err}`,
      };
    }
  }

  // Determine overall status
  const statuses = [results.supabase.status, results.resend.status, results.gemini.status];
  if (statuses.every(s => s === "working")) {
    results.overall = "success";
  } else if (statuses.some(s => s === "working")) {
    results.overall = "partial";
  } else {
    results.overall = "failed";
  }

  return NextResponse.json(results);
}
