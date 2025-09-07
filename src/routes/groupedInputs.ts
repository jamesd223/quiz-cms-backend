import { Router } from "express";
import type { Router as RouterType } from "express";
import { GroupedInputModel } from "../models/GroupedInput.js";
import { validate } from "../middleware/validate.js";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const groupedInputsRouter: RouterType = Router();

const bodySchema = z.object({
  field_id: z.string(),
  order_index: z.number().int().nonnegative(),
  is_visible: z.boolean().optional(),
  field_key: z.string().min(1),
  label: z.string().optional(),
  input_type: z.string().min(1),
  unit: z.string().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  placeholder: z.string().optional(),
  required: z.boolean().optional(),
});

groupedInputsRouter.get(
  "/field/:fieldId",
  requireAuth,
  requireRole(["admin", "editor", "viewer"]),
  async (req, res, next) => {
    try {
      const items = await GroupedInputModel.find({
        field_id: req.params.fieldId,
      })
        .sort({ order_index: 1 })
        .lean();
      res.json({ items });
    } catch (err) {
      next(err);
    }
  }
);

groupedInputsRouter.post(
  "/",
  requireAuth,
  requireRole(["admin", "editor"]),
  validate({ body: bodySchema }),
  async (req, res, next) => {
    try {
      const created = await GroupedInputModel.create(req.body);
      res.status(201).json({ grouped_input: created });
    } catch (err) {
      next(err);
    }
  }
);

groupedInputsRouter.patch(
  "/:id",
  requireAuth,
  requireRole(["admin", "editor"]),
  validate({ body: bodySchema.partial() }),
  async (req, res, next) => {
    try {
      const updated = await GroupedInputModel.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!updated) return res.status(404).json({ error: "not_found" });
      res.json({ grouped_input: updated });
    } catch (err) {
      next(err);
    }
  }
);

groupedInputsRouter.delete(
  "/:id",
  requireAuth,
  requireRole(["admin", "editor"]),
  async (req, res, next) => {
    try {
      await GroupedInputModel.findByIdAndDelete(req.params.id);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }
);

export default groupedInputsRouter;
