import type { Driver, Shipment } from "@/types/api";

export interface DriverWorkload {
  driver: Driver;
  delivered: number;
  failed: number;
  inProgress: number;
  total: number;
}

export interface FleetMetrics {
  // Headline
  totalActiveDrivers: number;
  onDelivery: number; // active drivers with at least 1 in-progress shipment
  idle: number; // active drivers - onDelivery
  totalShipments: number;
  totalDelivered: number;

  // Distribution
  workload: DriverWorkload[]; // sorted desc by delivered + inProgress
  hourlyActivity: { hour: number; count: number }[]; // 0..23

  // Insights
  underutilized: Driver[]; // active, well below avg workload
  overworked: Driver[]; // active, well above avg workload
  peakHours: { hour: number; count: number }[]; // top 1-3 busiest hour windows
  capacityRisk: "low" | "moderate" | "high"; // overall fleet pressure
  utilizationRate: number; // onDelivery / totalActiveDrivers (0..1)

  // Stats used for context
  avgWorkload: number;
}

const IN_PROGRESS_STATUSES = ["assigned_to_driver", "picked_up", "in_transit"];

export function computeFleetMetrics(
  drivers: Driver[],
  shipments: Shipment[],
): FleetMetrics {
  const activeDrivers = drivers.filter((d) => d.status === "active");
  const totalActiveDrivers = activeDrivers.length;

  // Build per-driver workload from shipments
  const workloadMap = new Map<number, DriverWorkload>();
  for (const d of activeDrivers) {
    workloadMap.set(d.id, {
      driver: d,
      delivered: 0,
      failed: 0,
      inProgress: 0,
      total: 0,
    });
  }

  for (const s of shipments) {
    if (s.assigned_driver_id == null) continue;
    const wl = workloadMap.get(s.assigned_driver_id);
    if (!wl) continue; // shipment assigned to non-active driver — skip
    wl.total++;
    if (s.status === "delivered") wl.delivered++;
    else if (s.status === "failed") wl.failed++;
    else if (IN_PROGRESS_STATUSES.includes(s.status)) wl.inProgress++;
  }

  const workload = Array.from(workloadMap.values()).sort(
    (a, b) => b.delivered + b.inProgress - (a.delivered + a.inProgress),
  );

  // Currently on delivery = drivers with at least one in-progress shipment
  const onDelivery = workload.filter((w) => w.inProgress > 0).length;
  const idle = Math.max(0, totalActiveDrivers - onDelivery);

  const totalShipments = shipments.length;
  const totalDelivered = shipments.filter((s) => s.status === "delivered").length;

  // Hourly activity (peak hours) — based on picked_up_at OR delivered_at OR created_at
  const hourlyMap = new Map<number, number>();
  for (let h = 0; h < 24; h++) hourlyMap.set(h, 0);
  for (const s of shipments) {
    const stamp = s.picked_up_at ?? s.delivered_at ?? s.created_at;
    if (!stamp) continue;
    const hour = new Date(stamp).getHours();
    hourlyMap.set(hour, (hourlyMap.get(hour) ?? 0) + 1);
  }
  const hourlyActivity = Array.from(hourlyMap.entries()).map(([hour, count]) => ({
    hour,
    count,
  }));

  // Workload imbalance — flag drivers >1.5x avg as overworked, <0.5x avg (and active) as underutilized
  const totalEffectiveWorkload = workload.reduce(
    (sum, w) => sum + w.delivered + w.inProgress,
    0,
  );
  const avgWorkload =
    totalActiveDrivers > 0 ? totalEffectiveWorkload / totalActiveDrivers : 0;

  const underutilized: Driver[] = [];
  const overworked: Driver[] = [];

  if (avgWorkload >= 1) {
    for (const w of workload) {
      const score = w.delivered + w.inProgress;
      if (score >= avgWorkload * 1.5 && score >= 2) overworked.push(w.driver);
      else if (score <= avgWorkload * 0.5) underutilized.push(w.driver);
    }
  }

  // Peak hours — top 3 hours by activity, only if they have meaningful volume
  // (≥ avg + 1 to avoid recommending a "peak" when activity is uniformly tiny)
  const totalHourly = hourlyActivity.reduce((s, h) => s + h.count, 0);
  const avgHourly = totalHourly / 24;
  const peakHours = [...hourlyActivity]
    .filter((h) => h.count > avgHourly && h.count >= 2)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .sort((a, b) => a.hour - b.hour);

  // Utilization rate + capacity risk
  const utilizationRate =
    totalActiveDrivers > 0 ? onDelivery / totalActiveDrivers : 0;
  let capacityRisk: "low" | "moderate" | "high" = "low";
  if (utilizationRate >= 0.85) capacityRisk = "high";
  else if (utilizationRate >= 0.6) capacityRisk = "moderate";

  return {
    totalActiveDrivers,
    onDelivery,
    idle,
    totalShipments,
    totalDelivered,
    workload,
    hourlyActivity,
    underutilized,
    overworked,
    peakHours,
    capacityRisk,
    utilizationRate,
    avgWorkload,
  };
}
