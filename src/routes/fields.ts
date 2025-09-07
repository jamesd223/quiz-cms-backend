import { Router } from "express";
import type { Router as RouterType } from "express";
import { FieldModel } from "../models/Field.js";
import { StepModel } from "../models/Step.js";
import hasCollisions from "../utils/grid.js";
import { validate } from "../middleware/validate.js";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const fieldsRouter: RouterType = Router();

const bodySchema = z.object({
  step_id: z.string(),
  order_index: z.number().int().nonnegative(),
  is_visible: z.boolean().optional(),
  key: z.string().min(1),
  label: z.string().optional(),
  help_text: z.string().optional(),
  type: z.enum([
    "choice_single",
    "choice_multi",
    "input_text",
    "input_number",
    "input_email",
    "input_phone",
    "date",
    "slider",
    "group",
  ]),
  required: z.boolean().optional(),
});

fieldsRouter.get(
  "/step/:stepId",
  requireAuth,
  requireRole(["admin", "editor", "viewer"]),
  async (req, res, next) => {
    try {
      const items = await FieldModel.find({ step_id: req.params.stepId })
        .sort({ order_index: 1 })
        .lean();
      res.json({ items });
    } catch (err) {
      next(err);
    }
  }
);

fieldsRouter.post(
  "/",
  requireAuth,
  requireRole(["admin", "editor"]),
  validate({ body: bodySchema }),
  async (req, res, next) => {
    try {
      // Enforce key uniqueness within quiz_version
      const step = await StepModel.findById((req.body as any).step_id);
      if (!step) return res.status(400).json({ error: "invalid_step" });
      const siblingSteps = await StepModel.find(
        { quiz_version_id: step.quiz_version_id },
        { _id: 1 }
      );
      const siblingStepIds = siblingSteps.map((s) => s._id);
      const exists = await FieldModel.exists({
        step_id: { $in: siblingStepIds },
        key: (req.body as any).key,
      });
      if (exists) return res.status(400).json({ error: "duplicate_field_key" });

      const created = await FieldModel.create(req.body);
      res.status(201).json({ field: created });
    } catch (err) {
      next(err);
    }
  }
);

fieldsRouter.patch(
  "/:id",
  requireAuth,
  requireRole(["admin", "editor"]),
  validate({ body: bodySchema.partial() }),
  async (req, res, next) => {
    try {
      // If key updates, ensure uniqueness within version
      if ((req.body as any).key) {
        const current = await FieldModel.findById(req.params.id);
        if (!current) return res.status(404).json({ error: "not_found" });
        const step = await StepModel.findById(current.step_id);
        const siblingSteps = await StepModel.find(
          { quiz_version_id: step!.quiz_version_id },
          { _id: 1 }
        );
        const siblingStepIds = siblingSteps.map((s) => s._id);
        const exists = await FieldModel.exists({
          _id: { $ne: current._id },
          step_id: { $in: siblingStepIds },
          key: (req.body as any).key,
        });
        if (exists)
          return res.status(400).json({ error: "duplicate_field_key" });
      }

      const updated = await FieldModel.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!updated) return res.status(404).json({ error: "not_found" });
      res.json({ field: updated });
    } catch (err) {
      next(err);
    }
  }
);

fieldsRouter.delete(
  "/:id",
  requireAuth,
  requireRole(["admin", "editor"]),
  async (req, res, next) => {
    try {
      await FieldModel.findByIdAndDelete(req.params.id);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }
);

export default fieldsRouter;
