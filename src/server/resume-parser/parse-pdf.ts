import PDFParser from "pdf2json";

type PdfTextRun = {
  T: string;
};

type PdfTextItem = {
  R: PdfTextRun[];
};

type PdfPage = {
  Texts: PdfTextItem[];
};

type PdfData = {
  Pages: PdfPage[];
};

type PdfParserError =
  | Error
  | {
      parserError: Error;
    };

export async function parsePdf(
  buffer: Buffer
): Promise<string> {
  try {
    if (!buffer || buffer.length === 0) {
      throw new Error(
        "PDF buffer is empty."
      );
    }

    const extractedText =
      await extractTextFromPdf(
        buffer
      );

    if (
      !extractedText ||
      extractedText.trim().length === 0
    ) {
      throw new Error(
        "No readable text could be extracted from the PDF."
      );
    }

    return extractedText.trim();
  } catch (error) {
    console.error(
      "[PDF_PARSE_ERROR]",
      error
    );

    throw new Error(
      "Failed to parse PDF resume."
    );
  }
}

async function extractTextFromPdf(
  buffer: Buffer
): Promise<string> {
  return new Promise(
    (
      resolve,
      reject
    ) => {
      const pdfParser =
        new PDFParser();

      pdfParser.on(
        "pdfParser_dataError",
        (
          error: PdfParserError
        ) => {
          if (
            error instanceof Error
          ) {
            reject(error);

            return;
          }

          reject(
            error.parserError
          );
        }
      );

      pdfParser.on(
        "pdfParser_dataReady",
        (
          pdfData: PdfData
        ) => {
          try {
            const text =
              pdfData.Pages
                .map(
                  (
                    page
                  ) =>
                    page.Texts
                      .map(
                        (
                          textItem
                        ) =>
                          textItem.R
                            .map(
                              (
                                run
                              ) =>
                                decodeURIComponent(
                                  run.T
                                )
                            )
                            .join("")
                      )
                      .join(" ")
                )
                .join("\n");

            resolve(text);
          } catch (error) {
            reject(error);
          }
        }
      );

      pdfParser.parseBuffer(
        buffer
      );
    }
  );
}