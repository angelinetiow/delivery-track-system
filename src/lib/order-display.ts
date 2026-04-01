import type { OrderStatus, Urgency } from "@/data/types";

/** Shared chip tones: status and urgency reuse the same palette where specified. */
export const orderChipOrange = "bg-orange-200 text-orange-950 ring-orange-400/70";
export const orderChipYellow = "bg-yellow-200 text-yellow-950 ring-yellow-400/70";
export const orderChipBlue = "bg-sky-200 text-sky-950 ring-sky-400/70";
export const orderChipGreen = "bg-emerald-200 text-emerald-950 ring-emerald-400/70";
export const orderChipRed = "bg-red-200 text-red-950 ring-red-400/70";

export type OrderPipelineKey =
  | "unassigned"
  | "awaiting_acceptance"
  | "in_transit"
  | "delivered"
  | "delayed"
  | "completed";

export const orderPipelineFilterOptions: { value: OrderPipelineKey; label: string }[] = [
  { value: "unassigned", label: "Unassigned" },
  { value: "awaiting_acceptance", label: "Awaiting acceptance" },
  { value: "in_transit", label: "In transit" },
  { value: "delivered", label: "Delivered" },
  { value: "delayed", label: "Delayed" },
  { value: "completed", label: "Completed" },
];

/** Less than 2 days until due → high; less than 7 days → medium; else low. Past due counts as high. */
export function urgencyFromDueDate(dueAtIso: string, now = new Date()): Urgency {
  const dueMs = new Date(dueAtIso).getTime();
  const diffDays = (dueMs - now.getTime()) / 86_400_000;
  if (diffDays < 2) return "high";
  if (diffDays < 7) return "medium";
  return "low";
}

export function urgencyChipToneFromDueDate(dueAtIso: string, now = new Date()): string {
  return urgencyChipTone(urgencyFromDueDate(dueAtIso, now));
}

/** High = delayed red, medium = awaiting yellow, low = delivered green. */
export function urgencyChipTone(u: Urgency): string {
  switch (u) {
    case "high":
      return orderChipRed;
    case "medium":
      return orderChipYellow;
    case "low":
      return orderChipGreen;
  }
}

const pipelineByStatus: Record<
  OrderStatus,
  { key: OrderPipelineKey; label: string; tone: string }
> = {
  unassigned: { key: "unassigned", label: "Unassigned", tone: orderChipOrange },
  awaiting_acceptance: {
    key: "awaiting_acceptance",
    label: "Awaiting acceptance",
    tone: orderChipYellow,
  },
  in_transit: { key: "in_transit", label: "In transit", tone: orderChipBlue },
  delayed: { key: "delayed", label: "Delayed", tone: orderChipRed },
  delivered: { key: "delivered", label: "Delivered", tone: orderChipGreen },
  completed: {
    key: "completed",
    label: "Completed",
    tone: "bg-slate-200 text-slate-900 ring-slate-400/60",
  },
};

export function pipelineDisplay(status: OrderStatus): {
  key: OrderPipelineKey;
  label: string;
  tone: string;
} {
  return pipelineByStatus[status];
}

/** Map query ?status= to pipeline filter keys (deep links). */
export function statusParamToPipelineKey(param: string): OrderPipelineKey | null {
  const keys: OrderPipelineKey[] = [
    "unassigned",
    "awaiting_acceptance",
    "in_transit",
    "delivered",
    "delayed",
    "completed",
  ];
  return keys.includes(param as OrderPipelineKey) ? (param as OrderPipelineKey) : null;
}
