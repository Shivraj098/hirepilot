import { PDFDocument } from "pdf-lib";
import { formatResumeText } from "./format-resume";

export async function exportResumePDF(
  content: unknown
) {

  const text =
    formatResumeText(
      content
    );

  const pdf =
    await PDFDocument.create();

  const page =
    pdf.addPage();

  const font =
    await pdf.embedFont(
      "Helvetica"
    );

  page.drawText(text, {
    x: 50,
    y: 700,
    size: 10,
    font,
    maxWidth: 500,
  });

  const bytes =
    await pdf.save();

  return bytes;
}