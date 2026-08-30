export const GENERIC_ERROR = 'Something went wrong. Try again.'
export const NO_CONNECTION_ERROR = 'No connection. Check internet and try again.'

// `.unwrap()` rejects with a plain object, not an Error, so read `message` off anything.
// On a crash (5xx) the caller's action message wins over the generic one.
export const errorMessage = (error: unknown, fallback: string): string => {
  const message = (error as { message?: string })?.message
  if (!message || message === GENERIC_ERROR) return fallback
  return message
}
