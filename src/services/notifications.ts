/**
 * Notifications module (future email + push notifications).
 *
 * - `notification_subscribers` — email addresses and web-push endpoints,
 *   with a language preference and topic list. Anyone may subscribe; rows
 *   start unconfirmed and only staff can read or manage them.
 * - `notification_log`         — staff-only audit trail of what was sent.
 *
 * Actual sending must happen server-side (server function + cron), never in
 * the browser: this module only handles subscription capture.
 */
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type NotificationSubscriber = Tables<"notification_subscribers">;
export type NotificationLogEntry = Tables<"notification_log">;

/** Topics a visitor can opt into. */
export type NotificationTopic = "news" | "events" | "gallery" | "archive";

/** Subscribes an email address. Rows are created unconfirmed (double opt-in). */
export async function subscribeEmail(params: {
  email: string;
  language?: "ar" | "en";
  topics?: NotificationTopic[];
}): Promise<void> {
  const { error } = await supabase.from("notification_subscribers").insert({
    channel: "email",
    email: params.email.trim().toLowerCase(),
    language: params.language ?? "ar",
    topics: params.topics ?? ["news"],
    confirmed: false,
  });
  if (error) throw new Error(error.message);
}

/** Stores a browser push subscription (endpoint + VAPID keys). */
export async function subscribePush(params: {
  endpoint: string;
  keys: Record<string, string>;
  language?: "ar" | "en";
  topics?: NotificationTopic[];
}): Promise<void> {
  const { error } = await supabase.from("notification_subscribers").insert({
    channel: "push",
    push_endpoint: params.endpoint,
    push_keys: params.keys,
    language: params.language ?? "ar",
    topics: params.topics ?? ["news"],
    confirmed: false,
  });
  if (error) throw new Error(error.message);
}

/** Staff-only: recent delivery attempts, newest first. */
export async function fetchNotificationLog(limit = 50): Promise<NotificationLogEntry[]> {
  const { data, error } = await supabase
    .from("notification_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return data ?? [];
}
