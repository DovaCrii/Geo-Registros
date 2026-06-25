/**
 * Simple CSRF protection using Origin/Referer header validation.
 *
 * Validates that the request originates from our own application domain,
 * preventing cross-site request forgery attacks.
 *
 * OWASP recommendation: use SameSite cookies + Origin header validation.
 * NextAuth already sets SameSite=Lax on session cookies.
 * This is defense-in-depth for API route mutations.
 */

export function validateCsrf(request: Request): { valid: boolean; reason?: string } {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  // Allowlist of accepted origins (must match NEXTAUTH_URL or app domain)
  const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const allowedOrigins = [appUrl.replace(/\/+$/, ""), "http://localhost:3000"];

  // If neither origin nor referer is present, reject
  if (!origin && !referer) {
    return { valid: false, reason: "Missing origin and referer headers." };
  }

  // Validate origin
  if (origin) {
    const matches = allowedOrigins.some(
      (allowed) => origin === allowed || origin.startsWith(`${allowed}/`),
    );
    if (!matches) {
      return { valid: false, reason: `Origin not allowed: ${origin}` };
    }
  }

  // Validate referer (fallback if origin not present)
  if (!origin && referer) {
    const matches = allowedOrigins.some(
      (allowed) => referer.startsWith(`${allowed}/`) || referer === allowed,
    );
    if (!matches) {
      return { valid: false, reason: `Referer not allowed: ${referer}` };
    }
  }

  return { valid: true };
}
