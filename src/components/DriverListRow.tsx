"use client";

import { useI18n } from "@/intl";
import { cn } from "@/lib/utils";
import { MoreHorizontal, Star, Phone, CheckCircle2, AlertCircle, Clock, Bike, Car } from "lucide-react";
import { motion } from "framer-motion";
import { GlassCard } from "./GlassCard";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface DriverItem {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  vehicleIcon: "bike" | "car";
  deliveries: number;
  status: string;
  rating: string;
}

interface DriverListRowProps {
  driver: DriverItem;
}

export function DriverListRow({ driver }: DriverListRowProps) {
  const t = useI18n("drivers");

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
      case "ንቁ":
        return { 
          icon: CheckCircle2, 
          class: "bg-green-500/20 text-green-500 border-green-500/30",
          label: t("status.active")
        };
      case "on break":
      case "በእረፍት ላይ":
        return { 
          icon: Clock, 
          class: "bg-amber-500/20 text-amber-500 border-amber-500/30",
          label: t("status.onBreak")
        };
      case "busy":
      case "ሥራ ላይ":
        return { 
          icon: AlertCircle, 
          class: "bg-blue-500/20 text-blue-500 border-blue-500/30",
          label: t("status.busy")
        };
      case "inactive":
      case "ያልነቁ":
      default:
        return { 
          icon: AlertCircle, 
          class: "bg-muted-foreground/20 text-muted-foreground border-muted-foreground/30",
          label: t("status.inactive")
        };
    }
  };

  const statusConfig = getStatusConfig(driver.status);
  const StatusIcon = statusConfig.icon;
  const VehicleIcon = driver.vehicleIcon === "bike" ? Bike : Car;

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
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 items-center relative z-10 font-sans">
          {/* Driver Info */}
          <div className="md:col-span-1">
            <p className="md:hidden text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 opacity-60">
              {t("table.driver")}
            </p>
            <p className="text-sm font-black text-foreground tracking-tight group-hover:text-primary transition-colors">
              {driver.name}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <Phone className="h-2.5 w-2.5 text-muted-foreground" />
              <p className="text-[10px] text-muted-foreground opacity-60 font-medium">
                {driver.phone}
              </p>
            </div>
          </div>

          {/* Vehicle */}
          <div className="md:col-span-1">
            <p className="md:hidden text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 opacity-60">
              {t("table.vehicle")}
            </p>
            <div className="flex items-center gap-2">
              <VehicleIcon className="h-4 w-4 text-primary/70" />
              <p className="text-sm font-bold text-foreground">{driver.vehicle}</p>
            </div>
          </div>

          {/* Deliveries */}
          <div className="md:col-span-1">
            <p className="md:hidden text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 opacity-60">
              {t("table.deliveries")}
            </p>
            <p className="text-sm font-black text-foreground font-mono tracking-tighter">
              {driver.deliveries}
            </p>
          </div>

          {/* Status */}
          <div className="md:col-span-1">
            <p className="md:hidden text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 opacity-60">
              {t("table.status")}
            </p>
            <div className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase border shadow-sm",
              statusConfig.class
            )}>
              <StatusIcon className="h-3 w-3" />
              {statusConfig.label}
            </div>
          </div>

          {/* Rating */}
          <div className="md:col-span-1">
            <p className="md:hidden text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 opacity-60">
              {t("table.rating")}
            </p>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
              <p className="text-sm font-black text-foreground">
                {driver.rating}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="md:col-span-1 flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-10 w-10 p-0 rounded-full hover:bg-primary/10 hover:text-primary transition-all">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-card/90 backdrop-blur-xl border-border/40 p-1 rounded-2xl shadow-2xl">
                <DropdownMenuItem className="rounded-xl px-4 py-2 text-sm font-semibold hover:bg-primary/20 hover:text-primary transition-all cursor-pointer">
                  View Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-xl px-4 py-2 text-sm font-semibold hover:bg-primary/20 hover:text-primary transition-all cursor-pointer">
                  Assign Task
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-xl px-4 py-2 text-sm font-semibold hover:bg-primary/20 hover:text-primary transition-all cursor-pointer text-red-500 hover:text-red-600">
                  Deactivate
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
