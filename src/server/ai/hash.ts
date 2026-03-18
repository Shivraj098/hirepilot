import crypto from "crypto";

export function hashPrompt(text: string) {
  return crypto
    .createHash("sha256")
    .update(text)
    .digest("hex");
}