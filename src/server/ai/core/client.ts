import { GoogleGenAI } from "@google/genai";
import { logError } from "@/server/utils/logger";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set");
}

// Initialize the Gemini client
export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Using the fast, cost-effective model perfect for heavy text processing
export const AI_MODEL = "gemini-2.0-flash-lite";
export const AI_TEMPERATURE = 0.2;
export const AI_MAX_TOKENS = 1200;
export const AI_TIMEOUT_MS = 20000;
export const AI_RETRIES = 1;

// ==============================
// TIMEOUT WRAPPER
// ==============================

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`AI request timed out after ${ms}ms`)),
      ms,
    );
    promise
      .then((v) => {
        clearTimeout(timer);
        resolve(v);
      })
      .catch((e) => {
        clearTimeout(timer);
        reject(e);
      });
  });
}

// ==============================
// SAFE JSON PARSE
// ==============================

export function safeJsonParse<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    // Try to extract JSON object or array from text
    const objectMatch = text.match(/\{[\s\S]*?\}/);

    const arrayMatch = text.match(/\[[\s\S]*?\]/);
    const match = objectMatch ?? arrayMatch;
    if (!match) return null;
    try {
      return JSON.parse(match[0]) as T;
    } catch {
      return null;
    }
  }
}

// ==============================
// NON-RETRYABLE ERROR CHECK
// ==============================

function isNonRetryable(err: unknown): boolean {
  // Check standard HTTP error statuses returned by the fetch API inside the SDK
  // We exclude 429 (Rate Limit) so the system will attempt to retry it
  if (
    typeof err === "object" &&
    err !== null &&
    "status" in err &&
    typeof (err as Record<string, unknown>).status === "number"
  ) {
    return [400, 401, 403, 404].includes((err as { status: number }).status);
  }
  return false;
}

// ==============================
// BASE AI CALL
// ==============================

async function callAI(
  systemPrompt: string,
  userPrompt: string,
  options?: {
    temperature?: number;
    maxTokens?: number;
  },
) {
  return withTimeout(
    ai.models.generateContent({
      model: AI_MODEL,
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: options?.temperature ?? AI_TEMPERATURE,
        // Note: Gemini uses maxOutputTokens instead of max_tokens
        maxOutputTokens: options?.maxTokens ?? AI_MAX_TOKENS,
        // Forces the model to return a JSON-compatible string
        responseMimeType: "application/json",
      },
    }),
    AI_TIMEOUT_MS,
  );
}

// ==============================
// TEXT COMPLETION
// ==============================

export async function aiTextCompletion(
  prompt: string,
  options?: { temperature?: number; maxTokens?: number },
): Promise<string> {
  for (let i = 0; i <= AI_RETRIES; i++) {
    try {
      const res = await callAI("You are a helpful assistant.", prompt, options);
      // Gemini simplifies the response object significantly
      return res.text ?? "";
    } catch (err) {
      if (isNonRetryable(err)) {
        logError("AI TEXT NON-RETRYABLE", err);
        return "";
      }
      logError(`AI TEXT ERROR (attempt ${i + 1})`, err);
      if (i === AI_RETRIES) return "";
    }
  }
  return "";
}

// ==============================
// JSON COMPLETION
// ==============================

export async function aiJsonCompletion<T>(
  systemPrompt: string,
  userPrompt: string,
  options?: { temperature?: number; maxTokens?: number },
): Promise<T | null> {
  for (let i = 0; i <= AI_RETRIES; i++) {
    try {
      const res = await callAI(systemPrompt, userPrompt, options);
      const text = res.text ?? "";

      if (!text) return null;
      const parsed = safeJsonParse<T>(text);
      if (parsed) return parsed;
    } catch (err) {
      if (isNonRetryable(err)) {
        logError("AI JSON NON-RETRYABLE", err);
        return null;
      }
      logError(`AI JSON ERROR (attempt ${i + 1})`, err);
      if (i === AI_RETRIES) return null;
    }
  }
  return null;
}
