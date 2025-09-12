import { Router } from "express";
import type { Router as RouterType } from "express";
import { QuizVersionModel } from "../models/QuizVersion.js";
import { QuizModel } from "../models/Quiz.js";
import { validate } from "../middleware/validate.js";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/auth.js";
import strongEtagForJson from "../utils/etag.js";
import { objectId } from "../validators/index.js";

export const versionsRouter: RouterType = Router();

const bodySchema = z.object({
  quiz_id: z.string(),
  label: z.string().min(1),
  traffic_weight: z.number().int().nonnegative().optional(),
  is_default: z.boolean().optional(),
});

versionsRouter.post(
  "/",
  requireAuth,
  requireRole(["admin", "editor"]),
  validate({ body: bodySchema }),
  async (req, res, next) => {
    try {
      const created = await QuizVersionModel.create(req.body);
      res.status(201).json({ version: created });
    } catch (err) {
      next(err);
    }
  }
);

versionsRouter.patch(
  "/:id",
  requireAuth,
  requireRole(["admin", "editor"]),
  validate({ params: z.object({ id: objectId }), body: bodySchema.partial() }),
  async (req, res, next) => {
    try {
      const updated = await QuizVersionModel.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!updated) return res.status(404).json({ error: "not_found" });
      res.json({ version: updated });
    } catch (err) {
      next(err);
    }
  }
);

versionsRouter.get(
  "/quiz/:quizId",
  requireAuth,
  requireRole(["admin", "editor", "viewer"]),
  async (req, res, next) => {
    try {
      const items = await QuizVersionModel.find({
        quiz_id: req.params.quizId,
      }).lean();
      res.json({ items });
    } catch (err) {
      next(err);
    }
  }
);

// Get single version by id
versionsRouter.get(
  "/:id",
  requireAuth,
  requireRole(["admin", "editor", "viewer"]),
  validate({ params: z.object({ id: objectId }) }),
  async (req, res, next) => {
    try {
      const version = await QuizVersionModel.findById(req.params.id).lean();
      if (!version) return res.status(404).json({ error: "not_found" });
      res.json({ version });
    } catch (err) {
      next(err);
    }
  }
);

export default versionsRouter;
