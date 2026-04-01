/** Domain types for Delivery Tracking Portal (mock / future API shape). */

/** Canonical pipeline statuses (UI chips match these five). */
export type OrderStatus =
  | "unassigned"
  | "awaiting_acceptance"
  | "in_transit"
  | "delayed"
  | "delivered"
  | "completed";

export type Urgency = "high" | "medium" | "low";

export type DriverOperationalStatus = "active" | "idle" | "available" | "busy";

export type VehicleOperationalStatus = "active" | "idle";

export type TrafficCondition = "light" | "moderate" | "heavy";

export type TimelineEventType =
  | "created"
  | "assigned"
  | "driver_accepted"
  | "dispatched"
  | "in_transit"
  | "arrived"
  | "delivered"
  | "delayed"
  | "issue"
  | "completed"
  | "cancelled";

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  label: string;
  at: string;
  detail?: string;
}

export type PodSignatureStatus = "captured" | "unavailable";

export interface ProofOfDelivery {
  signatureStatus: PodSignatureStatus;
  signatureImageUrl?: string;
  photoUrls: string[];
  receiverName?: string;
  notesFromDriver?: string;
  /** Edge: fallback photo when signature unavailable */
  usedFallbackPhoto?: boolean;
}

/** Optional structured lines; when absent, UI derives rows from `itemSummary`. */
export interface OrderLineItem {
  name: string;
  categoryLabel: string;
  quantity: number;
}

export interface DeliveryOrder {
  id: string;
  pickupName: string;
  pickupAddress: string;
  destinationName: string;
  destinationAddress: string;
  itemSummary: string;
  lineItems?: OrderLineItem[];
  itemType:
    | "cold_storage_kit"
    | "lab_specimen"
    | "medical_documents"
    | "hospital_supply"
    | "pharmacy_transfer"
    | "blood_sample";
  urgency: Urgency;
  status: OrderStatus;
  driverId: string | null;
  vehicleId: string | null;
  dueAt: string;
  eta: string | null;
  createdAt: string;
  receiverName: string;
  receiverPhone: string;
  /** Optional handling notes; not collected on create. */
  requirements?: string[];
  notes: string;
  assignmentPriority: number;
  timeline: TimelineEvent[];
  pod?: ProofOfDelivery;
  /** Admin must review POD before marking completed in UI */
  podReviewed?: boolean;
  maintenanceHint?: string;
}

export interface Driver {
  id: string;
  name: string;
  employeeCode: string;
  phone: string;
  status: DriverOperationalStatus;
  vehicleId: string;
  currentOrderId: string | null;
  shiftEndsAt: string;
  assignmentsToday: number;
}

export interface Vehicle {
  id: string;
  plate: string;
  model: string;
  status: VehicleOperationalStatus;
  mileageKm: number;
  currentDriverId: string | null;
  maintenanceDue: boolean;
  lastServiceAt: string;
}

export interface RouteOption {
  id: string;
  label: string;
  tag: "fastest" | "shortest" | "recommended" | "alternate";
  distanceKm: number;
  durationMin: number;
  traffic: TrafficCondition;
  summary: string;
}

export interface RouteTaskView extends DeliveryOrder {
  routeOptions: RouteOption[];
}
