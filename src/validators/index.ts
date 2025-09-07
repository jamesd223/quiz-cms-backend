import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
extendZodWithOpenApi(z);

export const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/);

export const mediaSchema = z.object({
  _id: objectId.optional(),
  type: z.enum(["icon", "image", "logo", "avatar"]),
  url: z.string().url(),
  alt: z.string().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  locale: z.string().optional(),
});

export const brandSchema = z.object({
  _id: objectId.optional(),
  name: z.string().min(1),
});

export const quizSchema = z.object({
  _id: objectId.optional(),
  brand_id: objectId,
  slug: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  locale_default: z.string().optional(),
  progress_style: z.string().optional(),
  show_trust_strip: z.boolean().optional(),
  show_seen_on: z.boolean().optional(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
});

export const quizVersionSchema = z.object({
  _id: objectId.optional(),
  quiz_id: objectId,
  label: z.string().min(1),
  traffic_weight: z.number().int().nonnegative().default(0),
  is_default: z.boolean().default(false),
});

export const stepSchema = z.object({
  _id: objectId.optional(),
  quiz_version_id: objectId,
  order_index: z.number().int().nonnegative(),
  is_visible: z.boolean().default(true),
  title: z.string().optional(),
  description: z.string().optional(),
  footnote_text: z.string().optional(),
  cta_text: z.string().optional(),
  layout: z.string().optional(),
  media_id: objectId.optional(),
  grid_columns: z.number().int().positive().default(1),
  grid_rows: z.number().int().positive().optional(),
  grid_gap_px: z.number().int().nonnegative().optional(),
});

export const fieldType = z.enum([
  "choice_single",
  "choice_multi",
  "input_text",
  "input_number",
  "input_email",
  "input_phone",
  "date",
  "slider",
  "group",
]);

export const fieldSchema = z.object({
  _id: objectId.optional(),
  step_id: objectId,
  order_index: z.number().int().nonnegative(),
  is_visible: z.boolean().default(true),
  key: z.string().min(1),
  label: z.string().optional(),
  help_text: z.string().optional(),
  type: fieldType,
  required: z.boolean().default(false),
  placeholder: z.string().optional(),
  input_mask: z.string().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  unit: z.string().optional(),
  validation_regex: z.string().optional(),
  validation_message: z.string().optional(),
  row_index: z.number().int().nonnegative().optional(),
  col_index: z.number().int().nonnegative().optional(),
  row_span: z.number().int().positive().optional(),
  col_span: z.number().int().positive().optional(),
  container_layout_mode: z.string().optional(),
  container_grid_columns: z.number().int().positive().optional(),
  container_grid_rows: z.number().int().positive().optional(),
  container_gap_px: z.number().int().nonnegative().optional(),
  randomize_options: z.boolean().default(false),
  value_format: z.string().optional(),
  default_value: z.any().optional(),
});

export const optionSchema = z.object({
  _id: objectId.optional(),
  field_id: objectId,
  order_index: z.number().int().nonnegative(),
  is_visible: z.boolean().default(true),
  label: z.string().optional(),
  description: z.string().optional(),
  value: z.string().min(1),
  icon_media_id: objectId.optional(),
  image_media_id: objectId.optional(),
  is_default: z.boolean().default(false),
  score: z.number().optional(),
  row_index: z.number().int().nonnegative().optional(),
  col_index: z.number().int().nonnegative().optional(),
  row_span: z.number().int().positive().optional(),
  col_span: z.number().int().positive().optional(),
});

export const groupedInputSchema = z.object({
  _id: objectId.optional(),
  field_id: objectId,
  order_index: z.number().int().nonnegative(),
  is_visible: z.boolean().default(true),
  field_key: z.string().min(1),
  label: z.string().optional(),
  input_type: z.string().min(1),
  unit: z.string().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  placeholder: z.string().optional(),
  required: z.boolean().default(false),
  row_index: z.number().int().nonnegative().optional(),
  col_index: z.number().int().nonnegative().optional(),
  row_span: z.number().int().positive().optional(),
  col_span: z.number().int().positive().optional(),
});

export const submissionSchema = z.object({
  _id: objectId.optional(),
  quiz_id: objectId,
  version_label: z.string().min(1),
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

export const userSchema = z.object({
  _id: objectId.optional(),
  email: z.string().email(),
  password_hash: z.string().min(1),
  role: z.enum(["admin", "editor", "viewer"]),
  lastLoginAt: z.coerce.date().optional(),
});

export const refreshTokenSchema = z.object({
  _id: objectId.optional(),
  user_id: objectId,
  token_hash: z.string().min(1),
  exp: z.coerce.date(),
});

export type Id = z.infer<typeof objectId>;
