import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { ShellLayoutProvider, useShellLayout } from "./ShellLayoutContext";
import { ToastStack } from "@/components/ui/ToastStack";

function AppShellInner() {
  const { sidebarOpen } = useShellLayout();

  return (
    <div className="flex h-dvh min-h-0 w-full overflow-hidden">
      <div
        className={`flex h-full min-h-0 shrink-0 overflow-hidden border-border transition-[width] duration-200 ease-out ${
          sidebarOpen ? "w-56 border-r" : "w-0 border-r-0"
        }`}
        aria-hidden={!sidebarOpen}
      >
        <div
          className="flex h-full min-h-0 w-56 min-w-[14rem] flex-1 flex-col"
          {...(!sidebarOpen ? { inert: "" as const } : {})}
        >
          <Sidebar />
        </div>
      </div>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-surface">
        <Outlet />
      </div>
      <ToastStack />
    </div>
  );
}

export function AppShell() {
  return (
    <ShellLayoutProvider>
      <AppShellInner />
    </ShellLayoutProvider>
  );
}
