"use client";

import { useI18n } from "@/intl";
import { useAuth } from "@/context/AuthContext";
import { DashboardStatsCard } from "@/components/DashboardStatsCard";
import { DriverStatusCard } from "@/components/DriverStatusCard";
import { AssignmentsTable } from "@/components/AssignmentsTable";
import { PerformanceChart } from "@/components/PerformanceChart";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/GlassCard";
import { 
  Plus, 
  Bell, 
  User, 
  History as HistoryIcon, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  RefreshCcw,
  PlusCircle,
  Truck
} from "lucide-react";
import { motion, Variants } from "framer-motion";
import dispatchLogo from "@/assets/dispatch-logo.png";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export default function SupervisorDashboard() {
  const t = useI18n("supervisorDashboard");
  const { user } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshDashboard = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Mock data for the dashboard
  const stats = [
    { 
      title: t("pendingAssignments"), 
      value: "14", 
      change: "Action needed",
      changeType: "warning" as const,
      icon: Clock 
    },
    { 
      title: t("inTransit"), 
      value: "28", 
      change: "On track",
      changeType: "positive" as const,
      icon: TrendingUp 
    },
    { 
      title: t("completedToday"), 
      value: "42", 
      change: "+12% vs yesterday",
      changeType: "positive" as const,
      icon: CheckCircle2 
    },
    { 
      title: t("revenueToday"), 
      value: "ETB 8.5k", 
      change: "Steady",
      changeType: "neutral" as const,
      icon: HistoryIcon 
    },
  ];

  const drivers = [
    { name: "Abebe Kebede", status: "Active", deliveriesToday: 12 },
    { name: "Sara Mohammed", status: "In Transit", deliveriesToday: 8 },
    { name: "Dawit Girma", status: "Active", deliveriesToday: 15 },
  ];

  const assignments = [
    { id: "SHIP-0024", merchant: "Lorum Ipsum Shop", destination: "Bole, Addis Ababa", status: "Urgent" },
    { id: "SHIP-0025", merchant: "Market Hub Ltd", destination: "Piassa, Addis Ababa", status: "Pending" },
    { id: "SHIP-0026", merchant: "Fresh Foods", destination: "Kazanchis", status: "Pending" },
  ];

  const performance = [
    { label: t("deliveryRate"), value: 85 },
    { label: t("driverUtilization"), value: 65 },
    { label: t("rating"), value: 92 },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-10"
    >
      {/* Header Section (High-Fidelity) */}
      <GlassCard 
        variants={itemVariants} 
        className="bg-card/40 p-8 lg:p-10 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.4)]"
        gradient={false}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/5 pointer-events-none" />
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 mb-4 border border-primary/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                Live Fleet Overview
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="h-16 w-16 rounded-3xl bg-background/50 border border-white/10 flex items-center justify-center shadow-inner overflow-hidden flex-shrink-0">
                <img
                  src={dispatchLogo.src}
                  alt="Dispatch"
                  className="h-10 w-10 object-contain drop-shadow-md"
                />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                  Welcome back, {user?.name || user?.preferred_username || "Supervisor"} 
                </h1>
                <p className="text-sm md:text-base text-muted-foreground mt-1 font-medium italic">
                  Dispatching for Addis Ababa Courier Network.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="flex items-center gap-2 rounded-2xl h-11 px-5 shadow-sm border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all"
              onClick={refreshDashboard}
            >
              <RefreshCcw className={cn("h-4 w-4 text-muted-foreground", isRefreshing && "animate-spin text-primary")} />
              <span className="font-semibold tracking-wide">Sync Data</span>
            </Button>
            <Button className="flex items-center gap-2 rounded-2xl h-11 px-6 shadow-lg shadow-primary/20 font-bold bg-primary hover:bg-primary/90 transition-all active:scale-95">
              <PlusCircle className="h-4 w-4" />
              Assign Shipment
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4 relative z-10">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 300, damping: 24 }}
            >
              <DashboardStatsCard
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                change={stat.change}
                changeType={stat.changeType}
                className="bg-background/40 border border-border/30 shadow-none hover:bg-background/60 transition-colors backdrop-blur-xl rounded-3xl"
              />
            </motion.div>
          ))}
        </div>
      </GlassCard>

      {/* Main Content Grid */}
      <motion.section variants={itemVariants} className="grid gap-8 lg:grid-cols-[1fr,420px]">
        <AssignmentsTable assignments={assignments} />
        <DriverStatusCard drivers={drivers} />
      </motion.section>

      {/* Performance Section */}
      <motion.section variants={itemVariants}>
        <PerformanceChart metrics={performance} />
      </motion.section>

      {/* Quick Access Footer */}
      <motion.section variants={itemVariants} className="flex flex-wrap items-center justify-center gap-6 py-6 border-t border-border/10">
        <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-muted/20 hover:bg-muted/40 transition-all text-xs font-bold text-muted-foreground uppercase tracking-widest border border-border/20">
          <Truck className="h-4 w-4" />
          Fleet Map
        </button>
        <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-muted/20 hover:bg-muted/40 transition-all text-xs font-bold text-muted-foreground uppercase tracking-widest border border-border/20">
          <HistoryIcon className="h-4 w-4" />
          Audit Logs
        </button>
      </motion.section>
    </motion.div>
  );
}
