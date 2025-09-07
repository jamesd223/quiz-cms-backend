import { Router } from "express";
import type { Router as RouterType } from "express";
import { OptionModel } from "../models/Option.js";
import { validate } from "../middleware/validate.js";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const optionsRouter: RouterType = Router();

const bodySchema = z.object({
  field_id: z.string(),
  order_index: z.number().int().nonnegative(),
  is_visible: z.boolean().optional(),
  label: z.string().optional(),
  description: z.string().optional(),
  value: z.string().min(1),
  icon_media_id: z.string().optional(),
  image_media_id: z.string().optional(),
  is_default: z.boolean().optional(),
  score: z.number().optional(),
});

optionsRouter.get(
  "/field/:fieldId",
  requireAuth,
  requireRole(["admin", "editor", "viewer"]),
  async (req, res, next) => {
    try {
      const items = await OptionModel.find({ field_id: req.params.fieldId })
        .sort({ order_index: 1 })
        .lean();
      res.json({ items });
    } catch (err) {
      next(err);
    }
  }
);

optionsRouter.post(
  "/",
  requireAuth,
  requireRole(["admin", "editor"]),
  validate({ body: bodySchema }),
  async (req, res, next) => {
    try {
      const created = await OptionModel.create(req.body);
      res.status(201).json({ option: created });
    } catch (err) {
      // Handle duplicate key error for unique value constraint
      if ((err as any)?.code === 11000)
        return res.status(400).json({ error: "duplicate_option_value" });
      next(err);
    }
  }
);

optionsRouter.patch(
  "/:id",
  requireAuth,
  requireRole(["admin", "editor"]),
  validate({ body: bodySchema.partial() }),
  async (req, res, next) => {
    try {
      const updated = await OptionModel.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!updated) return res.status(404).json({ error: "not_found" });
      res.json({ option: updated });
    } catch (err) {
      if ((err as any)?.code === 11000)
        return res.status(400).json({ error: "duplicate_option_value" });
      next(err);
    }
  }
);

optionsRouter.delete(
  "/:id",
  requireAuth,
  requireRole(["admin", "editor"]),
  async (req, res, next) => {
    try {
      await OptionModel.findByIdAndDelete(req.params.id);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }
);

export default optionsRouter;
