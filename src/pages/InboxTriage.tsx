import { useState, useMemo } from "react";
import { useActionInbox, type ActionItem } from "@/hooks/useActionInbox";
import { useProjects } from "@/hooks/useProjects";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import UrgencyBadge from "@/components/UrgencyBadge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Inbox,
  Archive,
  Clock,
  Play,
  ChevronRight,
  PartyPopper,
  Mail,
  Calendar,
  MessageSquare,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const sourceIcons: Record<string, React.ElementType> = {
  gmail: Mail,
  calendar: Calendar,
  meeting: MessageSquare,
  manual: Pencil,
};

export default function InboxTriage() {
  const { items, loading, updateItem } = useActionInbox();
  const { projects } = useProjects();
  const [animatingOut, setAnimatingOut] = useState(false);
  const [selectedUrgency, setSelectedUrgency] = useState<string>("medium");
  const [selectedProject, setSelectedProject] = useState<string>("none");

  const inboxItems = useMemo(
    () => items.filter((i) => !i.status || i.status === "new"),
    [items]
  );

  const current = inboxItems[0] ?? null;
  const SourceIcon = current ? (sourceIcons[current.source ?? "manual"] ?? Pencil) : Pencil;

  const advance = async (action: () => Promise<any>) => {
    setAnimatingOut(true);
    await action();
    setTimeout(() => {
      setAnimatingOut(false);
      setSelectedUrgency("medium");
      setSelectedProject("none");
    }, 300);
  };

  const handleReady = () =>
    advance(() =>
      updateItem(current!.id, {
        status: "ready",
        urgency_level: selectedUrgency,
        primary_project_id: selectedProject === "none" ? null : selectedProject,
      })
    );

  const handleStartNow = () =>
    advance(() =>
      updateItem(current!.id, {
        status: "in_progress",
        urgency_level: selectedUrgency,
        primary_project_id: selectedProject === "none" ? null : selectedProject,
      })
    );

  const handleDefer = () =>
    advance(() =>
      updateItem(current!.id, {
        status: "ready",
        urgency_level: "low",
        snoozed_until: new Date(Date.now() + 86400000).toISOString(),
        snooze_count: (current!.snooze_count ?? 0) + 1,
      })
    );

  const handleArchive = () =>
    advance(() => updateItem(current!.id, { status: "archived" }));

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <Skeleton className="h-64 w-full max-w-lg bg-zinc-800" />
      </div>
    );
  }

  // Inbox Zero celebration
  if (!current) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <PartyPopper className="h-16 w-16 text-purple-400" />
        <h2 className="text-2xl font-bold text-zinc-100">Inbox Zero!</h2>
        <p className="text-sm text-zinc-400">Everything has been triaged. Go focus on what matters.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-center p-6">
      <div className="mb-4 text-sm text-zinc-500">
        <Inbox className="mr-1 inline h-4 w-4" />
        {inboxItems.length} item{inboxItems.length !== 1 ? "s" : ""} to triage
      </div>

      <Card
        className={cn(
          "w-full max-w-lg border-zinc-700 bg-zinc-800 p-6 transition-all duration-300",
          animatingOut && "translate-x-12 opacity-0"
        )}
      >
        <div className="mb-4 flex items-center gap-2">
          <SourceIcon className="h-4 w-4 text-zinc-400" />
          <span className="text-xs text-zinc-500">{current.source ?? "manual"}</span>
          {current.created_at && (
            <span className="ml-auto text-xs text-zinc-600">
              {new Date(current.created_at).toLocaleDateString()}
            </span>
          )}
        </div>

        <h2 className="mb-2 text-lg font-semibold text-zinc-100">{current.title}</h2>

        {current.description && (
          <p className="mb-3 text-sm text-zinc-400">{current.description}</p>
        )}

        {current.ai_summary && (
          <div className="mb-4 rounded-md bg-zinc-700/50 p-3">
            <p className="text-xs font-medium text-zinc-400">AI Summary</p>
            <p className="mt-1 text-sm text-zinc-300">{current.ai_summary}</p>
          </div>
        )}

        <div className="mb-4 grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">Urgency</label>
            <Select value={selectedUrgency} onValueChange={setSelectedUrgency}>
              <SelectTrigger className="border-zinc-700 bg-zinc-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-zinc-700 bg-zinc-800">
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">Project</label>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="border-zinc-700 bg-zinc-800">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent className="border-zinc-700 bg-zinc-800">
                <SelectItem value="none">None</SelectItem>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            className="bg-purple-600 hover:bg-purple-700"
            onClick={handleReady}
          >
            <ChevronRight className="mr-1 h-4 w-4" /> Ready
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={handleStartNow}
          >
            <Play className="mr-1 h-4 w-4" /> Start Now
          </Button>
          <Button
            variant="outline"
            className="border-zinc-700 text-zinc-400"
            onClick={handleDefer}
          >
            <Clock className="mr-1 h-4 w-4" /> Defer
          </Button>
          <Button
            variant="outline"
            className="border-zinc-700 text-zinc-400"
            onClick={handleArchive}
          >
            <Archive className="mr-1 h-4 w-4" /> Archive
          </Button>
        </div>
      </Card>
    </div>
  );
}
