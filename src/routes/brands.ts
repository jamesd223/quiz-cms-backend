import { Router } from "express";
import type { Router as RouterType } from "express";
import { BrandModel } from "../models/Brand.js";
import { validate } from "../middleware/validate.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { z } from "zod";

export const brandsRouter: RouterType = Router();

const brandBody = z.object({ name: z.string().min(1) });

brandsRouter.get(
  "/",
  requireAuth,
  requireRole(["admin", "editor", "viewer"]),
  async (_req, res, next) => {
    try {
      const items = await BrandModel.find().limit(100).lean();
      res.json({ items });
    } catch (err) {
      next(err);
    }
  }
);

brandsRouter.post(
  "/",
  requireAuth,
  requireRole(["admin", "editor"]),
  validate({ body: brandBody }),
  async (req, res, next) => {
    try {
      const created = await BrandModel.create(req.body);
      res.status(201).json({ brand: created });
    } catch (err) {
      next(err);
    }
  }
);

brandsRouter.patch(
  "/:id",
  requireAuth,
  requireRole(["admin", "editor"]),
  validate({ body: brandBody.partial() }),
  async (req, res, next) => {
    try {
      const updated = await BrandModel.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!updated) return res.status(404).json({ error: "not_found" });
      res.json({ brand: updated });
    } catch (err) {
      next(err);
    }
  }
);

export default brandsRouter;
