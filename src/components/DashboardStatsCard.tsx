import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface DashboardStatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  changeType?: "positive" | "negative" | "warning" | "neutral";
  className?: string;
}

export function DashboardStatsCard({
  title,
  value,
  icon: Icon,
  change,
  changeType = "neutral",
  className,
}: DashboardStatsCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-[2rem] border border-border/40 bg-card/30 backdrop-blur-xl p-6 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.3)] transition-all duration-300 hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.4)] hover:border-primary/30",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative z-10 flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
            {title}
          </p>
          <div className="space-y-1">
            <h3 className="text-3xl font-bold tracking-tight text-foreground">
              {value}
            </h3>
            {change && (
              <p className={cn(
                "text-xs font-semibold",
                changeType === "positive" && "text-primary",
                changeType === "negative" && "text-destructive",
                changeType === "warning" && "text-warning",
                changeType === "neutral" && "text-muted-foreground"
              )}>
                {change}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-background/50 border border-border/20 shadow-inner group-hover:scale-110 transition-transform duration-300">
          <Icon className="h-6 w-6 text-primary/80" />
        </div>
      </div>
    </div>
  );
}
