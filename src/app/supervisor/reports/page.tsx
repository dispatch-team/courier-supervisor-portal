"use client";

import { useI18n, useLocale } from "@/intl";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { GlassCard } from "@/components/GlassCard";
import { RevenueChart } from "@/components/RevenueChart";
import { StatusBreakdownChart } from "@/components/StatusBreakdownChart";
import {
  Trophy,
  Clock,
  CheckCircle2,
  Download,
  Users2,
  Zap,
  Star,
  ChevronRight,
  Loader2,
  AlertCircle,
  FileText,
  FileSpreadsheet,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportOperationsReportPdf, exportOperationsReportExcel } from "@/lib/operations-report";
import { useApi } from "@/hooks/use-api";
import { useAuth } from "@/context/AuthContext";
import { fetchLogoAsDataUrl } from "@/lib/report-utils";
import type { Shipment, ShipmentListResponse } from "@/types/api";
import { cn } from "@/lib/utils";
import { useDrivers } from "@/hooks/queries/use-drivers";
import { useShipments } from "@/hooks/queries/use-shipments";
import { useCompanyId } from "@/hooks/queries/use-company-id";
import { computeRevenueMetrics, formatEtb } from "@/lib/revenue-metrics";
import { computeFleetMetrics } from "@/lib/fleet-metrics";
import { computeDriverMetrics, formatDuration } from "@/lib/driver-metrics";
import { ReportsSkeleton } from "@/components/skeletons";

function toApiDate(d: Date, isEnd = false): string {
  const datePart = d.toISOString().split('T')[0];
  return isEnd ? `${datePart}T23:59:59Z` : `${datePart}T00:00:00Z`;
}

function getPeriodRanges() {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  
  const priorEnd = new Date(start.getTime() - 1);
  const priorStart = new Date(priorEnd.getTime() - (end.getTime() - start.getTime()));
  
  return { start, end, priorStart, priorEnd };
}

