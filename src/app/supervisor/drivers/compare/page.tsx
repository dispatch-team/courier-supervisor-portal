"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Trophy,
  AlertTriangle,
  CalendarIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DriverAvatar } from "@/components/DriverAvatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import type { DateRange } from "react-day-picker";
import { useDrivers } from "@/hooks/queries/use-drivers";
import { useShipments } from "@/hooks/queries/use-shipments";
import { useCompanyId } from "@/hooks/queries/use-company-id";
import { computeDriverMetrics, formatDuration, type DriverMetrics } from "@/lib/driver-metrics";
import { cn } from "@/lib/utils";
import type { Driver } from "@/types/api";

type RangePreset = "7d" | "30d" | "90d" | "custom";

const PRESETS: { id: Exclude<RangePreset, "custom">; label: string; days: number }[] = [
  { id: "7d", label: "7d", days: 7 },
  { id: "30d", label: "30d", days: 30 },
  { id: "90d", label: "90d", days: 90 },
];

function getPresetRange(preset: Exclude<RangePreset, "custom">): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - PRESETS.find((p) => p.id === preset)!.days);
  return { start, end };
}

interface DriverWithMetrics {
  driver: Driver;
  metrics: DriverMetrics | null;
}

// Higher-is-better metrics: green = best, red = worst
// Lower-is-better metrics: invert (e.g., failed count, avg time, failure rate)
type MetricKey = "delivered" | "successRate" | "failed" | "failureRate" | "avgTime" | "deliveriesPerDay" | "avgRating";

interface MetricConfig {
  key: MetricKey;
  label: string;
  /** True if higher = better (green), false if lower = better */
  higherIsBetter: boolean;
  /** Extract numeric value for ranking from metrics; null = exclude from ranking */
  getValue: (m: DriverMetrics) => number | null;
  /** Format the value for display */
  format: (m: DriverMetrics) => string;
}

const getMetrics = (tp: any): MetricConfig[] => [
  {
    key: "delivered",
    label: tp("metrics.delivered"),
    higherIsBetter: true,
    getValue: (m) => m.delivered,
    format: (m) => String(m.delivered),
  },
  {
    key: "successRate",
    label: tp("metrics.successRate"),
    higherIsBetter: true,
    getValue: (m) => (m.delivered + m.failed + m.returned > 0 ? m.successRate : null),
    format: (m) =>
      m.delivered + m.failed + m.returned > 0
        ? `${(m.successRate * 100).toFixed(1)}%`
        : "—",
  },
  {
    key: "failed",
    label: tp("metrics.failed"),
    higherIsBetter: false,
    getValue: (m) => m.failed,
    format: (m) => String(m.failed),
  },
  {
    key: "failureRate",
    label: tp("metrics.rate", { count: "" }).replace("% rate", "").trim(), // A bit hacky, but avoids duplicating keys
    higherIsBetter: false,
    getValue: (m) => (m.delivered + m.failed + m.returned > 0 ? m.failureRate : null),
    format: (m) =>
      m.delivered + m.failed + m.returned > 0
        ? `${(m.failureRate * 100).toFixed(1)}%`
        : "—",
  },
  {
    key: "avgTime",
    label: tp("metrics.avgTime"),
    higherIsBetter: false,
    getValue: (m) => m.avgPickupToDeliveryMs,
    format: (m) => formatDuration(m.avgPickupToDeliveryMs),
  },
  {
    key: "deliveriesPerDay",
    label: tp("metrics.dailyAvg"),
    higherIsBetter: true,
    getValue: (m) => m.deliveriesPerDay,
    format: (m) => m.deliveriesPerDay.toFixed(2),
  },
  {
    key: "avgRating",
    label: tp("metrics.avgRating"),
    higherIsBetter: true,
    getValue: (m) => m.avgRating,
    format: (m) => (m.avgRating !== null ? m.avgRating.toFixed(2) : "—"),
  },
];

function rankDrivers(
  drivers: DriverWithMetrics[],
  config: MetricConfig,
): { bestId: number | null; worstId: number | null } {
  const valued = drivers
    .map((d) => ({ id: d.driver.id, value: d.metrics ? config.getValue(d.metrics) : null }))
    .filter((d): d is { id: number; value: number } => d.value !== null);

  if (valued.length < 2) return { bestId: null, worstId: null };

  const sorted = [...valued].sort((a, b) =>
    config.higherIsBetter ? b.value - a.value : a.value - b.value,
  );
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];
  // Don't highlight if all values are equal
  if (best.value === worst.value) return { bestId: null, worstId: null };
  return { bestId: best.id, worstId: worst.id };
}

