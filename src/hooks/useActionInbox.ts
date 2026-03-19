import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export type ActionItem = {
  id: string;
  user_id: string;
  title: string;
  action_type: string | null;
  status: string | null;
  urgency_level: string | null;
  urgency_reason: string | null;
  priority: number | null;
  description: string | null;
  deadline: string | null;
  estimated_minutes: number | null;
  smallest_first_step: string | null;
  completed_at: string | null;
  snoozed_until: string | null;
  primary_project_id: string | null;
  source: string | null;
  source_role: string | null;
  work_url: string | null;
  view_count: number | null;
  snooze_count: number | null;
  ai_summary: string | null;
  initiation_attempts: number | null;
  created_at: string;
  updated_at: string;
  where_i_left_off?: string | null;
  today_plate?: boolean;
};

export function useActionInbox() {
  const [items, setItems] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    const { data, error } = await supabase
      .from("action_inbox")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setItems(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchItems();

    const channel = supabase
      .channel("action_inbox_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "action_inbox" },
        () => {
          fetchItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchItems]);

  const createItem = async (item: Partial<ActionItem>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("action_inbox")
      .insert({ ...item, user_id: user.id })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const updateItem = async (id: string, updates: Partial<ActionItem>) => {
    const { data, error } = await supabase
      .from("action_inbox")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const deleteItem = async (id: string) => {
    const { error } = await supabase.from("action_inbox").delete().eq("id", id);
    if (error) throw error;
  };

  return { items, loading, fetchItems, createItem, updateItem, deleteItem };
}
