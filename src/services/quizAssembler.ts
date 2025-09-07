import { QuizModel } from "../models/Quiz.js";
import { QuizVersionModel } from "../models/QuizVersion.js";
import { StepModel } from "../models/Step.js";
import { FieldModel } from "../models/Field.js";
import { OptionModel } from "../models/Option.js";
import { GroupedInputModel } from "../models/GroupedInput.js";
import { MediaModel } from "../models/Media.js";
import hasCollisions from "../utils/grid.js";
import { deterministicShuffle } from "../utils/shuffle.js";

export type AssembledQuiz = {
  quiz: any;
  version: any;
  steps: any[];
  fields: any[];
  options: any[];
  grouped_inputs: any[];
  media: any[];
};

export async function assembleQuizBySlug(params: {
  slug: string;
  versionOverride?: string;
  clientSeed?: string;
}): Promise<AssembledQuiz> {
  const quiz = await QuizModel.findOne({
    slug: params.slug,
    status: "published",
  }).lean();
  if (!quiz) throw Object.assign(new Error("not_found"), { status: 404 });

  let version = null as any;
  if (params.versionOverride) {
    version = await QuizVersionModel.findOne({
      quiz_id: quiz._id,
      label: params.versionOverride,
    }).lean();
  }
  if (!version) {
    version = await QuizVersionModel.findOne({
      quiz_id: quiz._id,
      is_default: true,
    }).lean();
  }
  if (!version) {
    version = await QuizVersionModel.findOne({ quiz_id: quiz._id })
      .sort({ traffic_weight: -1 })
      .lean();
  }
  if (!version) throw Object.assign(new Error("no_version"), { status: 404 });

  return assembleByQuizIdAndVersion({
    quiz,
    version,
    clientSeed: params.clientSeed || "",
  });
}

export async function assembleByQuizIdAndVersion(params: {
  quiz: any | string;
  version: any | { label: string } | string;
  clientSeed?: string;
}): Promise<AssembledQuiz> {
  const quiz =
    typeof params.quiz === "string"
      ? await QuizModel.findById(params.quiz).lean()
      : params.quiz;
  if (!quiz) throw Object.assign(new Error("not_found"), { status: 404 });

  let versionDoc: any;
  if (typeof params.version === "string") {
    versionDoc = await QuizVersionModel.findOne({
      quiz_id: quiz._id,
      label: params.version,
    }).lean();
  } else if (
    "label" in (params.version as any) &&
    !(params.version as any)._id
  ) {
    versionDoc = await QuizVersionModel.findOne({
      quiz_id: quiz._id,
      label: (params.version as any).label,
    }).lean();
  } else {
    versionDoc = params.version;
  }
  if (!versionDoc)
    throw Object.assign(new Error("no_version"), { status: 404 });

  const steps = await StepModel.find({
    quiz_version_id: versionDoc._id,
    is_visible: true,
  })
    .sort({ order_index: 1 })
    .lean();
  const stepIds = steps.map((s) => s._id);
  const fields = await FieldModel.find({
    step_id: { $in: stepIds },
    is_visible: true,
  })
    .sort({ order_index: 1 })
    .lean();
  const fieldIds = fields.map((f) => f._id);
  let options = await OptionModel.find({
    field_id: { $in: fieldIds },
    is_visible: true,
  })
    .sort({ order_index: 1 })
    .lean();
  const groupedInputs = await GroupedInputModel.find({
    field_id: { $in: fieldIds },
    is_visible: true,
  })
    .sort({ order_index: 1 })
    .lean();

  // Deterministic option shuffling per field when enabled
  const clientSeed = params.clientSeed || "";
  const shuffled: Record<string, any[]> = {};
  for (const field of fields) {
    if (String(field.type).startsWith("choice") && field.randomize_options) {
      const values = options.filter(
        (o) => String(o.field_id) === String(field._id)
      );
      const seed = `${quiz._id}:${versionDoc.label}:${field._id}:${clientSeed}`;
      shuffled[String(field._id)] = deterministicShuffle(values, seed);
    }
  }
  // Replace options list if shuffled present
  if (Object.keys(shuffled).length > 0) {
    const result: any[] = [];
    for (const field of fields) {
      const sid = String(field._id);
      if (shuffled[sid]) {
        result.push(...shuffled[sid]!);
      } else {
        result.push(...options.filter((o) => String(o.field_id) === sid));
      }
    }
    options = result;
  }

  // Validation checks
  for (const s of steps) {
    if (!s.grid_columns || s.grid_columns < 1)
      throw Object.assign(new Error("invalid_step_grid"), { status: 400 });
    const visibleFields = fields.filter(
      (f) => String(f.step_id) === String(s._id)
    );
    if (s.is_visible && visibleFields.length === 0)
      throw Object.assign(new Error("empty_visible_step"), { status: 400 });
    if (hasCollisions(visibleFields))
      throw Object.assign(new Error("grid_collision"), { status: 400 });
  }
  // Container-level collisions for manual layout
  for (const f of fields) {
    if (f.container_layout_mode === "manual") {
      const groupItems = groupedInputs.filter(
        (gi) => String(gi.field_id) === String(f._id)
      );
      if (hasCollisions(groupItems))
        throw Object.assign(new Error("grid_collision_container"), {
          status: 400,
        });
    }
  }

  // Collect media references
  const mediaIds = new Set<string>();
  for (const s of steps) if (s.media_id) mediaIds.add(String(s.media_id));
  for (const o of options) {
    if (o.icon_media_id) mediaIds.add(String(o.icon_media_id));
    if (o.image_media_id) mediaIds.add(String(o.image_media_id));
  }
  const media = mediaIds.size
    ? await MediaModel.find({ _id: { $in: Array.from(mediaIds) } }).lean()
    : [];

  return {
    quiz,
    version: versionDoc,
    steps,
    fields,
    options,
    grouped_inputs: groupedInputs,
    media,
  };
}

export default assembleQuizBySlug;
