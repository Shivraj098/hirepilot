import { logError } from "./logger";
import { ActionResult, ok, fail } from "@/server/types/action.types";

export async function safeAsync<T>(
  fn: () => Promise<T>,
  label: string
): Promise<ActionResult<T>> {
  try {
    const data = await fn();
    return ok(data);
  } catch (err) {
    logError("SAFE ERROR", label, err);
    const message =
      err instanceof Error ? err.message : "Unknown error";
    return fail(message);
  }
}

export function safeSync<T>(
  fn: () => T,
  label: string
): ActionResult<T> {
  try {
    const data = fn();
    return ok(data);
  } catch (err) {
    logError("SAFE ERROR", label, err);
    const message =
      err instanceof Error ? err.message : "Unknown error";
    return fail(message);
  }
}