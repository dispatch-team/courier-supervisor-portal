import type { Driver, Shipment } from "@/types/api";

export interface RevenueMetrics {
  totalRevenue: number;
  deliveredCount: number;
  avgPerDelivery: number;
  // Comparison vs prior period of equal length
  prior: {
    totalRevenue: number;
    deliveredCount: number;
  };
  revenueChangePct: number; // current vs prior, e.g. 0.12 = +12%
  deliveriesChangePct: number;
  // Daily revenue series across the current range (zero-filled)
  dailyRevenue: { date: string; revenue: number; count: number }[];
  // Top drivers by revenue contribution
  topDrivers: { driver: Driver; revenue: number; count: number }[];
}

function toDateKey(iso: string): string {
  return iso.slice(0, 10);
}

function getPriorPeriod(start: Date, end: Date): { priorStart: Date; priorEnd: Date } {
  const ms = end.getTime() - start.getTime();
  const priorEnd = new Date(start.getTime() - 1); // 1ms before current start
  const priorStart = new Date(priorEnd.getTime() - ms);
  return { priorStart, priorEnd };
}

function pctChange(current: number, prior: number): number {
  if (prior === 0) return current > 0 ? 1 : 0; // 100% if growing from zero
  return (current - prior) / prior;
}

export function isShipmentInRange(s: Shipment, start: Date, end: Date): boolean {
  if (!s.delivered_at) return false;
  const t = new Date(s.delivered_at).getTime();
  return t >= start.getTime() && t <= end.getTime();
}

export function computeRevenueMetrics(
  drivers: Driver[],
  currentShipments: Shipment[],
  priorShipments: Shipment[],
  rangeStart: Date,
  rangeEnd: Date,
): RevenueMetrics {
  const driverMap = new Map(drivers.map((d) => [d.id, d]));

  const currentDelivered = currentShipments.filter((s) => s.status === "delivered");
  const priorDelivered = priorShipments.filter((s) => s.status === "delivered");

  const totalRevenue = currentDelivered.reduce((sum, s) => sum + (s.total_fee ?? 0), 0);
  const priorRevenue = priorDelivered.reduce((sum, s) => sum + (s.total_fee ?? 0), 0);

  const deliveredCount = currentDelivered.length;
  const priorCount = priorDelivered.length;

  const avgPerDelivery = deliveredCount > 0 ? totalRevenue / deliveredCount : 0;

  // Daily revenue — zero-fill across the range
  const dailyMap = new Map<string, { revenue: number; count: number }>();
  const cursor = new Date(rangeStart);
  cursor.setUTCHours(0, 0, 0, 0);
  const stop = new Date(rangeEnd);
  stop.setUTCHours(0, 0, 0, 0);
  while (cursor <= stop) {
    dailyMap.set(toDateKey(cursor.toISOString()), { revenue: 0, count: 0 });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  for (const s of currentDelivered) {
    if (!s.delivered_at) continue;
    const key = toDateKey(s.delivered_at);
    const entry = dailyMap.get(key);
    if (!entry) continue;
    entry.revenue += s.total_fee ?? 0;
    entry.count++;
  }
  const dailyRevenue = Array.from(dailyMap.entries())
    .map(([date, v]) => ({ date, ...v }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Top drivers by revenue
  const driverRevenueMap = new Map<number, { revenue: number; count: number }>();
  for (const s of currentDelivered) {
    if (s.assigned_driver_id == null) continue;
    const entry = driverRevenueMap.get(s.assigned_driver_id) ?? { revenue: 0, count: 0 };
    entry.revenue += s.total_fee ?? 0;
    entry.count++;
    driverRevenueMap.set(s.assigned_driver_id, entry);
  }
  const topDrivers = Array.from(driverRevenueMap.entries())
    .map(([id, v]) => ({ driver: driverMap.get(id), ...v }))
    .filter((d): d is { driver: Driver; revenue: number; count: number } => !!d.driver)
    .sort((a, b) => b.revenue - a.revenue);

  return {
    totalRevenue,
    deliveredCount,
    avgPerDelivery,
    prior: { totalRevenue: priorRevenue, deliveredCount: priorCount },
    revenueChangePct: pctChange(totalRevenue, priorRevenue),
    deliveriesChangePct: pctChange(deliveredCount, priorCount),
    dailyRevenue,
    topDrivers,
  };
}

export function formatEtb(amount: number): string {
  return `ETB ${amount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}
