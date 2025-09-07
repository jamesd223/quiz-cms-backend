import rateLimit from "express-rate-limit";

export function createPublicRateLimit() {
  const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000);
  const max = Number(process.env.RATE_LIMIT_MAX || 120);
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
  });
}

export function createSubmissionRateLimit() {
  const windowMs = Number(process.env.RATE_LIMIT_SUBMIT_WINDOW_MS || 60_000);
  const max = Number(process.env.RATE_LIMIT_SUBMIT_MAX || 30);
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
  });
}

export default createPublicRateLimit;
