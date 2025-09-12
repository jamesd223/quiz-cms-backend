import { Router } from "express";
import type { Router as RouterType } from "express";
import { QuizModel } from "../models/Quiz.js";
import { QuizVersionModel } from "../models/QuizVersion.js";
import strongEtagForJson from "../utils/etag.js";
import { assembleQuizBySlug } from "../services/quizAssembler.js";
import { validate } from "../middleware/validate.js";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const quizzesRouter: RouterType = Router();
// Public: GET /v1/quizzes/:id/versions
quizzesRouter.get("/:id/versions", async (req, res, next) => {
  try {
    const items = await QuizVersionModel.find({ quiz_id: req.params.id })
      .select({ label: 1, traffic_weight: 1, is_default: 1 })
      .lean();
    const payload = { items };
    const etag = strongEtagForJson(payload);
    res.setHeader("ETag", etag);
    res.setHeader("Cache-Control", "public, max-age=60");
    if (req.headers["if-none-match"] === etag) return res.status(304).end();
    res.json(payload);
  } catch (err) {
    next(err);
  }
});

// Public GET /v1/quizzes/:slug
quizzesRouter.get("/:slug", async (req, res, next) => {
  try {
    const { slug } = req.params;
    if (/^[0-9a-fA-F]{24}$/.test(slug)) return next();
    const versionOverride = req.query.version as string | undefined;
    const clientSeed = (req.query.seed as string | undefined) || "";
    const opts: {
      slug: string;
      versionOverride?: string;
      clientSeed?: string;
    } = { slug };
    if (versionOverride) opts.versionOverride = versionOverride;
    if (clientSeed) opts.clientSeed = clientSeed;
    const payload = await assembleQuizBySlug(opts);
    const etag = strongEtagForJson(payload);
    res.setHeader("ETag", etag);
    res.setHeader("Cache-Control", "public, max-age=60");
    if (req.headers["if-none-match"] === etag) return res.status(304).end();
    res.json(payload);
  } catch (err) {
    next(err);
  }
});

const quizBody = z.object({
  brand_id: z.string(),
  slug: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  locale_default: z.string().optional(),
  progress_style: z.string().optional(),
  show_trust_strip: z.boolean().optional(),
  show_seen_on: z.boolean().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
});

quizzesRouter.get(
  "/",
  requireAuth,
  requireRole(["admin", "editor", "viewer"]),
  async (req, res, next) => {
    try {
      const items = await QuizModel.find()
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();
      res.json({ items });
    } catch (err) {
      next(err);
    }
  }
);

quizzesRouter.post(
  "/",
  requireAuth,
  requireRole(["admin", "editor"]),
  validate({ body: quizBody }),
  async (req, res, next) => {
    try {
      const created = await QuizModel.create(req.body);
      const version = await QuizVersionModel.create({
        quiz_id: created._id,
        label: "v1",
        traffic_weight: 100,
        is_default: true,
      });
      res.status(201).json({ quiz: created, version });
    } catch (err) {
      next(err);
    }
  }
);

quizzesRouter.get(
  "/:id",
  requireAuth,
  requireRole(["admin", "editor", "viewer"]),
  async (req, res, next) => {
    try {
      const doc = await QuizModel.findById(req.params.id);
      if (!doc) return res.status(404).json({ error: "not_found" });
      res.json({ quiz: doc });
    } catch (err) {
      next(err);
    }
  }
);

quizzesRouter.patch(
  "/:id",
  requireAuth,
  requireRole(["admin", "editor"]),
  validate({ body: quizBody.partial() }),
  async (req, res, next) => {
    try {
      const updated = await QuizModel.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!updated) return res.status(404).json({ error: "not_found" });
      res.json({ quiz: updated });
    } catch (err) {
      next(err);
    }
  }
);

export default quizzesRouter;
