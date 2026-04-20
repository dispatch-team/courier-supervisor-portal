"use client";

import { useMemo, useState } from "react";
import {
  Loader2,
  Users,
  Truck,
  Coffee,
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  CalendarIcon,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { DriverAvatar } from "@/components/DriverAvatar";
import type { DateRange } from "react-day-picker";
import { useDrivers } from "@/hooks/queries/use-drivers";
import { useShipments } from "@/hooks/queries/use-shipments";
import { useCompanyId } from "@/hooks/queries/use-company-id";
import { computeFleetMetrics } from "@/lib/fleet-metrics";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

type RangePreset = "today" | "7d" | "30d" | "custom";

const PRESETS: { id: Exclude<RangePreset, "custom">; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "7d", label: "This week" },
  { id: "30d", label: "This month" },
];

function getPresetRange(preset: Exclude<RangePreset, "custom">): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();
  if (preset === "today") {
    start.setHours(0, 0, 0, 0);
  } else if (preset === "7d") {
    start.setDate(start.getDate() - 7);
  } else {
    start.setDate(start.getDate() - 30);
  }
  return { start, end };
}

import { useI18n } from "@/intl";

const getHourlyConfig = (t: any): ChartConfig => ({
  count: { label: t("fleet.workload.shipments"), color: "hsl(var(--primary))" },
});

