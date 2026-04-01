import type { DeliveryOrder, Driver, TimelineEvent } from "@/data/types";

export type DriverTimelineEntry = TimelineEvent & { orderId: string };

/** Merges timeline events from all orders attributed to `driverId`. */
export function buildDriverActivityTimelineForDriverId(
  driverId: string,
  orders: DeliveryOrder[]
): DriverTimelineEntry[] {
  const rows: DriverTimelineEntry[] = [];
  for (const o of orders) {
    if (o.driverId !== driverId) continue;
    for (const e of o.timeline) {
      rows.push({ ...e, orderId: o.id });
    }
  }
  rows.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
  return rows;
}

/** @deprecated Prefer `buildDriverActivityTimelineForDriverId(driver.id, orders)`. */
export function buildDriverActivityTimeline(
  driver: Driver,
  orders: DeliveryOrder[]
): DriverTimelineEntry[] {
  return buildDriverActivityTimelineForDriverId(driver.id, orders);
}
