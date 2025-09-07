import mongoose from "mongoose";
import { BrandModel } from "../models/Brand.js";
import { QuizModel } from "../models/Quiz.js";
import { QuizVersionModel } from "../models/QuizVersion.js";
import { StepModel } from "../models/Step.js";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/quizcms";

async function run() {
  await mongoose.connect(MONGODB_URI);
  const brand = await BrandModel.create({ name: "Acme" });
  const quiz = await QuizModel.create({
    brand_id: brand._id,
    slug: "sample",
    title: "Sample Quiz",
    status: "published",
  });
  const version = await QuizVersionModel.create({
    quiz_id: quiz._id,
    label: "A",
    traffic_weight: 100,
    is_default: true,
  });
  await StepModel.create({
    quiz_version_id: version._id,
    order_index: 0,
    is_visible: true,
    title: "Step 1",
    grid_columns: 1,
  });
  await mongoose.disconnect();
  // eslint-disable-next-line no-console
  console.log("Seeded.");
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
