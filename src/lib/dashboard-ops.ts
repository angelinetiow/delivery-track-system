import type { DeliveryOrder, OrderStatus, TimelineEvent } from "@/data/types";

export function isDueToday(iso: string) {
  const d = new Date(iso);
  const t = new Date();
  return (
    d.getFullYear() === t.getFullYear() &&
    d.getMonth() === t.getMonth() &&
    d.getDate() === t.getDate()
  );
}

/** Minutes until due (negative if past). */
export function minutesUntilDue(iso: string) {
  return (new Date(iso).getTime() - Date.now()) / 60_000;
}

/**
 * Low/medium urgency but due within threshold — scheduling risk.
 */
export function isUrgencyDueMismatch(order: DeliveryOrder, withinMinutes = 120) {
  if (order.urgency === "high") return false;
  const m = minutesUntilDue(order.dueAt);
  return m >= 0 && m <= withinMinutes;
}

/** Completed orders appear in history; delivered (awaiting admin close) stays in active pipeline. */
export const TERMINAL_STATUSES: OrderStatus[] = ["completed"];

export const PIPELINE_STATUSES: OrderStatus[] = [
  "unassigned",
  "awaiting_acceptance",
  "in_transit",
  "delayed",
  "delivered",
];

export function isActiveOrder(o: DeliveryOrder) {
  return o.status !== "completed";
}

export function isOngoingDelivery(o: DeliveryOrder) {
  return (
    isActiveOrder(o) &&
    ["awaiting_acceptance", "in_transit", "delayed"].includes(o.status)
  );
}

export function isCompletedToday(order: DeliveryOrder) {
  if (order.status !== "completed") return false;
  const last = order.timeline.filter((e) => e.type === "completed").pop();
  if (!last) return false;
  return isDueToday(last.at);
}

export type ActivityFeedKind =
  | "order_created"
  | "driver_accepted"
  | "pod_submitted"
  | "status_update";

export interface DashboardActivityItem {
  id: string;
  orderId: string;
  kind: ActivityFeedKind;
  at: string;
  title: string;
  detail?: string;
  /** Primary CTA */
  ctaLabel: string;
  ctaHref: string;
  /** Optional secondary: simulate accept from feed */
  secondaryCta?: { label: string; action: "simulate_accept" };
}

function inferKind(e: TimelineEvent): ActivityFeedKind {
  if (e.type === "created") return "order_created";
  if (e.type === "driver_accepted") return "driver_accepted";
  if (e.type === "delivered") return "pod_submitted";
  return "status_update";
}

export function buildActivityFeed(
  orders: DeliveryOrder[],
  dismissedIds: Set<string>
): DashboardActivityItem[] {
  const rows: DashboardActivityItem[] = [];

  for (const o of orders) {
    if (o.status === "completed") continue;
    for (const e of o.timeline) {
      const id = `${o.id}:${e.id}`;
      if (dismissedIds.has(id)) continue;
      if (!["created", "driver_accepted", "delivered", "assigned", "delayed", "issue"].includes(e.type))
        continue;

      let kind = inferKind(e);
      let title = e.label;
      let detail: string | undefined;
      let ctaLabel = "View order";
      let ctaHref = `/orders?order=${encodeURIComponent(o.id)}`;
      let secondary: DashboardActivityItem["secondaryCta"];

      if (e.type === "created") {
        title = `New order ${o.id}`;
        detail = `${o.pickupName} → ${o.destinationName}`;
      } else if (e.type === "driver_accepted") {
        title = `Driver accepted — ${o.id}`;
        detail = o.destinationName;
      } else if (e.type === "delivered") {
        kind = "pod_submitted";
        title = `Proof of delivery submitted — ${o.id}`;
        detail = o.destinationName;
        ctaLabel = "Review & complete";
        ctaHref = `/orders?order=${encodeURIComponent(o.id)}`;
      } else if (e.type === "assigned") {
        title = `Assignment sent — ${o.id}`;
        detail = o.destinationName;
      } else if (e.type === "delayed") {
        title = `Delay logged — ${o.id}`;
        detail = e.detail ?? o.destinationName;
      } else if (e.type === "issue") {
        title = `Issue — ${o.id}`;
        detail = e.detail ?? o.notes;
      }

      if (o.status === "awaiting_acceptance" && e.type === "assigned") {
        secondary = { label: "Simulate accept", action: "simulate_accept" };
      }

      rows.push({
        id,
        orderId: o.id,
        kind,
        at: e.at,
        title,
        detail,
        ctaLabel,
        ctaHref,
        secondaryCta: secondary,
      });
    }
  }

  rows.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  return rows.slice(0, 14);
}
