import { parseResumeContent }
  from "../utils/resume-parser";

export function formatResumeText(
  content: unknown
): string {

  const r =
    parseResumeContent(
      content
    );

  let text = "";

  text += "SUMMARY\n";

  text +=
    (r.summary ?? "") +
    "\n\n";

  text += "SKILLS\n";

  text +=
    (r.skills ?? []).join(", ");

  text += "\n\n";

  text += "EXPERIENCE\n";

  for (
    const e of r.experience ?? []
  ) {
    text +=
      `${e.role ?? ""} - ${
        e.company ?? ""
      }\n`;

    text +=
      `${e.duration ?? ""}\n`;

    text +=
      `${e.description ?? ""}\n\n`;
  }

  text += "\nEDUCATION\n";

  for (
    const e of r.education ?? []
  ) {
    text +=
      `${e.degree ?? ""} - ${
        e.institution ?? ""
      }\n`;

    text +=
      `${e.duration ?? ""}\n\n`;
  }

  return text;
}