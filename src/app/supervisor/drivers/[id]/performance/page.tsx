"use client";

import { use, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Package,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Star,
  BarChart3,
  Download,
  FileText,
  FileSpreadsheet,
} from "lucide-react";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { DriverAvatar } from "@/components/DriverAvatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportDriverReportPdf, exportDriverReportExcel } from "@/lib/driver-report";
import { useDriver } from "@/hooks/queries/use-drivers";
import { useShipments } from "@/hooks/queries/use-shipments";
import { useCompanyId } from "@/hooks/queries/use-company-id";
import { computeDriverMetrics, formatDuration } from "@/lib/driver-metrics";
import { cn } from "@/lib/utils";

type RangePreset = "7d" | "30d" | "90d" | "custom";

const PRESETS: { id: Exclude<RangePreset, "custom">; label: string; days: number }[] = [
  { id: "7d", label: "7d", days: 7 },
  { id: "30d", label: "30d", days: 30 },
  { id: "90d", label: "90d", days: 90 },
];

function getPresetRange(preset: Exclude<RangePreset, "custom">): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();
  const days = PRESETS.find((p) => p.id === preset)?.days ?? 30;
  start.setDate(start.getDate() - days);
  return { start, end };
}

function presetLabel(preset: RangePreset, locale: string, custom?: DateRange): string {
  if (preset === "custom" && custom?.from && custom?.to) {
    const fmt = (d: Date) =>
      d.toLocaleDateString(locale === "am" ? "am-ET" : "en-US", { month: "short", day: "numeric" });
    return `${fmt(custom.from)} – ${fmt(custom.to)}`;
  }
  return PRESETS.find((p) => p.id === preset)?.label ?? "";
}

function toRfc3339(d: Date): string {
  return d.toISOString();
}

function formatShortDate(iso: string, locale: string = "en-US"): string {
  const d = new Date(iso);
  return d.toLocaleDateString(locale === "am" ? "am-ET" : "en-US", { month: "short", day: "numeric" });
}

import { useI18n, useLocale } from "@/intl";

const getVolumeConfig = (t: any): ChartConfig => ({
  delivered: { label: t("metrics.delivered"), color: "hsl(var(--status-delivered))" },
  failed: { label: t("metrics.failed"), color: "hsl(var(--status-failed))" },
});

const getStatusConfig = (intl: any): ChartConfig => ({
  delivered: { label: intl("status.delivered"), color: "hsl(var(--status-delivered))" },
  inProgress: { label: intl("status.inTransit"), color: "hsl(var(--status-in-transit))" },
  failed: { label: intl("status.failed"), color: "hsl(var(--status-failed))" },
  returned: { label: intl("status.returned"), color: "hsl(var(--status-pending))" },
  cancelled: { label: intl("status.cancelled"), color: "hsl(var(--status-cancelled))" },
});

