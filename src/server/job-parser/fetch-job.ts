export async function fetchJobHtml(
  url: string
) {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0",
    },
  });

  if (!res.ok) {
    throw new Error(
      "Failed to fetch job page"
    );
  }

  return res.text();
}