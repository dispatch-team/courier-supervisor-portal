import type { Driver, Shipment } from "@/types/api";
import type { FleetMetrics } from "@/lib/fleet-metrics";
import { formatDuration } from "@/lib/driver-metrics";

export interface OperationsReportContext {
  fleet: FleetMetrics;
  drivers: Driver[];
  shipments: Shipment[];
  rangeStart: Date;
  rangeEnd: Date;
  companyName?: string;
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function fmtFileDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function pct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

function fmtHour(h: number): string {
  const ampm = h < 12 ? "AM" : "PM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:00 ${ampm}`;
}

// ─── Summary rows ──────────────────────────────────────────────────────────────

function buildSummaryRows(ctx: OperationsReportContext): string[][] {
  const { fleet, shipments, drivers } = ctx;
  const totalDrivers = drivers.length;
  const inactiveDrivers = drivers.filter((d) => d.status !== "active").length;

  const delivered = shipments.filter((s) => s.status === "delivered").length;
  const failed = shipments.filter((s) => s.status === "failed").length;
  const cancelled = shipments.filter((s) => s.status === "cancelled").length;
  const returned = shipments.filter((s) => s.status === "returned").length;
  const inProgress = shipments.filter((s) =>
    ["assigned_to_driver", "picked_up", "in_transit"].includes(s.status),
  ).length;
  const completed = delivered + failed + returned;
  const successRate = completed > 0 ? pct(delivered / completed) : "—";

  // Avg pickup-to-delivery time
  const deliveryTimes = shipments
    .filter((s) => s.status === "delivered")
    .map((s) => {
      if (!s.picked_up_at || !s.delivered_at) return null;
      return new Date(s.delivered_at).getTime() - new Date(s.picked_up_at).getTime();
    })
    .filter((v): v is number => v !== null && v > 0);
  const avgMs =
    deliveryTimes.length > 0
      ? deliveryTimes.reduce((a, b) => a + b, 0) / deliveryTimes.length
      : null;

  return [
    ["Report Period", `${fmtDate(ctx.rangeStart)} – ${fmtDate(ctx.rangeEnd)}`],
    ["Generated", fmtDate(new Date())],
    ["", ""],
    ["--- Fleet ---", ""],
    ["Total Drivers (Registered)", String(totalDrivers)],
    ["Active Drivers", String(fleet.totalActiveDrivers)],
    ["Inactive / Pending", String(inactiveDrivers)],
    ["Currently On Delivery", String(fleet.onDelivery)],
    ["Idle (Available)", String(fleet.idle)],
    ["Utilization Rate", pct(fleet.utilizationRate)],
    ["Capacity Risk", fleet.capacityRisk.charAt(0).toUpperCase() + fleet.capacityRisk.slice(1)],
    ["Avg Shipments per Driver", fleet.avgWorkload.toFixed(1)],
    ["", ""],
    ["--- Deliveries ---", ""],
    ["Total Shipments in Period", String(shipments.length)],
    ["Delivered", String(delivered)],
    ["In Progress", String(inProgress)],
    ["Failed", String(failed)],
    ["Cancelled", String(cancelled)],
    ["Returned", String(returned)],
    ["Overall Success Rate", successRate],
    ["Avg Pickup-to-Delivery Time", formatDuration(avgMs)],
  ];
}

// ─── Vehicle type breakdown ────────────────────────────────────────────────────

function buildVehicleRows(drivers: Driver[]): string[][] {
  const counts = new Map<string, number>();
  for (const d of drivers) {
    const vt = d.vehicle_type || "Unknown";
    counts.set(vt, (counts.get(vt) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => [type, String(count), `${((count / drivers.length) * 100).toFixed(1)}%`]);
}

// ─── Per-driver performance ───────────────────────────────────────────────────

function buildDriverPerformanceRows(ctx: OperationsReportContext): (string | number)[][] {
  const { fleet, shipments } = ctx;

  // Build per-driver shipment data from the full shipment list
  const driverMap = new Map(ctx.drivers.map((d) => [d.id, d]));
  const statsMap = new Map<number, { delivered: number; failed: number; cancelled: number; returned: number; inProgress: number; timesMs: number[] }>();

  for (const s of shipments) {
    if (s.assigned_driver_id == null) continue;
    const e = statsMap.get(s.assigned_driver_id) ?? { delivered: 0, failed: 0, cancelled: 0, returned: 0, inProgress: 0, timesMs: [] };
    if (s.status === "delivered") {
      e.delivered++;
      if (s.picked_up_at && s.delivered_at) {
        const ms = new Date(s.delivered_at).getTime() - new Date(s.picked_up_at).getTime();
        if (ms > 0) e.timesMs.push(ms);
      }
    } else if (s.status === "failed") e.failed++;
    else if (s.status === "cancelled") e.cancelled++;
    else if (s.status === "returned") e.returned++;
    else if (["assigned_to_driver", "picked_up", "in_transit"].includes(s.status)) e.inProgress++;
    statsMap.set(s.assigned_driver_id, e);
  }

  // Also pull in active drivers with zero activity from fleet.workload
  for (const w of fleet.workload) {
    if (!statsMap.has(w.driver.id)) {
      statsMap.set(w.driver.id, { delivered: 0, failed: 0, cancelled: 0, returned: 0, inProgress: 0, timesMs: [] });
    }
  }

  return Array.from(statsMap.entries())
    .map(([id, s]) => {
      const d = driverMap.get(id);
      const name = d ? `${d.first_name} ${d.last_name}` : `Driver #${id}`;
      const vehicle = d?.vehicle_type || "—";
      const completed = s.delivered + s.failed + s.returned;
      const successRate = completed > 0 ? `${((s.delivered / completed) * 100).toFixed(1)}%` : "—";
      const avgTime = s.timesMs.length > 0
        ? formatDuration(s.timesMs.reduce((a, b) => a + b, 0) / s.timesMs.length)
        : "—";
      const rating = d && d.rating_aggregate > 0
        ? (d.rating_aggregate / 2).toFixed(1)
        : "—";
      const status = d?.status ?? "—";
      return [name, vehicle, status, s.delivered, s.failed, s.cancelled, s.inProgress, successRate, avgTime, rating];
    })
    .sort((a, b) => (b[3] as number) - (a[3] as number));
}

// ─── Peak hours ───────────────────────────────────────────────────────────────

function buildPeakHourRows(ctx: OperationsReportContext): string[][] {
  return ctx.fleet.peakHours.map((ph) => [fmtHour(ph.hour), String(ph.count)]);
}

// ─── Workload distribution ────────────────────────────────────────────────────

function buildWorkloadRows(ctx: OperationsReportContext): (string | number)[][] {
  return ctx.fleet.workload.map((w) => {
    const d = w.driver;
    const name = `${d.first_name} ${d.last_name}`;
    const total = w.delivered + w.failed + w.inProgress;
    const successRate = total > 0 ? `${((w.delivered / total) * 100).toFixed(1)}%` : "—";
    return [name, d.vehicle_type || "—", w.delivered, w.failed, w.inProgress, w.total, successRate];
  });
}

// ─── PDF export ───────────────────────────────────────────────────────────────

export async function exportOperationsReportPdf(ctx: OperationsReportContext): Promise<void> {
  const [{ default: jsPDF }, autoTableModule] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  const autoTable = (autoTableModule.default ?? autoTableModule) as typeof autoTableModule.default;

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 40;
  const headStyles = {
    fillColor: [20, 30, 48] as [number, number, number],
    textColor: 255 as number,
    fontStyle: "bold" as const,
  };

  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Operations Report", margin, 60);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(110);
  if (ctx.companyName) doc.text(ctx.companyName, margin, 80);
  doc.text(`${fmtDate(ctx.rangeStart)} – ${fmtDate(ctx.rangeEnd)}`, margin, ctx.companyName ? 96 : 80);
  doc.setTextColor(0);

  // Executive Summary
  autoTable(doc, {
    startY: 120,
    head: [["Metric", "Value"]],
    body: buildSummaryRows(ctx),
    theme: "striped",
    headStyles,
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 220 } },
    margin: { left: margin, right: margin },
  });

  // Driver Performance Table
  const driverRows = buildDriverPerformanceRows(ctx);
  if (driverRows.length > 0) {
    autoTable(doc, {
      head: [["Driver", "Vehicle", "Status", "Delivered", "Failed", "Cancelled", "In Progress", "Success Rate", "Avg Time", "Rating"]],
      body: driverRows,
      theme: "striped",
      headStyles,
      columnStyles: {
        3: { halign: "right" },
        4: { halign: "right" },
        5: { halign: "right" },
        6: { halign: "right" },
        7: { halign: "right" },
        8: { halign: "right" },
        9: { halign: "right" },
      },
      margin: { left: margin, right: margin },
    });
  }

  // Vehicle Type Breakdown
  const vehicleRows = buildVehicleRows(ctx.drivers);
  if (vehicleRows.length > 0) {
    autoTable(doc, {
      head: [["Vehicle Type", "Drivers", "Share"]],
      body: vehicleRows,
      theme: "striped",
      headStyles,
      columnStyles: { 1: { halign: "right" }, 2: { halign: "right" } },
      margin: { left: margin, right: margin },
    });
  }

  // Workload Distribution
  const workloadRows = buildWorkloadRows(ctx);
  if (workloadRows.length > 0) {
    autoTable(doc, {
      head: [["Driver", "Vehicle", "Delivered", "Failed", "In Progress", "Total", "Success Rate"]],
      body: workloadRows,
      theme: "striped",
      headStyles,
      columnStyles: {
        2: { halign: "right" },
        3: { halign: "right" },
        4: { halign: "right" },
        5: { halign: "right" },
        6: { halign: "right" },
      },
      margin: { left: margin, right: margin },
    });
  }

  // Peak Hours
  const peakRows = buildPeakHourRows(ctx);
  if (peakRows.length > 0) {
    autoTable(doc, {
      head: [["Peak Hour", "Shipment Activity"]],
      body: peakRows,
      theme: "striped",
      headStyles,
      columnStyles: { 1: { halign: "right" } },
      margin: { left: margin, right: margin },
    });
  }

  // Underutilized / Overworked callout
  const alerts: string[][] = [];
  for (const d of ctx.fleet.overworked) {
    alerts.push([`${d.first_name} ${d.last_name}`, "Overworked", d.vehicle_type || "—"]);
  }
  for (const d of ctx.fleet.underutilized) {
    alerts.push([`${d.first_name} ${d.last_name}`, "Underutilized", d.vehicle_type || "—"]);
  }
  if (alerts.length > 0) {
    autoTable(doc, {
      head: [["Driver", "Flag", "Vehicle"]],
      body: alerts,
      theme: "striped",
      headStyles: { ...headStyles, fillColor: [120, 40, 40] as [number, number, number] },
      margin: { left: margin, right: margin },
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() - margin,
      doc.internal.pageSize.getHeight() - 20,
      { align: "right" },
    );
    doc.text("Dispatch — Courier Supervisor Portal", margin, doc.internal.pageSize.getHeight() - 20);
  }

  doc.save(`operations-${fmtFileDate(ctx.rangeStart)}_${fmtFileDate(ctx.rangeEnd)}.pdf`);
}

// ─── Excel export ─────────────────────────────────────────────────────────────

export async function exportOperationsReportExcel(ctx: OperationsReportContext): Promise<void> {
  const XLSX = await import("xlsx");
  const wb = XLSX.utils.book_new();

  // Summary sheet
  const summaryData = [
    ["Operations Report"],
    ...(ctx.companyName ? [[ctx.companyName]] : []),
    [],
    ...buildSummaryRows(ctx),
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  summarySheet["!cols"] = [{ wch: 32 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");

  // Driver Performance sheet
  const driverRows = buildDriverPerformanceRows(ctx);
  if (driverRows.length > 0) {
    const driverSheet = XLSX.utils.aoa_to_sheet([
      ["Driver", "Vehicle", "Status", "Delivered", "Failed", "Cancelled", "In Progress", "Success Rate", "Avg Delivery Time", "Rating (/ 5)"],
      ...driverRows,
    ]);
    driverSheet["!cols"] = [
      { wch: 24 }, { wch: 14 }, { wch: 10 }, { wch: 10 }, { wch: 8 },
      { wch: 10 }, { wch: 12 }, { wch: 14 }, { wch: 18 }, { wch: 12 },
    ];
    XLSX.utils.book_append_sheet(wb, driverSheet, "Driver Performance");
  }

  // Fleet Utilization sheet
  const workloadRows = buildWorkloadRows(ctx);
  if (workloadRows.length > 0) {
    const fleetSheet = XLSX.utils.aoa_to_sheet([
      ["Driver", "Vehicle", "Delivered", "Failed", "In Progress", "Total Assigned", "Success Rate"],
      ...workloadRows,
    ]);
    fleetSheet["!cols"] = [
      { wch: 24 }, { wch: 14 }, { wch: 10 }, { wch: 8 }, { wch: 12 }, { wch: 15 }, { wch: 14 },
    ];
    XLSX.utils.book_append_sheet(wb, fleetSheet, "Fleet Utilization");
  }

  // Vehicle Types sheet
  const vehicleRows = buildVehicleRows(ctx.drivers);
  if (vehicleRows.length > 0) {
    const vehicleSheet = XLSX.utils.aoa_to_sheet([
      ["Vehicle Type", "Driver Count", "Share"],
      ...vehicleRows,
    ]);
    vehicleSheet["!cols"] = [{ wch: 18 }, { wch: 14 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, vehicleSheet, "Vehicle Types");
  }

  // Alerts sheet (overworked / underutilized)
  const alerts: string[][] = [];
  for (const d of ctx.fleet.overworked) {
    alerts.push([`${d.first_name} ${d.last_name}`, "Overworked", d.vehicle_type || "—", d.email]);
  }
  for (const d of ctx.fleet.underutilized) {
    alerts.push([`${d.first_name} ${d.last_name}`, "Underutilized", d.vehicle_type || "—", d.email]);
  }
  if (alerts.length > 0) {
    const alertSheet = XLSX.utils.aoa_to_sheet([
      ["Driver", "Flag", "Vehicle", "Email"],
      ...alerts,
    ]);
    alertSheet["!cols"] = [{ wch: 24 }, { wch: 14 }, { wch: 14 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, alertSheet, "Workload Alerts");
  }

  XLSX.writeFile(wb, `operations-${fmtFileDate(ctx.rangeStart)}_${fmtFileDate(ctx.rangeEnd)}.xlsx`);
}
