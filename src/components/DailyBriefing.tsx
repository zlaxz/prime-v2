import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { FileText, AlertTriangle, Calendar, CheckCircle, Brain, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Briefing = {
  id: string;
  user_id: string;
  briefing_date: string;
  content: Record<string, any>;
  created_at: string;
};

export default function DailyBriefing() {
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const fetchBriefing = async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase
        .from("daily_briefings")
        .select("*")
        .eq("briefing_date", today)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) setBriefing(data);
    };
    fetchBriefing();
  }, []);

  if (!briefing || dismissed) return null;

  const content = briefing.content;
  const priorities = content.priority_items ?? content.priorities ?? [];
  const decisions = content.decisions_pending ?? content.decisions ?? [];
  const summary = content.autonomous_summary ?? content.summary ?? "";
  const insights = content.insights ?? [];
  const metrics = content.metrics ?? {};

  return (
    <div
      className="relative rounded-lg p-4"
      style={{
        backgroundColor: "rgba(0, 217, 255, 0.03)",
        border: "1px solid rgba(0, 217, 255, 0.15)",
      }}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 h-6 w-6"
        style={{ color: "var(--arc-reactor-text-secondary)" }}
        onClick={() => setDismissed(true)}
      >
        <X className="h-3.5 w-3.5" />
      </Button>

      <div className="mb-3 flex items-center gap-2">
        <FileText className="h-4 w-4" style={{ color: "var(--arc-reactor-accent)" }} />
        <h3 className="text-sm font-medium arc-reactor-glow-text">Daily Briefing</h3>
      </div>

      {/* Metrics row */}
      {(metrics.tasks_completed != null || metrics.emails_handled != null) && (
        <div className="mb-3 flex gap-4 text-xs" style={{ color: "var(--arc-reactor-text-secondary)" }}>
          {metrics.tasks_completed != null && (
            <span className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" style={{ color: "#22c55e" }} />
              {metrics.tasks_completed} completed
            </span>
          )}
          {metrics.emails_handled != null && (
            <span className="flex items-center gap-1">
              <FileText className="h-3 w-3" style={{ color: "var(--arc-reactor-accent)" }} />
              {metrics.emails_handled} emails
            </span>
          )}
          {metrics.meetings_prepped != null && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" style={{ color: "#8b5cf6" }} />
              {metrics.meetings_prepped} prepped
            </span>
          )}
        </div>
      )}

      {/* Priority items */}
      {priorities.length > 0 && (
        <div className="mb-3">
          <p className="mb-1.5 text-xs font-medium" style={{ color: "var(--arc-reactor-accent)" }}>
            Priority Items
          </p>
          <ul className="space-y-1">
            {priorities.slice(0, 3).map((item: any, i: number) => (
              <li key={i} className="flex items-start gap-2 text-xs" style={{ color: "var(--arc-reactor-text)" }}>
                <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" style={{ color: "#f59e0b" }} />
                <span>{typeof item === "string" ? item : item.title ?? item.description ?? JSON.stringify(item)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Decisions */}
      {decisions.length > 0 && (
        <div className="mb-3">
          <p className="mb-1.5 text-xs font-medium" style={{ color: "var(--arc-reactor-accent)" }}>
            Decisions Needed
          </p>
          <ul className="space-y-1">
            {decisions.slice(0, 3).map((item: any, i: number) => (
              <li key={i} className="text-xs" style={{ color: "var(--arc-reactor-text)" }}>
                {typeof item === "string" ? item : item.title ?? JSON.stringify(item)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <div className="mb-2">
          <p className="mb-1.5 text-xs font-medium" style={{ color: "var(--arc-reactor-accent)" }}>
            Insights
          </p>
          {insights.slice(0, 2).map((item: any, i: number) => (
            <p key={i} className="flex items-start gap-2 text-xs" style={{ color: "var(--arc-reactor-text-secondary)" }}>
              <Brain className="mt-0.5 h-3 w-3 shrink-0" style={{ color: "#ec4899" }} />
              {typeof item === "string" ? item : item.text ?? JSON.stringify(item)}
            </p>
          ))}
        </div>
      )}

      {/* Summary */}
      {summary && (
        <p className="text-xs italic" style={{ color: "var(--arc-reactor-text-secondary)" }}>
          {typeof summary === "string" ? summary : JSON.stringify(summary)}
        </p>
      )}
    </div>
  );
}
