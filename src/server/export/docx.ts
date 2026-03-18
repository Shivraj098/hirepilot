import {
  Document,
  Packer,
  Paragraph,
} from "docx";

import { formatResumeText } from "./format-resume";

export async function exportResumeDocx(
  content: unknown
) {
  const text =
    formatResumeText(content);

  const lines =
    text.split("\n");

  const doc =
    new Document({
      sections: [
        {
          children: lines.map(
            (l) =>
              new Paragraph({
                text: l,
              })
          ),
        },
      ],
    });

  const buffer =
    await Packer.toBuffer(
      doc
    );

  return buffer;
}