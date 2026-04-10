"use client";

import { useI18n } from "@/intl";
import { motion } from "framer-motion";
import { GlassCard } from "./GlassCard";
import { User, Calendar, Banknote, PackageOpen } from "lucide-react";

interface CollectionItem {
  driverName: string;
  deliveries: number;
  feesCollected: string;
  date: string;
}

interface DriverCollectionRowProps {
  collection: CollectionItem;
}

export function DriverCollectionRow({ collection }: DriverCollectionRowProps) {
  const t = useI18n("revenue");

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.005 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
    >
      <GlassCard 
        className="p-4 md:p-6 mb-4 !rounded-3xl hover:bg-card/40 hover:border-primary/30 transition-all shadow-md active:scale-95"
        gradient={false}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center relative z-10 font-sans">
          {/* Driver */}
          <div className="md:col-span-1">
            <p className="md:hidden text-[10px] font-bold text-muted-foreground uppercase opacity-60 mb-1">
              {t("collections.table.driver")}
            </p>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <User className="h-4 w-4" />
              </div>
              <p className="text-sm font-black text-foreground group-hover:text-primary transition-colors">
                {collection.driverName}
              </p>
            </div>
          </div>

          {/* Deliveries */}
          <div className="md:col-span-1">
            <p className="md:hidden text-[10px] font-bold text-muted-foreground uppercase opacity-60 mb-1">
              {t("collections.table.deliveries")}
            </p>
            <div className="flex items-center gap-2">
              <PackageOpen className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-bold text-foreground font-mono">
                {collection.deliveries}
              </p>
            </div>
          </div>

          {/* Fees Collected */}
          <div className="md:col-span-1">
            <p className="md:hidden text-[10px] font-bold text-muted-foreground uppercase opacity-60 mb-1">
              {t("collections.table.feesCollected")}
            </p>
            <div className="flex items-center gap-2">
              <Banknote className="h-4 w-4 text-primary" />
              <p className="text-sm font-black text-foreground">
                {collection.feesCollected}
              </p>
            </div>
          </div>

          {/* Date */}
          <div className="md:col-span-1 flex md:justify-end">
            <div className="text-left md:text-right">
              <p className="md:hidden text-[10px] font-bold text-muted-foreground uppercase opacity-60 mb-1">
                {t("collections.table.date")}
              </p>
              <div className="flex items-center md:justify-end gap-2">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-xs font-bold text-muted-foreground font-mono">
                  {collection.date}
                </p>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
