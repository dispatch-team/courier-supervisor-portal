"use client";

import { useI18n } from "@/intl";
import { cn } from "@/lib/utils";
import { MoreHorizontal, MapPin, Truck, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { GlassCard } from "./GlassCard";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface ShipmentItem {
  id: string;
  merchant: string;
  merchantEmail: string;
  route: string;
  driver: string;
  driverStatus: string;
  status: string;
  fee: string;
  priority: "high" | "normal";
}

interface ShipmentListRowProps {
  shipment: ShipmentItem;
}

export function ShipmentListRow({ shipment }: ShipmentListRowProps) {
  const t = useI18n("shipments");

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "urgent":
      case "high":
        return { 
          icon: AlertCircle, 
          class: "bg-red-500/20 text-red-500 border-red-500/30",
          label: t("status.urgent")
        };
      case "pending":
        return { 
          icon: Clock, 
          class: "bg-amber-500/20 text-amber-500 border-amber-500/30",
          label: t("status.pending")
        };
      case "in transit":
      case "assigned":
        return { 
          icon: Truck, 
          class: "bg-blue-500/20 text-blue-500 border-blue-500/30",
          label: t("status.inTransit")
        };
      case "delivered":
      case "success":
        return { 
          icon: CheckCircle2, 
          class: "bg-green-500/20 text-green-500 border-green-500/30",
          label: t("status.delivered")
        };
      default:
        return { 
          icon: Package2, 
          class: "bg-muted-foreground/20 text-muted-foreground border-muted-foreground/30",
          label: status
        };
    }
  };

  const statusConfig = getStatusConfig(shipment.status);
  const StatusIcon = statusConfig.icon;

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
        <div className="grid grid-cols-2 md:grid-cols-7 gap-4 items-center relative z-10 font-sans">
          {/* ID & Priority */}
          <div className="md:col-span-1">
            <p className="md:hidden text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 opacity-60">
              {t("table.id")}
            </p>
            <p className="text-sm font-black text-foreground tracking-tight group-hover:text-primary transition-colors">
              {shipment.id}
            </p>
          </div>

          {/* Merchant */}
          <div className="md:col-span-1">
            <p className="md:hidden text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 opacity-60">
              {t("table.merchant")}
            </p>
            <p className="text-sm font-bold text-foreground truncate">{shipment.merchant}</p>
            <p className="text-[10px] text-muted-foreground/60 truncate italic">{shipment.merchantEmail}</p>
          </div>

          {/* Route */}
          <div className="md:col-span-1">
            <p className="md:hidden text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 opacity-60">
              {t("table.route")}
            </p>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3 text-primary/70" />
              <p className="text-sm font-medium text-foreground">{shipment.route}</p>
            </div>
          </div>

          {/* Driver */}
          <div className="md:col-span-1">
            <p className="md:hidden text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 opacity-60">
              {t("table.driver")}
            </p>
            <p className="text-sm font-bold text-foreground leading-tight">{shipment.driver}</p>
            <p className="text-[10px] text-muted-foreground/60 font-medium uppercase tracking-tight">{shipment.driverStatus}</p>
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

          {/* Fee */}
          <div className="md:col-span-1">
            <p className="md:hidden text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 opacity-60">
              {t("table.fee")}
            </p>
            <p className="text-sm font-black text-primary font-mono tracking-tighter">
              {shipment.fee}
            </p>
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
                  Assign Driver
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-xl px-4 py-2 text-sm font-semibold hover:bg-primary/20 hover:text-primary transition-all cursor-pointer">
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-xl px-4 py-2 text-sm font-semibold hover:bg-primary/20 hover:text-primary transition-all cursor-pointer text-red-500 hover:text-red-600">
                  Issue Alert
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

// Fallback for missing icon in some UI libs
function Package2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
      <path d="m3 9 2.45-4.91A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.09L21 9" />
      <path d="M12 3v6" />
    </svg>
  );
}
