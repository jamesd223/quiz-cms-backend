import mongoose, { Schema } from "mongoose";
import type { InferSchemaType } from "mongoose";

const QuizSchema = new Schema(
  {
    brand_id: { type: Schema.Types.ObjectId, ref: "brands", required: true },
    slug: { type: String, required: true },
    title: { type: String, required: true },
    subtitle: { type: String },
    locale_default: { type: String },
    progress_style: { type: String },
    show_trust_strip: { type: Boolean, default: false },
    show_seen_on: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
  },
  { timestamps: true }
);

QuizSchema.index({ slug: 1 }, { unique: true });

export type Quiz = InferSchemaType<typeof QuizSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const QuizModel = mongoose.model("quizzes", QuizSchema);

export default QuizModel;
