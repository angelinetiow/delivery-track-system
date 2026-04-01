import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ShellLayoutValue = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
};

const ShellLayoutContext = createContext<ShellLayoutValue | null>(null);

export function ShellLayoutProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = useCallback(() => setSidebarOpen((o) => !o), []);

  const value = useMemo(
    () => ({ sidebarOpen, setSidebarOpen, toggleSidebar }),
    [sidebarOpen, toggleSidebar]
  );

  return (
    <ShellLayoutContext.Provider value={value}>{children}</ShellLayoutContext.Provider>
  );
}

export function useShellLayout() {
  const ctx = useContext(ShellLayoutContext);
  if (!ctx) throw new Error("useShellLayout must be used within ShellLayoutProvider");
  return ctx;
}
