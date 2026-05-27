import { Button } from "@/components/ui/button";
import { Package, LayoutList } from "lucide-react";
import { motion } from "framer-motion";
import { GlassCard } from "./GlassCard";
import { DashboardSectionHeader } from "./DashboardSectionHeader";
import { useI18n } from "@/intl";

interface Assignment {
  id: string;
  merchant: string;
  destination: string;
  status: string;
}

interface AssignmentsTableProps {
  assignments: Assignment[];
  className?: string;
}

export function AssignmentsTable({ assignments, className }: AssignmentsTableProps) {
  const t = useI18n("supervisorDashboard");

  return (
    <GlassCard className={className} gradient={false}>
       <div className="absolute top-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] pointer-events-none" />
       
       <DashboardSectionHeader 
         subtitle={t("queueManagement")}
         title={t("pendingAssignments")}
         action={{ 
           label: t("viewAll"),
           onClick: () => {}
         }}
       />

      <div className="flex-1 relative z-10 space-y-3 font-sans">
        {assignments.map((assignment, index) => (
          <motion.div
            whileHover={{ scale: 1.01, y: -2 }}
            key={index}
            className="group relative flex items-center justify-between rounded-3xl border border-border/30 bg-background/50 p-4 transition-all hover:bg-background/80 hover:border-primary/20 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground tracking-wide">{assignment.id}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{assignment.merchant}</p>
                </div>
              </div>
            </div>

            <div className="text-right flex items-center gap-6">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-foreground">{assignment.destination}</p>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">{assignment.status}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl px-4 h-9 border-primary/20 hover:bg-primary/20 text-primary font-bold hover:text-primary transition-all text-xs"
              >
                {t("assign")}
              </Button>
            </div>
          </motion.div>
        ))}
        
        {assignments.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center py-12 bg-background/20 rounded-[2rem] border border-dashed border-border/40 p-8">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <LayoutList className="h-8 w-8 text-primary/50" />
            </div>
            <p className="text-foreground font-semibold mb-1">{t("allClear")}</p>
            <p className="text-sm text-muted-foreground max-w-[200px] leading-relaxed">
              {t("noPendingAssignments")}
            </p>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
