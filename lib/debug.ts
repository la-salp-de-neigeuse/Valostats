const DEBUG_ENABLED = process.env.NODE_ENV === "development" || process.env.DEBUG === "true";

export function debug(...args: unknown[]) {
  if (DEBUG_ENABLED) {
    console.log("[DEBUG]", ...args);
  }
}