import { useI18n } from "@/intl";

export default function DriverComparePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useI18n("driverCompare");
  const tp = useI18n("driverPerformance");
  const idsParam = searchParams.get("ids") ?? "";
  const driverIds = useMemo(
    () =>
      idsParam
        .split(",")
        .map((s) => Number(s))
        .filter((n) => !Number.isNaN(n) && n > 0),
    [idsParam],
  );

  const { companyId } = useCompanyId();
  const { data: allDrivers, isLoading: driversLoading } = useDrivers(companyId);

  const [preset, setPreset] = useState<RangePreset>("30d");
  const [customRange, setCustomRange] = useState<DateRange | undefined>();
  const [pickerOpen, setPickerOpen] = useState(false);

  const { start, end } = useMemo(() => {
    if (preset === "custom" && customRange?.from && customRange?.to) {
      return { start: customRange.from, end: customRange.to };
    }
    return getPresetRange(preset === "custom" ? "30d" : preset);
  }, [preset, customRange]);

  const selectedDrivers = useMemo(
    () => (allDrivers ?? []).filter((d) => driverIds.includes(d.id)),
    [allDrivers, driverIds],
  );

  if (driversLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (driverIds.length < 2) {
    return (
      <EmptyState
        title={t("empty.title")}
        description={t("empty.description")}
        onBack={() => router.push("/supervisor/drivers")}
        backLabel={t("backToDrivers")}
      />
    );
  }

  if (selectedDrivers.length < 2) {
    return (
      <EmptyState
        title={t("empty.notFoundTitle")}
        description={t("empty.notFoundDescription")}
        onBack={() => router.push("/supervisor/drivers")}
        backLabel={t("backToDrivers")}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/supervisor/drivers")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Compare Drivers</h1>
            <p className="text-sm text-muted-foreground">
              Side-by-side performance for {selectedDrivers.length} drivers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-0.5 rounded-lg border border-border bg-card p-0.5 self-start">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setPreset(p.id);
                setCustomRange(undefined);
              }}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                preset === p.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
              )}
            >
              {p.label}
            </button>
          ))}
          <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                  preset === "custom" && customRange?.from
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                )}
              >
                <CalendarIcon className="h-3 w-3" />
                Custom
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="p-0 w-auto" sideOffset={6}>
              <Calendar
                mode="range"
                selected={customRange}
                onSelect={(range) => {
                  setCustomRange(range);
                  if (range?.from && range?.to) {
                    setPreset("custom");
                    setPickerOpen(false);
                  }
                }}
                numberOfMonths={2}
                disabled={(date) => date > new Date()}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Comparison table */}
      <ComparisonTable drivers={selectedDrivers} start={start} end={end} t={t} tp={tp} />
    </div>
  );
}

