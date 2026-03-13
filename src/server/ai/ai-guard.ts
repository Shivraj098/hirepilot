const calls = new Map<
  string,
  { count: number; time: number }
>();

const LIMIT = 20;
const WINDOW = 60 * 1000; // 1 min

export function checkAIGuard(
  userId: string
) {
  const now = Date.now();

  const data =
    calls.get(userId);

  if (!data) {
    calls.set(userId, {
      count: 1,
      time: now,
    });

    return;
  }

  if (
    now - data.time >
    WINDOW
  ) {
    calls.set(userId, {
      count: 1,
      time: now,
    });

    return;
  }

  if (data.count >= LIMIT) {
    throw new Error(
      "Too many AI requests"
    );
  }

  data.count++;
}