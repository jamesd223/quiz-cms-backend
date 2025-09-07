import crypto from "node:crypto";

export function strongEtagForJson(value: unknown): string {
  const json = JSON.stringify(value);
  const hash = crypto.createHash("sha256").update(json).digest("base64url");
  return `"${hash}"`;
}

export default strongEtagForJson;
