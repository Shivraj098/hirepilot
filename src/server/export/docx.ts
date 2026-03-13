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
    formatResumeText(
      content
    );

  const doc =
    new Document({
      sections: [
        {
          children: [
            new Paragraph(
              text
            ),
          ],
        },
      ],
    });

  const buffer =
    await Packer.toBuffer(
      doc
    );

  return buffer;
}