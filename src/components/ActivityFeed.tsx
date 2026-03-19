import { useContextLog, type ContextEvent } from "@/hooks/useContextLog";
import {
  Mail,
  Calendar,
  CheckCircle,
  Brain,
  Bell,
  FileText,
  MessageSquare,
  Target,
  Zap,
  Clock,
} from "lucide-react";

const EVENT_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  email_processed: { icon: Mail, color: "#00d9ff", label: "Email processed" },
  task_created: { icon: Target, color: "#00e5a0", label: "Task created" },
  task_completed: { icon: CheckCircle, color: "#22c55e", label: "Task completed" },
  commitment_extracted: { icon: Zap, color: "#f59e0b", label: "Commitment found" },
  meeting_prepped: { icon: Calendar, color: "#8b5cf6", label: "Meeting prepped" },
  briefing_generated: { icon: FileText, color: "#00d9ff", label: "Briefing ready" },
  nudge_sent: { icon: Bell, color: "#f97316", label: "Nudge sent" },
  conversation_insight: { icon: Brain, color: "#ec4899", label: "Insight captured" },
  focus_started: { icon: Target, color: "#00d9ff", label: "Focus started" },
};

const SURFACE_LABELS: Record<string, string> = {
  openclaw: "OpenClaw",
  web_ui: "Web",
  cowork: "Cowork",
  claude_code: "Code",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function EventRow({ event }: { event: ContextEvent }) {
  const config = EVENT_CONFIG[event.event_type] ?? {
    icon: MessageSquare,
    color: "var(--arc-reactor-text-secondary)",
    label: event.event_type,
  };
  const Icon = config.icon;

  return (
    <div className="flex items-start gap-3 py-2.5 transition-colors hover:bg-[rgba(0,217,255,0.03)]">
      <div
        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: `${config.color}15`, color: config.color }}
      >
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm" style={{ color: "var(--arc-reactor-text)" }}>
          {event.title}
        </p>
        {event.summary && (
          <p className="mt-0.5 truncate text-xs" style={{ color: "var(--arc-reactor-text-secondary)" }}>
            {event.summary}
          </p>
        )}
        <div className="mt-1 flex items-center gap-2">
          <span
            className="rounded-full px-1.5 py-0.5 text-[10px] font-medium"
            style={{
              backgroundColor: "rgba(0, 217, 255, 0.08)",
              color: "var(--arc-reactor-accent)",
            }}
          >
            {SURFACE_LABELS[event.surface] ?? event.surface}
          </span>
          <span className="flex items-center gap-1 text-[10px]" style={{ color: "var(--arc-reactor-text-secondary)" }}>
            <Clock className="h-2.5 w-2.5" />
            {timeAgo(event.created_at)}
          </span>
        </div>
      </div>
    </div>
  );
}

type Props = {
  limit?: number;
  compact?: boolean;
};

export default function ActivityFeed({ limit = 20, compact = false }: Props) {
  const { events, loading } = useContextLog(limit);

  if (loading) {
    return (
      <div className="space-y-3 p-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-lg" style={{ backgroundColor: "rgba(0,217,255,0.05)" }} />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="py-8 text-center text-xs" style={{ color: "var(--arc-reactor-text-secondary)" }}>
        No activity yet. Events will appear here as Prime works across all surfaces.
      </div>
    );
  }

  return (
    <div className={compact ? "space-y-0 divide-y divide-[rgba(0,217,255,0.08)]" : "space-y-1 px-2"}>
      {events.map((event) => (
        <EventRow key={event.id} event={event} />
      ))}
    </div>
  );
}
