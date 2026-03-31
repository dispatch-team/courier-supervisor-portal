import { StatusBadge, ShipmentStatus } from "./StatusBadge";
import { MapPin, Phone, Clock, Package, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShipmentCardProps {
  id: string;
  trackingNumber: string;
  status: ShipmentStatus;
  pickupAddress: string;
  deliveryAddress: string;
  recipientName: string;
  recipientPhone: string;
  estimatedTime?: string;
  codAmount?: number;
  onClick?: () => void;
  variant?: "default" | "compact" | "mobile";
}

export function ShipmentCard({
  id,
  trackingNumber,
  status,
  pickupAddress,
  deliveryAddress,
  recipientName,
  recipientPhone,
  estimatedTime,
  codAmount,
  onClick,
  variant = "default",
}: ShipmentCardProps) {
  if (variant === "mobile") {
    return (
      <div
        onClick={onClick}
        className="mobile-card cursor-pointer active:scale-[0.98] transition-transform"
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="font-mono text-sm text-muted-foreground">{trackingNumber}</p>
            <p className="font-semibold text-foreground mt-0.5">{recipientName}</p>
          </div>
          <StatusBadge status={status} />
        </div>

        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <div className="w-2 h-2 rounded-full bg-success" />
            </div>
            <p className="text-sm text-foreground line-clamp-1">{pickupAddress}</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <MapPin className="w-3 h-3 text-accent" />
            </div>
            <p className="text-sm text-foreground line-clamp-1">{deliveryAddress}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {estimatedTime && (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {estimatedTime}
              </span>
            )}
            {codAmount && codAmount > 0 && (
              <span className="font-medium text-foreground">
                ETB {codAmount.toLocaleString()}
              </span>
            )}
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-card rounded-xl border border-border p-4 hover:shadow-md transition-all duration-200 cursor-pointer",
        variant === "compact" && "p-3"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-mono text-xs text-muted-foreground">{trackingNumber}</p>
          <p className="font-semibold text-foreground">{recipientName}</p>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-start gap-2">
          <Package className="w-4 h-4 text-muted-foreground mt-0.5" />
          <span className="text-muted-foreground line-clamp-1">{pickupAddress}</span>
        </div>
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-accent mt-0.5" />
          <span className="text-foreground line-clamp-1">{deliveryAddress}</span>
        </div>
      </div>

      {(estimatedTime || codAmount) && (
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border text-sm">
          {estimatedTime && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-4 h-4" />
              {estimatedTime}
            </span>
          )}
          {codAmount && codAmount > 0 && (
            <span className="font-medium text-accent">
              COD: ETB {codAmount.toLocaleString()}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
