import crypto from "crypto";

function base64url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function sha256Base64url(input) {
  const hash = crypto.createHash("sha256").update(input).digest();
  return base64url(hash);
}

function getBaseUrl(req) {
  const proto = (req.headers["x-forwarded-proto"] || "http").toString().split(",")[0].trim();
  const host = (req.headers["x-forwarded-host"] || req.headers.host || "localhost:3000").toString();
  return `${proto}://${host}`;
}

function sanitizeRedirect(redirect) {
  if (!redirect || typeof redirect !== "string") return "/";
  if (redirect.startsWith("/") && !redirect.startsWith("//")) return redirect;
  return "/";
}

function buildCookie(name, value, opts) {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  if (opts.httpOnly) parts.push("HttpOnly");
  if (opts.secure) parts.push("Secure");
  if (opts.sameSite) parts.push(`SameSite=${opts.sameSite}`);
  if (opts.path) parts.push(`Path=${opts.path}`);
  if (typeof opts.maxAge === "number") parts.push(`Max-Age=${opts.maxAge}`);
  return parts.join("; ");
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return res.status(500).json({ message: "GOOGLE_CLIENT_ID is not configured" });
  }

  const redirect = sanitizeRedirect(req.query.redirect);

  const state = base64url(crypto.randomBytes(32));
  const nonce = base64url(crypto.randomBytes(32));
  const codeVerifier = base64url(crypto.randomBytes(32)) + base64url(crypto.randomBytes(32));
  const codeChallenge = sha256Base64url(codeVerifier);

  const isProduction = process.env.NODE_ENV === "production";
  const maxAge = 10 * 60; // 10 minutes

  const cookies = [
    buildCookie("g_state", state, { httpOnly: true, secure: isProduction, sameSite: "Lax", path: "/", maxAge }),
    buildCookie("g_nonce", nonce, { httpOnly: true, secure: isProduction, sameSite: "Lax", path: "/", maxAge }),
    buildCookie("g_cv", codeVerifier, { httpOnly: true, secure: isProduction, sameSite: "Lax", path: "/", maxAge }),
    buildCookie("g_redirect", redirect, { httpOnly: true, secure: isProduction, sameSite: "Lax", path: "/", maxAge }),
  ];

  res.setHeader("Set-Cookie", cookies);

  const baseUrl = getBaseUrl(req);
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${baseUrl}/api/auth/google/callback`;

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "openid email profile");
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("nonce", nonce);
  authUrl.searchParams.set("code_challenge", codeChallenge);
  authUrl.searchParams.set("code_challenge_method", "S256");
  authUrl.searchParams.set("prompt", "select_account");

  return res.redirect(authUrl.toString());
}

