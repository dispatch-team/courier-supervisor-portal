"use client";

import { useMemo } from "react";
import { useI18n } from "@/intl";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCompanyId } from "@/hooks/queries/use-company-id";
import { useDrivers } from "@/hooks/queries/use-drivers";
import { useShipments } from "@/hooks/queries/use-shipments";
import { computeFleetMetrics } from "@/lib/fleet-metrics";
import { formatEtb } from "@/lib/revenue-metrics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useI18n as useI18nShip } from "@/intl"; // I'll use separate t for shipments
import {
  Loader2,
  RefreshCcw,
  Package,
  Clock,
  Truck,
  CheckCircle2,
  Wallet,
  Users,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import type { Shipment } from "@/types/api";

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function isToday(iso: string | null): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  const today = startOfToday();
  return d >= today;
}

const IN_PROGRESS_STATUSES: Shipment["status"][] = [
  "assigned_to_driver",
  "picked_up",
  "in_transit",
];

export default function SupervisorDashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const t = useI18n("supervisorDashboard");
  const tShip = useI18n("shipments");
  const { companyId, isLoading: companyLoading } = useCompanyId();

  // Today's shipments (created/active today)
  const { data: drivers, isLoading: driversLoading } = useDrivers(companyId);
  const { data: shipmentData, isLoading: shipmentsLoading, isFetching, refetch } = useShipments({
    page_size: 100,
  });

  const isLoading = companyLoading || driversLoading || shipmentsLoading;

  const stats = useMemo(() => {
    if (!shipmentData?.shipments || !drivers) return null;
    const all = shipmentData.shipments;

    const pending = all.filter((s) => s.status === "pending").length;
    const unassigned = all.filter((s) => s.status === "assigned_to_courier" && !s.assigned_driver_id).length;
    const inProgress = all.filter((s) => IN_PROGRESS_STATUSES.includes(s.status)).length;
    const deliveredToday = all.filter((s) => s.status === "delivered" && isToday(s.delivered_at)).length;
    const failedToday = all.filter((s) => s.status === "failed" && isToday(s.failed_at)).length;
    const revenueToday = all
      .filter((s) => s.status === "delivered" && isToday(s.delivered_at))
      .reduce((sum, s) => sum + (s.total_fee ?? 0), 0);

    const fleet = computeFleetMetrics(drivers, all);

    return {
      pending,
      unassigned,
      inProgress,
      deliveredToday,
      failedToday,
      revenueToday,
      activeDrivers: fleet.totalActiveDrivers,
      onDelivery: fleet.onDelivery,
      idle: fleet.idle,
      utilizationRate: fleet.utilizationRate,
    };
  }, [shipmentData, drivers]);

  // Action items: unassigned shipments + pending shipments
  const actionItems = useMemo(() => {
    if (!shipmentData?.shipments) return [];
    return shipmentData.shipments
      .filter(
        (s) =>
          s.status === "pending" ||
          (s.status === "assigned_to_courier" && !s.assigned_driver_id),
      )
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  }, [shipmentData]);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["shipments"] });
    queryClient.invalidateQueries({ queryKey: ["drivers"] });
    refetch();
  };

  if (isLoading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("welcomeBack", { name: user?.given_name || user?.preferred_username || "Supervisor" })}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("todaysOperations")}
          </p>
        </div>
        <div className="flex items-center gap-2 self-start">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isFetching}
            className="gap-1.5"
          >
            <RefreshCcw className={cn("h-3.5 w-3.5", isFetching && "animate-spin")} />
            {t("refresh")}
          </Button>
          <Button
            size="sm"
            onClick={() => router.push("/supervisor/shipments")}
            className="gap-1.5"
          >
            <Package className="h-3.5 w-3.5" />
            {t("viewShipments")}
          </Button>
        </div>
      </div>

      {/* Action items banner — only when there are pending/unassigned items */}
      {stats && (stats.pending > 0 || stats.unassigned > 0) && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="h-10 w-10 rounded-full bg-amber-500/15 flex items-center justify-center shrink-0">
              <AlertCircle className="h-5 w-5 text-amber-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">
                {t("attentionNeeded")}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {stats.unassigned > 0 && (
                  <>
                    {t("awaitingAssignment", {
                      count: stats.unassigned.toString(),
                      s: stats.unassigned > 1 ? "s" : ""
                    })}
                  </>
                )}
                {stats.unassigned > 0 && stats.pending > 0 && " • "}
                {stats.pending > 0 && (
                  <>
                    {t("pendingCount", {
                      count: stats.pending.toString(),
                      s: stats.pending > 1 ? "s" : ""
                    })}
                  </>
                )}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push("/supervisor/shipments?status=assigned_to_courier")}
              className="gap-1.5 shrink-0"
            >
              {t("review")}
              <ArrowRight className="h-3 w-3" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={Clock}
          tone="amber"
          label={t("pending")}
          value={stats?.unassigned ?? 0}
          sub={t("awaitingAssignmentSub")}
          onClick={() => router.push("/supervisor/shipments?status=assigned_to_courier")}
        />
        <StatCard
          icon={Truck}
          tone="blue"
          label={t("inProgress")}
          value={stats?.inProgress ?? 0}
          sub={t("onTheRoad")}
          onClick={() => router.push("/supervisor/shipments?status=in_transit")}
        />
        <StatCard
          icon={CheckCircle2}
          tone="green"
          label={t("deliveriesToday")}
          value={stats?.deliveredToday ?? 0}
          sub={
            stats && stats.failedToday > 0
              ? t("failedToday", { count: stats.failedToday.toString() })
              : t("noFailuresToday")
          }
        />
        <StatCard
          icon={Wallet}
          tone="primary"
          label={t("revenueToday")}
          value={formatEtb(stats?.revenueToday ?? 0)}
          sub={t("fromCompletedDeliveries")}
          onClick={() => router.push("/supervisor/revenue")}
        />
      </div>

      {/* Two-column section: action items + driver status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Action items list */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-baseline justify-between">
              <CardTitle className="text-base">{t("actionItems")}</CardTitle>
              <button
                onClick={() => router.push("/supervisor/shipments")}
                className="text-xs text-primary hover:underline"
              >
                {t("viewAllShipments")}
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {actionItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center mb-3">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                </div>
                <p className="text-sm font-medium">{t("allCaughtUp")}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("noPendingUnassigned")}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {actionItems.map((s) => (
                  <button
                    key={s.code}
                    onClick={() => router.push(`/supervisor/shipments/${s.code}`)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-md hover:bg-muted/40 transition-colors text-left group/row"
                  >
                    <div className="h-8 w-8 rounded-md bg-amber-500/10 flex items-center justify-center shrink-0">
                      <Package className="h-4 w-4 text-amber-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate group-hover/row:text-primary transition-colors">
                        {s.code}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {s.description || t("noDescription")}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] capitalize shrink-0",
                        s.status === "pending" &&
                          "border-amber-500/30 bg-amber-500/10 text-amber-500",
                        s.status === "assigned_to_courier" &&
                          "border-blue-500/30 bg-blue-500/10 text-blue-500",
                      )}
                    >
                      {tShip(`status.${s.status}` as any)}
                    </Badge>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Driver availability */}
        <Card>
          <CardHeader>
            <div className="flex items-baseline justify-between">
              <CardTitle className="text-base">{t("fleetStatus")}</CardTitle>
              <button
                onClick={() => router.push("/supervisor/fleet")}
                className="text-xs text-primary hover:underline"
              >
                {t("detailsLink")}
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <FleetRow
              icon={Users}
              tone="primary"
              label={t("activeLabel")}
              value={stats?.activeDrivers ?? 0}
              sub={t("inFleet")}
            />
            <FleetRow
              icon={Truck}
              tone="blue"
              label={t("onDeliveryLabel")}
              value={stats?.onDelivery ?? 0}
              sub={
                stats && stats.activeDrivers > 0
                  ? t("utilizationLabel", { rate: (stats.utilizationRate * 100).toFixed(0) })
                  : "—"
              }
            />
            <FleetRow
              icon={CheckCircle2}
              tone="green"
              label={t("idleAvailableLabel")}
              value={stats?.idle ?? 0}
              sub={t("readyForAssignments")}
            />

            {/* Quick driver shortcut */}
            <div className="pt-2 border-t border-border/50 mt-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-1.5"
                onClick={() => router.push("/supervisor/drivers")}
              >
                <Users className="h-3.5 w-3.5" />
                {t("manageDrivers")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  tone,
  label,
  value,
  sub,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  tone: "amber" | "blue" | "green" | "primary";
  label: string;
  value: number | string;
  sub: string;
  onClick?: () => void;
}) {
  const toneClass = {
    amber: "bg-amber-500/10 text-amber-500",
    blue: "bg-blue-500/10 text-blue-500",
    green: "bg-green-500/10 text-green-500",
    primary: "bg-primary/10 text-primary",
  }[tone];

  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      onClick={onClick}
      className={cn(
        "block w-full text-left",
        onClick && "transition-transform hover:scale-[1.01] active:scale-[0.99]",
      )}
    >
      <Card className="overflow-hidden hover:border-border/80 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <div className={cn("h-7 w-7 rounded-md flex items-center justify-center", toneClass)}>
              <Icon className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="text-2xl font-bold tabular-nums tracking-tight">{value}</p>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{sub}</p>
        </CardContent>
      </Card>
    </Wrapper>
  );
}

function FleetRow({
  icon: Icon,
  tone,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  tone: "primary" | "blue" | "green";
  label: string;
  value: number;
  sub: string;
}) {
  const toneClass = {
    primary: "bg-primary/10 text-primary",
    blue: "bg-blue-500/10 text-blue-500",
    green: "bg-green-500/10 text-green-500",
  }[tone];

  return (
    <div className="flex items-center gap-3">
      <div className={cn("h-9 w-9 rounded-md flex items-center justify-center shrink-0", toneClass)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xs text-muted-foreground/70 truncate">{sub}</p>
      </div>
      <p className="text-xl font-bold tabular-nums shrink-0">{value}</p>
    </div>
  );
}
