import jwt from "jsonwebtoken";
import { jwtVerify, createRemoteJWKSet } from "jose";
import { getUserByEmail, createUser } from "../../../../lib/db-helpers";

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

function clearCookie(name, isProduction) {
  const parts = [`${name}=`, "Path=/", "Max-Age=0", "SameSite=Lax"];
  if (isProduction) parts.push("Secure");
  parts.push("HttpOnly");
  return parts.join("; ");
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

const googleJwks = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const jwtSecret = process.env.JWT_SECRET;
  if (!clientId || !clientSecret) {
    return res.status(500).json({ message: "Google OAuth env vars are not configured" });
  }
  if (!jwtSecret) {
    return res.status(500).json({ message: "JWT_SECRET is not configured" });
  }

  const isProduction = process.env.NODE_ENV === "production";
  const oauthCookiesToClear = [
    clearCookie("g_state", isProduction),
    clearCookie("g_nonce", isProduction),
    clearCookie("g_cv", isProduction),
    clearCookie("g_redirect", isProduction),
  ];

  const { code, state, error } = req.query;
  const cookieState = req.cookies?.g_state;
  const cookieNonce = req.cookies?.g_nonce;
  const codeVerifier = req.cookies?.g_cv;
  const cookieRedirect = req.cookies?.g_redirect;

  if (error) {
    res.setHeader("Set-Cookie", oauthCookiesToClear);
    return res.redirect(`/login?error=${encodeURIComponent("google_oauth_denied")}`);
  }

  if (!code || typeof code !== "string") {
    res.setHeader("Set-Cookie", oauthCookiesToClear);
    return res.redirect(`/login?error=${encodeURIComponent("missing_code")}`);
  }

  if (!state || typeof state !== "string" || !cookieState || state !== cookieState) {
    res.setHeader("Set-Cookie", oauthCookiesToClear);
    return res.redirect(`/login?error=${encodeURIComponent("state_mismatch")}`);
  }

  if (!codeVerifier) {
    res.setHeader("Set-Cookie", oauthCookiesToClear);
    return res.redirect(`/login?error=${encodeURIComponent("missing_pkce")}`);
  }

  try {
    const baseUrl = getBaseUrl(req);
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${baseUrl}/api/auth/google/callback`;

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
        code_verifier: codeVerifier,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) {
      console.error("Google token exchange failed:", tokenData);
      res.setHeader("Set-Cookie", oauthCookiesToClear);
      return res.redirect(`/login?error=${encodeURIComponent("token_exchange_failed")}`);
    }

    const idToken = tokenData.id_token;
    if (!idToken || typeof idToken !== "string") {
      res.setHeader("Set-Cookie", oauthCookiesToClear);
      return res.redirect(`/login?error=${encodeURIComponent("missing_id_token")}`);
    }

    const { payload } = await jwtVerify(idToken, googleJwks, {
      audience: clientId,
      issuer: ["https://accounts.google.com", "accounts.google.com"],
    });

    if (cookieNonce && payload.nonce && payload.nonce !== cookieNonce) {
      res.setHeader("Set-Cookie", oauthCookiesToClear);
      return res.redirect(`/login?error=${encodeURIComponent("nonce_mismatch")}`);
    }

    const email = payload.email;
    const emailVerified = payload.email_verified;
    if (!email || typeof email !== "string") {
      res.setHeader("Set-Cookie", oauthCookiesToClear);
      return res.redirect(`/login?error=${encodeURIComponent("missing_email")}`);
    }

    if (!(emailVerified === true || emailVerified === "true")) {
      res.setHeader("Set-Cookie", oauthCookiesToClear);
      return res.redirect(`/login?error=${encodeURIComponent("email_not_verified")}`);
    }

    let user = await getUserByEmail(email);
    if (!user) {
      user = await createUser({
        email,
        password_hash: null,
        name: typeof payload.name === "string" ? payload.name : null,
        role: "member",
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: "24h" }
    );

    const tokenExp = Date.now() + 24 * 60 * 60 * 1000;
    const maxAge = 24 * 60 * 60;

    const tokenCookie = buildCookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "Lax",
      path: "/",
      maxAge,
    });

    const tokenExpCookie = buildCookie("token_exp", String(tokenExp), {
      httpOnly: false,
      secure: isProduction,
      sameSite: "Lax",
      path: "/",
      maxAge,
    });

    const redirect = sanitizeRedirect(cookieRedirect);

    res.setHeader("Set-Cookie", [tokenCookie, tokenExpCookie, ...oauthCookiesToClear]);
    return res.redirect(redirect);
  } catch (e) {
    console.error("Google OAuth callback error:", e);
    res.setHeader("Set-Cookie", oauthCookiesToClear);
    return res.redirect(`/login?error=${encodeURIComponent("google_oauth_failed")}`);
  }
}

