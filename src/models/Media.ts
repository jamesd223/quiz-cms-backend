import mongoose, { Schema } from "mongoose";
import type { InferSchemaType } from "mongoose";

const MediaSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["icon", "image", "logo", "avatar"],
      required: true,
    },
    url: { type: String, required: true },
    alt: { type: String },
    width: { type: Number },
    height: { type: Number },
    locale: { type: String },
  },
  { timestamps: true }
);

export type Media = InferSchemaType<typeof MediaSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const MediaModel = mongoose.model("media", MediaSchema);

export default MediaModel;
