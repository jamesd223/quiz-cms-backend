import { Router } from "express";
import type { Router as RouterType } from "express";
import { FieldModel } from "../models/Field.js";
import { StepModel } from "../models/Step.js";
import hasCollisions from "../utils/grid.js";
import { validate } from "../middleware/validate.js";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { objectId } from "../validators/index.js";

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
  // Grid canonical keys
  row_index: z.number().int().nonnegative().optional(),
  col_index: z.number().int().nonnegative().optional(),
  row_span: z.number().int().positive().optional(),
  col_span: z.number().int().positive().optional(),
  // Grid alias keys accepted from clients
  row: z.number().int().nonnegative().optional(),
  col: z.number().int().nonnegative().optional(),
  rowspan: z.number().int().positive().optional(),
  colspan: z.number().int().positive().optional(),
});

function mapGridAliases<T extends Record<string, any>>(input: T): T {
  const out: Record<string, any> = { ...input };
  if (Object.prototype.hasOwnProperty.call(input, "row")) {
    out.row_index = input.row;
    delete out.row;
  }
  if (Object.prototype.hasOwnProperty.call(input, "col")) {
    out.col_index = input.col;
    delete out.col;
  }
  if (Object.prototype.hasOwnProperty.call(input, "rowspan")) {
    out.row_span = input.rowspan;
    delete out.rowspan;
  }
  if (Object.prototype.hasOwnProperty.call(input, "colspan")) {
    out.col_span = input.colspan;
    delete out.colspan;
  }
  return out as T;
}

fieldsRouter.get(
  "/step/:stepId",
  requireAuth,
  requireRole(["admin", "editor", "viewer"]),
  async (req, res, next) => {
    try {
      const itemsRaw = await FieldModel.find({ step_id: req.params.stepId })
        .sort({ order_index: 1 })
        .lean();
      const items = itemsRaw.map((f: any) => ({
        ...f,
        row: f.row_index,
        col: f.col_index,
        rowspan: f.row_span,
        colspan: f.col_span,
      }));
      res.json({ items });
    } catch (err) {
      next(err);
    }
  }
);

// Get single field by id
fieldsRouter.get(
  "/:id",
  requireAuth,
  requireRole(["admin", "editor", "viewer"]),
  validate({ params: z.object({ id: objectId }) }),
  async (req, res, next) => {
    try {
      const f = await FieldModel.findById(req.params.id).lean();
      if (!f) return res.status(404).json({ error: "not_found" });
      const field = {
        ...f,
        row: f.row_index,
        col: f.col_index,
        rowspan: f.row_span,
        colspan: f.col_span,
      } as any;
      res.json({ field });
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
      const payload = mapGridAliases(req.body as any);
      // Enforce key uniqueness within quiz_version
      const step = await StepModel.findById((payload as any).step_id);
      if (!step) return res.status(400).json({ error: "invalid_step" });
      const siblingSteps = await StepModel.find(
        { quiz_version_id: step.quiz_version_id },
        { _id: 1 }
      );
      const siblingStepIds = siblingSteps.map((s) => s._id);
      const exists = await FieldModel.exists({
        step_id: { $in: siblingStepIds },
        key: (payload as any).key,
      });
      if (exists) return res.status(400).json({ error: "duplicate_field_key" });

      const created = await FieldModel.create(payload);
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
      const payload = mapGridAliases(req.body as any);
      // If key updates, ensure uniqueness within version
      if ((payload as any).key) {
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
          key: (payload as any).key,
        });
        if (exists)
          return res.status(400).json({ error: "duplicate_field_key" });
      }

      const updated = await FieldModel.findByIdAndUpdate(
        req.params.id,
        payload,
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
