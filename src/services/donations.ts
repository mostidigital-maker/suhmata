/**
 * Donations module (future donation system).
 *
 * Covers three tables:
 * - `payment_methods`     — how supporters can pay (bank, PayPal, cash, ...).
 * - `donation_campaigns`  — fundraising campaigns with a goal and progress.
 * - `donations`           — individual donation records.
 *
 * Read access is public for active/completed public rows only; every write is
 * restricted to staff by RLS, so the UI never needs to guard these calls.
 */
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type PaymentMethod = Tables<"payment_methods">;
export type DonationCampaign = Tables<"donation_campaigns">;
export type Donation = Tables<"donations">;

/** Payment method kinds understood by the UI layer. */
export type PaymentMethodKind = "bank" | "paypal" | "card" | "cash" | "other";
/** Lifecycle of a donation record. */
export type DonationStatus = "pending" | "completed" | "failed" | "refunded";

function unwrap<T>(result: { data: T | null; error: { message: string } | null }): T | null {
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

/** Active payment methods, ordered for display. */
export async function fetchPaymentMethods(): Promise<PaymentMethod[]> {
  return (
    unwrap(
      await supabase
        .from("payment_methods")
        .select("*")
        .eq("active", true)
        .order("sort_order", { ascending: true }),
    ) ?? []
  );
}

/** Active campaigns, newest configured first. */
export async function fetchDonationCampaigns(): Promise<DonationCampaign[]> {
  return (
    unwrap(
      await supabase
        .from("donation_campaigns")
        .select("*")
        .eq("active", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false }),
    ) ?? []
  );
}

export async function fetchCampaignBySlug(slug: string): Promise<DonationCampaign | null> {
  return unwrap(
    await supabase.from("donation_campaigns").select("*").eq("slug", slug).maybeSingle(),
  );
}

/** Public donor wall: completed donations the donor allowed to be shown. */
export async function fetchPublicDonations(campaignId?: string | null, limit = 24) {
  let query = supabase
    .from("donations")
    .select("*")
    .eq("status", "completed")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (campaignId) query = query.eq("campaign_id", campaignId);
  return unwrap(await query) ?? [];
}

/**
 * Records a pledge. Kept staff-writable only for now: a public checkout flow
 * must go through a server function once a payment provider is wired up.
 */
export async function recordDonation(
  entry: Pick<
    TablesInsert<"donations">,
    | "campaign_id"
    | "payment_method_id"
    | "donor_name"
    | "donor_email"
    | "amount"
    | "currency"
    | "message"
    | "anonymous"
    | "is_public"
    | "reference"
  >,
): Promise<void> {
  const { error } = await supabase.from("donations").insert({ ...entry, status: "pending" });
  if (error) throw new Error(error.message);
}
