export function logInfo(
  message: string,
  ...args: unknown[]
) {
  console.log(
    "[INFO]",
    message,
    ...args
  );
}

export function logError(
  message: string,
  ...args: unknown[]
) {
  console.error(
    "[ERROR]",
    message,
    ...args
  );
}

export function logWarn(
  message: string,
  ...args: unknown[]
) {
  console.warn(
    "[WARN]",
    message,
    ...args
  );
}