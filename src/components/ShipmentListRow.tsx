"use client";

import { useI18n } from "@/intl";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Truck, CheckCircle2, AlertCircle, Clock, XCircle, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import { GlassCard } from "./GlassCard";
import { AssignDriverDialog } from "./AssignDriverDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { Shipment, ShipmentStatus } from "@/types/api";

interface ShipmentListRowProps {
  shipment: Shipment;
}

function formatStatus(status: ShipmentStatus): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getStatusConfig(status: ShipmentStatus) {
  switch (status) {
    case "pending":
      return {
        icon: Clock,
        class: "bg-amber-500/20 text-amber-500 border-amber-500/30",
      };
    case "assigned_to_courier":
    case "assigned_to_driver":
      return {
        icon: Truck,
        class: "bg-blue-500/20 text-blue-500 border-blue-500/30",
      };
    case "picked_up":
    case "in_transit":
      return {
        icon: Truck,
        class: "bg-indigo-500/20 text-indigo-500 border-indigo-500/30",
      };
    case "delivered":
      return {
        icon: CheckCircle2,
        class: "bg-green-500/20 text-green-500 border-green-500/30",
      };
    case "failed":
      return {
        icon: AlertCircle,
        class: "bg-red-500/20 text-red-500 border-red-500/30",
      };
    case "returned":
      return {
        icon: RotateCcw,
        class: "bg-orange-500/20 text-orange-500 border-orange-500/30",
      };
    case "cancelled":
      return {
        icon: XCircle,
        class: "bg-muted-foreground/20 text-muted-foreground border-muted-foreground/30",
      };
  }
}

export function ShipmentListRow({ shipment }: ShipmentListRowProps) {
  const t = useI18n("shipments");
  const router = useRouter();
  const [assignOpen, setAssignOpen] = useState(false);
  const statusConfig = getStatusConfig(shipment.status);
  const StatusIcon = statusConfig.icon;

  const handleRowClick = () => {
    router.push(`/supervisor/shipments/${shipment.code}`);
  };

  return (
    <>
    <motion.div
      whileHover={{ y: -2, scale: 1.005 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group cursor-pointer"
      onClick={handleRowClick}
    >
      <GlassCard
        className="p-4 md:p-6 mb-4 !rounded-3xl hover:bg-card/40 hover:border-primary/30 transition-all shadow-md active:scale-95"
        gradient={false}
      >
        <div className="grid grid-cols-2 md:grid-cols-8 gap-4 items-center relative z-10 font-sans">
          {/* Tracking Number */}
          <div className="md:col-span-1">
            <p className="md:hidden text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 opacity-60">
              {t("table.id")}
            </p>
            <p className="text-sm font-black text-foreground tracking-tight group-hover:text-primary transition-colors">
              {shipment.code}
            </p>
            <p className="text-[10px] text-muted-foreground/60 italic truncate">
              {shipment.description}
            </p>
          </div>

          {/* Recipient Name */}
          <div className="md:col-span-1">
            <p className="md:hidden text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 opacity-60">
              Recipient
            </p>
            <p className="text-sm font-bold text-foreground truncate">
              {shipment.end_address_contact_name || "—"}
            </p>
            <p className="text-[10px] text-muted-foreground/60 truncate">
              {shipment.end_address_phone_number || ""}
            </p>
          </div>

          {/* Pickup Address */}
          <div className="md:col-span-1">
            <p className="md:hidden text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 opacity-60">
              Pickup
            </p>
            <p className="text-sm font-medium text-foreground truncate">
              {shipment.start_address}
            </p>
            <p className="text-[10px] text-muted-foreground/60 truncate">
              {shipment.start_address_contact_name}
            </p>
          </div>

          {/* Delivery Address */}
          <div className="md:col-span-1">
            <p className="md:hidden text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 opacity-60">
              Delivery
            </p>
            <p className="text-sm font-medium text-foreground truncate">
              {shipment.end_address}
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
              {formatStatus(shipment.status)}
            </div>
          </div>

          {/* Assigned Driver */}
          <div className="md:col-span-1">
            <p className="md:hidden text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 opacity-60">
              {t("table.driver")}
            </p>
            <p className="text-sm font-bold text-foreground leading-tight">
              {shipment.assigned_driver_id ? `Driver #${shipment.assigned_driver_id}` : "Unassigned"}
            </p>
          </div>

          {/* Created Date */}
          <div className="md:col-span-1">
            <p className="md:hidden text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 opacity-60">
              Created
            </p>
            <p className="text-sm font-medium text-foreground">
              {formatDate(shipment.created_at)}
            </p>
          </div>

          {/* Actions */}
          <div className="md:col-span-1 flex justify-end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-10 w-10 p-0 rounded-full hover:bg-primary/10 hover:text-primary transition-all">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-card/90 backdrop-blur-xl border-border/40 p-1 rounded-2xl shadow-2xl">
                <DropdownMenuItem
                  className="rounded-xl px-4 py-2 text-sm font-semibold hover:bg-primary/20 hover:text-primary transition-all cursor-pointer"
                  onClick={() => setAssignOpen(true)}
                >
                  Assign Driver
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="rounded-xl px-4 py-2 text-sm font-semibold hover:bg-primary/20 hover:text-primary transition-all cursor-pointer"
                  onClick={handleRowClick}
                >
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

    <AssignDriverDialog
      shipment={shipment}
      open={assignOpen}
      onOpenChange={setAssignOpen}
    />
    </>
  );
}
