import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export type ContextEvent = {
  id: string;
  user_id: string;
  event_type: string;
  surface: string;
  title: string;
  summary: string | null;
  metadata: Record<string, any>;
  related_table: string | null;
  related_id: string | null;
  importance: string;
  created_at: string;
};

export function useContextLog(limit = 50) {
  const [events, setEvents] = useState<ContextEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    const { data, error } = await supabase
      .from("prime_context_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (!error && data) {
      setEvents(data);
    }
    setLoading(false);
  }, [limit]);

  useEffect(() => {
    fetchEvents();

    const channel = supabase
      .channel("context_log_changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "prime_context_log" },
        (payload) => {
          setEvents((prev) => [payload.new as ContextEvent, ...prev].slice(0, limit));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchEvents, limit]);

  const eventsSince = useCallback(
    (since: string) => events.filter((e) => e.created_at > since),
    [events]
  );

  const eventsByType = useCallback(
    (type: string) => events.filter((e) => e.event_type === type),
    [events]
  );

  const eventsBySurface = useCallback(
    (surface: string) => events.filter((e) => e.surface === surface),
    [events]
  );

  return { events, loading, fetchEvents, eventsSince, eventsByType, eventsBySurface };
}
