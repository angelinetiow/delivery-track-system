import { useEffect, useState } from "react";
import type { DeliveryOrder } from "@/data/types";
import { Button } from "@/components/ui/Button";
import { DriverActivityDrawer } from "@/components/DriverActivityDrawer";
import { Drawer } from "@/components/ui/Drawer";
import { PodViewer } from "@/components/ui/PodViewer";
import { StatusChip } from "@/components/ui/StatusChip";
import { urgencyLabel } from "@/design-system/status";
import { formatShortDate } from "@/lib/format";
import { getOrderLineItems } from "@/lib/order-items";
import {
  pipelineDisplay,
  urgencyChipToneFromDueDate,
  urgencyFromDueDate,
} from "@/lib/order-display";
import { useAppState } from "@/state/AppStateContext";

function BoxIcon({ className = "h-4 w-4 shrink-0" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    </svg>
  );
}

function MapPinIcon({ className = "h-4 w-4 shrink-0" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

const fieldLabelClass = "text-2xs font-semibold uppercase text-text-muted";

const frameClass = "rounded-xl border border-border bg-slate-50/90 p-4 shadow-sm";

export function OrderDetailDrawer({
  order,
  onClose,
  driverName,
  vehicleLabel,
}: {
  order: DeliveryOrder | null;
  onClose: () => void;
  driverName: string;
  vehicleLabel: string;
}) {
  const { markPodReviewed, completeOrder, deleteOrder, orders, drivers } = useAppState();
  const [driverActivityOpen, setDriverActivityOpen] = useState(false);
  const open = !!order;

  useEffect(() => {
    if (!order) setDriverActivityOpen(false);
  }, [order]);

  if (!order) return null;

  const isOrderCompleted = order.status === "completed";

  const resolvedDriver = order.driverId
    ? drivers.find((d) => d.id === order.driverId) ?? null
    : null;
  const displayDriverName = resolvedDriver?.name ?? driverName;

  const pipe = pipelineDisplay(order.status);
  const derivedUrgency = urgencyFromDueDate(order.dueAt);
  const itemRows = getOrderLineItems(order);

  const onDelete = () => {
    if (
      !window.confirm(
        `Delete order ${order.id}? This cannot be undone in the prototype.`
      )
    ) {
      return;
    }
    deleteOrder(order.id);
    onClose();
  };

  return (
    <>
      <Drawer open={open} onClose={onClose} title="Order summary" widthClass="max-w-lg">
        <div className="space-y-5">
          <header className="space-y-3">
            <h2 className="font-mono text-lg font-bold tracking-tight text-text">{order.id}</h2>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-2xs text-text-muted">
              <span>Created {formatShortDate(order.createdAt)}</span>
              <span>Due {formatShortDate(order.dueAt)}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusChip tone={urgencyChipToneFromDueDate(order.dueAt)}>
                {urgencyLabel[derivedUrgency]}
              </StatusChip>
              {order.podReviewed ? (
                <StatusChip tone="bg-emerald-200 text-emerald-950 ring-emerald-400/70">
                  POD reviewed
                </StatusChip>
              ) : null}
            </div>
            {order.eta ? (
              <p className="text-2xs text-text-muted">ETA {formatShortDate(order.eta)}</p>
            ) : null}
          </header>

          <section className={frameClass}>
            <h3 className="mb-3 text-2xs font-semibold uppercase tracking-wide text-text-subtle">
              Pickup & drop-off
            </h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="mt-0.5 text-primary">
                  <BoxIcon />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={fieldLabelClass}>Pickup</p>
                  <p className="font-medium text-text">{order.pickupName}</p>
                  <p className="text-sm text-text-muted">{order.pickupAddress}</p>
                </div>
              </div>
              <div className="border-t border-border pt-4">
                <div className="flex gap-3">
                  <div className="mt-0.5 text-primary">
                    <MapPinIcon />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={fieldLabelClass}>Drop-off</p>
                    <p className="font-medium text-text">{order.destinationName}</p>
                    <p className="text-sm text-text-muted">{order.destinationAddress}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-2xs font-semibold uppercase tracking-wide text-text-subtle">
              Items
            </h3>
            <div className="overflow-hidden rounded-xl border border-border bg-surface-raised shadow-sm">
              <table className="w-full table-fixed text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-slate-100/90 text-2xs font-semibold uppercase text-text-muted">
                    <th className="px-3 py-2.5">Item name</th>
                    <th className="px-3 py-2.5">Category</th>
                    <th className="w-[5.5rem] px-3 py-2.5 pr-6 text-right">Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {itemRows.map((row, i) => (
                    <tr key={`${row.name}-${i}`} className="border-b border-border last:border-0">
                      <td className="px-3 py-3 font-medium text-text">{row.name}</td>
                      <td className="px-3 py-3 text-text-muted">{row.categoryLabel}</td>
                      <td className="px-3 py-3 pr-6 text-right font-mono text-text">
                        {row.quantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className={frameClass}>
            <div className="space-y-4">
              <div>
                <p className={fieldLabelClass}>Recipient</p>
                <p className="font-medium text-text">{order.receiverName}</p>
              </div>
              <div>
                <p className={fieldLabelClass}>Contact</p>
                <p className="text-sm text-text-muted">{order.receiverPhone}</p>
              </div>
              {order.notes ? (
                <div className="min-w-0">
                  <p className={fieldLabelClass}>Notes</p>
                  <p className="break-words text-sm leading-relaxed text-text-muted whitespace-pre-wrap">
                    {order.notes}
                  </p>
                </div>
              ) : null}
            </div>
          </section>

          <section className={frameClass}>
            <div className="mb-3 flex items-start justify-between gap-3">
              <h3 className="text-2xs font-semibold uppercase tracking-wide text-text-subtle">
                Assignment
              </h3>
              {!isOrderCompleted ? (
                <button
                  type="button"
                  className="shrink-0 text-sm font-semibold text-primary underline decoration-primary/70 underline-offset-2 hover:text-primary-hover hover:decoration-primary"
                  onClick={() => setDriverActivityOpen(true)}
                >
                  View details
                </button>
              ) : null}
            </div>
            <div className="mb-4">
              <StatusChip tone={pipe.tone}>{pipe.label}</StatusChip>
            </div>
            <div className="space-y-4">
              <div>
                <p className={fieldLabelClass}>Driver</p>
                <p className="mt-1 font-medium text-text">{displayDriverName}</p>
              </div>
              <div>
                <p className={fieldLabelClass}>Vehicle</p>
                <p className="mt-1 text-sm text-text-muted">{vehicleLabel}</p>
              </div>
            </div>
          </section>

          {isOrderCompleted && order.pod ? (
            <section className={frameClass}>
              <h3 className="mb-3 text-2xs font-semibold uppercase tracking-wide text-text-subtle">
                Proof of delivery
              </h3>
              <PodViewer pod={order.pod} />
            </section>
          ) : null}

          {!isOrderCompleted ? (
            <section className="space-y-4 border-t border-border pt-5">
              <Button variant="danger" size="sm" type="button" onClick={onDelete}>
                Delete order
              </Button>
            </section>
          ) : null}
        </div>
      </Drawer>

      <DriverActivityDrawer
        open={driverActivityOpen}
        onClose={() => setDriverActivityOpen(false)}
        order={order}
        drivers={drivers}
        orders={orders}
        markPodReviewed={markPodReviewed}
        completeOrder={completeOrder}
        onAssignNavigate={() => {
          setDriverActivityOpen(false);
          onClose();
        }}
      />
    </>
  );
}
