import mongoose, { Schema } from "mongoose";
import type { InferSchemaType } from "mongoose";

const QuizVersionSchema = new Schema(
  {
    quiz_id: {
      type: Schema.Types.ObjectId,
      ref: "quizzes",
      required: true,
      index: true,
    },
    label: { type: String, required: true },
    traffic_weight: { type: Number, default: 0 },
    is_default: { type: Boolean, default: false, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

QuizVersionSchema.index({ quiz_id: 1, is_default: 1 });

export type QuizVersion = InferSchemaType<typeof QuizVersionSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const QuizVersionModel = mongoose.model(
  "quiz_versions",
  QuizVersionSchema
);

export default QuizVersionModel;
