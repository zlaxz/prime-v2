import { Card } from "@/components/ui/card";
import UrgencyBadge from "@/components/UrgencyBadge";
import { cn } from "@/lib/utils";
import { Mail, Calendar, MessageSquare, Pencil, Clock } from "lucide-react";
import type { ActionItem } from "@/hooks/useActionInbox";
import type { Project } from "@/hooks/useProjects";

const sourceIcons: Record<string, React.ElementType> = {
  gmail: Mail,
  calendar: Calendar,
  meeting: MessageSquare,
  manual: Pencil,
};

const urgencyBorders: Record<string, string> = {
  critical: "border-l-red-500",
  high: "border-l-orange-500",
  medium: "border-l-blue-500",
  low: "border-l-zinc-500",
};

type Props = {
  item: ActionItem;
  project?: Project | null;
  onClick?: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
};

export default function TaskCard({ item, project, onClick, draggable, onDragStart }: Props) {
  const SourceIcon = sourceIcons[item.source ?? "manual"] ?? Pencil;
  const borderColor = urgencyBorders[item.urgency_level ?? "low"] ?? "border-l-zinc-500";

  return (
    <Card
      className={cn(
        "cursor-pointer border-l-4 p-3 transition-all duration-200 hover:shadow-[0_0_15px_rgba(0,217,255,0.15)]",
        borderColor
      )}
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium" style={{ color: "var(--arc-reactor-text)" }}>{item.title}</p>
          {item.smallest_first_step && (
            <p className="mt-1 truncate text-xs" style={{ color: "var(--arc-reactor-text-secondary)" }}>
              Start: {item.smallest_first_step}
            </p>
          )}
        </div>
        <SourceIcon className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
      </div>
      <div className="mt-2 flex items-center gap-2">
        <UrgencyBadge level={item.urgency_level} />
        {item.estimated_minutes && (
          <span className="flex items-center gap-1 text-xs text-zinc-500">
            <Clock className="h-3 w-3" />
            {item.estimated_minutes}m
          </span>
        )}
        {project && (
          <span
            className="truncate rounded-full px-2 py-0.5 text-xs"
            style={{
              backgroundColor: `${project.color ?? "#71717a"}20`,
              color: project.color ?? "#71717a",
            }}
          >
            {project.name}
          </span>
        )}
      </div>
    </Card>
  );
}
