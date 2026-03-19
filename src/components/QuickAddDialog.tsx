import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Project } from "@/hooks/useProjects";
import { useState } from "react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: Project[];
  onCreate: (item: any) => Promise<any>;
};

export default function QuickAddDialog({ open, onOpenChange, projects, onCreate }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState("medium");
  const [projectId, setProjectId] = useState("none");
  const [deadline, setDeadline] = useState("");
  const [estimatedMinutes, setEstimatedMinutes] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    await onCreate({
      title: title.trim(),
      description: description.trim() || null,
      urgency_level: urgency,
      primary_project_id: projectId === "none" ? null : projectId,
      deadline: deadline || null,
      estimated_minutes: estimatedMinutes ? parseInt(estimatedMinutes) : null,
      source: "manual",
      status: "ready",
    });

    setTitle("");
    setDescription("");
    setUrgency("medium");
    setProjectId("none");
    setDeadline("");
    setEstimatedMinutes("");
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-zinc-700 bg-zinc-900 text-zinc-100">
        <DialogHeader>
          <DialogTitle>Quick Add</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            autoFocus
            placeholder="What needs to happen?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border-zinc-700 bg-zinc-800"
          />
          <Textarea
            placeholder="Details (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[60px] border-zinc-700 bg-zinc-800 text-sm"
          />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-zinc-400">Urgency</label>
              <Select value={urgency} onValueChange={setUrgency}>
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
              <Select value={projectId} onValueChange={setProjectId}>
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
            <div className="space-y-1">
              <label className="text-xs text-zinc-400">Deadline</label>
              <Input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="border-zinc-700 bg-zinc-800"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-zinc-400">Est. minutes</label>
              <Input
                type="number"
                placeholder="15"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(e.target.value)}
                className="border-zinc-700 bg-zinc-800"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="border-zinc-700"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700"
              disabled={!title.trim() || saving}
            >
              Add
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
