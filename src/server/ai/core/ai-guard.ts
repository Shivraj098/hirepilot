import { AI_LIMIT, AI_WINDOW_MS } from "@/server/config/constants";


const calls = new Map<
  string,
  { count: number; time: number }
>();


const LIMIT = AI_LIMIT;
const WINDOW = AI_WINDOW_MS;

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