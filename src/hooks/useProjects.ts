import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export type Project = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
};

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    const { data, error } = await supabase
      .from("primary_projects")
      .select("*")
      .order("name");

    if (!error && data) {
      setProjects(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const createProject = async (project: Partial<Project>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("primary_projects")
      .insert({ ...project, user_id: user.id })
      .select()
      .single();

    if (error) throw error;
    await fetchProjects();
    return data;
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    const { data, error } = await supabase
      .from("primary_projects")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    await fetchProjects();
    return data;
  };

  const deleteProject = async (id: string) => {
    const { error } = await supabase.from("primary_projects").delete().eq("id", id);
    if (error) throw error;
    await fetchProjects();
  };

  return { projects, loading, fetchProjects, createProject, updateProject, deleteProject };
}