export default function FleetUtilizationPage() {
  const router = useRouter();
  const t = useI18n("fleet");
  const { companyId, isLoading: companyLoading } = useCompanyId();
  
  const presets = useMemo(() => [
    { id: "today" as const, label: t("presets.today") },
    { id: "7d" as const, label: t("presets.week") },
    { id: "30d" as const, label: t("presets.month") },
  ], [t]);

  const [preset, setPreset] = useState<RangePreset>("today");
  const [customRange, setCustomRange] = useState<DateRange | undefined>();
  const [pickerOpen, setPickerOpen] = useState(false);

  const { start, end } = useMemo(() => {
    if (preset === "custom" && customRange?.from && customRange?.to) {
      return { start: customRange.from, end: customRange.to };
    }
    return getPresetRange(preset === "custom" ? "today" : preset);
  }, [preset, customRange]);

  const { data: drivers, isLoading: driversLoading } = useDrivers(companyId);
  const { data: shipmentData, isLoading: shipmentsLoading } = useShipments({
    created_at_start: start.toISOString(),
    created_at_end: end.toISOString(),
    page_size: 100,
  });

  const isLoading = companyLoading || driversLoading || shipmentsLoading;

  const metrics = useMemo(() => {
    if (!drivers || !shipmentData?.shipments) return null;
    return computeFleetMetrics(drivers, shipmentData.shipments);
  }, [drivers, shipmentData]);

  if (isLoading && !metrics) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!metrics || metrics.totalActiveDrivers === 0) {
    return (
      <div className="space-y-6">
        <Header
          preset={preset}
          presets={presets}
          customRange={customRange}
          pickerOpen={pickerOpen}
          onPresetChange={(p) => {
            setPreset(p);
            setCustomRange(undefined);
          }}
          onPickerOpenChange={setPickerOpen}
          onCustomChange={setCustomRange}
          onCustomApply={(range) => {
            setCustomRange(range);
            setPreset("custom");
            setPickerOpen(false);
          }}
        />
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-muted-foreground/60" />
            </div>
            <p className="text-base font-medium">{t("empty.title")}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {t("empty.description")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const peakHour = metrics.hourlyActivity.reduce(
    (max, h) => (h.count > max.count ? h : max),
    { hour: 0, count: 0 },
  );

  const formatHour = (h: number) => {
    const ampm = h >= 12 ? "PM" : "AM";
    const display = h % 12 === 0 ? 12 : h % 12;
    return `${display}${ampm}`;
  };

  return (
    <div className="space-y-6">
      <Header
        preset={preset}
        presets={presets}
        customRange={customRange}
        pickerOpen={pickerOpen}
        onPresetChange={(p) => {
          setPreset(p);
          setCustomRange(undefined);
        }}
        onPickerOpenChange={setPickerOpen}
        onCustomChange={setCustomRange}
        onCustomApply={(range) => {
          setCustomRange(range);
          setPreset("custom");
          setPickerOpen(false);
        }}
      />

      {/* Overview cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <OverviewCard
          icon={Users}
          tone="primary"
          label={t("stats.activeDrivers")}
          value={metrics.totalActiveDrivers}
          sub={t("stats.inFleet")}
        />
        <OverviewCard
          icon={Truck}
          tone="blue"
          label={t("stats.onDelivery")}
          value={metrics.onDelivery}
          sub={t("stats.fleetPct", { pct: ((metrics.onDelivery / metrics.totalActiveDrivers) * 100).toFixed(0) })}
        />
        <OverviewCard
          icon={Coffee}
          tone="amber"
          label={t("stats.idleDrivers")}
          value={metrics.idle}
          sub={t("stats.availableNow")}
        />
        <OverviewCard
          icon={Package}
          tone="green"
          label={t("stats.shipments")}
          value={metrics.totalShipments}
          sub={t("stats.deliveredCount", { count: metrics.totalDelivered.toString() })}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Workload distribution — horizontal stacked bars per driver, scrollable */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-baseline justify-between">
              <div>
                <CardTitle className="text-base">{t("workload.title")}</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t("workload.summary", { 
                    count: metrics.workload.length.toString(), 
                    avg: metrics.avgWorkload.toFixed(1) 
                  })}
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <LegendDot color="hsl(var(--status-delivered))" label={t("workload.delivered")} />
                <LegendDot color="hsl(var(--status-in-transit))" label={t("workload.inProgress")} />
                <LegendDot color="hsl(var(--status-failed))" label={t("workload.failed")} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <WorkloadList workload={metrics.workload} avg={metrics.avgWorkload} />
          </CardContent>
        </Card>

        {/* Peak hours */}
        <Card>
          <CardHeader>
            <div className="flex items-baseline justify-between">
              <div>
                <CardTitle className="text-base">{t("peakHours.title")}</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t("peakHours.subtitle")}
                </p>
              </div>
              {peakHour.count > 0 && (
                <Badge variant="outline" className="text-[10px] gap-1">
                  <Clock className="h-3 w-3" />
                  {t("peakHours.peak", { time: formatHour(peakHour.hour) })}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer config={getHourlyConfig(t)} className="h-64 w-full">
              <BarChart
                data={metrics.hourlyActivity}
                margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
              >
                <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="3 3" />
                <XAxis
                  dataKey="hour"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(h: number) => (h % 6 === 0 ? formatHour(h) : "")}
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  interval={0}
                />
                <YAxis hide />
                <ChartTooltip
                  cursor={{ fill: "hsl(var(--muted) / 0.4)" }}
                  content={
                    <ChartTooltipContent
                      indicator="dot"
                      labelFormatter={(label: number) => formatHour(label)}
                    />
                  }
                />
                <Bar dataKey="count" fill="var(--color-count)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations — capacity gaps, workload balance, optimal activation times */}
      <Recommendations metrics={metrics} formatHour={formatHour} />
    </div>
  );
}

function Header({
  preset,
  presets,
  customRange,
  pickerOpen,
  onPresetChange,
  onPickerOpenChange,
  onCustomChange,
  onCustomApply,
}: {
  preset: RangePreset;
  presets: { id: Exclude<RangePreset, "custom">; label: string }[];
  customRange: DateRange | undefined;
  pickerOpen: boolean;
  onPresetChange: (p: Exclude<RangePreset, "custom">) => void;
  onPickerOpenChange: (open: boolean) => void;
  onCustomChange: (range: DateRange | undefined) => void;
  onCustomApply: (range: DateRange) => void;
}) {
  const t = useI18n("fleet");
  const [draftRange, setDraftRange] = useState<DateRange | undefined>(customRange);

  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>
      <div className="flex items-center gap-0.5 rounded-lg border border-border bg-card p-0.5 self-start">
        {presets.map((p) => (
          <button
            key={p.id}
            onClick={() => onPresetChange(p.id)}
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
        <Popover
          open={pickerOpen}
          onOpenChange={(next) => {
            if (next) setDraftRange(customRange);
            onPickerOpenChange(next);
          }}
        >
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
              {t("presets.custom")}
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="p-0 w-auto" sideOffset={6}>
            <Calendar
              mode="range"
              selected={draftRange}
              onSelect={(range) => {
                setDraftRange(range);
                onCustomChange(range);
              }}
              numberOfMonths={2}
              defaultMonth={
                draftRange?.from ??
                new Date(new Date().setMonth(new Date().getMonth() - 1))
              }
              disabled={(date) => date > new Date()}
            />
            <div className="flex items-center justify-end gap-1.5 p-3 border-t border-border">
              <button
                onClick={() => onPickerOpenChange(false)}
                className="text-xs px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                {t("calendar.cancel")}
              </button>
              <button
                onClick={() => draftRange?.from && draftRange?.to && onCustomApply(draftRange)}
                disabled={!draftRange?.from || !draftRange?.to}
                className="text-xs px-3 py-1.5 rounded-md bg-primary text-primary-foreground disabled:opacity-50 hover:bg-primary/90 transition-colors"
              >
                {t("calendar.apply")}
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

function OverviewCard({
  icon: Icon,
  tone,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  tone: "primary" | "blue" | "amber" | "green";
  label: string;
  value: number;
  sub: string;
}) {
  const toneClass = {
    primary: "bg-primary/10 text-primary",
    blue: "bg-blue-500/10 text-blue-500",
    amber: "bg-amber-500/10 text-amber-500",
    green: "bg-green-500/10 text-green-500",
  }[tone];

  return (
    <Card className="overflow-hidden">
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
  );
}

function RecommendationGroup({
  tone,
  icon: Icon,
  title,
  description,
  drivers,
  onDriverClick,
}: {
  tone: "red" | "amber";
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  drivers: Array<import("@/types/api").Driver>;
  onDriverClick: (id: number) => void;
}) {
  const toneCls = {
    red: "bg-red-500/10 text-red-500 border-red-500/20",
    amber: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  }[tone];

  return (
    <div className={cn("rounded-lg border p-3", toneCls)}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4" />
        <p className="text-sm font-semibold">
          {title} <span className="opacity-60 font-normal">({drivers.length})</span>
        </p>
      </div>
      <p className="text-xs text-muted-foreground mb-3">{description}</p>
      <div className="space-y-1.5">
        {drivers.map((d) => (
          <button
            key={d.id}
            onClick={() => onDriverClick(d.id)}
            className="w-full flex items-center gap-2 p-1.5 rounded-md hover:bg-card/60 transition-colors text-left"
          >
            <DriverAvatar
              driverId={d.id}
              profilePictureId={d.profile_picture_id}
              initials={`${d.first_name[0]}${d.last_name[0]}`}
            />
            <span className="text-sm text-foreground">
              {d.first_name} {d.last_name}
            </span>
            <AlertTriangle className="h-3 w-3 ml-auto opacity-60" />
          </button>
        ))}
      </div>
    </div>
  );
}

function Recommendations({
  metrics,
  formatHour,
}: {
  metrics: import("@/lib/fleet-metrics").FleetMetrics;
  formatHour: (h: number) => string;
}) {
  const t = useI18n("fleet");
  const router = useRouter();

  const insights: { tone: "red" | "amber" | "blue" | "green"; icon: React.ComponentType<{ className?: string }>; title: string; body: React.ReactNode }[] = [];

  // Capacity risk
  if (metrics.capacityRisk === "high") {
    insights.push({
      tone: "red",
      icon: AlertTriangle,
      title: t("recommendations.atCapacity.title"),
      body: (
        <>
          {t("recommendations.atCapacity.body", { pct: (metrics.utilizationRate * 100).toFixed(0) })}
        </>
      ),
    });
  } else if (metrics.capacityRisk === "moderate") {
    insights.push({
      tone: "amber",
      icon: AlertTriangle,
      title: t("recommendations.tightening.title"),
      body: (
        <>
          {t("recommendations.tightening.body", { 
            pct: (metrics.utilizationRate * 100).toFixed(0),
            count: metrics.idle.toString(),
            s: metrics.idle === 1 ? t("recommendations.tightening.driver") : t("recommendations.tightening.drivers")
          })}
        </>
      ),
    });
  } else if (metrics.idle > 0 && metrics.totalActiveDrivers >= 3) {
    insights.push({
      tone: "blue",
      icon: TrendingDown,
      title: t("recommendations.spare.title"),
      body: (
        <>
          {t("recommendations.spare.body", { idle: metrics.idle.toString(), total: metrics.totalActiveDrivers.toString() })}
        </>
      ),
    });
  }

  // Optimal activation times — derived from peak hours
  if (metrics.peakHours.length > 0) {
    const hourLabels = metrics.peakHours.map((h) => formatHour(h.hour)).join(", ");
    insights.push({
      tone: "blue",
      icon: Clock,
      title: t("recommendations.activation.title"),
      body: (
        <>
          {t("recommendations.activation.body", { hours: hourLabels })}
        </>
      ),
    });
  }

  const hasWorkloadIssues =
    metrics.overworked.length > 0 || metrics.underutilized.length > 0;

  if (insights.length === 0 && !hasWorkloadIssues) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("recommendations.title")}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {t("recommendations.balanced")}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("recommendations.title")}</CardTitle>
        <p className="text-xs text-muted-foreground mt-0.5">
          {t("recommendations.subtitle")}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Insight cards */}
        {insights.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {insights.map((ins, i) => (
              <InsightCard key={i} {...ins} />
            ))}
          </div>
        )}

        {/* Workload imbalance groups */}
        {hasWorkloadIssues && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {metrics.overworked.length > 0 && (
              <RecommendationGroup
                tone="red"
                icon={TrendingUp}
                title={t("recommendations.overworked.title")}
                description={t("recommendations.overworked.desc")}
                drivers={metrics.overworked}
                onDriverClick={(id) => router.push(`/supervisor/drivers/${id}/performance`)}
              />
            )}
            {metrics.underutilized.length > 0 && (
              <RecommendationGroup
                tone="amber"
                icon={TrendingDown}
                title={t("recommendations.underutilized.title")}
                description={t("recommendations.underutilized.desc")}
                drivers={metrics.underutilized}
                onDriverClick={(id) => router.push(`/supervisor/drivers/${id}/performance`)}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function InsightCard({
  tone,
  icon: Icon,
  title,
  body,
}: {
  tone: "red" | "amber" | "blue" | "green";
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: React.ReactNode;
}) {
  const toneCls = {
    red: "bg-red-500/10 text-red-500 border-red-500/20",
    amber: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    green: "bg-green-500/10 text-green-500 border-green-500/20",
  }[tone];

  return (
    <div className={cn("rounded-lg border p-3", toneCls)}>
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className="h-4 w-4" />
        <p className="text-sm font-semibold">{title}</p>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}

function WorkloadList({
  workload,
  avg,
}: {
  workload: import("@/lib/fleet-metrics").DriverWorkload[];
  avg: number;
}) {
  const t = useI18n("fleet");
  const router = useRouter();
  // Cap height around 6 rows; scroll the rest
  const ROW_HEIGHT = 44; // px (approx)
  const VISIBLE_ROWS = 6;

  // Find max total to scale bars consistently across all rows
  const maxTotal = workload.reduce(
    (max, w) => Math.max(max, w.delivered + w.inProgress + w.failed),
    1,
  );

  return (
    <div className="relative">
      <div
        className="overflow-y-auto pr-1 hidden-scrollbar"
        style={{ maxHeight: workload.length > VISIBLE_ROWS ? ROW_HEIGHT * VISIBLE_ROWS + 8 : "auto" }}
      >
        <div className="space-y-2">
          {workload.map((w) => {
            const total = w.delivered + w.inProgress + w.failed;
            const dPct = (w.delivered / maxTotal) * 100;
            const ipPct = (w.inProgress / maxTotal) * 100;
            const fPct = (w.failed / maxTotal) * 100;
            const isOver = total >= avg * 1.5 && total >= 2;
            const isUnder = avg >= 1 && total <= avg * 0.5;

            return (
              <button
                key={w.driver.id}
                onClick={() => router.push(`/supervisor/drivers/${w.driver.id}/performance`)}
                className="w-full flex items-center gap-3 p-1 rounded-md hover:bg-muted/40 transition-colors group/row text-left"
              >
                <div className="w-32 flex items-center gap-2 shrink-0">
                  <DriverAvatar
                    driverId={w.driver.id}
                    profilePictureId={w.driver.profile_picture_id}
                    initials={`${w.driver.first_name[0]}${w.driver.last_name[0]}`}
                  />
                  <span className="text-xs font-medium text-foreground truncate">
                    {w.driver.first_name} {w.driver.last_name[0]}.
                  </span>
                </div>

                <div className="flex-1 h-5 rounded-md bg-muted/30 overflow-hidden flex">
                  <div
                    className="h-full bg-[hsl(var(--status-delivered))] transition-all"
                    style={{ width: `${dPct}%` }}
                    title={`Delivered: ${w.delivered}`}
                  />
                  <div
                    className="h-full bg-[hsl(var(--status-in-transit))] transition-all"
                    style={{ width: `${ipPct}%` }}
                    title={`In progress: ${w.inProgress}`}
                  />
                  <div
                    className="h-full bg-[hsl(var(--status-failed))] transition-all"
                    style={{ width: `${fPct}%` }}
                    title={`Failed: ${w.failed}`}
                  />
                </div>

                <div className="w-16 text-right shrink-0 flex items-center justify-end gap-1">
                  <span className="text-sm font-semibold tabular-nums text-foreground">
                    {total}
                  </span>
                  {isOver && (
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" title="Overworked" />
                  )}
                  {isUnder && (
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" title="Underutilized" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
      {workload.length > VISIBLE_ROWS && (
        <p className="text-[10px] text-muted-foreground text-center pt-2 border-t border-border/30 mt-2">
          {t("workload.scroll", { count: workload.length.toString() })}
        </p>
      )}
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-muted-foreground">
      <span
        className="h-2 w-2 rounded-sm shrink-0"
        style={{ backgroundColor: color }}
      />
      <span>{label}</span>
    </div>
  );
}