// Container fetches metrics per driver via individual <DriverMetricsLoader> children
// (each owns its own useShipments hook so hook order stays stable per child).
// Loaders bubble metrics up via callback into a shared map.
function ComparisonTable({
  drivers,
  start,
  end,
  t,
  tp,
}: {
  drivers: Driver[];
  start: Date;
  end: Date;
  t: any;
  tp: any;
}) {
  const [metricsMap, setMetricsMap] = useState<Map<number, DriverMetrics>>(new Map());

  // Reset when range or driver set changes
  const rangeKey = `${start.toISOString()}-${end.toISOString()}-${drivers.map((d) => d.id).join(",")}`;
  const lastKeyRef = useMemo(() => ({ key: rangeKey }), [rangeKey]);
  if (lastKeyRef.key !== rangeKey) {
    lastKeyRef.key = rangeKey;
  }

  const handleMetrics = (driverId: number, metrics: DriverMetrics) => {
    setMetricsMap((prev) => {
      if (prev.get(driverId) === metrics) return prev;
      const next = new Map(prev);
      next.set(driverId, metrics);
      return next;
    });
  };

  const driverMetrics: DriverWithMetrics[] = drivers.map((driver) => ({
    driver,
    metrics: metricsMap.get(driver.id) ?? null,
  }));

  const isAnyLoading = driverMetrics.some((d) => d.metrics === null);

  // Pre-rank all metrics to find best/worst per row
  const metricsList = useMemo(() => getMetrics(tp), [tp]);
  const rankings = metricsList.map((m) => ({
    metric: m,
    ...rankDrivers(driverMetrics, m),
  }));

  return (
    <>
      {drivers.map((driver) => (
        <DriverMetricsLoader
          key={`${driver.id}-${rangeKey}`}
          driverId={driver.id}
          start={start}
          end={end}
          onMetrics={(m) => handleMetrics(driver.id, m)}
        />
      ))}

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-baseline justify-between">
            <CardTitle className="text-base">{t("metrics")}</CardTitle>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <LegendDot tone="green" label={t("top")} icon={Trophy} />
              <LegendDot tone="red" label={t("bottom")} icon={AlertTriangle} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left text-xs font-medium text-muted-foreground p-3 sticky left-0 bg-muted/30 z-10 min-w-[160px]">
                    {t("metricCol")}
                  </th>
                  {driverMetrics.map(({ driver }) => (
                    <th key={driver.id} className="p-3 min-w-[180px]">
                      <div className="flex items-center gap-2">
                        <DriverAvatar
                          driverId={driver.id}
                          profilePictureId={driver.profile_picture_id}
                          initials={`${driver.first_name[0]}${driver.last_name[0]}`}
                        />
                        <div className="flex flex-col items-start">
                          <span className="text-sm font-semibold text-foreground">
                            {driver.first_name} {driver.last_name}
                          </span>
                          <Badge
                            variant="outline"
                            className={cn(
                              "capitalize text-[10px] mt-0.5",
                              driver.status === "active" &&
                                "border-green-500/30 bg-green-500/10 text-green-500",
                            )}
                          >
                            {driver.status === "active" ? tp("statusActive") : driver.status}
                          </Badge>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isAnyLoading ? (
                  <tr>
                    <td
                      colSpan={driverMetrics.length + 1}
                      className="p-12 text-center"
                    >
                      <Loader2 className="h-6 w-6 animate-spin text-primary inline-block" />
                      <p className="text-xs text-muted-foreground mt-2">
                        {t("loading")}
                      </p>
                    </td>
                  </tr>
                ) : (
                  rankings.map(({ metric, bestId, worstId }) => (
                    <tr
                      key={metric.key}
                      className="border-b border-border/50 last:border-b-0 hover:bg-muted/20 transition-colors"
                    >
                      <td className="text-sm font-medium text-foreground p-3 sticky left-0 bg-card z-10">
                        {metric.label}
                      </td>
                      {driverMetrics.map(({ driver, metrics }) => {
                        const isBest = bestId === driver.id;
                        const isWorst = worstId === driver.id;
                        return (
                          <td key={driver.id} className="p-3">
                            <div
                              className={cn(
                                "inline-flex items-center gap-1.5 px-2 py-1 rounded-md tabular-nums text-sm font-medium",
                                isBest && "bg-green-500/10 text-green-500",
                                isWorst && "bg-red-500/10 text-red-500",
                                !isBest && !isWorst && "text-foreground",
                              )}
                            >
                              {isBest && <Trophy className="h-3 w-3" />}
                              {isWorst && <AlertTriangle className="h-3 w-3" />}
                              {metrics ? metric.format(metrics) : "—"}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

function DriverMetricsLoader({
  driverId,
  start,
  end,
  onMetrics,
}: {
  driverId: number;
  start: Date;
  end: Date;
  onMetrics: (metrics: DriverMetrics) => void;
}) {
  const { data } = useShipments({
    assigned_driver_id: driverId,
    created_at_start: start.toISOString(),
    created_at_end: end.toISOString(),
    page_size: 100,
  });

  // Bubble computed metrics up to the parent
  const metrics = useMemo(() => {
    if (!data?.shipments) return null;
    return computeDriverMetrics(data.shipments, start, end);
  }, [data, start, end]);

  // useEffect to call onMetrics avoids setState-during-render
  useEffectOnChange(metrics, () => {
    if (metrics) onMetrics(metrics);
  });

  return null;
}

function useEffectOnChange<T>(value: T, fn: () => void) {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    if (ref.current !== value) {
      ref.current = value;
      fn();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
}

function LegendDot({
  tone,
  label,
  icon: Icon,
}: {
  tone: "green" | "red";
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const cls = tone === "green" ? "text-green-500" : "text-red-500";
  return (
    <div className="flex items-center gap-1">
      <Icon className={cn("h-3 w-3", cls)} />
      <span>{label}</span>
    </div>
  );
}

function EmptyState({
  title,
  description,
  onBack,
  backLabel,
}: {
  title: string;
  description: string;
  onBack: () => void;
  backLabel: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <AlertCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-sm">{description}</p>
      <Button onClick={onBack} variant="outline">
        {backLabel}
      </Button>
    </div>
  );
}
