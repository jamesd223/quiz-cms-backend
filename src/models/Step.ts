import mongoose, { Schema } from "mongoose";
import type { InferSchemaType } from "mongoose";

const StepSchema = new Schema(
  {
    quiz_version_id: {
      type: Schema.Types.ObjectId,
      ref: "quiz_versions",
      required: true,
      index: true,
    },
    order_index: { type: Number, required: true, index: true },
    is_visible: { type: Boolean, default: true },
    title: { type: String },
    description: { type: String },
    footnote_text: { type: String },
    cta_text: { type: String },
    layout: { type: String },
    media_id: { type: Schema.Types.ObjectId, ref: "media" },
    grid_columns: { type: Number, default: 1 },
    grid_rows: { type: Number },
    grid_gap_px: { type: Number },
  },
  { timestamps: true }
);

StepSchema.index({ quiz_version_id: 1, order_index: 1 });

export type Step = InferSchemaType<typeof StepSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const StepModel = mongoose.model("steps", StepSchema);

export default StepModel;
