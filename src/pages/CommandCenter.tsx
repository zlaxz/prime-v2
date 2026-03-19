import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useActionInbox, type ActionItem } from "@/hooks/useActionInbox";
import { useProjects } from "@/hooks/useProjects";
import { useContextLog } from "@/hooks/useContextLog";
import TaskCard from "@/components/TaskCard";
import TaskDetailDialog from "@/components/TaskDetailDialog";
import QuickAddDialog from "@/components/QuickAddDialog";
import QuickCapture from "@/components/QuickCapture";
import TimeAwarenessBar from "@/components/TimeAwarenessBar";
import DailyBriefing from "@/components/DailyBriefing";
import ActivityFeed from "@/components/ActivityFeed";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Inbox, Target } from "lucide-react";
import { toast } from "sonner";

const STATUS_COLUMNS = [
  { key: "ready", label: "Ready", emptyText: "No tasks ready" },
  { key: "in_progress", label: "In Progress", emptyText: "Nothing in progress" },
  { key: "waiting", label: "Waiting", emptyText: "Nothing waiting" },
  { key: "completed", label: "Done", emptyText: "Complete some tasks!" },
];

export default function CommandCenter() {
  const { items, loading, createItem, updateItem } = useActionInbox();
  const { projects } = useProjects();
  const { events } = useContextLog(10);
  const [selectedItem, setSelectedItem] = useState<ActionItem | null>(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [dragItem, setDragItem] = useState<string | null>(null);
  const navigate = useNavigate();

  const projectMap = useMemo(() => {
    const map = new Map<string, typeof projects[0]>();
    projects.forEach((p) => map.set(p.id, p));
    return map;
  }, [projects]);

  // Session recovery: find in_progress task
  const inProgressTask = items.find((i) => i.status === "in_progress");

  // Inbox count (new/untriaged items)
  const inboxCount = items.filter((i) => !i.status || i.status === "new").length;

  // Today's plate: items marked as today_plate
  const todaysPlate = items.filter((i) => i.today_plate && i.status !== "completed" && i.status !== "archived");

  // Group items by project, then by status
  const projectGroups = useMemo(() => {
    const grouped = new Map<string | null, ActionItem[]>();
    items
      .filter((i) => i.status && i.status !== "new" && i.status !== "archived")
      .forEach((item) => {
        const key = item.primary_project_id;
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key)!.push(item);
      });
    return grouped;
  }, [items]);

  const handleDrop = async (status: string) => {
    if (!dragItem) return;
    const updates: Partial<ActionItem> = { status };
    if (status === "completed") updates.completed_at = new Date().toISOString();
    await updateItem(dragItem, updates);
    setDragItem(null);
  };

  const handleQuickCapture = async (title: string) => {
    await createItem({ title, source: "manual", status: "ready" });
    toast.success("Captured!");
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-10 w-full bg-zinc-800" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-48 bg-zinc-800" />
          ))}
        </div>
      </div>
    );
  }

  const totalReady = items.filter((i) => i.status === "ready").length;
  const totalInProgress = items.filter((i) => i.status === "in_progress").length;
  const totalDoneToday = items.filter((i) => {
    if (!i.completed_at) return false;
    return new Date(i.completed_at).toDateString() === new Date().toDateString();
  }).length;

  return (
    <div className="flex h-full flex-col">
      <TimeAwarenessBar items={items} />

      {/* Session recovery banner */}
      {inProgressTask && (
        <div
          className="flex cursor-pointer items-center gap-3 px-6 py-3"
          style={{
            borderBottom: "1px solid rgba(0, 217, 255, 0.2)",
            backgroundColor: "rgba(0, 217, 255, 0.05)",
          }}
          onClick={() => navigate("/focus")}
        >
          <Target className="h-4 w-4" style={{ color: "var(--arc-reactor-accent)" }} />
          <span className="text-sm" style={{ color: "var(--arc-reactor-text-secondary)" }}>
            Continue: <span className="font-medium" style={{ color: "var(--arc-reactor-accent)" }}>{inProgressTask.title}</span>
          </span>
          <Button size="sm" variant="ghost" className="ml-auto" style={{ color: "var(--arc-reactor-accent)" }}>
            Resume in Focus
          </Button>
        </div>
      )}

      {/* Triage banner */}
      {inboxCount > 0 && (
        <div
          className="flex cursor-pointer items-center gap-3 border-b border-orange-500/30 bg-orange-600/10 px-6 py-2"
          onClick={() => navigate("/inbox")}
        >
          <Inbox className="h-4 w-4 text-orange-400" />
          <span className="text-sm text-orange-300">
            {inboxCount} item{inboxCount !== 1 ? "s" : ""} need triage
          </span>
        </div>
      )}

      <div className="flex-1 overflow-auto p-6">
        {/* Summary bar */}
        <div className="mb-6 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="arc-reactor-glow-text text-2xl font-bold">Command Center</span>
          </div>
          <div className="ml-auto flex items-center gap-4 text-sm" style={{ color: "var(--arc-reactor-text-secondary)" }}>
            <span>{totalReady} ready</span>
            <span>{totalInProgress} in progress</span>
            <span style={{ color: "#00e5a0" }}>{totalDoneToday} done today</span>
          </div>
          <Button
            onClick={() => setShowQuickAdd(true)}
            className="arc-reactor-button"
            size="sm"
          >
            <Plus className="mr-1 h-4 w-4" /> Add
          </Button>
        </div>

        {/* Daily Briefing + Activity */}
        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <DailyBriefing />
          {events.length > 0 && (
            <div
              className="rounded-lg p-4"
              style={{
                backgroundColor: "rgba(0, 217, 255, 0.03)",
                border: "1px solid rgba(0, 217, 255, 0.15)",
              }}
            >
              <h3 className="mb-2 text-sm font-medium arc-reactor-glow-text">Recent Activity</h3>
              <ActivityFeed limit={5} compact />
            </div>
          )}
        </div>

        {/* Today's Plate */}
        {todaysPlate.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-2 text-sm font-medium" style={{ color: "var(--arc-reactor-accent)" }}>Today's Plate (top 3)</h3>
            <div className="grid grid-cols-3 gap-3">
              {todaysPlate.slice(0, 3).map((item) => (
                <TaskCard
                  key={item.id}
                  item={item}
                  project={projectMap.get(item.primary_project_id ?? "")}
                  onClick={() => setSelectedItem(item)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Swimlane Kanban */}
        <div className="grid grid-cols-4 gap-4">
          {STATUS_COLUMNS.map((col) => (
            <div
              key={col.key}
              className="rounded-lg p-3"
              style={{
                border: "1px solid rgba(0, 217, 255, 0.1)",
                backgroundColor: "rgba(26, 26, 26, 0.5)",
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(col.key)}
            >
              <h3 className="mb-3 flex items-center gap-2 text-sm font-medium" style={{ color: "var(--arc-reactor-text)" }}>
                {col.label}
                <span className="rounded-full px-2 py-0.5 text-xs" style={{ backgroundColor: "rgba(0, 217, 255, 0.1)", color: "var(--arc-reactor-accent)" }}>
                  {items.filter((i) => i.status === col.key).length}
                </span>
              </h3>

              <div className="space-y-2">
                {/* Group by project within column */}
                {(() => {
                  const colItems = items.filter((i) => i.status === col.key);
                  if (colItems.length === 0) {
                    return <p className="py-8 text-center text-xs" style={{ color: "var(--arc-reactor-text-secondary)", opacity: 0.5 }}>{col.emptyText}</p>;
                  }

                  // Group by project
                  const byProject = new Map<string | null, ActionItem[]>();
                  colItems.forEach((item) => {
                    const key = item.primary_project_id;
                    if (!byProject.has(key)) byProject.set(key, []);
                    byProject.get(key)!.push(item);
                  });

                  return Array.from(byProject.entries()).map(([projId, projItems]) => {
                    const project = projId ? projectMap.get(projId) : null;
                    return (
                      <div key={projId ?? "none"}>
                        {project && (
                          <div className="mb-1 flex items-center gap-1.5 px-1">
                            <div
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: project.color ?? "#71717a" }}
                            />
                            <span className="text-xs text-zinc-500">{project.name}</span>
                          </div>
                        )}
                        {projItems
                          .sort((a, b) => {
                            const urgOrder = { critical: 0, high: 1, medium: 2, low: 3 };
                            return (
                              (urgOrder[a.urgency_level as keyof typeof urgOrder] ?? 3) -
                              (urgOrder[b.urgency_level as keyof typeof urgOrder] ?? 3)
                            );
                          })
                          .map((item) => (
                            <TaskCard
                              key={item.id}
                              item={item}
                              project={project}
                              onClick={() => setSelectedItem(item)}
                              draggable
                              onDragStart={() => setDragItem(item.id)}
                            />
                          ))}
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          ))}
        </div>
      </div>

      <TaskDetailDialog
        item={selectedItem}
        projects={projects}
        open={!!selectedItem}
        onOpenChange={(open) => !open && setSelectedItem(null)}
        onUpdate={updateItem}
      />

      <QuickAddDialog
        open={showQuickAdd}
        onOpenChange={setShowQuickAdd}
        projects={projects}
        onCreate={createItem}
      />

      <QuickCapture items={items} onCapture={handleQuickCapture} onQuickAdd={() => setShowQuickAdd(true)} />
    </div>
  );
}
