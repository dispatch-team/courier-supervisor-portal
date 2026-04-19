"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Wallet,
  Package,
  TrendingUp,
  TrendingDown,
  Download,
  FileText,
  FileSpreadsheet,
  CalendarIcon,
  Trophy,
} from "lucide-react";
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import type { DateRange } from "react-day-picker";
import { DriverAvatar } from "@/components/DriverAvatar";
import { useDrivers } from "@/hooks/queries/use-drivers";
import { useShipments } from "@/hooks/queries/use-shipments";
import { useCompanyId } from "@/hooks/queries/use-company-id";
import {
  computeRevenueMetrics,
  formatEtb,
} from "@/lib/revenue-metrics";
import {
  exportRevenueReportPdf,
  exportRevenueReportExcel,
} from "@/lib/revenue-report";
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
  start.setDate(start.getDate() - PRESETS.find((p) => p.id === preset)!.days);
  return { start, end };
}

function getPriorRange(start: Date, end: Date): { priorStart: Date; priorEnd: Date } {
  const ms = end.getTime() - start.getTime();
  const priorEnd = new Date(start.getTime() - 1);
  const priorStart = new Date(priorEnd.getTime() - ms);
  return { priorStart, priorEnd };
}

function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const revenueConfig = {
  revenue: { label: "Revenue", color: "hsl(var(--primary))" },
} satisfies ChartConfig;

