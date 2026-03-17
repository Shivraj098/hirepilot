"use server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function diffVersions(a: any, b: any) {
  const diff: Record<string, unknown> = {};

  for (const key of Object.keys(b)) {
    if (JSON.stringify(a[key]) !== JSON.stringify(b[key])) {
      diff[key] = {
        before: a[key],
        after: b[key],
      };
    }
  }

  return diff;
}