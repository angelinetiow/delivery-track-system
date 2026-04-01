import { useMemo, useState } from "react";
import type { DeliveryOrder, RouteOption } from "@/data/types";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Label, TextArea } from "@/components/ui/Input";
import { StatusChip } from "@/components/ui/StatusChip";
import {
  driverStatusLabel,
  driverStatusTone,
  trafficLabel,
  trafficTone,
} from "@/design-system/status";
import { useAppState } from "@/state/AppStateContext";

export function AssignmentModal({
  open,
  order,
  routes,
  onClose,
}: {
  open: boolean;
  order: DeliveryOrder | null;
  routes: RouteOption[];
  onClose: () => void;
}) {
  const { assignOrder, drivers, vehicles } = useAppState();
  const [routeId, setRouteId] = useState<string | null>(null);
  const [driverId, setDriverId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  const assignableDrivers = useMemo(
    () => drivers.filter((d) => d.status === "available" || d.status === "idle"),
    [drivers]
  );

  const vehicleMap = useMemo(
    () => Object.fromEntries(vehicles.map((v) => [v.id, v])),
    [vehicles]
  );

  const selectedRoute = routes.find((r) => r.id === routeId);
  const selectedDriver = assignableDrivers.find((d) => d.id === driverId);

  const canConfirm = Boolean(order && routeId && driverId);

  const handleConfirm = () => {
    if (!order || !routeId || !driverId) return;
    const r = routes.find((x) => x.id === routeId);
    assignOrder({
      orderId: order.id,
      driverId,
      routeSummary: r?.label ?? "",
      dispatchNotes: notes.trim() || undefined,
    });
    onClose();
    setRouteId(null);
    setDriverId(null);
    setNotes("");
  };

  if (!order) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Confirm assignment — ${order.id}`}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!canConfirm} onClick={handleConfirm}>
            Confirm assignment
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="rounded-lg border border-border bg-slate-50 px-3 py-2 text-sm">
          <p className="font-medium text-text">{order.destinationName}</p>
          <p className="text-text-muted">{order.destinationAddress}</p>
          <p className="mt-2 text-xs text-text-muted">{order.itemSummary}</p>
        </div>

        <div>
          <Label>Route option</Label>
          <div className="mt-2 space-y-2">
            {routes.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRouteId(r.id)}
                className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                  routeId === r.id
                    ? "border-primary bg-primary-muted ring-1 ring-primary/30"
                    : "border-border hover:bg-slate-50"
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-text">{r.label}</span>
                  <span className="rounded bg-slate-200 px-1.5 py-0.5 text-2xs font-semibold uppercase text-text-muted">
                    {r.tag}
                  </span>
                  <span className={`text-2xs font-medium ${trafficTone[r.traffic]}`}>
                    Traffic: {trafficLabel[r.traffic]}
                  </span>
                </div>
                <p className="mt-1 font-mono text-2xs text-text-muted">
                  {r.distanceKm} km · {r.durationMin} min
                </p>
                <p className="mt-1 text-xs text-text-muted">{r.summary}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label>Driver</Label>
          {assignableDrivers.length === 0 ? (
            <p className="mt-2 rounded-lg border border-dashed border-amber-300 bg-amber-50 px-3 py-4 text-sm text-amber-900">
              No drivers currently marked available. Adjust driver status in Fleet (coming soon) or
              wait for a drop-off to complete.
            </p>
          ) : (
            <div className="mt-2 max-h-48 space-y-2 overflow-y-auto pr-1">
              {assignableDrivers.map((d) => {
                const v = vehicleMap[d.vehicleId];
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDriverId(d.id)}
                    className={`flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm ${
                      driverId === d.id
                        ? "border-primary bg-primary-muted ring-1 ring-primary/30"
                        : "border-border hover:bg-slate-50"
                    }`}
                  >
                    <div>
                      <p className="font-medium text-text">{d.name}</p>
                      <p className="font-mono text-2xs text-text-muted">
                        {d.employeeCode} · {v?.plate ?? v?.model}
                      </p>
                    </div>
                    <StatusChip tone={driverStatusTone[d.status]}>
                      {driverStatusLabel[d.status]}
                    </StatusChip>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="dispatch-notes">Dispatch notes / special instructions</Label>
          <TextArea
            id="dispatch-notes"
            className="mt-1.5"
            placeholder="Visible to driver on handheld"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {selectedRoute && selectedDriver ? (
          <div className="rounded-lg border border-border-strong bg-white px-3 py-2 text-sm">
            <p className="text-xs font-semibold uppercase text-text-subtle">Summary</p>
            <p className="mt-1 text-text">
              <span className="text-text-muted">Route:</span> {selectedRoute.label}
            </p>
            <p className="text-text">
              <span className="text-text-muted">Driver:</span> {selectedDriver.name}
            </p>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
