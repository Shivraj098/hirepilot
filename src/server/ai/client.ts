import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/*
========================================
AI CONFIG
========================================
*/

export const AI_MODEL = "gpt-4o-mini";

export const AI_TEMPERATURE = 0.2;

export const AI_MAX_TOKENS = 1500;

/*
========================================
SAFE TEXT COMPLETION
========================================
*/

export async function aiTextCompletion(
  prompt: string,
  options?: {
    temperature?: number;
    maxTokens?: number;
  }
): Promise<string> {
  try {
    const res = await openai.chat.completions.create({
      model: AI_MODEL,
      temperature: options?.temperature ?? AI_TEMPERATURE,
      max_tokens: options?.maxTokens ?? AI_MAX_TOKENS,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return res.choices[0]?.message?.content ?? "";
  } catch (err) {
    console.error("AI TEXT ERROR", err);
    return "";
  }
}

/*
========================================
SAFE JSON COMPLETION
========================================
*/

export async function aiJsonCompletion<T>(
  prompt: string,
  options?: {
    temperature?: number;
    maxTokens?: number;
  }
): Promise<T | null> {
  try {
    const res = await openai.chat.completions.create({
      model: AI_MODEL,
      temperature: options?.temperature ?? AI_TEMPERATURE,
      max_tokens: options?.maxTokens ?? AI_MAX_TOKENS,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const text = res.choices[0]?.message?.content ?? "";

    try {
      const json = JSON.parse(text);
      return json as T;
    } catch (parseErr) {
      console.error("JSON PARSE ERROR", parseErr);
      return null;
    }
  } catch (err) {
    console.error("AI JSON ERROR", err);
    return null;
  }
}