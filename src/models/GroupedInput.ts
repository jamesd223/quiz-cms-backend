import mongoose, { Schema } from "mongoose";
import type { InferSchemaType } from "mongoose";

const GroupedInputSchema = new Schema(
  {
    field_id: {
      type: Schema.Types.ObjectId,
      ref: "fields",
      required: true,
      index: true,
    },
    order_index: { type: Number, required: true },
    is_visible: { type: Boolean, default: true },
    field_key: { type: String, required: true },
    label: { type: String },
    input_type: { type: String, required: true },
    unit: { type: String },
    min: { type: Number },
    max: { type: Number },
    placeholder: { type: String },
    required: { type: Boolean, default: false },
    row_index: { type: Number },
    col_index: { type: Number },
    row_span: { type: Number },
    col_span: { type: Number },
  },
  { timestamps: true }
);

export type GroupedInput = InferSchemaType<typeof GroupedInputSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const GroupedInputModel = mongoose.model(
  "grouped_inputs",
  GroupedInputSchema
);

export default GroupedInputModel;
