import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Target,
  Inbox,
  MessageSquare,
  Settings,
  Activity,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { path: "/", label: "Command Center", icon: LayoutDashboard, key: "1" },
  { path: "/focus", label: "Focus Mode", icon: Target, key: "2" },
  { path: "/inbox", label: "Inbox", icon: Inbox, key: "3" },
  { path: "/chat", label: "Chat", icon: MessageSquare, key: "4" },
  { path: "/settings", label: "Settings", icon: Settings, key: "5" },
  { path: "/activity", label: "Activity", icon: Activity, key: "6" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;

      const item = navItems.find((n) => n.key === e.key);
      if (item) {
        e.preventDefault();
        navigate(item.path);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigate]);

  return (
    <div className="flex h-screen" style={{ backgroundColor: "var(--arc-reactor-bg)" }}>
      <aside
        className={cn(
          "flex flex-col transition-all duration-200",
          collapsed ? "w-16" : "w-56"
        )}
        style={{
          backgroundColor: "var(--arc-reactor-bg-light)",
          borderRight: "1px solid rgba(0, 217, 255, 0.15)",
        }}
      >
        <div className="flex items-center gap-2 p-4"
             style={{ borderBottom: "1px solid rgba(0, 217, 255, 0.15)" }}>
          {!collapsed && (
            <h1 className="arc-reactor-glow-text text-xl font-bold tracking-wider">
              PRIME
            </h1>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "ml-auto h-7 w-7 transition-colors",
              collapsed && "mx-auto ml-0"
            )}
            style={{ color: "var(--arc-reactor-text-secondary)" }}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <nav className="flex-1 space-y-1 p-2">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200",
                  active
                    ? "arc-reactor-hover-glow"
                    : "hover:bg-[rgba(0,217,255,0.05)]"
                )}
                style={{
                  color: active ? "var(--arc-reactor-accent)" : "var(--arc-reactor-text-secondary)",
                  backgroundColor: active ? "rgba(0, 217, 255, 0.1)" : undefined,
                  borderLeft: active ? "2px solid var(--arc-reactor-accent)" : "2px solid transparent",
                }}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && (
                  <span className="flex items-center gap-2">
                    {item.label}
                    <kbd className="hidden text-[10px] opacity-40 lg:inline">{item.key}</kbd>
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-2" style={{ borderTop: "1px solid rgba(0, 217, 255, 0.15)" }}>
          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-[rgba(0,217,255,0.05)]"
            style={{ color: "var(--arc-reactor-text-secondary)" }}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && "Sign out"}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