export default function ReportsPage() {
  const t = useI18n("reports");
  const ts = useI18n("shipments");
  const tr = useI18n("revenue");
  const { locale } = useLocale();
  const { companyId, isLoading: companyLoading } = useCompanyId();
  const api = useApi();
  const { getValidAccessToken } = useAuth();
  const [exporting, setExporting] = useState<"pdf" | "excel" | null>(null);
  
  const { start, end, priorStart, priorEnd } = useMemo(() => getPeriodRanges(), []);

  const { data: drivers, isLoading: driversLoading } = useDrivers(companyId);
  const { data: currentShipments, isLoading: currentLoading } = useShipments({
    page: 1,
    created_at_start: toApiDate(start),
    created_at_end: toApiDate(end, true),
    page_size: 100,
  });
  const { data: priorShipments, isLoading: priorLoading } = useShipments({
    page: 1,
    created_at_start: toApiDate(priorStart),
    created_at_end: toApiDate(priorEnd, true),
    page_size: 100,
  });

  const isLoading = companyLoading || driversLoading || currentLoading || priorLoading;

  const stats = useMemo(() => {
    if (!drivers || !currentShipments?.shipments || !priorShipments?.shipments) return null;

    const rev = computeRevenueMetrics(drivers, currentShipments.shipments, priorShipments.shipments, start, end);
    const fleet = computeFleetMetrics(drivers, currentShipments.shipments);
    
    // For general success rate and delivery time, we can use computeDriverMetrics on all shipments
    const overall = computeDriverMetrics(currentShipments.shipments, start, end);

    const performanceStats = [
      { 
        label: "successRate", 
        value: `${(overall.successRate * 100).toFixed(1)}%`, 
        icon: CheckCircle2, 
        sub: t("stats.deliveriesChange", { pct: `${rev.deliveriesChangePct >= 0 ? "+" : ""}${(rev.deliveriesChangePct * 100).toFixed(1)}` })
      },
      { 
        label: "avgDeliveryTime", 
        value: formatDuration(overall.avgPickupToDeliveryMs), 
        icon: Clock, 
        sub: t("stats.pickupToDelivery") 
      },
      { 
        label: "totalRevenue", 
        value: formatEtb(rev.totalRevenue), 
        icon: Zap, 
        sub: t("stats.revenueChange", { pct: `${rev.revenueChangePct >= 0 ? "+" : ""}${(rev.revenueChangePct * 100).toFixed(1)}` })
      },
      { 
        label: "fleetUtilization", 
        value: `${(fleet.utilizationRate * 100).toFixed(0)}%`, 
        icon: Users2, 
        sub: t("stats.driversIdle", { count: fleet.idle.toString() })
      },
    ];

    // Leaderboard: top 5 drivers by delivered trips in this period
    const leaderboard = fleet.workload
      .slice(0, 5)
      .map((w, idx) => {
        const d = w.driver;
        const colors = [
          "from-amber-400 to-orange-500",
          "from-slate-300 to-slate-400",
          "from-orange-700 to-orange-800",
          "from-blue-400 to-indigo-500",
          "from-emerald-400 to-teal-500",
        ];
        
        // Calculate success rate for this driver
        const totalAttempts = w.delivered + w.failed;
        const success = totalAttempts > 0 ? (w.delivered / totalAttempts) * 100 : 0;

        return {
          id: d.id,
          name: `${d.first_name} ${d.last_name}`,
          trips: w.delivered,
          success: Number(success.toFixed(1)),
          rating: d.rating_aggregate > 0 ? Number((d.rating_aggregate / 2).toFixed(1)) : 0,
          avatar: `${d.first_name[0]}${d.last_name[0]}`,
          color: colors[idx % colors.length],
        };
      });

    const statusData = [
      { name: ts("status.delivered"), value: overall.delivered, color: 'hsl(var(--status-delivered))' },
      { name: ts("status.in_transit"), value: overall.inProgress, color: 'hsl(var(--status-in-transit))' },
      { name: ts("status.failed"), value: overall.failed, color: 'hsl(var(--status-failed))' },
      { name: ts("status.returned"), value: overall.returned, color: 'hsl(var(--status-pending))' },
    ].filter(d => d.value > 0);

    return {
      performanceStats,
      leaderboard,
      revenueTrend: rev.dailyRevenue.map(d => d.revenue),
      revenueLabels: rev.dailyRevenue.map(d => {
        const dt = new Date(d.date);
        return dt.toLocaleDateString(locale === 'am' ? 'am-ET' : 'en-US', { month: 'short', day: 'numeric' });
      }),
      statusData,
      totalShipments: overall.total,
    };
  }, [drivers, currentShipments, priorShipments, start, end, ts, formatDuration]);

  const handleExport = async (format: "pdf" | "excel") => {
    if (!stats) return;
    setExporting(format);
    try {
      // Paginate all shipments — no artificial cap
      const allShipments: Shipment[] = [];
      let page = 1;
      while (true) {
        const qs = new URLSearchParams({
          created_at_start: toApiDate(start),
          created_at_end: toApiDate(end, true),
          page: String(page),
          page_size: "100",
        }).toString();
        const res = await api.get<ShipmentListResponse>(`shipments?${qs}`);
        allShipments.push(...(res.shipments ?? []));
        if (allShipments.length >= res.total || (res.shipments ?? []).length < 100) break;
        page++;
      }
      const profileRaw = await api.get<{ company_name?: string; company_logo_id?: string; website_url?: string }>("couriers/profile").catch(() => ({}));
      const companyName = (profileRaw as any)?.company_name ?? undefined;
      const companyWebsite = (profileRaw as any)?.website_url ?? undefined;
      const logoId = (profileRaw as any)?.company_logo_id ?? null;
      const companyLogo = logoId ? await fetchLogoAsDataUrl(logoId, getValidAccessToken).catch(() => null) ?? undefined : undefined;
      const fleet = computeFleetMetrics(drivers ?? [], allShipments);
      const ctx = {
        fleet,
        rangeStart: start,
        rangeEnd: end,
        companyName,
        companyWebsite,
        companyLogo,
        shipments: allShipments,
        drivers: drivers ?? [],
      };
      if (format === "pdf") await exportOperationsReportPdf(ctx);
      else await exportOperationsReportExcel(ctx);
    } finally {
      setExporting(null);
    }
  };

  if (isLoading) return <ReportsSkeleton />;

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">{t("failedLoad")}</h3>
        <p className="text-muted-foreground">{t("failedLoadDesc")}</p>
      </div>
    );
  }

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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={exporting !== null}
              className="flex items-center gap-2 bg-foreground text-background font-black px-6 py-3 rounded-2xl shadow-xl hover:shadow-primary/20 transition-all uppercase text-xs tracking-widest disabled:opacity-60"
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {t("export")}
            </motion.button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => handleExport("pdf")} className="gap-2">
              <FileText className="h-4 w-4 text-red-400" />
              <span className="text-sm">{t("pdfReport")}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("excel")} className="gap-2">
              <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
              <span className="text-sm">{t("excelReport")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        {stats.performanceStats.map((stat, idx) => {
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
                       <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                         {stat.label === 'totalRevenue' ? tr('stats.totalRevenue') : t(`stats.${stat.label}`)}
                       </p>
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
          <RevenueChart 
            data={stats.revenueTrend} 
            labels={stats.revenueLabels}
            className="!rounded-[3rem] p-8 shadow-2xl border-white/5 h-[400px]" 
          />
        </motion.div>

        <motion.div
           initial={{ opacity: 0, scale: 0.98 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ delay: 0.5 }}
        >
          <div className="mb-4 px-2">
            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground opacity-60">{t("charts.statusBreakdown")}</h3>
          </div>
          <StatusBreakdownChart data={stats.statusData} total={stats.totalShipments} />
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
              {stats.leaderboard.length === 0 ? (
                <GlassCard className="p-12 text-center !rounded-[2rem]">
                  <p className="text-muted-foreground">No driver activity found for this period.</p>
                </GlassCard>
              ) : (
                stats.leaderboard.map((driver, idx) => (
                  <motion.div
                    key={driver.id}
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
                ))
              )}
            </div>
          </div>

      </div>
    </div>
  );
}
