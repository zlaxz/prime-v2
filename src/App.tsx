import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Toaster } from "@/components/ui/sonner";
import AppShell from "@/components/AppShell";
import Auth from "@/pages/Auth";
import CommandCenter from "@/pages/CommandCenter";
import FocusMode from "@/pages/FocusMode";
import InboxTriage from "@/pages/InboxTriage";
import Chat from "@/pages/Chat";
import Settings from "@/pages/Settings";
import EmailCallback from "@/pages/EmailCallback";
import CalendarCallback from "@/pages/CalendarCallback";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-900">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/auth/email-callback" element={<EmailCallback />} />
        <Route path="/auth/calendar-callback" element={<CalendarCallback />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppShell>
                <Routes>
                  <Route path="/" element={<CommandCenter />} />
                  <Route path="/focus" element={<FocusMode />} />
                  <Route path="/inbox" element={<InboxTriage />} />
                  <Route path="/chat" element={<Chat />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </AppShell>
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}
