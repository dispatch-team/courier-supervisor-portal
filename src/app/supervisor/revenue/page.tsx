"use client";

import { useI18n } from "@/intl";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/GlassCard";
import { RevenueChart } from "@/components/RevenueChart";
import { DriverCollectionRow } from "@/components/DriverCollectionRow";
import { Wallet, Landmark, TrendingUp, HandCoins, ReceiptText } from "lucide-react";

const mockStats = [
  {
    label: "deliveryFees",
    value: "ETB 142,500",
    detail: "successRate",
    detailValue: "98.2",
    icon: Wallet,
    color: "primary",
  },
  {
    label: "codCollected",
    value: "ETB 45,800",
    detail: "last7Days",
    detailValue: "",
    icon: HandCoins,
    color: "accent",
  },
  {
    label: "avgPerDelivery",
    value: "ETB 215",
    detail: "totalShipments",
    detailValue: "",
    icon: TrendingUp,
    color: "info",
  },
];

const mockCollections = [
  { driverName: "Abebe Kebede", deliveries: 12, feesCollected: "ETB 2,450", date: "2026-04-10" },
  { driverName: "Sara Mohammed", deliveries: 8, feesCollected: "ETB 1,840", date: "2026-04-10" },
  { driverName: "Dawit Girma", deliveries: 15, feesCollected: "ETB 3,120", date: "2026-04-09" },
  { driverName: "Hagos Teklay", deliveries: 10, feesCollected: "ETB 2,100", date: "2026-04-09" },
];

const revenueTrendData = [45000, 52000, 48000, 61000, 55000, 68000, 72000];

export default function RevenuePage() {
  const t = useI18n("revenue");

  return (
    <div className="space-y-12 min-h-screen relative pb-20">
      {/* Background Decorative Blur */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[10%] -right-20 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] -left-20 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px]" />
      </div>

      {/* Page Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10"
      >
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-primary to-foreground mb-2">
          {t("title")}
        </h1>
        <p className="text-muted-foreground font-medium text-lg leading-relaxed max-w-2xl italic">
          {t("subtitle")}
        </p>
      </motion.div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        {mockStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
            >
              <GlassCard className="p-8 group hover:border-primary/40 transition-all !rounded-[2.5rem] shadow-xl overflow-hidden">
                <div className={stat.color === 'primary' ? 'absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/20 transition-all' : 
                                stat.color === 'accent' ? 'absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-accent/20 transition-all' :
                                'absolute top-0 right-0 w-32 h-32 bg-info/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-info/20 transition-all'} />
                
                <div className="relative z-10 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                      {t(`stats.${stat.label}`)}
                    </p>
                    <Icon className={`h-6 w-6 text-${stat.color === 'primary' ? 'primary' : stat.color === 'accent' ? 'accent-foreground' : 'info'} opacity-40 group-hover:opacity-100 transition-all`} />
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-3xl font-black text-foreground tracking-tighter">
                      {stat.value}
                    </p>
                    <p className="text-[11px] font-bold text-primary/70 tracking-tight flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {t(`stats.${stat.detail}`, { rate: stat.detailValue })}
                    </p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {/* Revenue Trend Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="relative z-10"
      >
        <RevenueChart data={revenueTrendData} className="!rounded-[3rem] p-8 shadow-2xl border-primary/10" />
      </motion.div>

      {/* Driver Collections Section */}
      <div className="space-y-6 relative z-10">
        <div className="flex items-center gap-3 px-2">
          <Landmark className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-black text-foreground tracking-tight">
            {t("collections.title")}
          </h2>
        </div>

        {/* Table Header */}
        <div className="hidden md:grid grid-cols-4 gap-4 md:px-6 mb-2 items-center opacity-40 uppercase tracking-[0.2em] font-black text-[10px] text-muted-foreground pointer-events-none">
          <div>{t("collections.table.driver")}</div>
          <div>{t("collections.table.deliveries")}</div>
          <div>{t("collections.table.feesCollected")}</div>
          <div className="text-right">{t("collections.table.date")}</div>
        </div>

        {/* Collections List */}
        <div className="space-y-4">
          {mockCollections.map((collection, idx) => (
            <DriverCollectionRow key={idx} collection={collection} />
          ))}
        </div>
      </div>
    </div>
  );
}
