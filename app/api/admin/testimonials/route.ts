import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { verifySession } from "@/lib/auth-secure";

function checkAuth(req: NextRequest): boolean {
  return verifySession(req).valid;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data || []);
  } catch (err) {
    const errorVal = err as Error;
    return NextResponse.json({ error: errorVal.message || "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, approved } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing review ID" }, { status: 400 });
    }

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("testimonials")
      .update({ approved: Boolean(approved) })
      .eq("id", id)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data[0]);
  } catch (err) {
    const errorVal = err as Error;
    return NextResponse.json({ error: errorVal.message || "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing review ID" }, { status: 400 });
    }

    const supabase = createServerClient();
    const { error } = await supabase
      .from("testimonials")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const errorVal = err as Error;
    return NextResponse.json({ error: errorVal.message || "Server error" }, { status: 500 });
  }
}
