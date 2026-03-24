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
import Activity from "@/pages/Activity";
import EmailCallback from "@/pages/EmailCallback";
import CalendarCallback from "@/pages/CalendarCallback";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  // Don't redirect to /auth if we're processing an OAuth callback
  // Supabase puts tokens in the URL hash after Google sign-in
  const isOAuthCallback = window.location.hash.includes("access_token") ||
    window.location.hash.includes("error_description");

  if (loading || isOAuthCallback) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ backgroundColor: "var(--arc-reactor-bg)" }}>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: "var(--arc-reactor-accent)", borderTopColor: "transparent" }} />
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
                  <Route path="/activity" element={<Activity />} />
                </Routes>
              </AppShell>
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}
