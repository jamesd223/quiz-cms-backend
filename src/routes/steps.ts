import { Router } from "express";
import type { Router as RouterType } from "express";
import { StepModel } from "../models/Step.js";
import { validate } from "../middleware/validate.js";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const stepsRouter: RouterType = Router();

const bodySchema = z.object({
  quiz_version_id: z.string(),
  order_index: z.number().int().nonnegative(),
  is_visible: z.boolean().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  footnote_text: z.string().optional(),
  cta_text: z.string().optional(),
  layout: z.string().optional(),
  media_id: z.string().optional(),
  grid_columns: z.number().int().positive().optional(),
  grid_rows: z.number().int().positive().optional(),
  grid_gap_px: z.number().int().nonnegative().optional(),
});

stepsRouter.get(
  "/version/:versionId",
  requireAuth,
  requireRole(["admin", "editor", "viewer"]),
  async (req, res, next) => {
    try {
      const items = await StepModel.find({
        quiz_version_id: req.params.versionId,
      })
        .sort({ order_index: 1 })
        .lean();
      res.json({ items });
    } catch (err) {
      next(err);
    }
  }
);

stepsRouter.post(
  "/",
  requireAuth,
  requireRole(["admin", "editor"]),
  validate({ body: bodySchema }),
  async (req, res, next) => {
    try {
      const created = await StepModel.create(req.body);
      res.status(201).json({ step: created });
    } catch (err) {
      next(err);
    }
  }
);

stepsRouter.patch(
  "/:id",
  requireAuth,
  requireRole(["admin", "editor"]),
  validate({ body: bodySchema.partial() }),
  async (req, res, next) => {
    try {
      const updated = await StepModel.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!updated) return res.status(404).json({ error: "not_found" });
      res.json({ step: updated });
    } catch (err) {
      next(err);
    }
  }
);

stepsRouter.delete(
  "/:id",
  requireAuth,
  requireRole(["admin", "editor"]),
  async (req, res, next) => {
    try {
      await StepModel.findByIdAndDelete(req.params.id);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }
);

export default stepsRouter;
