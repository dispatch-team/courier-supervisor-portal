"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Package,
  MapPin,
  Phone,
  User,
  Truck,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Scale,
  Ruler,
  CreditCard,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useShipment } from "@/hooks/queries/use-shipments";
import { ShipmentMapLoader } from "@/components/ShipmentMapLoader";
import type { ShipmentStatus } from "@/types/api";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatStatus(status: ShipmentStatus): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function getStatusConfig(status: ShipmentStatus) {
  switch (status) {
    case "pending":
      return { icon: Clock, class: "bg-amber-500/20 text-amber-500 border-amber-500/30" };
    case "assigned_to_courier":
    case "assigned_to_driver":
      return { icon: Truck, class: "bg-blue-500/20 text-blue-500 border-blue-500/30" };
    case "picked_up":
    case "in_transit":
      return { icon: Truck, class: "bg-indigo-500/20 text-indigo-500 border-indigo-500/30" };
    case "delivered":
      return { icon: CheckCircle2, class: "bg-green-500/20 text-green-500 border-green-500/30" };
    case "failed":
      return { icon: AlertCircle, class: "bg-red-500/20 text-red-500 border-red-500/30" };
    case "returned":
      return { icon: RotateCcw, class: "bg-orange-500/20 text-orange-500 border-orange-500/30" };
    case "cancelled":
      return { icon: XCircle, class: "bg-muted-foreground/20 text-muted-foreground border-muted-foreground/30" };
  }
}

interface TimelineEvent {
  label: string;
  timestamp: string | null;
  icon: typeof Clock;
}

function buildTimeline(shipment: {
  created_at: string;
  assigned_to_courier_at: string | null;
  assigned_to_driver_at: string | null;
  picked_up_at: string | null;
  in_transit_at: string | null;
  delivered_at: string | null;
  failed_at: string | null;
  returned_at: string | null;
  cancelled_at: string | null;
}): TimelineEvent[] {
  const events: TimelineEvent[] = [
    { label: "Created", timestamp: shipment.created_at, icon: Package },
    { label: "Assigned to Courier", timestamp: shipment.assigned_to_courier_at, icon: Truck },
    { label: "Assigned to Driver", timestamp: shipment.assigned_to_driver_at, icon: User },
    { label: "Picked Up", timestamp: shipment.picked_up_at, icon: Package },
    { label: "In Transit", timestamp: shipment.in_transit_at, icon: Truck },
    { label: "Delivered", timestamp: shipment.delivered_at, icon: CheckCircle2 },
    { label: "Failed", timestamp: shipment.failed_at, icon: AlertCircle },
    { label: "Returned", timestamp: shipment.returned_at, icon: RotateCcw },
    { label: "Cancelled", timestamp: shipment.cancelled_at, icon: XCircle },
  ];
  return events.filter((e) => e.timestamp !== null);
}

export default function ShipmentDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const router = useRouter();
  const { data: shipment, isLoading, error } = useShipment(code);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    const is404 = error.message?.toLowerCase().includes("not found");
    const is403 = error.message?.toLowerCase().includes("access") || error.message?.toLowerCase().includes("denied");
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          {is404 ? "Shipment not found" : is403 ? "Access denied" : "Failed to load shipment"}
        </h3>
        <p className="text-muted-foreground mb-4">{error.message}</p>
        <Button onClick={() => router.push("/supervisor/shipments")}>
          Back to Shipments
        </Button>
      </div>
    );
  }

  if (!shipment) return null;

  const statusConfig = getStatusConfig(shipment.status);
  const StatusIcon = statusConfig.icon;
  const timeline = buildTimeline(shipment);

  return (
    <div className="space-y-6 min-h-screen max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/supervisor/shipments")}
          className="h-8 w-8 rounded-lg"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{shipment.code}</h1>
          <p className="text-sm text-muted-foreground">{shipment.description}</p>
        </div>
        <div
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase border shadow-sm",
            statusConfig.class,
          )}
        >
          <StatusIcon className="h-4 w-4" />
          {formatStatus(shipment.status)}
        </div>
      </div>

      {/* Basic Information */}
      <Card className="border-border/40 bg-card/60 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Tracking Number</p>
              <p className="font-mono font-bold">{shipment.code}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Merchant</p>
              <p className="font-medium">
                {shipment.merchant?.company_name ?? `Merchant #${shipment.merchant_id}`}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="font-medium">{formatDate(shipment.created_at)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Timeline */}
      <Card className="border-border/40 bg-card/60 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Status History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {timeline.map((event, i) => {
              const Icon = event.icon;
              const isLast = i === timeline.length - 1;
              return (
                <div key={event.label} className="flex gap-4 pb-6 last:pb-0">
                  <div className="flex flex-col items-center">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    {!isLast && (
                      <div className="w-px flex-1 bg-border/40 mt-1" />
                    )}
                  </div>
                  <div className="pt-1">
                    <p className="font-semibold text-sm">{event.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(event.timestamp)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Assigned Driver */}
      <Card className="border-border/40 bg-card/60 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Assigned Driver
          </CardTitle>
        </CardHeader>
        <CardContent>
          {shipment.assigned_driver ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">
                  {shipment.assigned_driver.first_name} {shipment.assigned_driver.last_name}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Phone</p>
                <div className="flex items-center gap-1.5">
                  <Phone className="h-3 w-3 text-muted-foreground" />
                  <p className="font-medium">{shipment.assigned_driver.phone_number}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{shipment.assigned_driver.email}</p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No driver assigned</p>
          )}
        </CardContent>
      </Card>

      {/* Addresses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pickup */}
        <Card className="border-border/40 bg-card/60 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-500" />
              Pickup Address
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="font-medium">{shipment.start_address}</p>
            <div className="space-y-1 text-sm">
              <p className="text-muted-foreground">
                Contact: <span className="text-foreground">{shipment.start_address_contact_name}</span>
              </p>
              {shipment.start_address_phone_number && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  <span className="text-foreground">{shipment.start_address_phone_number}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Delivery */}
        <Card className="border-border/40 bg-card/60 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-red-500" />
              Delivery Address
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="font-medium">{shipment.end_address}</p>
            <div className="space-y-1 text-sm">
              <p className="text-muted-foreground">
                Contact: <span className="text-foreground">{shipment.end_address_contact_name}</span>
              </p>
              {shipment.end_address_phone_number && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  <span className="text-foreground">{shipment.end_address_phone_number}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Map */}
      <ShipmentMapLoader
        pickupAddress={shipment.start_address}
        deliveryAddress={shipment.end_address}
        pickupLabel={shipment.start_address_contact_name}
        deliveryLabel={shipment.end_address_contact_name}
      />

      {/* Package Details & Fee */}
      <Card className="border-border/40 bg-card/60 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Package Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Scale className="h-3 w-3" /> Weight
              </p>
              <p className="font-medium">{shipment.weight_kg} kg</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Ruler className="h-3 w-3" /> Dimensions
              </p>
              <p className="font-medium">{shipment.dimensions || "—"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <CreditCard className="h-3 w-3" /> Delivery Fee
              </p>
              <p className="font-bold text-primary">ETB {shipment.total_fee.toFixed(2)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Items</p>
              <p className="font-medium">{shipment.items?.length ?? 0} item(s)</p>
            </div>
          </div>
          {shipment.items && shipment.items.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border/40">
              <p className="text-sm text-muted-foreground mb-2">Item List</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                {shipment.items.map((item, i) => (
                  <li key={i} className="text-foreground">{item}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes / Remarks */}
      {shipment.remark && (
        <Card className="border-border/40 bg-card/60 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{shipment.remark}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
