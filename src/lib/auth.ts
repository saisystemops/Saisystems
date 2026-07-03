const JWT_SECRET = process.env.NEXTAUTH_SECRET || "fallback-sai-secret-key-12345";

// Helper to decode Base64/Base64URL safely in any environment (Node/Edge)
function decodeBase64(str: string): string {
  const normalized = str.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

// Helper to encode to Base64 safely in any environment (Node/Edge)
function encodeBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  const binary = Array.from(bytes, byte => String.fromCharCode(byte)).join("");
  return btoa(binary);
}

export async function signDemoToken(payload: { email: string; role: string; name: string; exp: number }): Promise<string> {
  const payloadStr = JSON.stringify(payload);
  const base64Payload = encodeBase64(payloadStr)
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  const encoder = new TextEncoder();
  const keyData = encoder.encode(JWT_SECRET);
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(base64Payload)
  );
  const hashArray = Array.from(new Uint8Array(signatureBuffer));
  const hashString = hashArray.map(byte => String.fromCharCode(byte)).join("");
  const signature = btoa(hashString)
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `demo.${base64Payload}.${signature}`;
}

export async function verifySessionToken(token: string | undefined): Promise<{ email: string; role: string; name: string } | null> {
  if (!token) return null;

  try {
    const parts = token.split(".");
    
    // Case 1: Demo signed token
    if (parts.length === 3 && parts[0] === "demo") {
      const [, base64Payload, signature] = parts;
      
      const encoder = new TextEncoder();
      const keyData = encoder.encode(JWT_SECRET);
      const key = await crypto.subtle.importKey(
        "raw",
        keyData,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );
      const signatureBuffer = await crypto.subtle.sign(
        "HMAC",
        key,
        encoder.encode(base64Payload)
      );
      const hashArray = Array.from(new Uint8Array(signatureBuffer));
      const hashString = hashArray.map(byte => String.fromCharCode(byte)).join("");
      const expectedSignature = btoa(hashString)
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");

      if (signature !== expectedSignature) {
        return null;
      }

      const decodedPayload = decodeBase64(base64Payload);
      const payload = JSON.parse(decodedPayload);

      if (payload.exp && payload.exp > Date.now()) {
        return {
          email: payload.email,
          role: payload.role,
          name: payload.name || "Demo User",
        };
      }
      return null;
    }

    // Case 2: Supabase JWT (3 parts, not starting with "demo")
    if (parts.length === 3) {
      const [, base64Payload] = parts;
      const decodedPayload = decodeBase64(base64Payload);
      const payload = JSON.parse(decodedPayload);

      if (payload.exp && payload.exp * 1000 > Date.now()) {
        return {
          email: payload.email || "",
          role: "admin", // Default role
          name: "Administrator",
        };
      }
      return null;
    }

    return null;
  } catch {
    return null;
  }
}
