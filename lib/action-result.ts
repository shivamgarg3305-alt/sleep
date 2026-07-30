/**
 * Every Server Action in this app returns one of these instead of throwing.
 * Server Action errors thrown across the client/server boundary get
 * serialized into an opaque "An error occurred" message by Next.js in
 * production, which is useless for toast copy — so we catch internally and
 * return a real message instead.
 */
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export function actionError(err: unknown, fallback = "Something went wrong. Please try again."): {
  success: false;
  error: string;
} {
  if (err instanceof Error) {
    if (err.message === "UNAUTHENTICATED") {
      return { success: false, error: "You must be signed in to do that." };
    }
    return { success: false, error: err.message || fallback };
  }
  return { success: false, error: fallback };
}
