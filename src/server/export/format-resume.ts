import { parseResumeContent } from "../ai/utils/resume-parser";

export function formatResumeText(
  content: unknown
): string {

  const r =
    parseResumeContent(
      content
    );

  let text = "";

  text += "SUMMARY\n";
  text += r.summary + "\n\n";

  text += "SKILLS\n";
  text += r.skills.join(", ");
  text += "\n\n";

  text += "EXPERIENCE\n";

  for (const e of r.experience) {
    text += JSON.stringify(e);
    text += "\n";
  }

  text += "\nEDUCATION\n";

  for (const e of r.education) {
    text += JSON.stringify(e);
    text += "\n";
  }

  return text;
}