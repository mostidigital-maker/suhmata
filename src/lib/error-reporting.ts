export type ErrorReportOptions = {
  mechanism?: "manual" | "onerror" | "unhandledrejection" | "react_error_boundary";
  handled?: boolean;
  severity?: "error" | "warning" | "info";
};

/**
 * Reports a caught error to the console with route context.
 * Swap the body for a real error-tracking SDK (Sentry, etc.) when one is added.
 */
export function reportError(
  error: unknown,
  context: Record<string, unknown> = {},
  options: ErrorReportOptions = {},
) {
  if (typeof window === "undefined") return;
  console.error("[error-boundary]", error, {
    route: window.location.pathname,
    mechanism: options.mechanism ?? "react_error_boundary",
    severity: options.severity ?? "error",
    ...context,
  });
}
