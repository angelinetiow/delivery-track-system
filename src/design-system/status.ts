import type { DriverOperationalStatus, OrderStatus, Urgency } from "@/data/types";

export const orderStatusLabel: Record<OrderStatus, string> = {
  unassigned: "Unassigned",
  awaiting_acceptance: "Awaiting acceptance",
  in_transit: "In transit",
  delayed: "Delayed",
  delivered: "Delivered",
  completed: "Completed",
};

/** Tailwind classes for StatusChip (legacy list views; prefer pipeline tones in order-display). */
export const orderStatusTone: Record<OrderStatus, string> = {
  unassigned: "bg-orange-200 text-orange-950 ring-orange-400/70",
  awaiting_acceptance: "bg-yellow-200 text-yellow-950 ring-yellow-400/70",
  in_transit: "bg-sky-200 text-sky-950 ring-sky-400/70",
  delayed: "bg-red-200 text-red-950 ring-red-400/70",
  delivered: "bg-emerald-200 text-emerald-950 ring-emerald-400/70",
  completed: "bg-slate-200 text-slate-900 ring-slate-400/60",
};

export const urgencyLabel: Record<Urgency, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const urgencyTone: Record<Urgency, string> = {
  high: "bg-danger-muted text-danger ring-red-200",
  medium: "bg-warning-muted text-warning ring-amber-200",
  low: "bg-slate-100 text-text-muted ring-slate-200",
};

export const driverStatusLabel: Record<DriverOperationalStatus, string> = {
  active: "Active",
  idle: "Idle",
  available: "Available",
  busy: "Busy",
};

export const driverStatusTone: Record<DriverOperationalStatus, string> = {
  active: "bg-success-muted text-success ring-emerald-200",
  idle: "bg-slate-100 text-text-muted ring-slate-200",
  available: "bg-emerald-200 text-emerald-950 ring-emerald-400/70",
  busy: "bg-info-muted text-info ring-blue-200",
};

export const vehicleStatusLabel = {
  active: "Active",
  idle: "Idle",
} as const;

export const vehicleStatusTone = {
  active: "bg-success-muted text-success ring-emerald-200",
  idle: "bg-slate-100 text-text-muted ring-slate-200",
} as const;

export const trafficLabel = {
  light: "Light",
  moderate: "Moderate",
  heavy: "Heavy",
} as const;

export const trafficTone = {
  light: "text-success",
  moderate: "text-warning",
  heavy: "text-danger",
} as const;
