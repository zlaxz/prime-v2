import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const urgencyConfig: Record<string, { color: string; label: string }> = {
  critical: { color: "bg-red-500/20 text-red-400 border-red-500/30", label: "Critical" },
  high: { color: "bg-orange-500/20 text-orange-400 border-orange-500/30", label: "High" },
  medium: { color: "bg-blue-500/20 text-blue-400 border-blue-500/30", label: "Medium" },
  low: { color: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30", label: "Low" },
};

export default function UrgencyBadge({ level }: { level: string | null }) {
  if (!level) return null;
  const config = urgencyConfig[level] ?? urgencyConfig.low;
  return (
    <Badge variant="outline" className={cn("text-xs font-medium", config.color)}>
      {config.label}
    </Badge>
  );
}
