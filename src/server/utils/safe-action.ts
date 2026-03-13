import { logError } from "./logger";

export async function safeAction<T>(
  fn: () => Promise<T>,
  label?: string
): Promise<T | null> {
  try {
    return await fn();
  } catch (err) {
    logError(
      "ACTION ERROR",
      label,
      err
    );
    return null;
  }
}