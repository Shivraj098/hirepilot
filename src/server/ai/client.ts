import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/*
========================================
CONFIG
========================================
*/

export const AI_MODEL = "gpt-4o-mini";
export const AI_TEMPERATURE = 0.2;
export const AI_MAX_TOKENS = 1500;

const AI_TIMEOUT = 15000;
const AI_RETRIES = 2;

/*
========================================
TIMEOUT
========================================
*/

function withTimeout<T>(
  promise: Promise<T>,
  ms: number
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("AI timeout"));
    }, ms);

    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

/*
========================================
SAFE JSON PARSE
========================================
*/

function safeJsonParse<T>(
  text: string
): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    try {
      const match = text.match(
        /\{[\s\S]*\}|\[[\s\S]*\]/
      );

      if (!match) return null;

      return JSON.parse(
        match[0]
      ) as T;
    } catch {
      return null;
    }
  }
}

/*
========================================
BASE AI CALL
========================================
*/

async function callAI(
  prompt: string,
  options?: {
    temperature?: number;
    maxTokens?: number;
  }
) {
  return withTimeout(
    openai.chat.completions.create({
      model: AI_MODEL,
      temperature:
        options?.temperature ??
        AI_TEMPERATURE,

      max_tokens:
        options?.maxTokens ??
        AI_MAX_TOKENS,

      messages: [
        {
          role: "system",
          content:
            "Return clean response. If JSON requested, return valid JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
    AI_TIMEOUT
  );
}

/*
========================================
TEXT COMPLETION
========================================
*/

export async function aiTextCompletion(
  prompt: string,
  options?: {
    temperature?: number;
    maxTokens?: number;
  }
): Promise<string> {

  for (let i = 0; i <= AI_RETRIES; i++) {
    try {

      const res =
        await callAI(
          prompt,
          options
        );

      return (
        res.choices[0]
          ?.message
          ?.content ?? ""
      );

    } catch (err) {

      console.error(
        "AI TEXT ERROR",
        err
      );

      if (i === AI_RETRIES) {
        return "";
      }
    }
  }

  return "";
}

/*
========================================
JSON COMPLETION
========================================
*/

export async function aiJsonCompletion<T>(
  prompt: string,
  options?: {
    temperature?: number;
    maxTokens?: number;
  }
): Promise<T | null> {

  for (let i = 0; i <= AI_RETRIES; i++) {

    try {

      const res =
        await callAI(
          prompt,
          options
        );

      const text =
        res.choices[0]
          ?.message
          ?.content ?? "";

      if (!text) return null;

      const parsed =
        safeJsonParse<T>(text);

      if (parsed) {
        return parsed;
      }

    } catch (err) {

      console.error(
        "AI JSON ERROR",
        err
      );

      if (i === AI_RETRIES) {
        return null;
      }
    }
  }

  return null;
}