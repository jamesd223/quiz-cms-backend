import mongoose, { Schema } from "mongoose";
import type { InferSchemaType } from "mongoose";

const BrandSchema = new Schema(
  {
    name: { type: String, required: true },
  },
  { timestamps: true }
);

export type Brand = InferSchemaType<typeof BrandSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const BrandModel = mongoose.model("brands", BrandSchema);

export default BrandModel;
