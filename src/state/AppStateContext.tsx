import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import type { DeliveryOrder, Driver, Vehicle } from "@/data/types";
import {
  registerRoutesForOrder,
  routeOptionsByOrderId,
  seedDrivers,
  seedOrders,
  seedVehicles,
} from "@/data/seed";

export type ToastMessage = {
  id: string;
  message: string;
  tone: "success" | "error" | "info";
};

type AppState = {
  orders: DeliveryOrder[];
  drivers: Driver[];
  vehicles: Vehicle[];
  toasts: ToastMessage[];
  dismissedActivityIds: string[];
};

type Action =
  | {
      type: "assign";
      orderId: string;
      driverId: string;
      routeSummary?: string;
      dispatchNotes?: string;
    }
  | { type: "add_order"; order: DeliveryOrder }
  | { type: "mark_pod_reviewed"; orderId: string }
  | { type: "complete_order"; orderId: string }
  | { type: "dismiss_toast"; id: string }
  | { type: "push_toast"; toast: Omit<ToastMessage, "id"> }
  | { type: "driver_accept_order"; orderId: string }
  | { type: "dismiss_activity"; id: string }
  | { type: "delete_order"; orderId: string };

function nextId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function releaseDriverOnOrder(
  drivers: Driver[],
  orderId: string,
  previousDriverId: string | null
): Driver[] {
  if (!previousDriverId) return drivers;
  return drivers.map((d) => {
    if (d.id !== previousDriverId) return d;
    if (d.currentOrderId !== orderId) return d;
    return { ...d, currentOrderId: null, status: "available" as const };
  });
}

function assignDriverToOrder(
  drivers: Driver[],
  driverId: string,
  orderId: string
): Driver[] {
  return drivers.map((d) => {
    if (d.id !== driverId) return d;
    return {
      ...d,
      currentOrderId: orderId,
      status: "busy" as const,
      assignmentsToday: d.assignmentsToday + 1,
    };
  });
}

function syncVehicleDriver(
  vehicles: Vehicle[],
  vehicleId: string,
  driverId: string
): Vehicle[] {
  return vehicles.map((v) =>
    v.id === vehicleId ? { ...v, currentDriverId: driverId, status: "active" } : v
  );
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "push_toast": {
      const t: ToastMessage = {
        ...action.toast,
        id: nextId("toast"),
      };
      return { ...state, toasts: [...state.toasts, t] };
    }
    case "dismiss_toast":
      return {
        ...state,
        toasts: state.toasts.filter((x) => x.id !== action.id),
      };
    case "mark_pod_reviewed": {
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.id === action.orderId ? { ...o, podReviewed: true } : o
        ),
      };
    }
    case "complete_order": {
      const order = state.orders.find((o) => o.id === action.orderId);
      if (!order?.pod) return state;
      if (!order.podReviewed) return state;
      if (order.status !== "delivered") return state;
      const at = new Date().toISOString();
      return {
        ...state,
        orders: state.orders.map((o) => {
          if (o.id !== action.orderId) return o;
          return {
            ...o,
            status: "completed" as const,
            timeline: [
              ...o.timeline,
              {
                id: nextId("tl"),
                type: "completed" as const,
                label: "Completed (admin verified)",
                at,
              },
            ],
          };
        }),
      };
    }
    case "add_order":
      return { ...state, orders: [action.order, ...state.orders] };
    case "dismiss_activity":
      return {
        ...state,
        dismissedActivityIds: [...state.dismissedActivityIds, action.id],
      };
    case "driver_accept_order": {
      const order = state.orders.find((o) => o.id === action.orderId);
      if (!order || order.status !== "awaiting_acceptance") return state;
      const at = new Date().toISOString();
      const driver = state.drivers.find((d) => d.id === order.driverId);
      return {
        ...state,
        orders: state.orders.map((o) => {
          if (o.id !== action.orderId) return o;
          return {
            ...o,
            status: "in_transit" as const,
            timeline: [
              ...o.timeline,
              {
                id: nextId("tl"),
                type: "driver_accepted" as const,
                label: `Driver accepted${driver ? ` (${driver.name})` : ""}`,
                at,
              },
            ],
          };
        }),
      };
    }
    case "delete_order": {
      const order = state.orders.find((o) => o.id === action.orderId);
      if (!order) return state;
      const drivers = releaseDriverOnOrder(state.drivers, order.id, order.driverId);
      return {
        ...state,
        orders: state.orders.filter((o) => o.id !== action.orderId),
        drivers,
      };
    }
    case "assign": {
      const order = state.orders.find((o) => o.id === action.orderId);
      const driver = state.drivers.find((d) => d.id === action.driverId);
      if (!order || !driver) return state;

      let drivers = state.drivers;
      if (order.driverId) {
        drivers = releaseDriverOnOrder(drivers, order.id, order.driverId);
      }

      drivers = assignDriverToOrder(drivers, driver.id, order.id);
      const vehicleId = driver.vehicleId;
      const vehicles = syncVehicleDriver(state.vehicles, vehicleId, driver.id);

      const at = new Date().toISOString();
      const eta = new Date(Date.now() + 45 * 60 * 1000).toISOString();
      const detailParts = [
        action.routeSummary && `Route: ${action.routeSummary}`,
        action.dispatchNotes && `Notes: ${action.dispatchNotes}`,
      ].filter(Boolean);

      const newTimeline = [
        ...order.timeline,
        {
          id: nextId("tl"),
          type: "assigned" as const,
          label: `Assigned to ${driver.name}`,
          at,
          detail: detailParts.join(" · ") || undefined,
        },
      ];

      const orders = state.orders.map((o) => {
        if (o.id !== order.id) return o;
        return {
          ...o,
          driverId: driver.id,
          vehicleId,
          status: "awaiting_acceptance" as const,
          eta,
          notes: action.dispatchNotes
            ? [o.notes, `Dispatch: ${action.dispatchNotes}`].filter(Boolean).join("\n")
            : o.notes,
          timeline: newTimeline,
        };
      });

      return { ...state, orders, drivers, vehicles };
    }
    default:
      return state;
  }
}

