import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProjects, type Project } from "@/hooks/useProjects";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  Calendar,
  CheckCircle,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

const GOOGLE_CLIENT_ID = "564767116409-35qpmdqobs6vul6ppop00l9kqkejgu26.apps.googleusercontent.com";

const PROJECT_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6",
  "#8b5cf6", "#ec4899", "#06b6d4", "#6366f1", "#71717a",
];

function startGmailOAuth() {
  const redirectUri = `${window.location.origin}/auth/email-callback`;
  const scope = encodeURIComponent("https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.modify");
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
  window.location.href = url;
}

function startCalendarOAuth() {
  const redirectUri = `${window.location.origin}/auth/calendar-callback`;
  const scope = encodeURIComponent("https://www.googleapis.com/auth/calendar.readonly");
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
  window.location.href = url;
}

export default function Settings() {
  const { user } = useAuth();
  const { projects, createProject, updateProject, deleteProject } = useProjects();
  const [emailAccounts, setEmailAccounts] = useState<any[]>([]);
  const [calendarAccounts, setCalendarAccounts] = useState<any[]>([]);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectColor, setNewProjectColor] = useState("#8b5cf6");
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");

  useEffect(() => {
    const fetchAccounts = async () => {
      const [emailRes, calRes] = await Promise.all([
        supabase.from("email_accounts").select("*"),
        supabase.from("calendar_accounts").select("*"),
      ]);
      if (emailRes.data) setEmailAccounts(emailRes.data);
      if (calRes.data) setCalendarAccounts(calRes.data);
    };
    fetchAccounts();
  }, []);

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    await createProject({ name: newProjectName.trim(), color: newProjectColor });
    setNewProjectName("");
    toast.success("Project created");
  };

  const handleSaveEdit = async (id: string) => {
    await updateProject(id, { name: editName, color: editColor });
    setEditingProject(null);
    toast.success("Project updated");
  };

  const handleDeleteProject = async (id: string) => {
    await deleteProject(id);
    toast.success("Project deleted");
  };

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h2 className="mb-6 text-2xl font-bold text-zinc-100">Settings</h2>

      {/* Connected Accounts */}
      <section className="mb-8">
        <h3 className="mb-3 text-sm font-medium text-zinc-400">Connected Accounts</h3>
        <div className="space-y-3">
          <Card className="flex items-center gap-3 border-zinc-700 bg-zinc-800 p-4">
            <Mail className="h-5 w-5 text-zinc-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-zinc-200">Gmail</p>
              {emailAccounts.length > 0 ? (
                <p className="text-xs text-green-400">
                  <CheckCircle className="mr-1 inline h-3 w-3" />
                  Connected ({emailAccounts[0].email_address ?? emailAccounts[0].email ?? "account"})
                </p>
              ) : (
                <p className="text-xs text-zinc-500">Not connected</p>
              )}
            </div>
            <Button
              size="sm"
              variant="outline"
              className="border-zinc-700"
              onClick={startGmailOAuth}
            >
              {emailAccounts.length > 0 ? "Reconnect" : "Connect"}
            </Button>
          </Card>

          <Card className="flex items-center gap-3 border-zinc-700 bg-zinc-800 p-4">
            <Calendar className="h-5 w-5 text-zinc-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-zinc-200">Google Calendar</p>
              {calendarAccounts.length > 0 ? (
                <p className="text-xs text-green-400">
                  <CheckCircle className="mr-1 inline h-3 w-3" />
                  Connected
                </p>
              ) : (
                <p className="text-xs text-zinc-500">Not connected</p>
              )}
            </div>
            <Button
              size="sm"
              variant="outline"
              className="border-zinc-700"
              onClick={startCalendarOAuth}
            >
              {calendarAccounts.length > 0 ? "Reconnect" : "Connect"}
            </Button>
          </Card>
        </div>
      </section>

      <Separator className="my-6 bg-zinc-700" />

      {/* Projects */}
      <section className="mb-8">
        <h3 className="mb-3 text-sm font-medium text-zinc-400">Projects</h3>

        <div className="mb-4 flex gap-2">
          <Input
            placeholder="New project name"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            className="border-zinc-700 bg-zinc-800"
            onKeyDown={(e) => e.key === "Enter" && handleCreateProject()}
          />
          <div className="flex gap-1">
            {PROJECT_COLORS.slice(0, 5).map((color) => (
              <button
                key={color}
                className={`h-8 w-8 rounded-md border-2 ${
                  newProjectColor === color ? "border-white" : "border-transparent"
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setNewProjectColor(color)}
              />
            ))}
          </div>
          <Button
            size="icon"
            className="bg-purple-600 hover:bg-purple-700"
            onClick={handleCreateProject}
            disabled={!newProjectName.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          {projects.map((project) => (
            <Card key={project.id} className="flex items-center gap-3 border-zinc-700 bg-zinc-800 p-3">
              {editingProject === project.id ? (
                <>
                  <div
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: editColor }}
                  />
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="h-8 border-zinc-700 bg-zinc-900 text-sm"
                  />
                  <div className="flex gap-1">
                    {PROJECT_COLORS.slice(0, 5).map((color) => (
                      <button
                        key={color}
                        className={`h-6 w-6 rounded border ${
                          editColor === color ? "border-white" : "border-transparent"
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setEditColor(color)}
                      />
                    ))}
                  </div>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleSaveEdit(project.id)}>
                    <Save className="h-3.5 w-3.5 text-green-400" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingProject(null)}>
                    <X className="h-3.5 w-3.5 text-zinc-400" />
                  </Button>
                </>
              ) : (
                <>
                  <div
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: project.color ?? "#71717a" }}
                  />
                  <span className="flex-1 text-sm text-zinc-200">{project.name}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => {
                      setEditingProject(project.id);
                      setEditName(project.name);
                      setEditColor(project.color ?? "#71717a");
                    }}
                  >
                    <Edit2 className="h-3.5 w-3.5 text-zinc-400" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => handleDeleteProject(project.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-400" />
                  </Button>
                </>
              )}
            </Card>
          ))}
        </div>
      </section>

      <Separator className="my-6 bg-zinc-700" />

      {/* Account */}
      <section>
        <h3 className="mb-3 text-sm font-medium text-zinc-400">Account</h3>
        <Card className="border-zinc-700 bg-zinc-800 p-4">
          <p className="text-sm text-zinc-300">{user?.email}</p>
          <p className="text-xs text-zinc-500">User ID: {user?.id}</p>
        </Card>
      </section>
    </div>
  );
}
