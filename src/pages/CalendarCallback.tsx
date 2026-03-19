import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

export default function CalendarCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Connecting Calendar...");

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      setStatus("error");
      setMessage("No authorization code received");
      return;
    }

    const exchangeCode = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch(
          "https://esnfzdpevddzgckwidgf.supabase.co/functions/v1/google-calendar-oauth",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session?.access_token}`,
            },
            body: JSON.stringify({
              code,
              redirectUri: `${window.location.origin}/auth/calendar-callback`,
            }),
          }
        );

        if (res.ok) {
          setStatus("success");
          setMessage("Calendar connected successfully!");
          setTimeout(() => navigate("/settings"), 2000);
        } else {
          const data = await res.json();
          throw new Error(data.error ?? "Failed to connect");
        }
      } catch (err: any) {
        setStatus("error");
        setMessage(err.message ?? "Failed to connect Calendar");
      }
    };

    exchangeCode();
  }, [searchParams, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-900">
      <div className="text-center">
        {status === "loading" && <Loader2 className="mx-auto h-8 w-8 animate-spin text-purple-400" />}
        {status === "success" && <CheckCircle className="mx-auto h-8 w-8 text-green-400" />}
        {status === "error" && <AlertCircle className="mx-auto h-8 w-8 text-red-400" />}
        <p className="mt-4 text-sm text-zinc-300">{message}</p>
      </div>
    </div>
  );
}
