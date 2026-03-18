import { fetchJobHtml } from "@/server/job-parser/fetch-job";
import { cleanHtmlToText } from "@/server/job-parser/clean-html";

export async function urlToText(
  input: string
): Promise<string> {
  if (!input) return "";

  if (!input.startsWith("http")) {
    return input;
  }

  try {
    const html = await fetchJobHtml(input);

    const text = cleanHtmlToText(html);

    return text;
  } catch (err) {
    console.error("URL parse failed", err);

    return input;
  }
}