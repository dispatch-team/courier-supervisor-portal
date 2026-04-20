"use client";

import { useI18n } from "@/intl";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/GlassCard";
import { RevenueChart } from "@/components/RevenueChart";
import { StatusBreakdownChart } from "@/components/StatusBreakdownChart";
import { 
  Trophy, 
  Clock, 
  CheckCircle2, 
  BarChart3, 
  Download,
  Users2,
  Bike,
  Car,
  Star,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const mockPerformanceStats = [
  { label: "successRate", value: "94.8%", icon: CheckCircle2, sub: "+2.1% from last week" },
  { label: "avgDeliveryTime", value: "32m", icon: Clock, sub: "-4m from average" },
  { label: "onTimePercentage", value: "91.2%", icon: BarChart3, sub: "Goal: 95%" },
  { label: "fleetUtilization", value: "78%", icon: Users2, sub: "12 drivers idle" },
];

const mockLeaderboard = [
  { name: "Abebe Kebede", trips: 142, success: 98.5, rating: 4.9, avatar: "AK", color: "from-amber-400 to-orange-500" },
  { name: "Sara Mohammed", trips: 128, success: 97.2, rating: 4.8, avatar: "SM", color: "from-slate-300 to-slate-400" },
  { name: "Dawit Girma", trips: 115, success: 96.8, rating: 4.7, avatar: "DG", color: "from-orange-700 to-orange-800" },
];

const volumeTrendData = [120, 145, 132, 168, 155, 182, 195];

export default function ReportsPage() {
  const t = useI18n("reports");

  return (
    <div className="space-y-12 pb-20 relative">
      {/* Decorative BG */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[20%] -left-20 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] -right-20 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px]" />
      </div>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-primary to-foreground mb-2">
            {t("title")}
          </h1>
          <p className="text-muted-foreground font-medium text-lg leading-relaxed max-w-2xl italic">
            {t("subtitle")}
          </p>
        </motion.div>

        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 bg-foreground text-background font-black px-6 py-3 rounded-2xl shadow-xl hover:shadow-primary/20 transition-all uppercase text-xs tracking-widest"
        >
          <Download className="h-4 w-4" />
          {t("export")}
        </motion.button>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        {mockPerformanceStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <GlassCard className="p-8 group hover:border-primary/40 transition-all !rounded-[2.5rem] relative overflow-hidden h-full">
                 <div className="flex flex-col h-full gap-4">
                    <div className="flex items-center justify-between">
                       <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                          <Icon className="h-5 w-5" />
                       </div>
                       <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{t(`stats.${stat.label}`)}</p>
                    </div>
                    <div className="space-y-1">
                       <h4 className="text-3xl font-black tracking-tighter">{stat.value}</h4>
                       <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-tight">{stat.sub}</p>
                    </div>
                 </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <div className="mb-4 px-2">
            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground opacity-60">{t("charts.deliveryVolume")}</h3>
          </div>
          <RevenueChart data={volumeTrendData} className="!rounded-[3rem] p-8 shadow-2xl border-white/5 h-[400px]" />
        </motion.div>

        <motion.div
           initial={{ opacity: 0, scale: 0.98 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ delay: 0.5 }}
        >
          <div className="mb-4 px-2">
            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground opacity-60">{t("charts.statusBreakdown")}</h3>
          </div>
          <StatusBreakdownChart />
        </motion.div>
      </div>

      {/* Leaderboard Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-10">
          {/* Driver Leaderboard */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3 px-2">
               <Trophy className="h-5 w-5 text-amber-500" />
               <h2 className="text-2xl font-black text-foreground tracking-tight">{t("leaderboard.title")}</h2>
            </div>

            <div className="space-y-4">
              {mockLeaderboard.map((driver, idx) => (
                <motion.div
                  key={driver.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + idx * 0.1 }}
                  className="group"
                >
                  <GlassCard className="p-6 !rounded-[2rem] hover:bg-card/40 transition-all group overflow-hidden relative">
                    {idx === 0 && <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-3xl -mr-12 -mt-12" />}
                    
                    <div className="flex items-center justify-between relative z-10">
                       <div className="flex items-center gap-4">
                          <div className="relative text-2xl font-black text-muted-foreground w-8 opacity-20 group-hover:opacity-100 group-hover:text-primary transition-all">
                             #{idx + 1}
                          </div>
                          <div className={cn("h-12 w-12 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white font-black text-sm shadow-lg", driver.color)}>
                             {driver.avatar}
                          </div>
                          <div>
                             <h4 className="font-black text-foreground">{driver.name}</h4>
                             <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">{driver.trips} {t("leaderboard.table.trips")}</p>
                          </div>
                       </div>

                       <div className="flex items-center gap-12">
                          <div className="hidden md:block">
                             <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest opacity-40">{t("leaderboard.table.success")}</p>
                             <p className="text-sm font-black text-emerald-400">{driver.success}%</p>
                          </div>
                          <div className="text-right">
                             <div className="flex items-center gap-1 text-amber-500">
                                <Star className="h-4 w-4 fill-current" />
                                <span className="font-black text-lg">{driver.rating}</span>
                             </div>
                             <p className="text-[8px] font-black uppercase text-muted-foreground tracking-tighter opacity-40">{t("leaderboard.table.rating")}</p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground opacity-20 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0" />
                       </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Vehicle Utilization Sidebar */}
          <div className="space-y-6">
             <div className="flex items-center gap-3 px-2">
               <BarChart3 className="h-5 w-5 text-primary" />
               <h2 className="text-2xl font-black text-foreground tracking-tight">{t("charts.vehicleUsage")}</h2>
            </div>

            <GlassCard className="p-8 !rounded-[2.5rem] space-y-8 h-fit">
               <div className="space-y-6">
                  <div className="space-y-2">
                     <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                        <div className="flex items-center gap-2"><Bike className="h-3 w-3" /> {t("vehicles.motorcycles")}</div>
                        <span>64%</span>
                     </div>
                     <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: "64%" }}
                          className="h-full bg-primary shadow-[0_0_10px_hsl(var(--primary))]" 
                        />
                     </div>
                  </div>

                  <div className="space-y-2">
                     <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                        <div className="flex items-center gap-2"><Car className="h-3 w-3" /> {t("vehicles.compactCars")}</div>
                        <span>32%</span>
                     </div>
                     <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: "32%" }}
                            className="h-full bg-accent shadow-[0_0_10px_hsl(var(--accent))]" 
                        />
                     </div>
                  </div>

                  <div className="space-y-2 opacity-40">
                     <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                        <div className="flex items-center gap-2">{t("vehicles.trucksVans")}</div>
                        <span>4%</span>
                     </div>
                     <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full w-[4%] bg-muted-foreground" />
                     </div>
                  </div>
               </div>
            </GlassCard>
          </div>
      </div>
    </div>
  );
}
