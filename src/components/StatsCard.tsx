import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  className?: string;
}

export function StatsCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  className,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        "stat-card group animate-fade-in",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground truncate">{title}</p>
          <p className="text-2xl font-bold tracking-tight text-foreground">
            {value}
          </p>
          {change && (
            <p
              className={cn(
                "text-xs font-medium",
                changeType === "positive" && "text-success",
                changeType === "negative" && "text-destructive",
                changeType === "neutral" && "text-muted-foreground"
              )}
            >
              {change}
            </p>
          )}
        </div>
        <div className="p-2 rounded-lg bg-primary/15 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300 flex-shrink-0">
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}
