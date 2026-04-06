import type { Request, Response } from "express";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";

const message = { error: "Too many requests, please try again later" };

// In production, all traffic arrives via Cloudflare Tunnel. Cloudflare sets
// CF-Connecting-IP to the real client IP on every request — it cannot be
// spoofed by clients because the edge overwrites it. Fall back to req.ip
// (populated from X-Forwarded-For via trust proxy) for local dev where
// cloudflared is not present.
function keyGenerator(req: Request, _res: Response): string {
  const cfIp = req.headers["cf-connecting-ip"];
  if (typeof cfIp === "string") return cfIp;
  // ipKeyGenerator applies /56 subnet masking to IPv6 addresses so that
  // users on the same /56 block can't trivially rotate addresses to bypass limits.
  return ipKeyGenerator(req.ip ?? req.socket.remoteAddress ?? "unknown");
}

const isDev = process.env.NODE_ENV !== "production";

const shared = {
  standardHeaders: true,
  legacyHeaders: false,
  message,
  keyGenerator,
  // In dev there is no Cloudflare in front, so all requests share the same
  // local IP and would immediately exhaust any limit. Skip entirely in dev.
  skip: () => isDev,
} as const;

// Baseline: all /api/* routes
export const globalLimiter = rateLimit({
  ...shared,
  windowMs: 60 * 1000,
  limit: 100,
});

// Strict: auth endpoints only (sign-in, sign-up, password reset)
export const authLimiter = rateLimit({
  ...shared,
  windowMs: 15 * 60 * 1000,
  limit: 10,
});

// Mutations: POST/PATCH/DELETE on write-heavy route groups
// GET and HEAD are skipped so read traffic is only subject to globalLimiter.
export const mutationLimiter = rateLimit({
  ...shared,
  windowMs: 60 * 1000,
  limit: 20,
  skip: (req) => isDev || req.method === "GET" || req.method === "HEAD",
});
