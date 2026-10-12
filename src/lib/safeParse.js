export function safeParse(str, fallback) {
  try {
    const parsed = JSON.parse(str);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}