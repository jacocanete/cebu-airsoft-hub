import type { Request, Response, NextFunction } from "express";
import { auth } from "../auth.js";
import { fromNodeHeaders } from "better-auth/node";

export interface AuthRequest extends Request {
  user?: { id: string; email: string; name: string; username: string };
  session?: { id: string };
}

export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  req.user = {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    username: (session.user as { username?: string }).username ?? "",
  };
  req.session = { id: session.session.id };
  next();
}

export async function optionalAuth(
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (session) {
    req.user = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      username: (session.user as { username?: string }).username ?? "",
    };
    req.session = { id: session.session.id };
  }
  next();
}
