export const GENERIC_ERROR = 'Something went wrong. Try again.'
export const NO_CONNECTION_ERROR = 'No connection. Check internet and try again.'

// Reads message off thunk rejections; on a 5xx the caller's message wins.
export const errorMessage = (error: unknown, fallback: string): string => {
  const message = (error as { message?: string })?.message
  if (!message || message === GENERIC_ERROR) return fallback
  return message
}
