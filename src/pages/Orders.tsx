import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CreateOrderModal } from "@/components/CreateOrderModal";
import { OrderDetailDrawer } from "@/components/OrderDetailDrawer";
import { PageScaffold } from "@/components/layout/PageScaffold";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { StatusChip } from "@/components/ui/StatusChip";
import { Table, Td, Th } from "@/components/ui/Table";
import { TabPanel, Tabs, type TabItem } from "@/components/ui/Tabs";
import type { DeliveryOrder, Driver, Urgency } from "@/data/types";
import { urgencyLabel } from "@/design-system/status";
import { formatShortDate } from "@/lib/format";
import { isDueToday } from "@/lib/dashboard-ops";
import {
  orderPipelineFilterOptions,
  pipelineDisplay,
  statusParamToPipelineKey,
  urgencyChipToneFromDueDate,
  urgencyFromDueDate,
} from "@/lib/order-display";
import { useAppState } from "@/state/AppStateContext";

const ALL = "all";

const ONGOING_FILTER: string[] = [
  "awaiting_acceptance",
  "in_transit",
  "delayed",
];

export default function Orders() {
  const { orders, drivers, vehicles, addOrder } = useAppState();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState("active");
  const [createOpen, setCreateOpen] = useState(false);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(ALL);
  const [urgencyFilter, setUrgencyFilter] = useState<string>(ALL);
  const [assignFilter, setAssignFilter] = useState<string>(ALL);
  const [dueTodayOnly, setDueTodayOnly] = useState(false);
  const [ongoingOnly, setOngoingOnly] = useState(false);
  const [unassignedOnly, setUnassignedOnly] = useState(false);

  const orderIdParam = searchParams.get("order");

  const driverMap = useMemo(
    () => Object.fromEntries(drivers.map((d) => [d.id, d])),
    [drivers]
  );
  const vehicleMap = useMemo(
    () => Object.fromEntries(vehicles.map((v) => [v.id, v])),
    [vehicles]
  );

  const selectedOrder = orderIdParam ? orders.find((o) => o.id === orderIdParam) ?? null : null;

  const closeDrawer = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("order");
    setSearchParams(next, { replace: true });
  };

  useEffect(() => {
    if (!orderIdParam) return;
    if (!orders.some((o) => o.id === orderIdParam)) {
      const next = new URLSearchParams(searchParams);
      next.delete("order");
      setSearchParams(next, { replace: true });
    }
  }, [orderIdParam, orders, searchParams, setSearchParams]);

  useEffect(() => {
    if (searchParams.get("order")) return;
    const st = searchParams.get("status");
    if (st) {
      const mapped = statusParamToPipelineKey(st);
      setStatusFilter(mapped ?? ALL);
    } else setStatusFilter(ALL);
    setDueTodayOnly(searchParams.get("dueToday") === "1");
    setOngoingOnly(searchParams.get("ongoing") === "1");
    setUnassignedOnly(searchParams.get("unassigned") === "1");
  }, [searchParams]);

  const tabItems: TabItem[] = useMemo(() => {
    const activeCount = orders.filter((o) => o.status !== "completed").length;
    const histCount = orders.filter((o) => o.status === "completed").length;
    return [
      { id: "active", label: "Active pipeline", badge: activeCount },
      { id: "history", label: "History", badge: histCount },
    ];
  }, [orders]);

  const baseList = useMemo(() => {
    if (tab === "history") {
      return orders.filter((o) => o.status === "completed");
    }
    return orders.filter((o) => o.status !== "completed");
  }, [orders, tab]);

  const filtered = useMemo(() => {
    let list = baseList;
    if (q.trim()) {
      const qq = q.toLowerCase();
      list = list.filter(
        (o) =>
          o.id.toLowerCase().includes(qq) ||
          o.destinationName.toLowerCase().includes(qq) ||
          o.pickupName.toLowerCase().includes(qq) ||
          o.receiverName.toLowerCase().includes(qq)
      );
    }
    if (statusFilter !== ALL) {
      list = list.filter((o) => pipelineDisplay(o.status).key === statusFilter);
    }
    if (urgencyFilter !== ALL) {
      list = list.filter((o) => urgencyFromDueDate(o.dueAt) === urgencyFilter);
    }
    if (assignFilter === "assigned") list = list.filter((o) => o.driverId != null);
    if (assignFilter === "unassigned") list = list.filter((o) => o.driverId == null);
    if (unassignedOnly) {
      list = list.filter((o) => o.driverId == null && o.status === "unassigned");
    }
    if (dueTodayOnly) {
      list = list.filter((o) => isDueToday(o.dueAt));
    }
    if (ongoingOnly) {
      list = list.filter((o) => ONGOING_FILTER.includes(o.status));
    }
    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [
    baseList,
    q,
    statusFilter,
    urgencyFilter,
    assignFilter,
    unassignedOnly,
    dueTodayOnly,
    ongoingOnly,
  ]);

  const openOrder = (id: string) => {
    const next = new URLSearchParams(searchParams);
    next.set("order", id);
    setSearchParams(next);
  };

  const driverForOrder = selectedOrder?.driverId
    ? driverMap[selectedOrder.driverId] ?? null
    : null;
  const driverName = driverForOrder?.name ?? "Unassigned";
  const vehicleLabel =
    selectedOrder?.vehicleId && vehicleMap[selectedOrder.vehicleId]
      ? `${vehicleMap[selectedOrder.vehicleId]!.plate} · ${vehicleMap[selectedOrder.vehicleId]!.model}`
      : "—";

  const clearDeepFilters = () => {
    setDueTodayOnly(false);
    setOngoingOnly(false);
    setUnassignedOnly(false);
    setStatusFilter(ALL);
    const next = new URLSearchParams(searchParams);
    next.delete("dueToday");
    next.delete("ongoing");
    next.delete("unassigned");
    next.delete("status");
    setSearchParams(next, { replace: true });
  };

  return (
    <PageScaffold
      title="Orders & tracking"
      subtitle="Search, filter, and drill into delivery records"
      onSearchChange={setQ}
    >
      <div className="space-y-4 p-6">
        <Card padding="p-4">
          <CardHeader
            title="Delivery records"
            description="Operational list — row opens detail drawer"
            action={
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                Create order
              </Button>
            }
          />
          <Tabs tabs={tabItems} active={tab} onChange={setTab} />

          {(dueTodayOnly || ongoingOnly || unassignedOnly) && (
            <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-primary/20 bg-primary-muted/40 px-3 py-2 text-sm">
              <span className="text-text-muted">Dashboard filters active:</span>
              {dueTodayOnly ? <StatusChip tone="bg-warning-muted text-warning">Due today</StatusChip> : null}
              {ongoingOnly ? <StatusChip tone="bg-info-muted text-info">Ongoing</StatusChip> : null}
              {unassignedOnly ? (
                <StatusChip tone="bg-orange-200 text-orange-950 ring-orange-400/70">Unassigned</StatusChip>
              ) : null}
              <Button variant="ghost" size="sm" className="!h-7 ml-auto" onClick={clearDeepFilters}>
                Clear
              </Button>
            </div>
          )}

          <TabPanel id="active" active={tab}>
            <Filters
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              urgencyFilter={urgencyFilter}
              setUrgencyFilter={setUrgencyFilter}
              assignFilter={assignFilter}
              setAssignFilter={setAssignFilter}
              mode="active"
            />
            <OrderTable
              rows={filtered}
              driverMap={driverMap}
              onRowClick={openOrder}
            />
          </TabPanel>

          <TabPanel id="history" active={tab}>
            <Filters
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              urgencyFilter={urgencyFilter}
              setUrgencyFilter={setUrgencyFilter}
              assignFilter={assignFilter}
              setAssignFilter={setAssignFilter}
              mode="history"
            />
            <OrderTable
              rows={filtered}
              driverMap={driverMap}
              onRowClick={openOrder}
            />
          </TabPanel>
        </Card>
      </div>

      <CreateOrderModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={addOrder}
      />

      <OrderDetailDrawer
        order={selectedOrder}
        onClose={closeDrawer}
        driverName={driverName}
        vehicleLabel={vehicleLabel}
      />
    </PageScaffold>
  );
}

