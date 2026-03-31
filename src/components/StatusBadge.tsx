import { cn } from "@/lib/utils";

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

const statusConfig: Record<ShipmentStatus, { label: string; className: string }> = {
  pending: {
    label: "Pending",
    className: "bg-status-pending/10 text-warning-foreground border-status-pending/30",
  },
  assigned: {
    label: "Assigned",
    className: "bg-status-assigned/10 text-info border-status-assigned/30",
  },
  picked_up: {
    label: "Picked Up",
    className: "bg-status-in-transit/10 text-status-in-transit border-status-in-transit/30",
  },
  in_transit: {
    label: "In Transit",
    className: "bg-status-in-transit/10 text-status-in-transit border-status-in-transit/30",
  },
  out_for_delivery: {
    label: "Out for Delivery",
    className: "bg-info/10 text-info border-info/30",
  },
  delivered: {
    label: "Delivered",
    className: "bg-success/10 text-success border-success/30",
  },
  failed: {
    label: "Failed",
    className: "bg-destructive/10 text-destructive border-destructive/30",
  },
  returned: {
    label: "Returned",
    className: "bg-muted text-muted-foreground border-muted-foreground/30",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-muted text-muted-foreground border-muted-foreground/30",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
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
      {config.label}
    </span>
  );
}
