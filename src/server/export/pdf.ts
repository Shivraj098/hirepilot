import { PDFDocument } from "pdf-lib";

import { formatResumeText } from "./format-resume";

export async function exportResumePDF(
  content: unknown
) {
  const text =
    formatResumeText(content);

  const pdf =
    await PDFDocument.create();

  const page =
    pdf.addPage();

  const font =
    await pdf.embedFont(
      "Helvetica"
    );

  const lines =
    text.split("\n");

  let y = 750;

  for (const line of lines) {
    page.drawText(line, {
      x: 50,
      y,
      size: 10,
      font,
      maxWidth: 500,
    });

    y -= 14;

    if (y < 50) {
      const newPage =
        pdf.addPage();

      y = 750;

      newPage.drawText(line, {
        x: 50,
        y,
        size: 10,
        font,
        maxWidth: 500,
      });
    }
  }

  const bytes =
    await pdf.save();

  return bytes;
}