const initial: AppState = {
  orders: structuredClone(seedOrders),
  drivers: structuredClone(seedDrivers),
  vehicles: structuredClone(seedVehicles),
  toasts: [],
  dismissedActivityIds: [],
};

type Ctx = {
  orders: DeliveryOrder[];
  drivers: Driver[];
  vehicles: Vehicle[];
  toasts: ToastMessage[];
  dismissedActivityIds: string[];
  assignOrder: (p: {
    orderId: string;
    driverId: string;
    routeSummary?: string;
    dispatchNotes?: string;
  }) => void;
  addOrder: (order: DeliveryOrder) => void;
  markPodReviewed: (orderId: string) => void;
  completeOrder: (orderId: string) => void;
  dismissToast: (id: string) => void;
  toast: (message: string, tone?: ToastMessage["tone"]) => void;
  getRoutesForOrder: (orderId: string) => import("@/data/types").RouteOption[];
  driverAcceptOrder: (orderId: string) => void;
  dismissActivity: (id: string) => void;
  deleteOrder: (orderId: string) => void;
};

const AppStateContext = createContext<Ctx | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);

  const assignOrder = useCallback(
    (p: {
      orderId: string;
      driverId: string;
      routeSummary?: string;
      dispatchNotes?: string;
    }) => {
      dispatch({ type: "assign", ...p });
      dispatch({
        type: "push_toast",
        toast: {
          message: "Assignment sent — awaiting driver acceptance.",
          tone: "success",
        },
      });
    },
    []
  );

  const addOrder = useCallback((order: DeliveryOrder) => {
    registerRoutesForOrder(order);
    dispatch({ type: "add_order", order });
    dispatch({
      type: "push_toast",
      toast: { message: `Order ${order.id} created.`, tone: "success" },
    });
  }, []);

  const markPodReviewed = useCallback((orderId: string) => {
    dispatch({ type: "mark_pod_reviewed", orderId });
    dispatch({
      type: "push_toast",
      toast: { message: "Proof of delivery marked as reviewed.", tone: "info" },
    });
  }, []);

  const completeOrder = useCallback((orderId: string) => {
    dispatch({ type: "complete_order", orderId });
    dispatch({
      type: "push_toast",
      toast: { message: "Order marked completed.", tone: "success" },
    });
  }, []);

  const dismissToast = useCallback((id: string) => {
    dispatch({ type: "dismiss_toast", id });
  }, []);

  const toast = useCallback((message: string, tone: ToastMessage["tone"] = "info") => {
    dispatch({ type: "push_toast", toast: { message, tone } });
  }, []);

  const getRoutesForOrder = useCallback((orderId: string) => {
    return routeOptionsByOrderId[orderId] ?? [];
  }, []);

  const driverAcceptOrder = useCallback((orderId: string) => {
    dispatch({ type: "driver_accept_order", orderId });
    dispatch({
      type: "push_toast",
      toast: { message: "Driver acceptance recorded (simulated).", tone: "success" },
    });
  }, []);

  const dismissActivity = useCallback((id: string) => {
    dispatch({ type: "dismiss_activity", id });
  }, []);

  const deleteOrder = useCallback((orderId: string) => {
    dispatch({ type: "delete_order", orderId });
    dispatch({
      type: "push_toast",
      toast: { message: `Order ${orderId} removed.`, tone: "info" },
    });
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      ...state,
      assignOrder,
      addOrder,
      markPodReviewed,
      completeOrder,
      dismissToast,
      toast,
      getRoutesForOrder,
      driverAcceptOrder,
      dismissActivity,
      deleteOrder,
    }),
    [
      state,
      assignOrder,
      addOrder,
      markPodReviewed,
      completeOrder,
      dismissToast,
      toast,
      getRoutesForOrder,
      driverAcceptOrder,
      dismissActivity,
      deleteOrder,
    ]
  );

  return (
    <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
  );
}

export function useAppState() {
  const c = useContext(AppStateContext);
  if (!c) throw new Error("useAppState outside AppStateProvider");
  return c;
}
