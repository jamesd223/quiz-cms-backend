import mongoose, { Schema } from "mongoose";
import type { InferSchemaType } from "mongoose";

const OptionSchema = new Schema(
  {
    field_id: {
      type: Schema.Types.ObjectId,
      ref: "fields",
      required: true,
      index: true,
    },
    order_index: { type: Number, required: true },
    is_visible: { type: Boolean, default: true },
    label: { type: String },
    description: { type: String },
    value: { type: String, required: true, index: true },
    icon_media_id: { type: Schema.Types.ObjectId, ref: "media" },
    image_media_id: { type: Schema.Types.ObjectId, ref: "media" },
    is_default: { type: Boolean, default: false },
    score: { type: Number },
    row_index: { type: Number },
    col_index: { type: Number },
    row_span: { type: Number },
    col_span: { type: Number },
  },
  { timestamps: true }
);

OptionSchema.index({ field_id: 1, value: 1 }, { unique: true });

export type Option = InferSchemaType<typeof OptionSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const OptionModel = mongoose.model("options", OptionSchema);

export default OptionModel;
