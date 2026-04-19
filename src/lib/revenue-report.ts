import type { RevenueMetrics } from "@/lib/revenue-metrics";
import { formatEtb } from "@/lib/revenue-metrics";

interface ReportContext {
  metrics: RevenueMetrics;
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

function pctStr(n: number): string {
  const sign = n > 0 ? "+" : "";
  return `${sign}${(n * 100).toFixed(1)}%`;
}

function buildSummaryRows(ctx: ReportContext): string[][] {
  return [
    ["Report Period", `${fmtDate(ctx.rangeStart)} – ${fmtDate(ctx.rangeEnd)}`],
    ["Generated", fmtDate(new Date())],
    ["Total Revenue", formatEtb(ctx.metrics.totalRevenue)],
    ["Total Deliveries", String(ctx.metrics.deliveredCount)],
    ["Average per Delivery", formatEtb(ctx.metrics.avgPerDelivery)],
    ["Revenue vs Prior Period", pctStr(ctx.metrics.revenueChangePct)],
    ["Deliveries vs Prior Period", pctStr(ctx.metrics.deliveriesChangePct)],
  ];
}

export async function exportRevenueReportPdf(ctx: ReportContext): Promise<void> {
  const [{ default: jsPDF }, autoTableModule] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  const autoTable = (autoTableModule.default ?? autoTableModule) as typeof autoTableModule.default;

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 40;

  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Revenue Report", margin, 60);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(110);
  if (ctx.companyName) doc.text(ctx.companyName, margin, 80);
  doc.text(`${fmtDate(ctx.rangeStart)} – ${fmtDate(ctx.rangeEnd)}`, margin, 96);
  doc.setTextColor(0);

  // Summary
  autoTable(doc, {
    startY: 120,
    head: [["Summary", ""]],
    body: buildSummaryRows(ctx),
    theme: "striped",
    headStyles: { fillColor: [30, 30, 40], textColor: 255, fontStyle: "bold" },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 200 } },
    margin: { left: margin, right: margin },
  });

  // Top drivers
  if (ctx.metrics.topDrivers.length > 0) {
    autoTable(doc, {
      head: [["Driver", "Deliveries", "Revenue", "Share"]],
      body: ctx.metrics.topDrivers.map((d) => [
        `${d.driver.first_name} ${d.driver.last_name}`,
        String(d.count),
        formatEtb(d.revenue),
        ctx.metrics.totalRevenue > 0
          ? `${((d.revenue / ctx.metrics.totalRevenue) * 100).toFixed(1)}%`
          : "—",
      ]),
      theme: "striped",
      headStyles: { fillColor: [30, 30, 40], textColor: 255, fontStyle: "bold" },
      columnStyles: {
        1: { halign: "right" },
        2: { halign: "right" },
        3: { halign: "right" },
      },
      margin: { left: margin, right: margin },
    });
  }

  // Daily revenue (only non-zero days)
  const nonZeroDays = ctx.metrics.dailyRevenue.filter((d) => d.count > 0);
  if (nonZeroDays.length > 0) {
    autoTable(doc, {
      head: [["Date", "Deliveries", "Revenue"]],
      body: nonZeroDays.map((d) => [d.date, String(d.count), formatEtb(d.revenue)]),
      theme: "striped",
      headStyles: { fillColor: [30, 30, 40], textColor: 255, fontStyle: "bold" },
      columnStyles: { 1: { halign: "right" }, 2: { halign: "right" } },
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
    doc.text(
      "Dispatch — Courier Supervisor Portal",
      margin,
      doc.internal.pageSize.getHeight() - 20,
    );
  }

  const filename = `revenue-${fmtFileDate(ctx.rangeStart)}_${fmtFileDate(ctx.rangeEnd)}.pdf`;
  doc.save(filename);
}

export async function exportRevenueReportExcel(ctx: ReportContext): Promise<void> {
  const XLSX = await import("xlsx");
  const wb = XLSX.utils.book_new();

  const summarySheet = XLSX.utils.aoa_to_sheet([
    ["Revenue Report"],
    ...(ctx.companyName ? [[ctx.companyName]] : []),
    [],
    ...buildSummaryRows(ctx),
  ]);
  summarySheet["!cols"] = [{ wch: 30 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");

  if (ctx.metrics.topDrivers.length > 0) {
    const driverSheet = XLSX.utils.aoa_to_sheet([
      ["Driver", "Deliveries", "Revenue (ETB)", "Share"],
      ...ctx.metrics.topDrivers.map((d) => [
        `${d.driver.first_name} ${d.driver.last_name}`,
        d.count,
        d.revenue,
        ctx.metrics.totalRevenue > 0 ? d.revenue / ctx.metrics.totalRevenue : 0,
      ]),
    ]);
    driverSheet["!cols"] = [{ wch: 24 }, { wch: 12 }, { wch: 14 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, driverSheet, "Top Drivers");
  }

  if (ctx.metrics.dailyRevenue.length > 0) {
    const dailySheet = XLSX.utils.aoa_to_sheet([
      ["Date", "Deliveries", "Revenue (ETB)"],
      ...ctx.metrics.dailyRevenue.map((d) => [d.date, d.count, d.revenue]),
    ]);
    dailySheet["!cols"] = [{ wch: 14 }, { wch: 12 }, { wch: 14 }];
    XLSX.utils.book_append_sheet(wb, dailySheet, "Daily Revenue");
  }

  const filename = `revenue-${fmtFileDate(ctx.rangeStart)}_${fmtFileDate(ctx.rangeEnd)}.xlsx`;
  XLSX.writeFile(wb, filename);
}
