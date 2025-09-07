import { Router } from "express";
import type { Router as RouterType } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate.js";
import { SubmissionModel } from "../models/Submission.js";
import { createSubmissionRateLimit } from "../middleware/rateLimit.js";
import { QuizModel } from "../models/Quiz.js";
import { QuizVersionModel } from "../models/QuizVersion.js";
import { assembleByQuizIdAndVersion } from "../services/quizAssembler.js";

export const submissionsRouter: RouterType = Router();
submissionsRouter.use(createSubmissionRateLimit());

const bodySchema = z.object({
  quiz_id: z.string(),
  version_label: z.string(),
  answers: z.record(z.string(), z.any()),
  meta: z
    .object({
      ua: z.string().optional(),
      locale: z.string().optional(),
      ip: z.string().optional(),
      ref: z.string().optional(),
    })
    .optional(),
});

submissionsRouter.post(
  "/",
  validate({ body: bodySchema }),
  async (req, res, next) => {
    try {
      const { quiz_id, version_label, answers, meta } = req.body as z.infer<
        typeof bodySchema
      >;
      // Validate existence and field requirements via assembler
      const assembled = await assembleByQuizIdAndVersion({ quiz: quiz_id, version: { label: version_label } });

      // Required fields must be present
      const requiredFields = assembled.fields.filter((f) => f.required).map((f) => String(f.key));
      for (const k of requiredFields) {
        if (!(k in answers)) return res.status(400).json({ error: "missing_required" });
      }
      // Basic type checks (numbers respect min/max, strings regex)
      for (const f of assembled.fields) {
        const v = (answers as any)[f.key];
        if (v == null) continue;
        if (f.type === 'input_number') {
          if (typeof v !== 'number') return res.status(400).json({ error: 'invalid_type' });
          if (typeof f.min === 'number' && v < f.min) return res.status(400).json({ error: 'min' });
          if (typeof f.max === 'number' && v > f.max) return res.status(400).json({ error: 'max' });
        }
        if (f.validation_regex) {
          const re = new RegExp(f.validation_regex);
          if (typeof v !== 'string' || !re.test(v)) return res.status(400).json({ error: 'regex' });
        }
        if (f.type === 'choice_multi') {
          if (!Array.isArray(v)) return res.status(400).json({ error: 'invalid_type' });
          const allowed = new Set(assembled.options.filter((o) => String(o.field_id) === String(f._id)).map((o) => o.value));
          for (const val of v) if (!allowed.has(val)) return res.status(400).json({ error: 'invalid_option' });
        }
        if (f.type === 'choice_single') {
          const allowed = new Set(assembled.options.filter((o) => String(o.field_id) === String(f._id)).map((o) => o.value));
          if (!allowed.has(v)) return res.status(400).json({ error: 'invalid_option' });
        }
        if (f.type === 'group') {
          if (typeof v !== 'object' || Array.isArray(v)) return res.status(400).json({ error: 'invalid_group' });
          const children = assembled.grouped_inputs.filter((gi) => String(gi.field_id) === String(f._id));
          for (const gi of children) {
            if (gi.required && !(gi.field_key in (v as any))) return res.status(400).json({ error: 'missing_required' });
          }
        }
      }

      await SubmissionModel.create({
        quiz_id,
        version_label,
        answers,
        meta: meta || {},
      });
      res.status(202).json({ status: "accepted" });
    } catch (err) {
      next(err);
    }
  }
);

export default submissionsRouter;
