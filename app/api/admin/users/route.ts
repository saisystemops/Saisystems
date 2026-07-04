import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { verifySession } from "@/lib/auth-secure";
import crypto from "crypto";

function sha256(secret: string): string {
  return crypto.createHash("sha256").update(secret).digest("hex");
}

async function checkSuperAdmin(req: NextRequest): Promise<boolean> {
  const sessionInfo = verifySession(req);
  if (!sessionInfo.valid) return false;

  if (process.env.ADMIN_USERNAME && sessionInfo.username === process.env.ADMIN_USERNAME) {
    return true;
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("admin_users")
    .select("role")
    .eq("username", sessionInfo.username)
    .single();

  if (!error && data && data.role === "super_admin") {
    return true;
  }
  return false;
}

// GET: List all administrative users
export async function GET(req: NextRequest) {
  if (!(await checkSuperAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("admin_users")
      .select("id, username, role, created_at")
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ users: data });
  } catch (err) {
    console.error("GET admin users error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST: Create a new admin user
export async function POST(req: NextRequest) {
  if (!(await checkSuperAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { username, password, role } = await req.json();

    if (!username || !password || !role) {
      return NextResponse.json({ error: "Username, password and role are required" }, { status: 400 });
    }

    const hash = sha256(password);
    const supabase = createServerClient();

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("admin_users")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json({ error: "Username already exists" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("admin_users")
      .insert({
        username,
        password_hash: hash,
        role,
      })
      .select("id, username, role")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, user: data });
  } catch (err) {
    console.error("POST admin user error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE: Delete an admin user
export async function DELETE(req: NextRequest) {
  if (!(await checkSuperAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const usernameToDelete = searchParams.get("username");

    if (!usernameToDelete) {
      return NextResponse.json({ error: "Username query parameter is required" }, { status: 400 });
    }

    const sessionInfo = verifySession(req);
    if (sessionInfo.username === usernameToDelete) {
      return NextResponse.json({ error: "You cannot delete your own account while logged in" }, { status: 400 });
    }

    const supabase = createServerClient();
    const { error } = await supabase
      .from("admin_users")
      .delete()
      .eq("username", usernameToDelete);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE admin user error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
