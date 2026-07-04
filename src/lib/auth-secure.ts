import crypto from "crypto";
import { NextRequest } from "next/server";

const SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY || "saisystems-secure-fallback-salt-key-982143";

function sha256(text: string): string {
  return crypto.createHash("sha256").update(text).digest("hex");
}

export function createSessionCookie(username: string, role: string): string {
  const timestamp = Date.now().toString();
  const value = `${username}:${role}:${timestamp}`;
  const signature = sha256(value + SECRET);
  return `${value}.${signature}`;
}

export function verifySession(req: NextRequest): { valid: boolean; username: string; role: string } {
  const cookie = req.cookies.get("admin_session")?.value;
  if (!cookie) {
    return { valid: false, username: "", role: "" };
  }

  const parts = cookie.split(".");
  if (parts.length !== 2) {
    return { valid: false, username: "", role: "" };
  }

  const [value, signature] = parts;
  const expectedSignature = sha256(value + SECRET);

  if (signature !== expectedSignature) {
    return { valid: false, username: "", role: "" };
  }

  const [username, role, timestampStr] = value.split(":");
  if (!username || !role || !timestampStr) {
    return { valid: false, username: "", role: "" };
  }

  const timestamp = parseInt(timestampStr, 10);
  const oneDay = 24 * 60 * 60 * 1000;
  if (Date.now() - timestamp > oneDay) {
    return { valid: false, username: "", role: "" }; // Expired session (24h limit)
  }

  return { valid: true, username, role };
}
