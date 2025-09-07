import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";

export type Role = "admin" | "editor" | "viewer";

export interface AccessTokenPayload {
  sub: string; // user id
  role: Role;
}

export const requireAuth: RequestHandler = (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer "))
      return res.status(401).json({ error: "unauthorized" });
    const token = auth.slice("Bearer ".length);
    const secret = process.env.JWT_SECRET || "dev";
    const payload = jwt.verify(token, secret) as AccessTokenPayload;
    (req as any).user = payload;
    next();
  } catch (_err) {
    return res.status(401).json({ error: "unauthorized" });
  }
};

export const requireRole =
  (roles: Role[]): RequestHandler =>
  (req, res, next) => {
    const user = (req as any).user as AccessTokenPayload | undefined;
    if (!user) return res.status(401).json({ error: "unauthorized" });
    if (!roles.includes(user.role))
      return res.status(403).json({ error: "forbidden" });
    next();
  };
