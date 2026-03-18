import { aiJsonCompletion } from "./client";
import { hashPrompt } from "./hash";
import {
  getCachedAI,
  saveCachedAI,
} from "./ai-cache";

export async function runAI<T>(
  prompt: string,
  options?: {
    temperature?: number;
  }
): Promise<T | null> {
  const key = hashPrompt(prompt);

  const cached = await getCachedAI(key);

  if (cached) {
    return cached.result as T;
  }

  try {
    const result = await aiJsonCompletion<T>(
      prompt,
      {
        temperature:
          options?.temperature ?? 0.2,
      }
    );

    if (result) {
      await saveCachedAI(
        key,
        prompt,
        result
      );
    }

    return result ?? null;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export { aiJsonCompletion };
