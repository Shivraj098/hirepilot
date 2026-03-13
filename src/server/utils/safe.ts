export async function safeAsync<T>(
  fn: () => Promise<T>,
  label?: string
): Promise<T | null> {

  try {
    return await fn();

  } catch (err) {

    console.error(
      "SAFE ERROR",
      label ?? "",
      err
    );

    return null;
  }

}


export function safeSync<T>(
  fn: () => T,
  label?: string
): T | null {

  try {
    return fn();

  } catch (err) {

    console.error(
      "SAFE ERROR",
      label ?? "",
      err
    );

    return null;
  }

}
