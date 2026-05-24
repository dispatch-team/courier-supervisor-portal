import type { Driver, Shipment } from "@/types/api";
import type { RevenueMetrics } from "@/lib/revenue-metrics";
import { formatEtb } from "@/lib/revenue-metrics";

export interface ReportContext {
  metrics: RevenueMetrics;
  rangeStart: Date;
  rangeEnd: Date;
  companyName?: string;
  shipments?: Shipment[];
  drivers?: Driver[];
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function fmtFileDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function pctStr(n: number): string {
  const sign = n > 0 ? "+" : "";
  return `${sign}${(n * 100).toFixed(1)}%`;
}

function buildSummaryRows(ctx: ReportContext): string[][] {
  const delivered = (ctx.shipments ?? []).filter((s) => s.status === "delivered");
  const failed = (ctx.shipments ?? []).filter((s) => s.status === "failed");
  const cancelled = (ctx.shipments ?? []).filter((s) => s.status === "cancelled");
  const returned = (ctx.shipments ?? []).filter((s) => s.status === "returned");

  return [
    ["Report Period", `${fmtDate(ctx.rangeStart)} – ${fmtDate(ctx.rangeEnd)}`],
    ["Generated", fmtDate(new Date())],
    ["", ""],
    ["--- Revenue ---", ""],
    ["Total Revenue", formatEtb(ctx.metrics.totalRevenue)],
    ["Average per Delivery", formatEtb(ctx.metrics.avgPerDelivery)],
    ["Revenue vs Prior Period", pctStr(ctx.metrics.revenueChangePct)],
    ["", ""],
    ["--- Deliveries ---", ""],
    ["Total Deliveries", String(ctx.metrics.deliveredCount)],
    ["Deliveries vs Prior Period", pctStr(ctx.metrics.deliveriesChangePct)],
    ...(ctx.shipments
      ? [
          ["Failed", String(failed.length)],
          ["Cancelled", String(cancelled.length)],
          ["Returned", String(returned.length)],
          ["Total Shipments in Period", String(ctx.shipments.length)],
          [
            "Success Rate",
            ctx.shipments.length > 0
              ? `${((delivered.length / ctx.shipments.length) * 100).toFixed(1)}%`
              : "—",
          ],
        ]
      : []),
  ];
}

function buildDriverRows(ctx: ReportContext): (string | number)[][] {
  const driverMap = new Map((ctx.drivers ?? []).map((d) => [d.id, d]));
  const shipments = ctx.shipments ?? [];

  const stats = new Map<
    number,
    { revenue: number; delivered: number; failed: number; cancelled: number }
  >();

  for (const s of shipments) {
    if (s.assigned_driver_id == null) continue;
    const e = stats.get(s.assigned_driver_id) ?? { revenue: 0, delivered: 0, failed: 0, cancelled: 0 };
    if (s.status === "delivered") { e.revenue += s.total_fee ?? 0; e.delivered++; }
    else if (s.status === "failed") e.failed++;
    else if (s.status === "cancelled") e.cancelled++;
    stats.set(s.assigned_driver_id, e);
  }

  return Array.from(stats.entries())
    .map(([id, s]) => {
      const d = driverMap.get(id);
      const name = d ? `${d.first_name} ${d.last_name}` : `Driver #${id}`;
      const total = s.delivered + s.failed + s.cancelled;
      const successRate = total > 0 ? `${((s.delivered / total) * 100).toFixed(1)}%` : "—";
      const avgFee = s.delivered > 0 ? formatEtb(s.revenue / s.delivered) : "—";
      const share =
        ctx.metrics.totalRevenue > 0
          ? `${((s.revenue / ctx.metrics.totalRevenue) * 100).toFixed(1)}%`
          : "—";
      return [name, s.delivered, s.failed, s.cancelled, formatEtb(s.revenue), avgFee, share, successRate];
    })
    .sort((a, b) => (b[4] as string).localeCompare(a[4] as string));
}

function buildShipmentRows(ctx: ReportContext): string[][] {
  const driverMap = new Map((ctx.drivers ?? []).map((d) => [d.id, d]));
  return (ctx.shipments ?? [])
    .filter((s) => s.status === "delivered")
    .sort((a, b) => (b.delivered_at ?? "").localeCompare(a.delivered_at ?? ""))
    .map((s) => {
      const d = s.assigned_driver_id != null ? driverMap.get(s.assigned_driver_id) : null;
      const driverName = d ? `${d.first_name} ${d.last_name}` : "—";
      const date = s.delivered_at ? fmtDate(new Date(s.delivered_at)) : "—";
      return [s.code, driverName, s.description ?? "—", formatEtb(s.total_fee ?? 0), date];
    });
}

// ─── PDF ─────────────────────────────────────────────────────────────────────

export async function exportRevenueReportPdf(ctx: ReportContext): Promise<void> {
  const [{ default: jsPDF }, autoTableModule] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  const autoTable = (autoTableModule.default ?? autoTableModule) as typeof autoTableModule.default;

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 40;
  const headStyles = { fillColor: [30, 30, 40] as [number, number, number], textColor: 255 as number, fontStyle: "bold" as const };

  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Revenue Report", margin, 60);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(110);
  if (ctx.companyName) doc.text(ctx.companyName, margin, 80);
  doc.text(`${fmtDate(ctx.rangeStart)} – ${fmtDate(ctx.rangeEnd)}`, margin, ctx.companyName ? 96 : 80);
  doc.setTextColor(0);

  // Summary
  autoTable(doc, {
    startY: 120,
    head: [["Metric", "Value"]],
    body: buildSummaryRows(ctx),
    theme: "striped",
    headStyles,
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 220 } },
    margin: { left: margin, right: margin },
  });

  // Driver breakdown
  const driverRows = buildDriverRows(ctx);
  if (driverRows.length > 0) {
    autoTable(doc, {
      head: [["Driver", "Delivered", "Failed", "Cancelled", "Revenue", "Avg/Delivery", "Share", "Success Rate"]],
      body: driverRows,
      theme: "striped",
      headStyles,
      columnStyles: {
        1: { halign: "right" },
        2: { halign: "right" },
        3: { halign: "right" },
        4: { halign: "right" },
        5: { halign: "right" },
        6: { halign: "right" },
        7: { halign: "right" },
      },
      margin: { left: margin, right: margin },
    });
  }

  // Daily revenue (non-zero)
  const nonZeroDays = ctx.metrics.dailyRevenue.filter((d) => d.count > 0);
  if (nonZeroDays.length > 0) {
    autoTable(doc, {
      head: [["Date", "Deliveries", "Revenue"]],
      body: nonZeroDays.map((d) => [d.date, String(d.count), formatEtb(d.revenue)]),
      theme: "striped",
      headStyles,
      columnStyles: { 1: { halign: "right" }, 2: { halign: "right" } },
      margin: { left: margin, right: margin },
    });
  }

  // Individual shipments
  const shipmentRows = buildShipmentRows(ctx);
  if (shipmentRows.length > 0) {
    autoTable(doc, {
      head: [["Shipment Code", "Driver", "Description", "Fee", "Delivered At"]],
      body: shipmentRows,
      theme: "striped",
      headStyles,
      columnStyles: { 3: { halign: "right" } },
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

  doc.save(`revenue-${fmtFileDate(ctx.rangeStart)}_${fmtFileDate(ctx.rangeEnd)}.pdf`);
}

// ─── Excel ───────────────────────────────────────────────────────────────────

export async function exportRevenueReportExcel(ctx: ReportContext): Promise<void> {
  const XLSX = await import("xlsx");
  const wb = XLSX.utils.book_new();

  // Summary sheet
  const summarySheet = XLSX.utils.aoa_to_sheet([
    ["Revenue Report"],
    ...(ctx.companyName ? [[ctx.companyName]] : []),
    [],
    ...buildSummaryRows(ctx),
  ]);
  summarySheet["!cols"] = [{ wch: 30 }, { wch: 24 }];
  XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");

  // Driver breakdown sheet
  const driverRows = buildDriverRows(ctx);
  if (driverRows.length > 0) {
    const driverSheet = XLSX.utils.aoa_to_sheet([
      ["Driver", "Delivered", "Failed", "Cancelled", "Revenue (ETB)", "Avg per Delivery", "Revenue Share", "Success Rate"],
      ...driverRows,
    ]);
    driverSheet["!cols"] = [
      { wch: 24 }, { wch: 10 }, { wch: 8 }, { wch: 10 },
      { wch: 14 }, { wch: 16 }, { wch: 14 }, { wch: 13 },
    ];
    XLSX.utils.book_append_sheet(wb, driverSheet, "Driver Breakdown");
  }

  // Daily revenue sheet
  if (ctx.metrics.dailyRevenue.length > 0) {
    const dailySheet = XLSX.utils.aoa_to_sheet([
      ["Date", "Deliveries", "Revenue (ETB)"],
      ...ctx.metrics.dailyRevenue.map((d) => [d.date, d.count, d.revenue]),
    ]);
    dailySheet["!cols"] = [{ wch: 14 }, { wch: 12 }, { wch: 14 }];
    XLSX.utils.book_append_sheet(wb, dailySheet, "Daily Revenue");
  }

  // Individual shipments sheet
  const driverMap = new Map((ctx.drivers ?? []).map((d) => [d.id, d]));
  const allShipments = ctx.shipments ?? [];
  if (allShipments.length > 0) {
    const rows = allShipments
      .sort((a, b) => (b.delivered_at ?? b.created_at ?? "").localeCompare(a.delivered_at ?? a.created_at ?? ""))
      .map((s) => {
        const d = s.assigned_driver_id != null ? driverMap.get(s.assigned_driver_id) : null;
        return [
          s.code,
          s.status,
          d ? `${d.first_name} ${d.last_name}` : "—",
          s.description ?? "—",
          s.total_fee ?? 0,
          s.weight_kg ?? "—",
          s.start_address ?? "—",
          s.end_address ?? "—",
          s.delivered_at ? new Date(s.delivered_at).toLocaleDateString("en-US") : "—",
          s.created_at ? new Date(s.created_at).toLocaleDateString("en-US") : "—",
        ];
      });

    const shipmentSheet = XLSX.utils.aoa_to_sheet([
      ["Code", "Status", "Driver", "Description", "Fee (ETB)", "Weight (kg)", "From", "To", "Delivered At", "Created At"],
      ...rows,
    ]);
    shipmentSheet["!cols"] = [
      { wch: 16 }, { wch: 14 }, { wch: 22 }, { wch: 24 },
      { wch: 12 }, { wch: 11 }, { wch: 28 }, { wch: 28 },
      { wch: 14 }, { wch: 14 },
    ];
    XLSX.utils.book_append_sheet(wb, shipmentSheet, "Shipments");
  }

  XLSX.writeFile(wb, `revenue-${fmtFileDate(ctx.rangeStart)}_${fmtFileDate(ctx.rangeEnd)}.xlsx`);
}
