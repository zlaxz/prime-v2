import { useState, useEffect } from "react";
import { Battery, BatteryLow, BatteryMedium, BatteryFull, Clock, Trophy, AlertTriangle } from "lucide-react";
import type { ActionItem } from "@/hooks/useActionInbox";

function getEnergyState(hour: number): { label: string; icon: React.ElementType; color: string } {
  if (hour >= 9 && hour < 12) return { label: "Peak Energy", icon: BatteryFull, color: "text-green-400" };
  if (hour >= 12 && hour < 14) return { label: "Post-Lunch Dip", icon: BatteryMedium, color: "text-yellow-400" };
  if (hour >= 14 && hour < 17) return { label: "Afternoon", icon: BatteryMedium, color: "text-blue-400" };
  if (hour >= 17 && hour < 18) return { label: "Wind Down", icon: BatteryLow, color: "text-orange-400" };
  return { label: "Off Hours", icon: Battery, color: "text-zinc-500" };
}

function getMinutesUntil6PM(): number {
  const now = new Date();
  const sixPM = new Date(now);
  sixPM.setHours(18, 0, 0, 0);
  return Math.max(0, Math.floor((sixPM.getTime() - now.getTime()) / 60000));
}

function formatTimeLeft(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m left`;
  return `${h}h ${m}m left`;
}

type Props = {
  items: ActionItem[];
};

export default function TimeAwarenessBar({ items }: Props) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const hour = now.getHours();
  const energy = getEnergyState(hour);
  const minutesLeft = getMinutesUntil6PM();
  const doneToday = items.filter((i) => {
    if (!i.completed_at) return false;
    const d = new Date(i.completed_at);
    return d.toDateString() === now.toDateString();
  }).length;

  const nextDeadline = items
    .filter((i) => i.deadline && i.status !== "completed" && i.status !== "archived")
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())[0];

  return (
    <div className="flex items-center gap-6 border-b border-zinc-700 bg-zinc-800/50 px-6 py-2 text-xs">
      <div className={`flex items-center gap-1.5 ${energy.color}`}>
        <energy.icon className="h-3.5 w-3.5" />
        <span>{energy.label}</span>
      </div>

      {hour < 18 && (
        <div className="flex items-center gap-1.5 text-zinc-400">
          <Clock className="h-3.5 w-3.5" />
          <span>{formatTimeLeft(minutesLeft)}</span>
        </div>
      )}

      {nextDeadline && (
        <div className="flex items-center gap-1.5 text-orange-400">
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>
            Next: {nextDeadline.title?.slice(0, 30)}
            {nextDeadline.deadline && ` (${new Date(nextDeadline.deadline).toLocaleDateString()})`}
          </span>
        </div>
      )}

      <div className="ml-auto flex items-center gap-1.5 text-green-400">
        <Trophy className="h-3.5 w-3.5" />
        <span>{doneToday} done today</span>
      </div>
    </div>
  );
}
