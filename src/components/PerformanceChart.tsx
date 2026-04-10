import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { GlassCard } from "./GlassCard";
import { DashboardSectionHeader } from "./DashboardSectionHeader";

interface PerformanceMetric {
  label: string;
  value: number; // 0-100
}

interface PerformanceChartProps {
  metrics: PerformanceMetric[];
  className?: string;
}

export function PerformanceChart({ metrics, className }: PerformanceChartProps) {
  return (
    <GlassCard className={className} gradient={false}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      
      <DashboardSectionHeader 
        subtitle="Performance Metrics"
        title="Today's Performance"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative z-10 font-sans">
        {metrics.map((metric, index) => (
          <div key={index} className="space-y-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-foreground/80 tracking-wide uppercase">{metric.label}</p>
              <p className="text-lg font-black text-primary">{metric.value}%</p>
            </div>
            <div className="relative h-4 w-full bg-background/50 rounded-full overflow-hidden border border-border/20 shadow-inner">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${metric.value}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: index * 0.1 }}
                className={cn(
                  "absolute top-0 left-0 h-full rounded-full shadow-[0_0_15px_rgba(var(--primary),0.3)]",
                  index === 0 ? "bg-primary" : index === 1 ? "bg-accent" : "bg-warning"
                )}
                style={{ 
                  background: index === 0 
                    ? "linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)" 
                    : index === 1 
                      ? "linear-gradient(90deg, hsl(var(--accent)) 0%, hsl(var(--info)) 100%)"
                      : "linear-gradient(90deg, hsl(var(--warning)) 0%, hsl(var(--primary)) 100%)"
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