export default function RevenuePage() {
  const router = useRouter();
  const { companyId, isLoading: companyLoading } = useCompanyId();
  const [preset, setPreset] = useState<RangePreset>("30d");
  const [customRange, setCustomRange] = useState<DateRange | undefined>();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [exporting, setExporting] = useState<"pdf" | "excel" | null>(null);

  const { start, end } = useMemo(() => {
    if (preset === "custom" && customRange?.from && customRange?.to) {
      return { start: customRange.from, end: customRange.to };
    }
    return getPresetRange(preset === "custom" ? "30d" : preset);
  }, [preset, customRange]);

  const { priorStart, priorEnd } = useMemo(() => getPriorRange(start, end), [start, end]);

  const { data: drivers, isLoading: driversLoading } = useDrivers(companyId);
  const { data: currentData, isLoading: currentLoading } = useShipments({
    created_at_start: start.toISOString(),
    created_at_end: end.toISOString(),
    page_size: 100,
  });
  const { data: priorData, isLoading: priorLoading } = useShipments({
    created_at_start: priorStart.toISOString(),
    created_at_end: priorEnd.toISOString(),
    page_size: 100,
  });

  const isLoading = companyLoading || driversLoading || currentLoading || priorLoading;

  const metrics = useMemo(() => {
    if (!drivers || !currentData?.shipments || !priorData?.shipments) return null;
    return computeRevenueMetrics(
      drivers,
      currentData.shipments,
      priorData.shipments,
      start,
      end,
    );
  }, [drivers, currentData, priorData, start, end]);

  const handleExport = async (format: "pdf" | "excel") => {
    if (!metrics) return;
    setExporting(format);
    try {
      const ctx = { metrics, rangeStart: start, rangeEnd: end };
      if (format === "pdf") await exportRevenueReportPdf(ctx);
      else await exportRevenueReportExcel(ctx);
    } finally {
      setExporting(null);
    }
  };

  if (isLoading && !metrics) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const hasData = metrics && metrics.deliveredCount > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Revenue</h1>
          <p className="text-sm text-muted-foreground">
            Earnings from delivered shipments, with comparison to the prior period
          </p>
        </div>

        <div className="flex items-center gap-2 self-start">
          <div className="flex items-center gap-0.5 rounded-lg border border-border bg-card p-0.5">
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
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => handleExport("pdf")} className="gap-2">
                <FileText className="h-4 w-4" />
                <div className="flex flex-col">
                  <span className="text-sm">PDF Report</span>
                  <span className="text-[10px] text-muted-foreground">Formatted document</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("excel")} className="gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                <div className="flex flex-col">
                  <span className="text-sm">Excel Workbook</span>
                  <span className="text-[10px] text-muted-foreground">Editable spreadsheet</span>
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
              <Wallet className="h-6 w-6 text-muted-foreground/60" />
            </div>
            <p className="text-base font-medium">No revenue data available for selected period.</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Revenue is calculated from completed deliveries. Try a wider date range.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary cards with prior-period comparison */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <RevenueCard
              icon={Wallet}
              tone="primary"
              label="Total Revenue"
              value={formatEtb(metrics.totalRevenue)}
              changePct={metrics.revenueChangePct}
              priorLabel={`vs ${formatEtb(metrics.prior.totalRevenue)} prior`}
            />
            <RevenueCard
              icon={Package}
              tone="green"
              label="Deliveries"
              value={metrics.deliveredCount.toLocaleString()}
              changePct={metrics.deliveriesChangePct}
              priorLabel={`vs ${metrics.prior.deliveredCount} prior`}
            />
            <RevenueCard
              icon={TrendingUp}
              tone="blue"
              label="Avg per Delivery"
              value={formatEtb(metrics.avgPerDelivery)}
              priorLabel="across all delivered shipments"
            />
          </div>

          {/* Trend chart */}
          <Card>
            <CardHeader>
              <div className="flex items-baseline justify-between">
                <div>
                  <CardTitle className="text-base">Revenue Trend</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Daily revenue across the selected range
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer config={revenueConfig} className="h-72 w-full">
                <AreaChart
                  data={metrics.dailyRevenue.map((d) => ({
                    ...d,
                    label: formatShortDate(d.date),
                  }))}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-revenue)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="var(--color-revenue)" stopOpacity={0} />
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
                    domain={[0, (dataMax: number) => Math.max(100, Math.ceil(dataMax * 1.4))]}
                  />
                  <ChartTooltip
                    cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1, strokeDasharray: "4 4" }}
                    content={
                      <ChartTooltipContent
                        indicator="dot"
                        formatter={(value) => formatEtb(value as number)}
                      />
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--color-revenue)"
                    strokeWidth={2}
                    fill="url(#fillRevenue)"
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Top drivers */}
          {metrics.topDrivers.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-baseline justify-between">
                  <CardTitle className="text-base">Top Revenue-Generating Drivers</CardTitle>
                  <span className="text-xs text-muted-foreground">
                    {metrics.topDrivers.length} driver{metrics.topDrivers.length > 1 ? "s" : ""} contributed
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {metrics.topDrivers.slice(0, 10).map((d, i) => {
                  const sharePct =
                    metrics.totalRevenue > 0
                      ? (d.revenue / metrics.totalRevenue) * 100
                      : 0;
                  return (
                    <button
                      key={d.driver.id}
                      onClick={() => router.push(`/supervisor/drivers/${d.driver.id}/performance`)}
                      className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-muted/40 transition-colors text-left group/row"
                    >
                      <div className="text-xs font-semibold text-muted-foreground w-5 tabular-nums">
                        #{i + 1}
                      </div>
                      <DriverAvatar
                        driverId={d.driver.id}
                        profilePictureId={d.driver.profile_picture_id}
                        initials={`${d.driver.first_name[0]}${d.driver.last_name[0]}`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate group-hover/row:text-primary transition-colors">
                          {d.driver.first_name} {d.driver.last_name}
                          {i === 0 && (
                            <Trophy className="inline-block h-3.5 w-3.5 ml-1.5 text-amber-400" />
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {d.count} deliver{d.count === 1 ? "y" : "ies"}
                        </p>
                      </div>
                      <div className="flex-1 max-w-[200px] hidden sm:block">
                        <div className="h-1.5 w-full rounded-full bg-muted/50 overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${sharePct}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold tabular-nums">
                          {formatEtb(d.revenue)}
                        </p>
                        <p className="text-[10px] text-muted-foreground tabular-nums">
                          {sharePct.toFixed(1)}% share
                        </p>
                      </div>
                    </button>
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

function RevenueCard({
  icon: Icon,
  tone,
  label,
  value,
  changePct,
  priorLabel,
}: {
  icon: React.ComponentType<{ className?: string }>;
  tone: "primary" | "green" | "blue";
  label: string;
  value: string;
  changePct?: number;
  priorLabel: string;
}) {
  const toneClass = {
    primary: "bg-primary/10 text-primary",
    green: "bg-green-500/10 text-green-500",
    blue: "bg-blue-500/10 text-blue-500",
  }[tone];

  const isPositive = changePct !== undefined && changePct > 0;
  const isNegative = changePct !== undefined && changePct < 0;
  const ChangeIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : null;

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
        <div className="flex items-center gap-1.5 mt-1.5">
          {ChangeIcon && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 text-[11px] font-semibold tabular-nums px-1 py-0.5 rounded",
                isPositive && "bg-green-500/10 text-green-500",
                isNegative && "bg-red-500/10 text-red-500",
              )}
            >
              <ChangeIcon className="h-2.5 w-2.5" />
              {Math.abs(changePct! * 100).toFixed(1)}%
            </span>
          )}
          <p className="text-[11px] text-muted-foreground truncate">{priorLabel}</p>
        </div>
      </CardContent>
    </Card>
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
  const [draftRange, setDraftRange] = useState<DateRange | undefined>(customRange);

  const handleOpenChange = (next: boolean) => {
    if (next) setDraftRange(customRange);
    onOpenChange(next);
  };

  const isActive = preset === "custom" && customRange?.from && customRange?.to;

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
            isActive
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
          )}
        >
          <CalendarIcon className="h-3 w-3" />
          {isActive
            ? `${customRange!.from!.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${customRange!.to!.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
            : "Custom"}
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
        <div className="flex items-center justify-end gap-1.5 p-3 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDraftRange(undefined)}
            disabled={!draftRange?.from}
          >
            Clear
          </Button>
          <Button
            size="sm"
            onClick={() => draftRange?.from && draftRange?.to && onApply(draftRange)}
            disabled={!draftRange?.from || !draftRange?.to}
          >
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
