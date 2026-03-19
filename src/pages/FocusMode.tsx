import { useState, useEffect, useRef, useMemo } from "react";
import { useActionInbox, type ActionItem } from "@/hooks/useActionInbox";
import { useProjects } from "@/hooks/useProjects";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import UrgencyBadge from "@/components/UrgencyBadge";
import { supabase } from "@/lib/supabase";
import {
  Check,
  AlertTriangle,
  SkipForward,
  Timer,
  Shield,
  ChevronDown,
  Sparkles,
  Coffee,
} from "lucide-react";
import { toast } from "sonner";

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m} min in`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m in`;
}

export default function FocusMode() {
  const { items, updateItem } = useActionInbox();
  const { projects } = useProjects();
  const [starterTimer, setStarterTimer] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [decomposedSteps, setDecomposedSteps] = useState<string[]>([]);
  const [loadingDecompose, setLoadingDecompose] = useState(false);
  const [showBreakNudge, setShowBreakNudge] = useState(false);
  const startTime = useRef<number | null>(null);
  const breakNudgeShown = useRef(false);

  // Priority selection: in_progress first, then highest urgency ready items
  const currentTask = useMemo(() => {
    const inProgress = items.find((i) => i.status === "in_progress");
    if (inProgress) return inProgress;

    const ready = items
      .filter((i) => i.status === "ready")
      .sort((a, b) => {
        const urgOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return (
          (urgOrder[a.urgency_level as keyof typeof urgOrder] ?? 3) -
          (urgOrder[b.urgency_level as keyof typeof urgOrder] ?? 3)
        );
      });
    return ready[0] ?? null;
  }, [items]);

  // Shield mode: hide distractions when inbox is overwhelming
  const inboxCount = items.filter((i) => !i.status || i.status === "new" || i.status === "ready").length;
  const shieldMode = inboxCount > 20;

  // Elapsed timer
  useEffect(() => {
    if (!currentTask) return;
    startTime.current = Date.now();
    const interval = setInterval(() => {
      if (startTime.current) {
        const secs = Math.floor((Date.now() - startTime.current) / 1000);
        setElapsed(secs);
        // Break nudge at 45 minutes
        if (secs >= 2700 && !breakNudgeShown.current) {
          breakNudgeShown.current = true;
          setShowBreakNudge(true);
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [currentTask?.id]);

  // 2-minute starter timer
  useEffect(() => {
    if (starterTimer === null) return;
    if (starterTimer <= 0) {
      toast.success("2 minutes done! Keep going or mark done.");
      setStarterTimer(null);
      return;
    }
    const timeout = setTimeout(() => setStarterTimer(starterTimer - 1), 1000);
    return () => clearTimeout(timeout);
  }, [starterTimer]);

  const handleDone = async () => {
    if (!currentTask) return;
    await updateItem(currentTask.id, { status: "completed", completed_at: new Date().toISOString() });
    startTime.current = null;
    setElapsed(0);
    setDecomposedSteps([]);
    breakNudgeShown.current = false;
    toast.success("Done! Nice work.");
  };

  const handleStuck = async () => {
    if (!currentTask) return;
    setLoadingDecompose(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        "https://esnfzdpevddzgckwidgf.supabase.co/functions/v1/decompose-task",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ taskTitle: currentTask.title, taskType: currentTask.action_type || "general", estimatedMinutes: currentTask.estimated_minutes || 30 }),
        }
      );
      if (!res.ok) throw new Error("Decompose failed");
      const data = await res.json();
      setDecomposedSteps(data.steps ?? data.micro_steps ?? []);
    } catch {
      toast.error("Couldn't decompose task");
    } finally {
      setLoadingDecompose(false);
    }
  };

  const handleSkip = async () => {
    if (!currentTask) return;
    await updateItem(currentTask.id, {
      status: "ready",
      snooze_count: (currentTask.snooze_count ?? 0) + 1,
    });
    startTime.current = null;
    setElapsed(0);
    setDecomposedSteps([]);
    breakNudgeShown.current = false;
  };

  const handleStart = async () => {
    if (!currentTask) return;
    await updateItem(currentTask.id, { status: "in_progress" });
    setStarterTimer(120);
  };

  if (!currentTask) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <Sparkles className="h-12 w-12 text-purple-400" />
        <h2 className="text-xl font-semibold text-zinc-200">All clear!</h2>
        <p className="text-sm text-zinc-400">No tasks to focus on. Add some from the Command Center.</p>
      </div>
    );
  }

  const project = projects.find((p) => p.id === currentTask.primary_project_id);

  return (
    <div className="flex h-full flex-col items-center justify-center p-6">
      {shieldMode && (
        <div className="mb-4 flex items-center gap-2 rounded-full bg-purple-600/20 px-4 py-2 text-sm text-purple-300">
          <Shield className="h-4 w-4" />
          Shield Mode — Just focus on this one thing
        </div>
      )}

      {showBreakNudge && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-600/10 px-4 py-2">
          <Coffee className="h-4 w-4 text-yellow-400" />
          <span className="text-sm text-yellow-300">45 minutes in. Consider a short break?</span>
          <Button size="sm" variant="ghost" className="text-yellow-400" onClick={() => setShowBreakNudge(false)}>
            Dismiss
          </Button>
        </div>
      )}

      <Card className="w-full max-w-xl border-zinc-700 bg-zinc-800 p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UrgencyBadge level={currentTask.urgency_level} />
            {project && (
              <span
                className="rounded-full px-2 py-0.5 text-xs"
                style={{ backgroundColor: `${project.color ?? "#71717a"}20`, color: project.color ?? "#71717a" }}
              >
                {project.name}
              </span>
            )}
          </div>
          <span className="text-xs text-zinc-500">{formatElapsed(elapsed)}</span>
        </div>

        <h2 className="mb-2 text-xl font-semibold text-zinc-100">{currentTask.title}</h2>

        {currentTask.description && (
          <p className="mb-4 text-sm text-zinc-400">{currentTask.description}</p>
        )}

        {currentTask.smallest_first_step && (
          <div className="mb-4 rounded-md bg-purple-500/10 p-3">
            <p className="text-xs font-medium text-purple-400">Start here</p>
            <p className="mt-1 text-sm text-zinc-200">{currentTask.smallest_first_step}</p>
          </div>
        )}

        {/* 2-minute starter timer */}
        {starterTimer !== null && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400">2-minute starter</span>
              <span className="font-mono text-purple-400">
                {Math.floor(starterTimer / 60)}:{String(starterTimer % 60).padStart(2, "0")}
              </span>
            </div>
            <Progress value={((120 - starterTimer) / 120) * 100} className="mt-1 h-2" />
          </div>
        )}

        {/* Decomposed steps */}
        {decomposedSteps.length > 0 && (
          <div className="mb-4 space-y-2 rounded-md border border-zinc-700 p-3">
            <p className="text-xs font-medium text-zinc-400">Micro-steps</p>
            {decomposedSteps.map((step, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full border border-zinc-600 text-center text-[10px] leading-4">
                  {i + 1}
                </span>
                {step}
              </div>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          {currentTask.status !== "in_progress" ? (
            <Button className="flex-1 bg-purple-600 hover:bg-purple-700" onClick={handleStart}>
              <Timer className="mr-2 h-4 w-4" /> Start (2-min timer)
            </Button>
          ) : (
            <>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={handleDone}
              >
                <Check className="mr-2 h-4 w-4" /> Done
              </Button>
              <Button
                variant="outline"
                className="border-orange-700 text-orange-400 hover:bg-orange-900/20"
                onClick={handleStuck}
                disabled={loadingDecompose}
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                {loadingDecompose ? "..." : "Stuck"}
              </Button>
              <Button
                variant="outline"
                className="border-zinc-700 text-zinc-400"
                onClick={handleSkip}
              >
                <SkipForward className="mr-2 h-4 w-4" /> Skip
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
