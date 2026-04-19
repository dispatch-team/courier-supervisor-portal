import type { Shipment } from "@/types/api";

export interface DriverMetrics {
  total: number;
  delivered: number;
  failed: number;
  cancelled: number;
  returned: number;
  inProgress: number;
  successRate: number; // delivered / (delivered + failed + returned)
  failureRate: number; // failed / (delivered + failed + returned)
  avgPickupToDeliveryMs: number | null;
  deliveriesPerDay: number;
  failureReasons: { reason: string; count: number }[];
  dailyVolume: { date: string; delivered: number; failed: number }[];
  avgRating: number | null;
}

function msBetween(a: string | null, b: string | null): number | null {
  if (!a || !b) return null;
  return new Date(b).getTime() - new Date(a).getTime();
}

function toDateKey(iso: string): string {
  return iso.slice(0, 10); // YYYY-MM-DD
}

export function computeDriverMetrics(
  shipments: Shipment[],
  rangeStart: Date,
  rangeEnd: Date,
): DriverMetrics {
  const delivered = shipments.filter((s) => s.status === "delivered");
  const failed = shipments.filter((s) => s.status === "failed");
  const cancelled = shipments.filter((s) => s.status === "cancelled");
  const returned = shipments.filter((s) => s.status === "returned");
  const inProgress = shipments.filter((s) =>
    ["assigned_to_driver", "picked_up", "in_transit"].includes(s.status),
  );

  const completedAttempts = delivered.length + failed.length + returned.length;
  const successRate = completedAttempts > 0 ? delivered.length / completedAttempts : 0;
  const failureRate = completedAttempts > 0 ? failed.length / completedAttempts : 0;

  // Average pickup-to-delivery time
  const deliveryTimes = delivered
    .map((s) => msBetween(s.picked_up_at, s.delivered_at))
    .filter((v): v is number => v !== null && v > 0);
  const avgPickupToDeliveryMs =
    deliveryTimes.length > 0
      ? deliveryTimes.reduce((a, b) => a + b, 0) / deliveryTimes.length
      : null;

  // Deliveries per day (based on range)
  const daysInRange = Math.max(
    1,
    Math.ceil((rangeEnd.getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24)),
  );
  const deliveriesPerDay = delivered.length / daysInRange;

  // Failure reasons (bucket by remark)
  const reasonCounts = new Map<string, number>();
  for (const s of failed) {
    const reason = (s.remark ?? "").trim() || "Unspecified";
    reasonCounts.set(reason, (reasonCounts.get(reason) ?? 0) + 1);
  }
  const failureReasons = Array.from(reasonCounts.entries())
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count);

  // Daily volume — zero-fill across the entire range so the chart is a real time series
  const dailyMap = new Map<string, { delivered: number; failed: number }>();
  const cursor = new Date(rangeStart);
  cursor.setHours(0, 0, 0, 0);
  const stop = new Date(rangeEnd);
  stop.setHours(0, 0, 0, 0);
  while (cursor <= stop) {
    dailyMap.set(toDateKey(cursor.toISOString()), { delivered: 0, failed: 0 });
    cursor.setDate(cursor.getDate() + 1);
  }
  for (const s of delivered) {
    if (!s.delivered_at) continue;
    const key = toDateKey(s.delivered_at);
    const entry = dailyMap.get(key);
    if (entry) entry.delivered++;
  }
  for (const s of failed) {
    if (!s.failed_at) continue;
    const key = toDateKey(s.failed_at);
    const entry = dailyMap.get(key);
    if (entry) entry.failed++;
  }
  const dailyVolume = Array.from(dailyMap.entries())
    .map(([date, counts]) => ({ date, ...counts }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Average rating for delivered shipments
  const ratedDeliveries = delivered.filter((s) => s.rating > 0);
  const avgRating =
    ratedDeliveries.length > 0
      ? ratedDeliveries.reduce((sum, s) => sum + s.rating, 0) / ratedDeliveries.length
      : null;

  return {
    total: shipments.length,
    delivered: delivered.length,
    failed: failed.length,
    cancelled: cancelled.length,
    returned: returned.length,
    inProgress: inProgress.length,
    successRate,
    failureRate,
    avgPickupToDeliveryMs,
    deliveriesPerDay,
    failureReasons,
    dailyVolume,
    avgRating,
  };
}

export function formatDuration(ms: number | null): string {
  if (ms === null) return "—";
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
