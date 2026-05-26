import type { Driver } from "@/types/api";
import type { DriverMetrics } from "@/lib/driver-metrics";
import { formatDuration } from "@/lib/driver-metrics";
import { drawPdfHeader } from "@/lib/report-utils";

export interface ReportContext {
  driver: Driver;
  metrics: DriverMetrics;
  rangeStart: Date;
  rangeEnd: Date;
  companyName?: string;
  companyWebsite?: string;
  companyLogo?: string;
}

function fullName(d: Driver): string {
  return [d.first_name, d.middle_name, d.last_name].filter(Boolean).join(" ");
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

function buildSummaryRows({ driver, metrics, rangeStart, rangeEnd }: ReportContext) {
  return [
    ["Driver", fullName(driver)],
    ["Email", driver.email],
    ["Phone", driver.phone_number],
    ["Status", driver.status],
    ["Report Period", `${fmtDate(rangeStart)} – ${fmtDate(rangeEnd)}`],
    ["Generated", fmtDate(new Date())],
  ];
}

function buildMetricRows({ metrics }: ReportContext) {
  return [
    ["Total Shipments", String(metrics.total)],
    ["Delivered", String(metrics.delivered)],
    ["Failed", String(metrics.failed)],
    ["Returned", String(metrics.returned)],
    ["Cancelled", String(metrics.cancelled)],
    ["In Progress", String(metrics.inProgress)],
    ["Success Rate", pct(metrics.successRate)],
    ["Failure Rate", pct(metrics.failureRate)],
    ["Avg Pickup to Delivery", formatDuration(metrics.avgPickupToDeliveryMs)],
    ["Daily Average", metrics.deliveriesPerDay.toFixed(2)],
    ["Avg Rating", metrics.avgRating !== null ? metrics.avgRating.toFixed(2) : "—"],
  ];
}

export async function exportDriverReportPdf(ctx: ReportContext): Promise<void> {
  const [{ default: jsPDF }, autoTableModule] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  const autoTable = (autoTableModule.default ?? autoTableModule) as typeof autoTableModule.default;

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 40;

  const startY = drawPdfHeader(doc, {
    title: "Driver Performance Report",
    subtitle: fullName(ctx.driver),
    dateRange: `${fmtDate(ctx.rangeStart)} – ${fmtDate(ctx.rangeEnd)}`,
    companyName: ctx.companyName,
    companyWebsite: ctx.companyWebsite,
    companyLogo: ctx.companyLogo,
    margin,
  });

  // Driver info table
  autoTable(doc, {
    startY,
    head: [["Driver Information", ""]],
    body: buildSummaryRows(ctx),
    theme: "striped",
    headStyles: { fillColor: [30, 30, 40], textColor: 255, fontStyle: "bold" },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 160 } },
    margin: { left: margin, right: margin },
  });

  // Metrics table
  autoTable(doc, {
    head: [["Performance Metric", "Value"]],
    body: buildMetricRows(ctx),
    theme: "striped",
    headStyles: { fillColor: [30, 30, 40], textColor: 255, fontStyle: "bold" },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 200 } },
    margin: { left: margin, right: margin },
  });

  // Failure reasons
  if (ctx.metrics.failureReasons.length > 0) {
    autoTable(doc, {
      head: [["Failure Reason", "Count", "Share"]],
      body: ctx.metrics.failureReasons.map((r) => [
        r.reason,
        String(r.count),
        ctx.metrics.failed > 0 ? pct(r.count / ctx.metrics.failed) : "—",
      ]),
      theme: "striped",
      headStyles: { fillColor: [185, 28, 28], textColor: 255, fontStyle: "bold" },
      columnStyles: { 1: { halign: "right" }, 2: { halign: "right" } },
      margin: { left: margin, right: margin },
    });
  }

  // Daily volume
  const nonZeroDays = ctx.metrics.dailyVolume.filter(
    (d) => d.delivered > 0 || d.failed > 0,
  );
  if (nonZeroDays.length > 0) {
    autoTable(doc, {
      head: [["Date", "Delivered", "Failed"]],
      body: nonZeroDays.map((d) => [d.date, String(d.delivered), String(d.failed)]),
      theme: "striped",
      headStyles: { fillColor: [30, 30, 40], textColor: 255, fontStyle: "bold" },
      columnStyles: { 1: { halign: "right" }, 2: { halign: "right" } },
      margin: { left: margin, right: margin },
    });
  }

  // Footer with page numbers
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
    doc.text(
      "Dispatch — Courier Supervisor Portal",
      margin,
      doc.internal.pageSize.getHeight() - 20,
    );
  }

  const filename = `driver-${ctx.driver.id}-performance-${fmtFileDate(ctx.rangeStart)}_${fmtFileDate(ctx.rangeEnd)}.pdf`;
  doc.save(filename);
}

export async function exportDriverReportExcel(ctx: ReportContext): Promise<void> {
  const XLSX = await import("xlsx");
  const wb = XLSX.utils.book_new();

  // Summary sheet — driver info + headline metrics
  const summarySheet = XLSX.utils.aoa_to_sheet([
    ["Driver Performance Report"],
    [],
    ...buildSummaryRows(ctx),
    [],
    ["Performance Metric", "Value"],
    ...buildMetricRows(ctx),
  ]);
  // Auto-width columns
  summarySheet["!cols"] = [{ wch: 30 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");

  // Daily volume sheet
  if (ctx.metrics.dailyVolume.length > 0) {
    const volumeSheet = XLSX.utils.aoa_to_sheet([
      ["Date", "Delivered", "Failed"],
      ...ctx.metrics.dailyVolume.map((d) => [d.date, d.delivered, d.failed]),
    ]);
    volumeSheet["!cols"] = [{ wch: 14 }, { wch: 12 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, volumeSheet, "Daily Volume");
  }

  // Failure reasons sheet
  if (ctx.metrics.failureReasons.length > 0) {
    const reasonSheet = XLSX.utils.aoa_to_sheet([
      ["Failure Reason", "Count", "Share"],
      ...ctx.metrics.failureReasons.map((r) => [
        r.reason,
        r.count,
        ctx.metrics.failed > 0 ? r.count / ctx.metrics.failed : 0,
      ]),
    ]);
    reasonSheet["!cols"] = [{ wch: 32 }, { wch: 10 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, reasonSheet, "Failure Reasons");
  }

  const filename = `driver-${ctx.driver.id}-performance-${fmtFileDate(ctx.rangeStart)}_${fmtFileDate(ctx.rangeEnd)}.xlsx`;
  XLSX.writeFile(wb, filename);
}
