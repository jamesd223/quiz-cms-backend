import mongoose, { Schema } from "mongoose";
import type { InferSchemaType } from "mongoose";

const SubmissionSchema = new Schema(
  {
    quiz_id: {
      type: Schema.Types.ObjectId,
      ref: "quizzes",
      required: true,
      index: true,
    },
    version_label: { type: String, required: true },
    answers: { type: Schema.Types.Mixed, required: true },
    meta: {
      ua: String,
      locale: String,
      ip: String,
      ref: String,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

SubmissionSchema.index({ quiz_id: 1, createdAt: -1 });

export type Submission = InferSchemaType<typeof SubmissionSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const SubmissionModel = mongoose.model("submissions", SubmissionSchema);

export default SubmissionModel;
