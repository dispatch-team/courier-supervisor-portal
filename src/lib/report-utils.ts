export async function fetchLogoAsDataUrl(
  logoId: string,
  getToken: () => Promise<string | null>,
): Promise<string | null> {
  try {
    const token = await getToken();
    if (!token) return null;

    const res = await fetch(`/api/v1/couriers/logos/${encodeURIComponent(logoId)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) return null;

    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export function drawPdfHeader(
  doc: import("jspdf").jsPDF,
  opts: {
    title: string;
    subtitle?: string;
    dateRange: string;
    companyName?: string;
    companyWebsite?: string;
    companyLogo?: string;
    margin: number;
  },
): number {
  const { title, subtitle, dateRange, companyName, companyWebsite, companyLogo, margin } = opts;
  const pageWidth = doc.internal.pageSize.getWidth();
  const logoSize = 60;
  const rightX = pageWidth - margin;

  // Logo (top-right)
  if (companyLogo) {
    try {
      const fmt = companyLogo.includes("image/png") ? "PNG" : "JPEG";
      doc.addImage(companyLogo, fmt, rightX - logoSize, 24, logoSize, logoSize);
    } catch {
      // ignore if logo fails to render
    }
  }

  // Title
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.text(title, margin, 50);

  let y = 70;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(110);

  if (companyName) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(40);
    doc.text(companyName, margin, y);
    y += 16;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(110);
  }

  if (companyWebsite) {
    doc.text(companyWebsite, margin, y);
    y += 14;
  }

  if (subtitle) {
    doc.text(subtitle, margin, y);
    y += 14;
  }

  doc.text(dateRange, margin, y);
  y += 14;

  doc.setTextColor(0);

  // Divider
  y += 6;
  doc.setDrawColor(220);
  doc.line(margin, y, pageWidth - margin, y);
  y += 16;

  return y;
}
