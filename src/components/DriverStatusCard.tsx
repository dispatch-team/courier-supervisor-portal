import { cn } from "@/lib/utils";
import { Users, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { GlassCard } from "./GlassCard";
import { DashboardSectionHeader } from "./DashboardSectionHeader";

interface DriverStatus {
  name: string;
  status: string;
  deliveriesToday: number;
}

interface DriverStatusCardProps {
  drivers: DriverStatus[];
  className?: string;
}

export function DriverStatusCard({ drivers, className }: DriverStatusCardProps) {
  return (
    <GlassCard className={className}>
      <DashboardSectionHeader 
        subtitle="Fleet Management"
        title="Driver Status"
        action={{ 
          label: "View all",
          onClick: () => {} // In a real app, use router or handler
        }}
      />

      <div className="space-y-4 relative z-10 font-sans">
        {drivers.map((driver, index) => (
          <motion.div
            whileHover={{ scale: 1.01, x: 2 }}
            key={index}
            className="group relative flex items-center justify-between rounded-3xl border border-border/30 bg-background/50 p-4 transition-all hover:bg-background/80 hover:border-primary/20 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground tracking-wide">{driver.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    driver.status === "Active" ? "bg-primary animate-pulse-glow" : "bg-muted-foreground"
                  )} />
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{driver.status}</p>
                </div>
              </div>
            </div>

            <div className="text-right flex items-center gap-6">
              <div className="hidden sm:block">
                <p className="text-lg font-black text-foreground">{driver.deliveriesToday}</p>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">Deliveries Today</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-background flex items-center justify-center border border-border/40 shadow-sm group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
}
