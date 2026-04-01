import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { AppStateProvider } from "@/state/AppStateContext";
import Dashboard from "@/pages/Dashboard";
import Orders from "@/pages/Orders";
import RoutePlanning from "@/pages/RoutePlanning";

export default function App() {
  const basename =
    import.meta.env.BASE_URL.replace(/\/$/, "") || undefined;

  return (
    <AppStateProvider>
      <BrowserRouter basename={basename}>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<Dashboard />} />
            <Route path="route-planning" element={<RoutePlanning />} />
            <Route path="orders" element={<Orders />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppStateProvider>
  );
}
