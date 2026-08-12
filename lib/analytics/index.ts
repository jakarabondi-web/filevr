/**
 * Analytics adapter seam. Never pass filenames or document content — only
 * privacy-safe event names/properties (spec section 16).
 */
type AnalyticsEvent =
  | "homepage_viewed"
  | "upload_started"
  | "upload_completed"
  | "upload_failed"
  | "tool_recommended"
  | "tool_selected"
  | "job_started"
  | "job_completed"
  | "job_failed"
  | "result_downloaded"
  | "upgrade_prompt_viewed"
  | "checkout_started"
  | "subscription_started";

export function track(event: AnalyticsEvent, properties: Record<string, string | number | boolean> = {}): void {
  if (process.env.NODE_ENV !== "production") {
    console.debug("[analytics]", event, properties);
  }
  // TODO: forward to real analytics provider (PostHog/Amplitude/etc).
}
