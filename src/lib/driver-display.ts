import type { DriverOperationalStatus } from "@/data/types";
import { orderChipBlue, orderChipGreen, orderChipOrange } from "@/lib/order-display";

const driverIdleChipTone =
  "bg-slate-200 text-slate-950 ring-slate-400/70";

/** StatusChip tones aligned with order pipeline chip saturation. */
export function driverStatusPipelineTone(s: DriverOperationalStatus): string {
  switch (s) {
    case "busy":
      return orderChipBlue;
    case "available":
      return orderChipOrange;
    case "active":
      return orderChipGreen;
    case "idle":
      return driverIdleChipTone;
  }
}
