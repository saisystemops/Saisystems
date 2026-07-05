import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth-secure";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = verifySession(req);
    if (!session.valid) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ success: false, message: "Database not configured." }, { status: 500 });
    }

    const body = await req.json();
    const { type, id, status, estimatePrice, notes } = body;

    if (!type || !id || !status) {
      return NextResponse.json({ success: false, message: "Missing required fields: type, id, status." }, { status: 400 });
    }

    const supabase = createServerClient();

    const updateFields: Record<string, any> = {
      status,
      estimate_price: estimatePrice !== undefined && estimatePrice !== "" ? Number(estimatePrice) : null,
      notes: notes || null,
      updated_at: new Date().toISOString(),
    };

    let updatePromise;

    if (type === "appointment") {
      updatePromise = supabase
        .from("appointments")
        .update(updateFields)
        .eq("id", id);
    } else if (type === "ticket") {
      updatePromise = supabase
        .from("tickets")
        .update(updateFields)
        .eq("id", id);
    } else if (type === "lead") {
      updatePromise = supabase
        .from("leads")
        .update(updateFields)
        .eq("id", id);
    } else {
      return NextResponse.json({ success: false, message: "Invalid type parameter." }, { status: 400 });
    }

    let { error } = await updatePromise;

    // Fallback if estimate_price or notes columns are missing in Supabase
    if (error && (error.code === "42703" || error.message?.includes("column"))) {
      const fallbackFields = {
        status,
        updated_at: new Date().toISOString(),
      };
      
      let retryPromise;
      if (type === "appointment") {
        retryPromise = supabase.from("appointments").update(fallbackFields).eq("id", id);
      } else if (type === "ticket") {
        retryPromise = supabase.from("tickets").update(fallbackFields).eq("id", id);
      } else if (type === "lead") {
        retryPromise = supabase.from("leads").update(fallbackFields).eq("id", id);
      }

      if (retryPromise) {
        const retryResult = await retryPromise;
        error = retryResult.error;
      }
    }

    if (error) {
      console.error("Database update error:", error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Incident updated successfully." });
  } catch (error: any) {
    console.error("Admin ticket update API error:", error);
    return NextResponse.json({ success: false, message: "Failed to update incident details." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = verifySession(req);
    if (!session.valid) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ success: false, message: "Database not configured." }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const id = searchParams.get("id");

    if (!type || !id) {
      return NextResponse.json({ success: false, message: "Missing required parameters: type, id." }, { status: 400 });
    }

    const supabase = createServerClient();
    let deletePromise;

    if (type === "appointment") {
      deletePromise = supabase.from("appointments").delete().eq("id", id);
    } else if (type === "ticket") {
      deletePromise = supabase.from("tickets").delete().eq("id", id);
    } else if (type === "lead") {
      deletePromise = supabase.from("leads").delete().eq("id", id);
    } else {
      return NextResponse.json({ success: false, message: "Invalid type parameter." }, { status: 400 });
    }

    const { error } = await deletePromise;

    if (error) {
      console.error("Database delete error:", error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Incident deleted successfully from database." });
  } catch (error: any) {
    console.error("Admin ticket delete API error:", error);
    return NextResponse.json({ success: false, message: "Failed to delete incident." }, { status: 500 });
  }
}
