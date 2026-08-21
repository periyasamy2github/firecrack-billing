// `.unwrap()` rejects with a plain object, not an Error, so read `message` off anything.
export const errorMessage = (error: unknown, fallback: string): string =>
  (error as { message?: string })?.message || fallback
