import { cn } from "@/lib/utils";
import { useI18n } from "@/intl";

export type ShipmentStatus = 
  | "pending" 
  | "assigned" 
  | "picked_up" 
  | "in_transit" 
  | "out_for_delivery" 
  | "delivered" 
  | "failed" 
  | "returned" 
  | "cancelled";

interface StatusBadgeProps {
  status: ShipmentStatus;
  className?: string;
}

const statusConfig: Record<ShipmentStatus, { className: string }> = {
  pending: {
    className: "bg-status-pending/10 text-warning-foreground border-status-pending/30",
  },
  assigned: {
    className: "bg-status-assigned/10 text-info border-status-assigned/30",
  },
  picked_up: {
    className: "bg-status-in-transit/10 text-status-in-transit border-status-in-transit/30",
  },
  in_transit: {
    className: "bg-status-in-transit/10 text-status-in-transit border-status-in-transit/30",
  },
  out_for_delivery: {
    className: "bg-info/10 text-info border-info/30",
  },
  delivered: {
    className: "bg-success/10 text-success border-success/30",
  },
  failed: {
    className: "bg-destructive/10 text-destructive border-destructive/30",
  },
  returned: {
    className: "bg-muted text-muted-foreground border-muted-foreground/30",
  },
  cancelled: {
    className: "bg-muted text-muted-foreground border-muted-foreground/30",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const t = useI18n("shipments");
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border",
        config.className,
        className
      )}
    >
      <span className={cn(
        "w-1.5 h-1.5 rounded-full mr-1.5",
        status === "pending" && "bg-warning",
        status === "assigned" && "bg-info",
        status === "picked_up" && "bg-status-in-transit",
        status === "in_transit" && "bg-status-in-transit",
        status === "out_for_delivery" && "bg-info",
        status === "delivered" && "bg-success",
        status === "failed" && "bg-destructive",
        (status === "returned" || status === "cancelled") && "bg-muted-foreground"
      )} />
      {t(`status.${status}` as any)}
    </span>
  );
}
