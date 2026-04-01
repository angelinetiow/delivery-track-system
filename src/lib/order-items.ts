import type { DeliveryOrder } from "@/data/types";

export type OrderLineItemRow = {
  name: string;
  categoryLabel: string;
  quantity: number;
};

const ITEM_TYPE_LABEL: Record<DeliveryOrder["itemType"], string> = {
  cold_storage_kit: "Cold storage sample kit",
  lab_specimen: "Lab specimen",
  medical_documents: "Medical documents",
  hospital_supply: "Hospital supply box",
  pharmacy_transfer: "Pharmacy stock transfer",
  blood_sample: "Urgent blood sample",
};

/** Parses `N× name (Category)` segments from create-order flow; falls back to a single line. */
export function getOrderLineItems(order: DeliveryOrder): OrderLineItemRow[] {
  if (order.lineItems?.length) return order.lineItems;
  const defaultCat = ITEM_TYPE_LABEL[order.itemType];
  const parts = order.itemSummary.split(";").map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0) {
    return [{ name: "—", categoryLabel: defaultCat, quantity: 1 }];
  }
  const re = /^(\d+)×\s+(.+?)\s+\(([^)]+)\)\s*$/;
  const rows: OrderLineItemRow[] = [];
  for (const p of parts) {
    const m = p.match(re);
    if (m) {
      const qty = Math.max(1, parseInt(m[1]!, 10) || 1);
      rows.push({
        quantity: qty,
        name: m[2]!.trim(),
        categoryLabel: m[3]!.trim(),
      });
    } else {
      rows.push({ name: p, categoryLabel: defaultCat, quantity: 1 });
    }
  }
  return rows;
}