export default function DriverPerformancePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const driverId = Number(id);
  const router = useRouter();
  const { locale: currentLocale } = useLocale();
  const t = useI18n("driverPerformance");
  const ts = useI18n("shipments");
  
  const presets = useMemo(() => [
    { id: "7d" as const, label: "7d", days: 7 },
    { id: "30d" as const, label: "30d", days: 30 },
    { id: "90d" as const, label: "90d", days: 90 },
  ], []);

  const [preset, setPreset] = useState<RangePreset>("30d");
  const [customRange, setCustomRange] = useState<DateRange | undefined>();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [exporting, setExporting] = useState<"pdf" | "excel" | null>(null);

  const { companyId } = useCompanyId();
  const { data: driver, isLoading: driverLoading } = useDriver(companyId, driverId);

  const { start, end } = useMemo(() => {
    if (preset === "custom" && customRange?.from && customRange?.to) {
      return { start: customRange.from, end: customRange.to };
    }
    return getPresetRange(preset === "custom" ? "30d" : preset);
  }, [preset, customRange]);

  const { data: shipmentData, isLoading: shipmentsLoading } = useShipments({
    assigned_driver_id: driverId,
    created_at_start: toRfc3339(start),
    created_at_end: toRfc3339(end),
    page_size: 100,
  });

  const metrics = useMemo(() => {
    if (!shipmentData?.shipments) return null;
    return computeDriverMetrics(shipmentData.shipments, start, end);
  }, [shipmentData, start, end]);

  const volumeData = useMemo(() => {
    if (!metrics) return [];
    return metrics.dailyVolume.map((d) => ({
      ...d,
      label: formatShortDate(d.date, currentLocale),
    }));
  }, [metrics, currentLocale]);

  const isLoading = driverLoading || shipmentsLoading;

  const handleExport = async (format: "pdf" | "excel") => {
    if (!driver || !metrics) return;
    setExporting(format);
    try {
      const ctx = { driver, metrics, rangeStart: start, rangeEnd: end };
      if (format === "pdf") await exportDriverReportPdf(ctx);
      else await exportDriverReportExcel(ctx);
    } finally {
      setExporting(null);
    }
  };

  if (isLoading && !driver) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">{t("notFound")}</h3>
        <Button onClick={() => router.push("/supervisor/drivers")}>
          {t("backToDrivers")}
        </Button>
      </div>
    );
  }

  const fullName = [driver.first_name, driver.middle_name, driver.last_name]
    .filter(Boolean)
    .join(" ");

  const hasData = metrics && metrics.total > 0;

  // Pie chart data — only include non-zero slices
  const statusPieData = metrics
    ? [
        { key: "delivered", value: metrics.delivered, fill: "var(--color-delivered)" },
        { key: "inProgress", value: metrics.inProgress, fill: "var(--color-inProgress)" },
        { key: "failed", value: metrics.failed, fill: "var(--color-failed)" },
        { key: "returned", value: metrics.returned, fill: "var(--color-returned)" },
        { key: "cancelled", value: metrics.cancelled, fill: "var(--color-cancelled)" },
      ].filter((d) => d.value > 0)
    : [];

  // Format daily volume dates for nicer display (using useMemo for volumeData instead)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/supervisor/drivers")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <DriverAvatar
            driverId={driver.id}
            profilePictureId={driver.profile_picture_id}
            initials={`${driver.first_name[0]}${driver.last_name[0]}`}
            size="lg"
          />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{fullName}</h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>{driver.email}</span>
              <span className="text-muted-foreground/40">•</span>
              <span>{driver.phone_number}</span>
              <Badge
                variant="outline"
                className={cn(
                  "ml-1 capitalize text-[10px]",
                  driver.status === "active" &&
                    "border-green-500/30 bg-green-500/10 text-green-500",
                )}
              >
                {driver.status === "active" ? t("statusActive") : driver.status}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start">
          <div className="flex items-center gap-0.5 rounded-lg border border-border bg-card p-0.5">
            {presets.map((p) => (
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
            <CustomRangePicker
              preset={preset}
              customRange={customRange}
              open={pickerOpen}
              onOpenChange={setPickerOpen}
              onApply={(range) => {
                setCustomRange(range);
                setPreset("custom");
                setPickerOpen(false);
              }}
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={!hasData || exporting !== null}
                className="gap-1.5"
              >
                 {exporting !== null ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="h-3.5 w-3.5" />
                )}
                {t("export")}
              </Button>
            </DropdownMenuTrigger>
             <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => handleExport("pdf")} className="gap-2">
                <FileText className="h-4 w-4" />
                <div className="flex flex-col">
                  <span className="text-sm">{t("reports.pdf")}</span>
                  <span className="text-[10px] text-muted-foreground">{t("reports.pdfDesc")}</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("excel")} className="gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                <div className="flex flex-col">
                  <span className="text-sm">{t("reports.excel")}</span>
                  <span className="text-[10px] text-muted-foreground">{t("reports.excelDesc")}</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {!hasData ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <Package className="h-6 w-6 text-muted-foreground/60" />
            </div>
            <p className="text-base font-medium">{t("empty.title")}</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              {t("empty.description", { name: driver.first_name })}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <MetricCard
              icon={CheckCircle2}
              tone="green"
              label="Delivered"
              value={metrics.delivered}
              sub={`of ${metrics.total} total`}
            />
            <MetricCard
              icon={TrendingUp}
              tone="primary"
              label="Success Rate"
              value={`${(metrics.successRate * 100).toFixed(0)}%`}
              sub={`${metrics.delivered + metrics.failed + metrics.returned} attempts`}
            />
            <MetricCard
              icon={XCircle}
              tone="red"
              label="Failed"
              value={metrics.failed}
              sub={`${(metrics.failureRate * 100).toFixed(0)}% rate`}
            />
            <MetricCard
              icon={Clock}
              tone="amber"
              label="Avg Time"
              value={formatDuration(metrics.avgPickupToDeliveryMs)}
              sub="pickup → delivered"
            />
            <MetricCard
              icon={BarChart3}
              tone="blue"
              label="Daily Avg"
              value={metrics.deliveriesPerDay.toFixed(1)}
              sub="deliveries / day"
            />
            <MetricCard
              icon={Star}
              tone="amber"
              label="Avg Rating"
              value={metrics.avgRating !== null ? metrics.avgRating.toFixed(1) : "—"}
              sub={
                driver.rating_count > 0
                  ? `${driver.rating_count} ratings`
                  : "no ratings yet"
              }
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Delivery activity — smooth area chart over full range */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-baseline justify-between">
                  <div>
                    <CardTitle className="text-base">{t("charts.activity")}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {presetLabel(preset, currentLocale, customRange)} • {metrics.delivered} {t("metrics.delivered")}, {metrics.failed} {t("metrics.failed")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <LegendDot color="hsl(var(--status-delivered))" label="Delivered" />
                    <LegendDot color="hsl(var(--status-failed))" label="Failed" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ChartContainer config={getVolumeConfig(t)} className="h-64 w-full">
                  <AreaChart
                    data={volumeData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="fillDelivered" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-delivered)" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="var(--color-delivered)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="fillFailed" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-failed)" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="var(--color-failed)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="3 3" />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      minTickGap={48}
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis
                      hide
                      domain={[0, (dataMax: number) => Math.max(2, Math.ceil(dataMax * 1.4))]}
                    />
                    <ChartTooltip
                      cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1, strokeDasharray: "4 4" }}
                      content={<ChartTooltipContent indicator="dot" />}
                    />
                    <Area
                      type="monotone"
                      dataKey="delivered"
                      stroke="var(--color-delivered)"
                      strokeWidth={2}
                      fill="url(#fillDelivered)"
                    />
                    <Area
                      type="monotone"
                      dataKey="failed"
                      stroke="var(--color-failed)"
                      strokeWidth={2}
                      fill="url(#fillFailed)"
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Status breakdown — donut */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("charts.breakdown")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={getStatusConfig(ts)}
                  className="mx-auto aspect-square max-h-[200px]"
                >
                  <PieChart>
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel nameKey="key" />}
                    />
                    <Pie
                      data={statusPieData}
                      dataKey="value"
                      nameKey="key"
                      innerRadius={55}
                      strokeWidth={2}
                      stroke="hsl(var(--card))"
                    >
                      {statusPieData.map((entry) => (
                        <Cell key={entry.key} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
                {/* Center label overlay */}
                <div className="-mt-[120px] mb-[80px] flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold tabular-nums">{metrics.total}</span>
                  <span className="text-xs text-muted-foreground">{t("charts.total")}</span>
                </div>
                {/* Legend */}
                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-2">
                  {statusPieData.map((d) => (
                    <div key={d.key} className="flex items-center gap-1.5 text-xs">
                      <span
                        className="h-2 w-2 rounded-sm shrink-0"
                        style={{ backgroundColor: d.fill }}
                      />
                      <span className="text-muted-foreground capitalize">
                        {(getStatusConfig(ts) as any)[d.key]?.label}
                      </span>
                      <span className="ml-auto font-medium tabular-nums">{d.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Failure reasons — compact ranked list */}
          {metrics.failureReasons.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-baseline justify-between">
                  <CardTitle className="text-base">Failure Reasons</CardTitle>
                  <span className="text-xs text-muted-foreground">
                    {metrics.failed} failed shipment{metrics.failed > 1 ? "s" : ""}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {metrics.failureReasons.map((r) => {
                  const pct = metrics.failed > 0 ? (r.count / metrics.failed) * 100 : 0;
                  return (
                    <div key={r.reason} className="space-y-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-sm text-foreground truncate">{r.reason}</span>
                        <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                          {r.count} <span className="opacity-60">({pct.toFixed(0)}%)</span>
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted/50 overflow-hidden">
                        <div
                          className="h-full bg-[hsl(var(--status-failed))] rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

function CustomRangePicker({
  preset,
  customRange,
  open,
  onOpenChange,
  onApply,
}: {
  preset: RangePreset;
  customRange: DateRange | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (range: DateRange) => void;
}) {
  const { locale: currentLocale } = useLocale();
  const t = useI18n("driverPerformance");
  const [draftRange, setDraftRange] = useState<DateRange | undefined>(customRange);

  const handleOpenChange = (next: boolean) => {
    if (next) setDraftRange(customRange);
    onOpenChange(next);
  };

  const isCustomActive = preset === "custom" && !!customRange?.from && !!customRange?.to;

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
            isCustomActive
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
          )}
        >
          <CalendarIcon className="h-3 w-3" />
          {isCustomActive ? presetLabel("custom", currentLocale, customRange) : t("presets.custom")}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="p-0 w-auto" sideOffset={6}>
        <Calendar
          mode="range"
          selected={draftRange}
          onSelect={setDraftRange}
          numberOfMonths={2}
          defaultMonth={
            draftRange?.from ??
            new Date(new Date().setMonth(new Date().getMonth() - 1))
          }
          disabled={(date) => date > new Date()}
        />
        <div className="flex items-center justify-between gap-2 p-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            {draftRange?.from && draftRange?.to ? (
              <>
                {draftRange.from.toLocaleDateString(currentLocale === "am" ? "am-ET" : "en-US", { month: "short", day: "numeric" })}
                {" – "}
                {draftRange.to.toLocaleDateString(currentLocale === "am" ? "am-ET" : "en-US", { month: "short", day: "numeric", year: "numeric" })}
              </>
            ) : draftRange?.from ? (
              t("picker.pickEnd")
            ) : (
              t("picker.pickStart")
            )}
          </p>
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDraftRange(undefined)}
              disabled={!draftRange?.from}
            >
              {t("picker.clear")}
            </Button>
            <Button
              size="sm"
              onClick={() => draftRange?.from && draftRange?.to && onApply(draftRange)}
              disabled={!draftRange?.from || !draftRange?.to}
            >
              {t("picker.apply")}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
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

function MetricCard({
  icon: Icon,
  tone,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  tone: "green" | "red" | "amber" | "blue" | "primary";
  label: string;
  value: string | number;
  sub: string;
}) {
  const toneClass = {
    green: "bg-green-500/10 text-green-500",
    red: "bg-red-500/10 text-red-500",
    amber: "bg-amber-500/10 text-amber-500",
    blue: "bg-blue-500/10 text-blue-500",
    primary: "bg-primary/10 text-primary",
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
