import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { createSessionCookie } from "@/lib/auth-secure";
import crypto from "crypto";

const FALLBACK_USER = process.env.ADMIN_USERNAME;
const FALLBACK_PASS = process.env.ADMIN_PASSWORD;

function sha256(secret: string): string {
  return crypto.createHash("sha256").update(secret).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 });
    }

    // 1. Verify against config fallbacks (only if defined in environment)
    if (FALLBACK_USER && FALLBACK_PASS && username === FALLBACK_USER && password === FALLBACK_PASS) {
      const response = NextResponse.json({ success: true, role: "super_admin" });
      const sessionVal = createSessionCookie(username, "super_admin");
      response.cookies.set("admin_session", sessionVal, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24, // 24 hours
      });
      return response;
    }

    // 2. Query Supabase admin_users table
    const supabase = createServerClient();
    const { data: user, error } = await supabase
      .from("admin_users")
      .select("*")
      .eq("username", username)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    const hashedInput = sha256(password);
    const isValid = user.password_hash === hashedInput || user.password_hash === password;

    if (!isValid) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    const response = NextResponse.json({ success: true, role: user.role });
    const sessionVal = createSessionCookie(user.username, user.role);
    response.cookies.set("admin_session", sessionVal, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24,
    });
    return response;
  } catch (err) {
    console.error("Admin auth handler error:", err);
    return NextResponse.json({ error: "Internal authentication error" }, { status: 500 });
  }
}
