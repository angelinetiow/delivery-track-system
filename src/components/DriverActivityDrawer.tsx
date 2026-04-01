import { Link } from "react-router-dom";
import type { DeliveryOrder, Driver } from "@/data/types";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { MapPanel } from "@/components/ui/MapPanel";
import { PodViewer } from "@/components/ui/PodViewer";
import { formatShortDate } from "@/lib/format";
import {
  buildDriverActivityTimelineForDriverId,
  type DriverTimelineEntry,
} from "@/lib/driver-timeline";

const frameClass = "rounded-xl border border-border bg-slate-50/90 p-4 shadow-sm";

function ActivityList({ entries }: { entries: DriverTimelineEntry[] }) {
  if (entries.length === 0) {
    return (
      <p className="text-sm text-text-muted">
        No driver-scoped timeline events on loaded orders.
      </p>
    );
  }
  return (
    <ul className="space-y-0 border-l-2 border-border pl-4">
      {entries.map((e) => (
        <li key={`${e.orderId}-${e.id}`} className="relative pb-5 last:pb-0">
          <span
            className="absolute -left-[calc(0.5rem+3px)] top-1.5 h-2 w-2 rounded-full bg-primary ring-4 ring-surface-raised"
            aria-hidden
          />
          <p className="font-mono text-2xs text-text-muted">{formatShortDate(e.at)}</p>
          <p className="text-sm font-medium text-text">{e.label}</p>
          <p className="font-mono text-2xs text-text-subtle">{e.orderId}</p>
          {e.detail ? <p className="mt-1 text-2xs text-text-muted">{e.detail}</p> : null}
        </li>
      ))}
    </ul>
  );
}

export function DriverActivityDrawer({
  open,
  onClose,
  order,
  drivers,
  orders,
  markPodReviewed,
  completeOrder,
  onAssignNavigate,
}: {
  open: boolean;
  onClose: () => void;
  order: DeliveryOrder | null;
  drivers: Driver[];
  orders: DeliveryOrder[];
  markPodReviewed: (orderId: string) => void;
  completeOrder: (orderId: string) => void;
  /** Close stacked drawers when user follows Assign driver (Orders flow). */
  onAssignNavigate?: () => void;
}) {
  if (!order) return null;

  const driver: Driver | null = order.driverId
    ? drivers.find((d) => d.id === order.driverId) ?? null
    : null;
  const entries =
    order.driverId != null && order.driverId !== ""
      ? buildDriverActivityTimelineForDriverId(order.driverId, orders)
      : [];

  const showLiveTracking = order.status === "in_transit";

  const canReviewPod = order.pod && order.status === "delivered" && !order.podReviewed;
  const canComplete =
    order.pod && order.podReviewed && order.status === "delivered";

  const footer =
    canReviewPod || canComplete ? (
      <div className="flex w-full flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          {canReviewPod ? (
            <Button variant="primary" size="sm" onClick={() => markPodReviewed(order.id)}>
              Mark POD reviewed
            </Button>
          ) : null}
          {canComplete ? (
            <Button variant="primary" size="sm" onClick={() => completeOrder(order.id)}>
              Mark completed
            </Button>
          ) : null}
        </div>
        {order.status === "delivered" && order.pod && !order.podReviewed ? (
          <p className="text-2xs text-text-muted">
            Complete order unlocks after proof of delivery is reviewed.
          </p>
        ) : null}
        {order.status === "delivered" && !order.pod ? (
          <p className="text-2xs text-amber-800">
            No POD attached yet — wait for driver upload or contact field ops.
          </p>
        ) : null}
      </div>
    ) : undefined;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Assignment & delivery"
      widthClass="max-w-lg"
      stackLayer
      leading="chevron-back"
      footer={footer}
    >
      <div className="space-y-5">
        <section className={frameClass}>
          <h3 className="mb-3 text-2xs font-semibold uppercase tracking-wide text-text-subtle">
            Driver
          </h3>
          {driver ? (
            <dl className="grid gap-3 text-sm">
              <div>
                <dt className="text-2xs font-semibold uppercase text-text-muted">Name</dt>
                <dd className="font-medium text-text">{driver.name}</dd>
              </div>
              <div>
                <dt className="text-2xs font-semibold uppercase text-text-muted">Employee code</dt>
                <dd className="font-mono text-text">{driver.employeeCode}</dd>
              </div>
              <div>
                <dt className="text-2xs font-semibold uppercase text-text-muted">Phone</dt>
                <dd className="text-text-muted">{driver.phone}</dd>
              </div>
              <div>
                <dt className="text-2xs font-semibold uppercase text-text-muted">Shift ends</dt>
                <dd className="font-mono text-2xs text-text">{formatShortDate(driver.shiftEndsAt)}</dd>
              </div>
              <div>
                <dt className="text-2xs font-semibold uppercase text-text-muted">Assignments today</dt>
                <dd className="font-mono text-text">{driver.assignmentsToday}</dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-text-muted">
              No driver assigned on this order yet.
            </p>
          )}
          {order.status === "unassigned" ? (
            <div className="mt-4 border-t border-border pt-4">
              <Link
                to={`/route-planning?order=${encodeURIComponent(order.id)}`}
                onClick={() => onAssignNavigate?.()}
                className="inline-flex"
              >
                <Button variant="primary" size="sm" type="button">
                  Assign driver
                </Button>
              </Link>
            </div>
          ) : null}
        </section>

        <section>
          <h3 className="mb-3 text-2xs font-semibold uppercase tracking-wide text-text-subtle">
            Driver activity timeline
          </h3>
          <ActivityList entries={entries} />
        </section>

        {showLiveTracking ? (
          <section>
            <h3 className="mb-2 text-2xs font-semibold uppercase tracking-wide text-text-subtle">
              Live location tracking
            </h3>
            <p className="mb-2 text-sm text-text-muted">
              Last update:{" "}
              {order.timeline.length
                ? formatShortDate(order.timeline[order.timeline.length - 1]!.at)
                : "—"}
            </p>
            <MapPanel
              title="Live vehicle position (mock)"
              subtitle={order.destinationName}
              badge="In transit"
            />
          </section>
        ) : null}

        {order.pod ? (
          <section className={frameClass}>
            <h3 className="mb-3 text-2xs font-semibold uppercase tracking-wide text-text-subtle">
              Proof of delivery
            </h3>
            <PodViewer pod={order.pod} />
          </section>
        ) : null}
      </div>
    </Drawer>
  );
}
