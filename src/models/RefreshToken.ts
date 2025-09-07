import mongoose, { Schema } from "mongoose";
import type { InferSchemaType } from "mongoose";

const RefreshTokenSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
      index: true,
    },
    token_hash: { type: String, required: true },
    exp: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export type RefreshToken = InferSchemaType<typeof RefreshTokenSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const RefreshTokenModel = mongoose.model(
  "refresh_tokens",
  RefreshTokenSchema
);

export default RefreshTokenModel;
