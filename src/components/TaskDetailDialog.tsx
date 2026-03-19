import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import UrgencyBadge from "@/components/UrgencyBadge";
import type { ActionItem } from "@/hooks/useActionInbox";
import type { Project } from "@/hooks/useProjects";
import { useState } from "react";
import { Mail, Calendar, MessageSquare, Pencil, ExternalLink } from "lucide-react";

const sourceIcons: Record<string, React.ElementType> = {
  gmail: Mail,
  calendar: Calendar,
  meeting: MessageSquare,
  manual: Pencil,
};

type Props = {
  item: ActionItem | null;
  projects: Project[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string, updates: Partial<ActionItem>) => Promise<any>;
};

export default function TaskDetailDialog({ item, projects, open, onOpenChange, onUpdate }: Props) {
  const [whereLeftOff, setWhereLeftOff] = useState(item?.where_i_left_off ?? "");
  const [saving, setSaving] = useState(false);

  if (!item) return null;

  const SourceIcon = sourceIcons[item.source ?? "manual"] ?? Pencil;

  const handleStatusChange = async (status: string) => {
    setSaving(true);
    const updates: Partial<ActionItem> = { status };
    if (status === "completed") updates.completed_at = new Date().toISOString();
    await onUpdate(item.id, updates);
    setSaving(false);
    if (status === "completed" || status === "archived") onOpenChange(false);
  };

  const handleSaveNotes = async () => {
    setSaving(true);
    await onUpdate(item.id, { where_i_left_off: whereLeftOff });
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-zinc-700 bg-zinc-900 text-zinc-100">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <SourceIcon className="h-4 w-4 text-zinc-400" />
            <DialogTitle className="text-lg">{item.title}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <UrgencyBadge level={item.urgency_level} />
            <span className="text-xs text-zinc-500">
              Status: <span className="text-zinc-300">{item.status ?? "new"}</span>
            </span>
            {item.deadline && (
              <span className="text-xs text-zinc-500">
                Due: <span className="text-zinc-300">{new Date(item.deadline).toLocaleDateString()}</span>
              </span>
            )}
          </div>

          {item.description && (
            <p className="text-sm text-zinc-300">{item.description}</p>
          )}

          {item.ai_summary && (
            <div className="rounded-md bg-zinc-800 p-3">
              <p className="text-xs font-medium text-zinc-400">AI Summary</p>
              <p className="mt-1 text-sm text-zinc-300">{item.ai_summary}</p>
            </div>
          )}

          {item.smallest_first_step && (
            <div className="rounded-md bg-purple-500/10 p-3">
              <p className="text-xs font-medium text-purple-400">Start here</p>
              <p className="mt-1 text-sm text-zinc-200">{item.smallest_first_step}</p>
            </div>
          )}

          {item.work_url && (
            <a
              href={item.work_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Open link
            </a>
          )}

          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-400">Project</label>
            <Select
              value={item.primary_project_id ?? "none"}
              onValueChange={(v) => onUpdate(item.id, { primary_project_id: v === "none" ? null : v })}
            >
              <SelectTrigger className="border-zinc-700 bg-zinc-800">
                <SelectValue placeholder="No project" />
              </SelectTrigger>
              <SelectContent className="border-zinc-700 bg-zinc-800">
                <SelectItem value="none">No project</SelectItem>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-400">Urgency</label>
            <Select
              value={item.urgency_level ?? "low"}
              onValueChange={(v) => onUpdate(item.id, { urgency_level: v })}
            >
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

          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-400">Where I left off</label>
            <Textarea
              value={whereLeftOff}
              onChange={(e) => setWhereLeftOff(e.target.value)}
              onBlur={handleSaveNotes}
              placeholder="Notes for when you come back..."
              className="min-h-[60px] border-zinc-700 bg-zinc-800 text-sm"
            />
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="border-zinc-700"
              onClick={() => handleStatusChange("ready")}
              disabled={saving}
            >
              Ready
            </Button>
            <Button
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => handleStatusChange("in_progress")}
              disabled={saving}
            >
              Start
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-green-700 text-green-400 hover:bg-green-900/20"
              onClick={() => handleStatusChange("completed")}
              disabled={saving}
            >
              Done
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-zinc-700 text-zinc-400"
              onClick={() => handleStatusChange("archived")}
              disabled={saving}
            >
              Archive
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
