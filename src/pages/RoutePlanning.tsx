import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import type { Urgency } from "@/data/types";
import { AssignmentModal } from "@/components/AssignmentModal";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { MapPanel } from "@/components/ui/MapPanel";
import { StatusChip } from "@/components/ui/StatusChip";
import {
  driverStatusLabel,
  driverStatusTone,
  trafficLabel,
  trafficTone,
  urgencyLabel,
} from "@/design-system/status";
import { formatShortDate } from "@/lib/format";
import { getOrderLineItems } from "@/lib/order-items";
import { urgencyChipTone, urgencyFromDueDate } from "@/lib/order-display";
import { useAppState } from "@/state/AppStateContext";

type DriverPanelStatusFilter = "all" | "busy" | "idle" | "available";

const URGENCY_SORT_RANK: Record<Urgency, number> = { high: 0, medium: 1, low: 2 };

const DRIVER_FILTER_CHIPS: { value: DriverPanelStatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "busy", label: "Busy" },
  { value: "idle", label: "Idle" },
  { value: "available", label: "Available" },
];

export default function RoutePlanning() {
  const { orders, drivers, vehicles, getRoutesForOrder } = useAppState();
  const [searchParams] = useSearchParams();
  const orderFromUrl = searchParams.get("order");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [driverStatusFilter, setDriverStatusFilter] =
    useState<DriverPanelStatusFilter>("all");
  const [q, setQ] = useState("");

  const vehicleByDriver = useMemo(() => {
    const m: Record<string, (typeof vehicles)[0]> = {};
    drivers.forEach((d) => {
      const v = vehicles.find((x) => x.id === d.vehicleId);
      if (v) m[d.id] = v;
    });
    return m;
  }, [drivers, vehicles]);

  const taskQueue = useMemo(() => {
    const list = orders.filter(
      (o) =>
        o.status === "unassigned" &&
        o.driverId == null
    );
    const filtered = q.trim()
      ? list.filter(
          (o) =>
            o.id.toLowerCase().includes(q.toLowerCase()) ||
            o.destinationName.toLowerCase().includes(q.toLowerCase()) ||
            o.pickupName.toLowerCase().includes(q.toLowerCase())
        )
      : list;
    return [...filtered].sort((a, b) => {
      const ua = urgencyFromDueDate(a.dueAt);
      const ub = urgencyFromDueDate(b.dueAt);
      const byUrgency = URGENCY_SORT_RANK[ua] - URGENCY_SORT_RANK[ub];
      if (byUrgency !== 0) return byUrgency;
      return a.assignmentPriority - b.assignmentPriority;
    });
  }, [orders, q]);

  useEffect(() => {
    const urlId = orderFromUrl?.trim();
    const urlInQueue = Boolean(urlId && taskQueue.some((o) => o.id === urlId));
    if (urlInQueue && urlId) {
      setSelectedOrderId(urlId);
      return;
    }
    setSelectedOrderId((cur) => {
      if (cur && taskQueue.some((o) => o.id === cur)) return cur;
      return taskQueue[0]?.id ?? null;
    });
  }, [taskQueue, orderFromUrl]);

  const selectedOrder = orders.find((o) => o.id === selectedOrderId) ?? null;
  const selectedUrgency = selectedOrder ? urgencyFromDueDate(selectedOrder.dueAt) : null;
  const routes = selectedOrderId ? getRoutesForOrder(selectedOrderId) : [];
  const selectedRoute = routes.find((r) => r.id === selectedRouteId);

  const openAssign = () => {
    if (routes[0]) setSelectedRouteId(routes[0].id);
    setAssignOpen(true);
  };

  const filteredDrivers = useMemo(() => {
    if (driverStatusFilter === "all") return drivers;
    return drivers.filter((d) => d.status === driverStatusFilter);
  }, [drivers, driverStatusFilter]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <TopBar
        title="Route and driver assignment"
        subtitle="Select a task, compare routes, and assign a driver"
        onSearchChange={setQ}
      />
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 lg:flex-row lg:gap-0 lg:overflow-hidden lg:p-0">
        <aside className="flex w-full shrink-0 flex-col border-border lg:min-h-0 lg:w-80 lg:shrink-0 lg:border-r lg:bg-surface-raised">
          <div className="sticky top-0 z-20 border-b border-border bg-surface-raised p-4">
            <CardHeader
              className="mb-0"
              title="Unassigned tasks"
              description="Sorted by urgency (due date), then dispatch priority"
            />
          </div>
          <div className="p-2 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
            {taskQueue.length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-text-muted">
                No unassigned tasks. Great job — or adjust filters on Orders.
              </p>
            ) : (
              <ul className="space-y-1">
                {taskQueue.map((o) => {
                  const derivedUrgency = urgencyFromDueDate(o.dueAt);
                  return (
                  <li key={o.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedOrderId(o.id);
                        setSelectedRouteId(null);
                      }}
                      className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                        selectedOrderId === o.id
                          ? "border-primary bg-primary-muted"
                          : "border-transparent hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-semibold">{o.id}</span>
                        <StatusChip tone={urgencyChipTone(derivedUrgency)}>
                          {urgencyLabel[derivedUrgency]}
                        </StatusChip>
                      </div>
                      <p className="mt-0.5 truncate text-2xs text-text-muted">
                        {o.pickupName.split(" —")[0]} → {o.destinationName}
                      </p>
                      <p className="truncate text-text">{o.destinationName}</p>
                      <p className="mt-1 font-mono text-2xs text-text-muted">
                        Due {formatShortDate(o.dueAt)}
                      </p>
                    </button>
                  </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>

        <main className="min-w-0 flex-1 space-y-4 p-4 lg:min-h-0 lg:overflow-y-auto lg:p-5">
          {selectedOrder ? (
            <>
              <Card padding="p-4">
                <CardHeader
                  title={selectedOrder.destinationName}
                  description={selectedOrder.destinationAddress}
                  action={
                    <div className="flex shrink-0 flex-wrap justify-end gap-2">
                      <Button size="sm" onClick={openAssign}>
                        Assign driver
                      </Button>
                    </div>
                  }
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <StatusChip tone="bg-orange-200 text-orange-950 ring-orange-400/70">
                    Unassigned
                  </StatusChip>
                  {selectedUrgency ? (
                    <StatusChip tone={urgencyChipTone(selectedUrgency)}>
                      {urgencyLabel[selectedUrgency]}
                    </StatusChip>
                  ) : null}
                </div>
                <div className="mt-3 space-y-3 text-sm">
                  <div className="min-w-0">
                    <p className="text-xs text-text-muted">Pickup</p>
                    <p className="break-words text-text">{selectedOrder.pickupName}</p>
                    <p className="break-words text-2xs text-text-muted">
                      {selectedOrder.pickupAddress}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-text-muted">Items</p>
                    <ul className="mt-2 divide-y divide-border border-t border-border">
                      {getOrderLineItems(selectedOrder).map((row, i) => (
                        <li key={`${row.name}-${i}`} className="py-3 first:pt-2">
                          <p className="font-medium leading-snug text-text">{row.name}</p>
                          <p className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-2xs text-text-muted">
                            <span>{row.categoryLabel}</span>
                            <span className="text-border-strong" aria-hidden>
                              ·
                            </span>
                            <span className="font-mono tabular-nums text-text-subtle">
                              Qty {row.quantity}
                            </span>
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-text-muted">Due</p>
                    <p className="mt-1 font-mono text-2xs text-text-muted">
                      {formatShortDate(selectedOrder.dueAt)}
                    </p>
                  </div>
                  {selectedOrder.notes ? (
                    <div className="min-w-0">
                      <p className="text-xs text-text-muted">Notes</p>
                      <p className="break-words text-text">{selectedOrder.notes}</p>
                    </div>
                  ) : null}
                </div>
              </Card>

              <MapPanel
                title={`Route preview — ${selectedOrder.id}`}
                subtitle={selectedRoute?.label ?? "Select a route option"}
                badge={selectedRoute ? `${selectedRoute.durationMin} min` : undefined}
              />

              <Card>
                <CardHeader title="Route options" description="From routing provider (mock)" />
                <div className="grid gap-3 md:grid-cols-3">
                  {routes.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedRouteId(r.id)}
                      className={`rounded-xl border px-3 py-3 text-left text-sm transition-colors ${
                        selectedRouteId === r.id
                          ? "border-primary bg-primary-muted ring-2 ring-primary/20"
                          : "border-border hover:border-border-strong"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold uppercase text-text-subtle">
                          {r.tag}
                        </span>
                        <span className={`text-2xs font-medium ${trafficTone[r.traffic]}`}>
                          {trafficLabel[r.traffic]}
                        </span>
                      </div>
                      <p className="mt-2 font-medium text-text">{r.label}</p>
                      <p className="mt-1 font-mono text-2xs text-text-muted">
                        {r.distanceKm} km · {r.durationMin} min
                      </p>
                      <p className="mt-2 text-xs text-text-muted">{r.summary}</p>
                    </button>
                  ))}
                </div>
              </Card>
            </>
          ) : (
            <p className="text-sm text-text-muted">
              No tasks in queue. Create an order or wait for new intake.
            </p>
          )}
        </main>

        <aside className="flex w-full shrink-0 flex-col border-border lg:min-h-0 lg:w-72 lg:shrink-0 lg:border-l lg:bg-surface-raised">
          <div className="sticky top-0 z-20 border-b border-border bg-surface-raised p-4">
            <CardHeader
              className="mb-0"
              title="Drivers"
              description="Availability for dispatch"
            />
            <p className="mb-2 text-2xs font-medium uppercase text-text-muted">Status</p>
            <div className="flex flex-wrap gap-1.5">
              {DRIVER_FILTER_CHIPS.map(({ value, label }) => {
                const selected = driverStatusFilter === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setDriverStatusFilter(value)}
                    className={`rounded-full border px-2.5 py-1 text-2xs font-semibold transition-colors ${
                      selected
                        ? "border-primary bg-primary-muted text-primary ring-1 ring-primary/25"
                        : "border-border bg-surface-raised text-text-muted hover:border-border-strong hover:text-text"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="p-2 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
            {filteredDrivers.length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-text-muted">
                No drivers match this status.
              </p>
            ) : (
            <ul className="space-y-2">
              {filteredDrivers.map((d) => {
                const v = vehicleByDriver[d.id];
                const body = (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-text">{d.name}</p>
                        <p className="font-mono text-2xs text-text-muted">{d.employeeCode}</p>
                      </div>
                      <StatusChip tone={driverStatusTone[d.status]}>
                        {driverStatusLabel[d.status]}
                      </StatusChip>
                    </div>
                    <p className="mt-2 text-2xs text-text-muted">
                      Vehicle: {v?.plate ?? "—"} · {v?.model ?? ""}
                    </p>
                    <p className="text-2xs text-text-muted">
                      Assignments today: {d.assignmentsToday}
                      {d.currentOrderId ? (
                        <>
                          {" "}
                          · Current:{" "}
                          <span className="font-mono text-text">{d.currentOrderId}</span>
                        </>
                      ) : null}
                    </p>
                    {d.status === "busy" && d.currentOrderId ? (
                      <p className="mt-2 text-2xs font-medium text-primary">
                        Open assignment in Orders →
                      </p>
                    ) : null}
                  </>
                );
                const cardClass =
                  "rounded-lg border border-border bg-surface-raised px-3 py-2 shadow-sm";
                if (d.status === "busy" && d.currentOrderId) {
                  return (
                    <li key={d.id}>
                      <Link
                        to={`/orders?order=${encodeURIComponent(d.currentOrderId)}`}
                        className={`${cardClass} block transition-colors hover:border-primary/50 hover:bg-slate-50/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`}
                      >
                        {body}
                      </Link>
                    </li>
                  );
                }
                return (
                  <li key={d.id} className={cardClass}>
                    {body}
                  </li>
                );
              })}
            </ul>
            )}
          </div>
        </aside>
      </div>

      <AssignmentModal
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        order={selectedOrder}
        routes={routes}
      />
    </div>
  );
}
