import ActivityFeed from "@/components/ActivityFeed";

export default function Activity() {
  return (
    <div className="mx-auto max-w-2xl p-6">
      <h2 className="mb-6 text-2xl font-bold arc-reactor-glow-text">Activity</h2>
      <p className="mb-4 text-sm" style={{ color: "var(--arc-reactor-text-secondary)" }}>
        Events from all surfaces — OpenClaw, Web, Cowork, and Claude Code.
      </p>
      <ActivityFeed limit={100} />
    </div>
  );
}
