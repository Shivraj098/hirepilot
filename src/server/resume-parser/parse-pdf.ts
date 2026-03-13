import * as pdfjs from "pdfjs-dist";

export async function parsePdf(
  buffer: Buffer
): Promise<string> {

  const loadingTask =
    pdfjs.getDocument({
      data: buffer,
    });

  const pdf =
    await loadingTask.promise;

  let text = "";

  for (
    let i = 1;
    i <= pdf.numPages;
    i++
  ) {
    const page =
      await pdf.getPage(i);

    const content =
      await page.getTextContent();

    const strings =
      content.items.map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (item: any) =>
          item.str
      );

    text +=
      strings.join(" ") +
      "\n";
  }

  return text;
}