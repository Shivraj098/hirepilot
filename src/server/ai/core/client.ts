import OpenAI from "openai";
import { logError } from "@/server/utils/logger";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set");
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const AI_MODEL = "gpt-4o-mini";
export const AI_TEMPERATURE = 0.2;
export const AI_MAX_TOKENS = 2000;
export const AI_TIMEOUT_MS = 20000;
export const AI_RETRIES = 2;

// ==============================
// TIMEOUT WRAPPER
// ==============================

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`AI request timed out after ${ms}ms`)),
      ms
    );
    promise
      .then((v) => { clearTimeout(timer); resolve(v); })
      .catch((e) => { clearTimeout(timer); reject(e); });
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
    const objectMatch = text.match(/\{[\s\S]*\}/);
    const arrayMatch = text.match(/\[[\s\S]*\]/);
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
  if (err instanceof OpenAI.APIError) {
    return [400, 401, 403, 404, 422].includes(err.status);
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
  }
) {
  return withTimeout(
    openai.chat.completions.create({
      model: AI_MODEL,
      temperature: options?.temperature ?? AI_TEMPERATURE,
      max_tokens: options?.maxTokens ?? AI_MAX_TOKENS,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
    AI_TIMEOUT_MS
  );
}

// ==============================
// TEXT COMPLETION
// ==============================

export async function aiTextCompletion(
  prompt: string,
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  for (let i = 0; i <= AI_RETRIES; i++) {
    try {
      const res = await callAI(
        "You are a helpful assistant.",
        prompt,
        options
      );
      return res.choices[0]?.message?.content ?? "";
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
  options?: { temperature?: number; maxTokens?: number }
): Promise<T | null> {
  for (let i = 0; i <= AI_RETRIES; i++) {
    try {
      const res = await callAI(systemPrompt, userPrompt, options);
      const text = res.choices[0]?.message?.content ?? "";
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