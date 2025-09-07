import mongoose, { Schema } from "mongoose";
import type { InferSchemaType } from "mongoose";

const FieldSchema = new Schema(
  {
    step_id: {
      type: Schema.Types.ObjectId,
      ref: "steps",
      required: true,
      index: true,
    },
    order_index: { type: Number, required: true, index: true },
    is_visible: { type: Boolean, default: true },
    key: { type: String, required: true, index: true },
    label: { type: String },
    help_text: { type: String },
    type: {
      type: String,
      enum: [
        "choice_single",
        "choice_multi",
        "input_text",
        "input_number",
        "input_email",
        "input_phone",
        "date",
        "slider",
        "group",
      ],
      required: true,
    },
    required: { type: Boolean, default: false },
    placeholder: { type: String },
    input_mask: { type: String },
    min: { type: Number },
    max: { type: Number },
    unit: { type: String },
    validation_regex: { type: String },
    validation_message: { type: String },
    row_index: { type: Number },
    col_index: { type: Number },
    row_span: { type: Number },
    col_span: { type: Number },
    container_layout_mode: { type: String },
    container_grid_columns: { type: Number },
    container_grid_rows: { type: Number },
    container_gap_px: { type: Number },
    randomize_options: { type: Boolean, default: false },
    value_format: { type: String },
    default_value: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

FieldSchema.index({ step_id: 1, key: 1, order_index: 1 });

export type Field = InferSchemaType<typeof FieldSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const FieldModel = mongoose.model("fields", FieldSchema);

export default FieldModel;
