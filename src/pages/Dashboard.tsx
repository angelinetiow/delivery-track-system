import { useMemo } from "react";
import { Link } from "react-router-dom";
import { PageScaffold } from "@/components/layout/PageScaffold";
import { Card, CardHeader } from "@/components/ui/Card";
import {
  isActiveOrder,
  isCompletedToday,
  isDueToday,
  isOngoingDelivery,
} from "@/lib/dashboard-ops";
import { ordersUrl } from "@/lib/orders-nav";
import { useAppState } from "@/state/AppStateContext";

export default function Dashboard() {
  const { orders, drivers, vehicles } = useAppState();

  const metrics = useMemo(() => {
    const total = orders.length;
    const ongoing = orders.filter(isOngoingDelivery).length;
    const dueToday = orders.filter(
      (o) => isActiveOrder(o) && isDueToday(o.dueAt)
    ).length;
    const delayed = orders.filter((o) => o.status === "delayed").length;
    const unassigned = orders.filter(
      (o) => o.driverId == null && isActiveOrder(o) && o.status === "unassigned"
    ).length;
    const awaitingAcceptance = orders.filter((o) => o.status === "awaiting_acceptance").length;

    return {
      total,
      ongoing,
      dueToday,
      delayed,
      unassigned,
      awaitingAcceptance,
    };
  }, [orders]);

  const todayProgress = useMemo(() => {
    const completed = orders.filter(isCompletedToday).length;
    const inTransit = orders.filter((o) => o.status === "in_transit").length;
    const pending = orders.filter((o) =>
      ["unassigned", "awaiting_acceptance"].includes(o.status)
    ).length;
    const atRisk = orders.filter(
      (o) => o.status === "delayed" || o.status === "awaiting_acceptance"
    ).length;
    const sum = Math.max(completed + inTransit + pending + atRisk, 1);
    return {
      completed,
      inTransit,
      pending,
      atRisk,
      pct: {
        completed: Math.round((completed / sum) * 100),
        inTransit: Math.round((inTransit / sum) * 100),
        pending: Math.round((pending / sum) * 100),
        atRisk: Math.round((atRisk / sum) * 100),
      },
    };
  }, [orders]);

  const fleetSnapshot = useMemo(() => {
    const activeDrivers = drivers.filter((d) => d.status === "busy").length;
    const idleDrivers = drivers.filter((d) => d.status === "idle" || d.status === "available").length;
    const driversAwaitingAccept = orders.filter((o) => o.status === "awaiting_acceptance").length;
    const vehiclesInUse = vehicles.filter((v) => v.status === "active").length;
    const vehiclesIdle = vehicles.filter((v) => v.status === "idle").length;
    return {
      activeDrivers,
      idleDrivers,
      driversAwaitingAccept,
      vehiclesInUse,
      vehiclesIdle,
    };
  }, [drivers, vehicles, orders]);

  return (
    <PageScaffold
      title="Delivery Tracking Portal"
      subtitle="Summary metrics, today's mix, and fleet snapshot"
    >
      <div className="space-y-6 p-6">
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-subtle">
            Summary metrics
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <ClickableMetricCard
              to="/orders"
              label="Total orders"
              value={metrics.total}
              hint="All records"
              accent="primary"
            />
            <ClickableMetricCard
              to={ordersUrl({ ongoing: "1" })}
              label="Ongoing deliveries"
              value={metrics.ongoing}
              hint="Pre-delivery pipeline"
              accent="info"
            />
            <ClickableMetricCard
              to={ordersUrl({ dueToday: "1" })}
              label="Due today"
              value={metrics.dueToday}
              hint="SLA window"
              accent="warning"
            />
            <ClickableMetricCard
              to={ordersUrl({ status: "delayed" })}
              label="Delayed"
              value={metrics.delayed}
              hint="Exceptions"
              accent="danger"
            />
            <ClickableMetricCard
              to={ordersUrl({ unassigned: "1" })}
              label="Unassigned"
              value={metrics.unassigned}
              hint="Needs dispatch"
              accent="amber"
            />
            <ClickableMetricCard
              to={ordersUrl({ status: "awaiting_acceptance" })}
              label="Awaiting acceptance"
              value={metrics.awaitingAcceptance}
              hint="Driver app"
              accent="amber"
            />
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader
              title="Today's progress"
              description="High-level mix — use Orders & tracking for full detail"
            />
            <div className="space-y-4">
              <ProgressRow
                label="Completed (verified today)"
                count={todayProgress.completed}
                pct={todayProgress.pct.completed}
                tone="bg-success"
              />
              <ProgressRow
                label="In transit"
                count={todayProgress.inTransit}
                pct={todayProgress.pct.inTransit}
                tone="bg-info"
              />
              <ProgressRow
                label="Pending / staged"
                count={todayProgress.pending}
                pct={todayProgress.pct.pending}
                tone="bg-slate-400"
              />
              <ProgressRow
                label="At risk (delayed + awaiting acceptance)"
                count={todayProgress.atRisk}
                pct={todayProgress.pct.atRisk}
                tone="bg-danger"
              />
            </div>
          </Card>

          <Card>
            <CardHeader title="Fleet & drivers" description="Snapshot only" />
            <div className="space-y-3 text-sm">
              <SnapshotRow label="Active drivers (on jobs)" value={fleetSnapshot.activeDrivers} />
              <SnapshotRow label="Idle / available drivers" value={fleetSnapshot.idleDrivers} />
              <SnapshotRow
                label="Assignments awaiting acceptance"
                value={fleetSnapshot.driversAwaitingAccept}
                highlight
              />
              <SnapshotRow label="Vehicles in use" value={fleetSnapshot.vehiclesInUse} />
              <SnapshotRow label="Vehicles idle" value={fleetSnapshot.vehiclesIdle} />
            </div>
          </Card>
        </div>
      </div>
    </PageScaffold>
  );
}

function ClickableMetricCard({
  to,
  label,
  value,
  hint,
  accent,
}: {
  to: string;
  label: string;
  value: number;
  hint: string;
  accent: "primary" | "info" | "warning" | "danger" | "success" | "amber";
}) {
  const border =
    accent === "primary"
      ? "border-l-4 border-l-primary"
      : accent === "danger"
        ? "border-l-4 border-l-danger"
        : accent === "warning"
          ? "border-l-4 border-l-warning"
          : accent === "success"
            ? "border-l-4 border-l-success"
            : accent === "info"
              ? "border-l-4 border-l-info"
              : "border-l-4 border-l-amber-500";

  return (
    <Link
      to={to}
      className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <Card
        className={`h-full transition-shadow group-hover:shadow-md ${border}`}
        padding="p-4"
      >
        <p className="text-2xs font-semibold uppercase tracking-wide text-text-subtle">{label}</p>
        <p className="mt-1 text-2xl font-semibold tabular-nums text-text">{value}</p>
        <p className="mt-0.5 text-2xs text-text-muted">{hint}</p>
        <p className="mt-2 text-2xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
          Open in Orders →
        </p>
      </Card>
    </Link>
  );
}

function ProgressRow({
  label,
  count,
  pct,
  tone,
}: {
  label: string;
  count: number;
  pct: number;
  tone: string;
}) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-text-muted">{label}</span>
        <span className="font-mono text-text">
          {count} <span className="text-text-subtle">({pct}%)</span>
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
    </div>
  );
}

function SnapshotRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className={highlight ? "font-medium text-amber-900" : "text-text-muted"}>{label}</span>
      <span className="font-mono font-semibold text-text">{value}</span>
    </div>
  );
}
