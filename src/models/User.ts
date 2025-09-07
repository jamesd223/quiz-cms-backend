import mongoose, { Schema } from "mongoose";
import type { InferSchemaType } from "mongoose";

const UserSchema = new Schema(
  {
    email: { type: String, required: true },
    password_hash: { type: String, required: true },
    role: { type: String, enum: ["admin", "editor", "viewer"], required: true },
    lastLoginAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

UserSchema.index({ email: 1 }, { unique: true });

export type User = InferSchemaType<typeof UserSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const UserModel = mongoose.model("users", UserSchema);

export default UserModel;
