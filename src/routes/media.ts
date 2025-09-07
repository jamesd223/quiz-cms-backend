import { Router } from "express";
import type { Router as RouterType } from "express";
import multer from "multer";
import { LocalStubStorage } from "../services/storage/LocalStubStorage.js";
import { MediaModel } from "../models/Media.js";
import { validate } from "../middleware/validate.js";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/auth.js";

const upload = multer();
const storage = new LocalStubStorage();
export const mediaRouter: RouterType = Router();

mediaRouter.get(
  "/",
  requireAuth,
  requireRole(["admin", "editor", "viewer"]),
  async (req, res, next) => {
    try {
      const items = await MediaModel.find().limit(100).lean();
      res.json({ items });
    } catch (err) {
      next(err);
    }
  }
);

mediaRouter.post(
  "/",
  requireAuth,
  requireRole(["admin", "editor"]),
  upload.single("file"),
  validate({
    body: z.object({
      type: z.enum(["icon", "image", "logo", "avatar"]),
      alt: z.string().optional(),
      locale: z.string().optional(),
    }),
  }),
  async (req, res, next) => {
    try {
      const file = req.file;
      if (!file) return res.status(400).json({ error: "file_required" });
      const stored = await storage.save({
        buffer: file.buffer,
        filename: file.originalname,
        contentType: file.mimetype,
      });
      const doc = await MediaModel.create({
        type: (req.body as any).type,
        url: stored.url,
        alt: (req.body as any).alt,
        locale: (req.body as any).locale,
      });
      res
        .status(201)
        .json({ media: { _id: doc._id.toString(), url: doc.url } });
    } catch (err) {
      next(err);
    }
  }
);

mediaRouter.delete(
  "/:id",
  requireAuth,
  requireRole(["admin", "editor"]),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const doc = await MediaModel.findByIdAndDelete(id);
      if (!doc) return res.status(404).json({ error: "not_found" });
      // In stub, we don't actually delete storage
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }
);

export default mediaRouter;
