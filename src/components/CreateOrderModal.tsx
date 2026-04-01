import { useState } from "react";
import type { DeliveryOrder } from "@/data/types";
import { HUB_PICKUP } from "@/data/seed";
import { Button } from "@/components/ui/Button";
import { Input, Label, TextArea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";

const itemTypes: { value: DeliveryOrder["itemType"]; label: string }[] = [
  { value: "cold_storage_kit", label: "Cold storage sample kit" },
  { value: "lab_specimen", label: "Lab specimen" },
  { value: "medical_documents", label: "Medical documents" },
  { value: "hospital_supply", label: "Hospital supply box" },
  { value: "pharmacy_transfer", label: "Pharmacy stock transfer" },
  { value: "blood_sample", label: "Urgent blood sample" },
];

type LineItem = {
  id: string;
  name: string;
  category: DeliveryOrder["itemType"];
  quantity: number;
};

type Errors = Partial<Record<string, string>>;

function categoryLabel(v: DeliveryOrder["itemType"]) {
  return itemTypes.find((t) => t.value === v)?.label ?? v;
}

function nextOrderId() {
  return `ORD-${Date.now().toString().slice(-5)}`;
}

function nextLineId() {
  return `line-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function CreateOrderModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (o: DeliveryOrder) => void;
}) {
  const [pickupName, setPickupName] = useState<string>(HUB_PICKUP.pickupName);
  const [pickupAddress, setPickupAddress] = useState<string>(HUB_PICKUP.pickupAddress);
  const [destinationName, setDestinationName] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [draftName, setDraftName] = useState("");
  const [draftCategory, setDraftCategory] = useState<DeliveryOrder["itemType"]>("lab_specimen");
  const [draftQuantity, setDraftQuantity] = useState("1");
  const [notes, setNotes] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  const reset = () => {
    setDestinationName("");
    setDestinationAddress("");
    setReceiverName("");
    setReceiverPhone("");
    setLineItems([]);
    setDraftName("");
    setDraftCategory("lab_specimen");
    setDraftQuantity("1");
    setNotes("");
    setDueAt("");
    setErrors({});
  };

  const addLineItem = () => {
    const name = draftName.trim();
    const qty = Math.max(1, Math.floor(Number.parseInt(draftQuantity, 10) || 0));
    const e: Errors = {};
    if (!name) e.draftName = "Enter an item name.";
    if (!Number.isFinite(qty) || qty < 1) e.draftQuantity = "Quantity must be at least 1.";
    if (Object.keys(e).length) {
      setErrors((prev) => ({ ...prev, ...e }));
      return;
    }
    setErrors((prev) => {
      const next = { ...prev };
      delete next.draftName;
      delete next.draftQuantity;
      return next;
    });
    setLineItems((prev) => [
      ...prev,
      { id: nextLineId(), name, category: draftCategory, quantity: qty },
    ]);
    setDraftName("");
    setDraftQuantity("1");
  };

  const removeLineItem = (id: string) => {
    setLineItems((prev) => prev.filter((x) => x.id !== id));
  };

  const validate = (): boolean => {
    const e: Errors = {};
    if (!pickupName.trim()) e.pickupName = "Pickup location name is required.";
    if (!pickupAddress.trim()) e.pickupAddress = "Pickup address is required.";
    if (!destinationName.trim()) e.destinationName = "Destination is required.";
    if (!destinationAddress.trim()) e.destinationAddress = "Address is required.";
    if (!receiverName.trim()) e.receiverName = "Receiver name is required.";
    if (!receiverPhone.trim()) e.receiverPhone = "Contact number is required.";
    if (lineItems.length === 0) e.items = "Add at least one item.";
    if (!dueAt) e.dueAt = "Due date and time are required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    const id = nextOrderId();
    const dueIso = new Date(dueAt).toISOString();
    const createdAt = new Date().toISOString();
    const itemSummary = lineItems
      .map(
        (l) =>
          `${l.quantity}× ${l.name} (${categoryLabel(l.category)})`
      )
      .join("; ");
    const primaryType = lineItems[0]!.category;
    const structuredLineItems = lineItems.map((l) => ({
      name: l.name,
      categoryLabel: categoryLabel(l.category),
      quantity: l.quantity,
    }));
    const order: DeliveryOrder = {
      id,
      pickupName: pickupName.trim(),
      pickupAddress: pickupAddress.trim(),
      destinationName: destinationName.trim(),
      destinationAddress: destinationAddress.trim(),
      itemSummary,
      lineItems: structuredLineItems,
      itemType: primaryType,
      urgency: "medium",
      status: "unassigned",
      driverId: null,
      vehicleId: null,
      dueAt: dueIso,
      eta: null,
      createdAt,
      receiverName: receiverName.trim(),
      receiverPhone: receiverPhone.trim(),
      notes: notes.trim(),
      assignmentPriority: 5,
      timeline: [
        {
          id: `tl-${id}-c`,
          type: "created",
          label: "Order created",
          at: createdAt,
        },
      ],
    };
    onCreate(order);
    reset();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create delivery order"
      size="lg"
      footer={
        <>
          <Button
            variant="secondary"
            onClick={() => {
              reset();
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button onClick={submit}>Create order</Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <p className="mb-1 text-2xs font-semibold uppercase tracking-wide text-text-subtle">
            Pickup
          </p>
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="pickup-name" required>
            Pickup name
          </Label>
          <Input
            id="pickup-name"
            value={pickupName}
            onChange={(e) => setPickupName(e.target.value)}
            error={errors.pickupName}
            placeholder="e.g. Central Operations Hub — Subang"
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="pickup-addr" required>
            Pickup address
          </Label>
          <TextArea
            id="pickup-addr"
            value={pickupAddress}
            onChange={(e) => setPickupAddress(e.target.value)}
            error={errors.pickupAddress}
            placeholder="Full pickup address"
          />
        </div>
        <div className="sm:col-span-2">
          <p className="mb-1 mt-1 text-2xs font-semibold uppercase tracking-wide text-text-subtle">
            Destination
          </p>
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="dest-name" required>
            Destination name
          </Label>
          <Input
            id="dest-name"
            value={destinationName}
            onChange={(e) => setDestinationName(e.target.value)}
            error={errors.destinationName}
            placeholder="e.g. Hospital Kuala Lumpur"
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="dest-addr" required>
            Address
          </Label>
          <TextArea
            id="dest-addr"
            value={destinationAddress}
            onChange={(e) => setDestinationAddress(e.target.value)}
            error={errors.destinationAddress}
            placeholder="Full delivery address"
          />
        </div>
        <div>
          <Label htmlFor="recv-name" required>
            Receiver / PIC
          </Label>
          <Input
            id="recv-name"
            value={receiverName}
            onChange={(e) => setReceiverName(e.target.value)}
            error={errors.receiverName}
          />
        </div>
        <div>
          <Label htmlFor="recv-phone" required>
            Contact
          </Label>
          <Input
            id="recv-phone"
            value={receiverPhone}
            onChange={(e) => setReceiverPhone(e.target.value)}
            error={errors.receiverPhone}
            placeholder="+60 …"
          />
        </div>

        <div className="sm:col-span-2 rounded-xl border border-border bg-slate-50/80 p-4">
          <Label required>Items</Label>
          <p className="mb-3 text-2xs text-text-muted">
            Describe each item, choose a category, set quantity, then add to the list.
          </p>
          <div className="space-y-3">
            <div>
              <Label htmlFor="item-name">Item name</Label>
              <Input
                id="item-name"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                error={errors.draftName}
                placeholder="e.g. STAT specimen cooler A"
              />
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-[min(100%,220px)] flex-1">
                <Label htmlFor="item-cat">Category</Label>
                <Select
                  id="item-cat"
                  value={draftCategory}
                  onChange={(e) =>
                    setDraftCategory(e.target.value as DeliveryOrder["itemType"])
                  }
                >
                  {itemTypes.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="w-24 shrink-0">
                <Label htmlFor="item-qty">Qty</Label>
                <Input
                  id="item-qty"
                  type="number"
                  min={1}
                  value={draftQuantity}
                  onChange={(e) => setDraftQuantity(e.target.value)}
                  error={errors.draftQuantity}
                />
              </div>
              <Button type="button" variant="secondary" className="shrink-0" onClick={addLineItem}>
                Add item
              </Button>
            </div>
          </div>
          {errors.items ? (
            <p className="mt-2 text-xs text-danger">{errors.items}</p>
          ) : null}
          {lineItems.length > 0 ? (
            <ul className="mt-4 space-y-2 border-t border-border pt-3">
              {lineItems.map((l) => (
                <li
                  key={l.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm"
                >
                  <span>
                    <span className="font-mono font-semibold text-text">{l.quantity}×</span>{" "}
                    {l.name}
                    <span className="text-text-muted"> · {categoryLabel(l.category)}</span>
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="!px-2 text-text-muted"
                    onClick={() => removeLineItem(l.id)}
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-text-muted">No items added yet.</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="notes">Notes / instructions</Label>
          <TextArea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional context for dispatch"
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="due" required>
            Due date & time
          </Label>
          <Input
            id="due"
            type="datetime-local"
            value={dueAt}
            onChange={(e) => setDueAt(e.target.value)}
            error={errors.dueAt}
          />
        </div>
      </div>
    </Modal>
  );
}
