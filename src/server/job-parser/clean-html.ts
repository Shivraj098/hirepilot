import * as cheerio from "cheerio";

export function cleanHtmlToText(
  html: string
) {
  const $ = cheerio.load(html);

  $("script").remove();
  $("style").remove();
  $("noscript").remove();

  const text = $("body")
    .text()
    .replace(/\s+/g, " ")
    .trim();

  return text.slice(0, 15000);
}