import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export type Contact = {
  id: string;
  user_id: string;
  name: string | null;
  email: string | null;
  organization_id: string | null;
  is_vip: boolean;
  vip_score: number | null;
  last_interaction_at: string | null;
  interaction_count: number | null;
  created_at: string;
};

export type Organization = {
  id: string;
  name: string | null;
  domain: string | null;
  relationship_type: string | null;
};

export function useContact() {
  const [contact, setContact] = useState<Contact | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchByEmail = useCallback(async (email: string) => {
    setLoading(true);
    const { data } = await supabase
      .from("contacts")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (data) {
      setContact(data);
      if (data.organization_id) {
        const { data: org } = await supabase
          .from("organizations")
          .select("*")
          .eq("id", data.organization_id)
          .maybeSingle();
        if (org) setOrganization(org);
      }
    }
    setLoading(false);
  }, []);

  const fetchById = useCallback(async (id: string) => {
    setLoading(true);
    const { data } = await supabase
      .from("contacts")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (data) {
      setContact(data);
      if (data.organization_id) {
        const { data: org } = await supabase
          .from("organizations")
          .select("*")
          .eq("id", data.organization_id)
          .maybeSingle();
        if (org) setOrganization(org);
      }
    }
    setLoading(false);
  }, []);

  return { contact, organization, loading, fetchByEmail, fetchById };
}