function Filters({
  statusFilter,
  setStatusFilter,
  urgencyFilter,
  setUrgencyFilter,
  assignFilter,
  setAssignFilter,
  mode,
}: {
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  urgencyFilter: string;
  setUrgencyFilter: (v: string) => void;
  assignFilter: string;
  setAssignFilter: (v: string) => void;
  mode: "active" | "history";
}) {
  return (
    <div className="mb-4 flex flex-wrap gap-3">
      <div className="min-w-[160px] flex-1 sm:max-w-[220px]">
        <label className="mb-1 block text-2xs font-medium text-text-muted">Status</label>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value={ALL}>All statuses</option>
          {orderPipelineFilterOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      </div>
      <div className="min-w-[120px]">
        <label className="mb-1 block text-2xs font-medium text-text-muted">Urgency</label>
        <Select value={urgencyFilter} onChange={(e) => setUrgencyFilter(e.target.value)}>
          <option value={ALL}>All</option>
          {(["high", "medium", "low"] as Urgency[]).map((u) => (
            <option key={u} value={u}>
              {urgencyLabel[u]}
            </option>
          ))}
        </Select>
      </div>
      {mode === "active" ? (
        <div className="min-w-[140px]">
          <label className="mb-1 block text-2xs font-medium text-text-muted">Assignment</label>
          <Select value={assignFilter} onChange={(e) => setAssignFilter(e.target.value)}>
            <option value={ALL}>All</option>
            <option value="assigned">Assigned</option>
            <option value="unassigned">Unassigned</option>
          </Select>
        </div>
      ) : null}
    </div>
  );
}

function OrderTable({
  rows,
  driverMap,
  onRowClick,
}: {
  rows: DeliveryOrder[];
  driverMap: Record<string, Driver | undefined>;
  onRowClick: (id: string) => void;
}) {
  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border py-10 text-center text-sm text-text-muted">
        No orders match your filters.
      </p>
    );
  }

  return (
    <Table>
      <thead>
        <tr>
          <Th>Order</Th>
          <Th>Pickup</Th>
          <Th>Destination</Th>
          <Th>Status</Th>
          <Th>Driver</Th>
          <Th>Urgency</Th>
          <Th>Due</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((o) => {
          const pipe = pipelineDisplay(o.status);
          const derived = urgencyFromDueDate(o.dueAt);
          return (
            <tr
              key={o.id}
              className="cursor-pointer hover:bg-slate-50/80"
              onClick={() => onRowClick(o.id)}
            >
              <Td className="font-mono text-xs font-semibold">{o.id}</Td>
              <Td className="max-w-[140px] truncate text-2xs text-text-muted">{o.pickupName}</Td>
              <Td className="max-w-[180px] truncate">{o.destinationName}</Td>
              <Td>
                <StatusChip tone={pipe.tone}>{pipe.label}</StatusChip>
              </Td>
              <Td className="text-text-muted">
                {o.driverId ? driverMap[o.driverId]?.name ?? "—" : "—"}
              </Td>
              <Td>
                <StatusChip tone={urgencyChipToneFromDueDate(o.dueAt)}>
                  {urgencyLabel[derived]}
                </StatusChip>
              </Td>
              <Td className="font-mono text-2xs text-text-muted">{formatShortDate(o.dueAt)}</Td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}
