import cors from "cors";

export function createCors() {
  const origins = (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, false);
      if (origins.length === 0 || origins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  });
}

export default createCors;
