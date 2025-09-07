import { Router } from "express";
import type { Router as RouterType } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate.js";
import { UserModel } from "../models/User.js";
import { RefreshTokenModel } from "../models/RefreshToken.js";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";

export const authRouter: RouterType = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function signAccessToken(payload: { sub: string; role: string }) {
  const secret = process.env.JWT_SECRET || "dev";
  return jwt.sign(payload, secret, { expiresIn: "15m" });
}

function signRefreshToken() {
  return crypto.randomBytes(48).toString("base64url");
}

authRouter.post(
  "/login",
  validate({ body: loginSchema }),
  async (req, res, next) => {
    try {
      const { email, password } = req.body as z.infer<typeof loginSchema>;
      const user = await UserModel.findOne({ email });
      if (!user) return res.status(401).json({ error: "invalid_credentials" });
      const ok = await argon2.verify(user.password_hash, password);
      if (!ok) return res.status(401).json({ error: "invalid_credentials" });

      const access = signAccessToken({
        sub: user._id.toString(),
        role: user.role,
      });
      const refresh = signRefreshToken();
      const refreshHash = await argon2.hash(refresh);
      const exp = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days
      await RefreshTokenModel.create({
        user_id: user._id,
        token_hash: refreshHash,
        exp,
      });
      res.cookie("refresh_token", refresh, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: exp,
        path: "/v1/auth/refresh",
      });
      res.json({ access_token: access });
    } catch (err) {
      next(err);
    }
  }
);

authRouter.post("/refresh", async (req, res, next) => {
  try {
    const token = req.cookies?.refresh_token as string | undefined;
    if (!token) return res.status(401).json({ error: "unauthorized" });
    const docs = await RefreshTokenModel.find({})
      .sort({ createdAt: -1 })
      .limit(100);
    let found: { user_id: string } | null = null;
    for (const doc of docs) {
      const ok = await argon2.verify(doc.token_hash, token).catch(() => false);
      if (ok) {
        if (doc.exp < new Date())
          return res.status(401).json({ error: "expired" });
        found = { user_id: doc.user_id.toString() };
        break;
      }
    }
    if (!found) return res.status(401).json({ error: "unauthorized" });
    const user = await UserModel.findById(found.user_id);
    if (!user) return res.status(401).json({ error: "unauthorized" });
    const access = signAccessToken({
      sub: user._id.toString(),
      role: user.role,
    });
    res.json({ access_token: access });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/logout", async (req, res, next) => {
  try {
    const token = req.cookies?.refresh_token as string | undefined;
    if (token) {
      const docs = await RefreshTokenModel.find({})
        .sort({ createdAt: -1 })
        .limit(200);
      for (const doc of docs) {
        const ok = await argon2
          .verify(doc.token_hash, token)
          .catch(() => false);
        if (ok) {
          await RefreshTokenModel.deleteOne({ _id: doc._id });
          break;
        }
      }
    }
    res.clearCookie("refresh_token", { path: "/v1/auth/refresh" });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default authRouter;
