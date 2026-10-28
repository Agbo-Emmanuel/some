import { jsPDF } from "jspdf";
import pptxgen from "pptxgenjs";
import {
  Document as DocxDocument,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
} from "docx";

/**
 * Normalizes hex colors to RGB format [r, g, b]
 */
function hexToRgb(hex, defaultColor = [37, 99, 235]) {
  if (!hex || typeof hex !== "string") return defaultColor;
  let clean = hex.replace("#", "").trim();
  if (clean.length === 3) {
    clean = clean
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (clean.length !== 6) return defaultColor;
  const num = parseInt(clean, 16);
  if (isNaN(num)) return defaultColor;
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

/**
 * Normalizes hex colors to 6-char hex string (without '#')
 */
function cleanHex(hex, fallback = "2563EB") {
  if (!hex || typeof hex !== "string") return fallback;
  const clean = hex.replace("#", "").trim();
  if (clean.length === 3) {
    return clean
      .split("")
      .map((c) => c + c)
      .join("");
  }
  return clean.length === 6 ? clean.toUpperCase() : fallback;
}

/**
 * Helper to download Blob in browser
 */
function triggerBlobDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * ============================================================================
 * 1. REAL PDF GENERATION (Using jsPDF)
 * ============================================================================
 * Generates an isolated, beautifully structured standalone PDF document
 * with custom branding, corporate/minimal/creative layouts, and page numbers.
 */
export async function exportToPdf({
  documentTitle = "Untitled Document",
  documentType = "Proposal",
  styleTemplate = "Corporate",
  brandKit = {},
  companyProfile = {},
  sections = [],
  filename,
}) {
  const isPitchDeck =
    documentType.toLowerCase().includes("deck") ||
    documentType.toLowerCase().includes("pitch") ||
    documentTitle.toLowerCase().includes("deck") ||
    documentTitle.toLowerCase().includes("pitch");

  const isLandscape = isPitchDeck;

  const doc = new jsPDF({
    orientation: isLandscape ? "landscape" : "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  const primaryRgb = hexToRgb(brandKit.primaryColor, [15, 23, 42]);
  const accentRgb = hexToRgb(brandKit.secondaryColor, [37, 99, 235]);

  if (isPitchDeck) {
    // Dedicated Corporate Pitch Deck presentation PDF export
    const totalSlides = Math.max(1, sections.length);
    const initials = (companyProfile.companyName || "SolarTech")
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

    sections.forEach((sec, idx) => {
      if (idx > 0) {
        doc.addPage("a4", "landscape");
      }

      const isCover = idx === 0 || sec.isCover;

      if (isCover) {
        if (styleTemplate === "Creative") {
          // Creative Cover Slide (Dark Navy Background)
          doc.setFillColor(16, 24, 63);
          doc.rect(0, 0, pageWidth, pageHeight, "F");

          // Brand logo badge
          doc.setFillColor(accentRgb[0], accentRgb[1], accentRgb[2]);
          doc.roundedRect(margin + 5, margin + 6, 16, 16, 3.5, 3.5, "F");
          doc.setTextColor(255, 255, 255);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(13);
          doc.text(initials, margin + 13, margin + 17, { align: "center" });

          // Brand name & tagline
          doc.setFontSize(14);
          doc.setTextColor(255, 255, 255);
          doc.text(companyProfile.companyName || "SolarTech Nigeria", margin + 26, margin + 12);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(191, 219, 254);
          doc.text(brandKit.tagline || "Clean power, built to last", margin + 26, margin + 18);

          // Hero headline
          doc.setFont("helvetica", "bold");
          doc.setFontSize(27);
          doc.setTextColor(255, 255, 255);
          const splitTitle = doc.splitTextToSize(sec.title || documentTitle, contentWidth - 30);
          doc.text(splitTitle, margin + 5, 85);

          // Subtitle
          const subY = 85 + splitTitle.length * 10 + 6;
          doc.setFont("helvetica", "bold");
          doc.setFontSize(14);
          doc.setTextColor(147, 197, 253);
          doc.text(sec.subtitle || "Series-A raise • 2026", margin + 5, subY);

          // Bottom vibrant blue accent bar
          doc.setFillColor(accentRgb[0], accentRgb[1], accentRgb[2]);
          doc.rect(0, pageHeight - 4, pageWidth, 4, "F");

          // Footer
          doc.setDrawColor(30, 41, 89);
          doc.setLineWidth(0.3);
          doc.line(margin + 5, pageHeight - 18, pageWidth - margin, pageHeight - 18);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(191, 219, 254);
          doc.text(sec.footerNote || "Confidential • Investor presentation", margin + 5, pageHeight - 10);
          doc.text(`${idx + 1} / ${totalSlides}`, pageWidth - margin, pageHeight - 10, { align: "right" });
        } else if (styleTemplate === "Minimal") {
          // Minimal Cover Slide
          // Standalone Brand badge
          doc.setFillColor(accentRgb[0], accentRgb[1], accentRgb[2]);
          doc.roundedRect(margin + 5, margin + 6, 16, 16, 3.5, 3.5, "F");
          doc.setTextColor(255, 255, 255);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(13);
          doc.text(initials, margin + 13, margin + 17, { align: "center" });

          // Hero headline
          doc.setFont("helvetica", "bold");
          doc.setFontSize(26);
          doc.setTextColor(11, 21, 54);
          const splitTitle = doc.splitTextToSize(sec.title || documentTitle, contentWidth - 40);
          doc.text(splitTitle, margin + 5, 85);

          // Subtitle
          const subY = 85 + splitTitle.length * 10 + 6;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(13.5);
          doc.setTextColor(51, 65, 85);
          doc.text(sec.subtitle || "Series-A raise • 2026", margin + 5, subY);

          // Minimal Footer: Company • Tagline | Page
          doc.setDrawColor(241, 245, 249);
          doc.setLineWidth(0.4);
          doc.line(margin + 5, pageHeight - 18, pageWidth - margin, pageHeight - 18);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(148, 163, 184);
          doc.text(
            `${companyProfile.companyName || "SolarTech Nigeria"} • ${brandKit.tagline || "Clean power, built to last"}`,
            margin + 5,
            pageHeight - 10
          );
          doc.text(`${idx + 1} / ${totalSlides}`, pageWidth - margin, pageHeight - 10, { align: "right" });
        } else {
          // Corporate Cover Slide
          // Left thick vertical blue bar
          doc.setFillColor(accentRgb[0], accentRgb[1], accentRgb[2]);
          doc.rect(0, 0, 7, pageHeight, "F");

          // Brand logo badge
          doc.setFillColor(accentRgb[0], accentRgb[1], accentRgb[2]);
          doc.roundedRect(margin + 5, margin + 4, 15, 15, 3, 3, "F");
          doc.setTextColor(255, 255, 255);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(12);
          doc.text(initials, margin + 12.5, margin + 14, { align: "center" });

          // Brand name & tagline
          doc.setFontSize(13);
          doc.setTextColor(11, 21, 54);
          doc.text(companyProfile.companyName || "SolarTech Nigeria", margin + 25, margin + 10);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8.5);
          doc.setTextColor(100, 116, 139);
          doc.text(brandKit.tagline || "Clean power, built to last", margin + 25, margin + 16);

          // Hero headline
          doc.setFont("helvetica", "bold");
          doc.setFontSize(26);
          doc.setTextColor(11, 21, 54);
          const splitTitle = doc.splitTextToSize(sec.title || documentTitle, contentWidth - 40);
          doc.text(splitTitle, margin + 5, 85);

          // Blue accent bar
          const barY = 85 + splitTitle.length * 10 + 4;
          doc.setFillColor(accentRgb[0], accentRgb[1], accentRgb[2]);
          doc.roundedRect(margin + 5, barY, 22, 2, 1, 1, "F");

          // Subtitle
          doc.setFont("helvetica", "bold");
          doc.setFontSize(14);
          doc.setTextColor(11, 21, 54);
          doc.text(sec.subtitle || "Series-A raise • 2026", margin + 5, barY + 12);

          // Footer
          doc.setDrawColor(226, 232, 240);
          doc.setLineWidth(0.3);
          doc.line(margin + 5, pageHeight - 18, pageWidth - margin, pageHeight - 18);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(100, 116, 139);
          doc.text(sec.footerNote || "Confidential • Investor presentation", margin + 5, pageHeight - 10);
          doc.text(`${idx + 1} / ${totalSlides}`, pageWidth - margin, pageHeight - 10, { align: "right" });
        }
      } else {
        // Content Slide
        if (styleTemplate === "Creative") {
          // Creative Top Dark Navy Banner
          doc.setFillColor(16, 24, 63);
          doc.rect(0, 0, pageWidth, 45, "F");

          // Kicker
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9.5);
          doc.setTextColor(96, 165, 250);
          doc.text((sec.kicker || sec.title || "Problem").toUpperCase(), margin, 15);

          // Large Ghost Number
          doc.setFont("helvetica", "bold");
          doc.setFontSize(22);
          doc.setTextColor(38, 51, 102);
          doc.text(String(idx + 1).padStart(2, "0"), margin, 32);

          // Headline
          doc.setFont("helvetica", "bold");
          doc.setFontSize(18);
          doc.setTextColor(255, 255, 255);
          const splitHeadline = doc.splitTextToSize(sec.title || "", contentWidth - 30);
          doc.text(splitHeadline, margin + 25, 24);

          let contentY = 60;

          // Bullets
          if (Array.isArray(sec.bullets) && sec.bullets.length > 0) {
            sec.bullets.forEach((bullet) => {
              // Vibrant blue bullet dot
              doc.setFillColor(accentRgb[0], accentRgb[1], accentRgb[2]);
              doc.circle(margin + 2.5, contentY - 1.2, 1.4, "F");

              doc.setFont("helvetica", "bold");
              doc.setFontSize(12.5);
              doc.setTextColor(15, 23, 42);
              const splitBullet = doc.splitTextToSize(bullet, contentWidth - 12);
              doc.text(splitBullet, margin + 8, contentY);
              contentY += splitBullet.length * 7 + 5;
            });
          }

          // Solid Vibrant Blue Metric Card (if present on Traction)
          if (sec.metricValue) {
            contentY += 2;
            doc.setFillColor(accentRgb[0], accentRgb[1], accentRgb[2]);
            doc.roundedRect(margin, contentY, 80, 25, 4, 4, "F");

            doc.setFont("helvetica", "bold");
            doc.setFontSize(22);
            doc.setTextColor(255, 255, 255);
            doc.text(sec.metricValue, margin + 7, contentY + 12);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.setTextColor(219, 234, 254);
            doc.text(sec.metricLabel || "Metric target", margin + 7, contentY + 19);

            contentY += 32;
          }

          // Slide Footer
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(100, 116, 139);
          doc.text(companyProfile.companyName || "SolarTech Nigeria", margin, pageHeight - 10);
          doc.text(`${idx + 1} / ${totalSlides}`, pageWidth - margin, pageHeight - 10, { align: "right" });
        } else if (styleTemplate === "Minimal") {
          // Minimal kicker (muted gray, spaced)
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9.5);
          doc.setTextColor(148, 163, 184);
          const kickerText = (sec.kicker || sec.title || "Traction").toUpperCase();
          doc.text(kickerText, margin, margin + 5);

          // Headline
          doc.setFont("helvetica", "bold");
          doc.setFontSize(22);
          doc.setTextColor(11, 21, 54);
          const splitHeadline = doc.splitTextToSize(sec.title || "", contentWidth);
          doc.text(splitHeadline, margin, margin + 18);

          let contentY = margin + 18 + splitHeadline.length * 9 + 4;

          // Metric Card (if present)
          if (sec.metricValue) {
            doc.setFillColor(255, 255, 255);
            doc.roundedRect(margin, contentY, 65, 22, 4, 4, "F");
            doc.setDrawColor(226, 232, 240);
            doc.setLineWidth(0.4);
            doc.roundedRect(margin, contentY, 65, 22, 4, 4, "S");

            doc.setFont("helvetica", "bold");
            doc.setFontSize(20);
            doc.setTextColor(11, 21, 54);
            doc.text(sec.metricValue, margin + 5, contentY + 11);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(8.5);
            doc.setTextColor(100, 116, 139);
            doc.text(sec.metricLabel || "", margin + 5, contentY + 17);

            contentY += 30;
          }

          // Bullets
          if (Array.isArray(sec.bullets) && sec.bullets.length > 0) {
            sec.bullets.forEach((bullet, bIdx) => {
              doc.setFont("helvetica", "bold");
              doc.setFontSize(10.5);
              doc.setTextColor(148, 163, 184);
              const numStr = String(bIdx + 1).padStart(2, "0");
              doc.text(numStr, margin, contentY);

              doc.setFont("helvetica", "normal");
              doc.setFontSize(12);
              doc.setTextColor(30, 41, 59);
              const splitBullet = doc.splitTextToSize(bullet, contentWidth - 14);
              doc.text(splitBullet, margin + 9, contentY);
              contentY += splitBullet.length * 7 + 4;
            });
          }

          // Slide Footer
          doc.setDrawColor(241, 245, 249);
          doc.setLineWidth(0.4);
          doc.line(margin, pageHeight - 16, pageWidth - margin, pageHeight - 16);

          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(148, 163, 184);
          doc.text(companyProfile.companyName || "SolarTech Nigeria", margin, pageHeight - 9);
          doc.text(`${idx + 1} / ${totalSlides}`, pageWidth - margin, pageHeight - 9, { align: "right" });
        } else {
          // Corporate kicker (blue, with top-right dash)
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10.5);
          doc.setTextColor(accentRgb[0], accentRgb[1], accentRgb[2]);
          doc.text(sec.kicker || sec.title || "Traction", margin, margin + 5);

          doc.setFillColor(accentRgb[0], accentRgb[1], accentRgb[2]);
          doc.roundedRect(pageWidth - margin - 16, margin + 3, 16, 1.5, 0.75, 0.75, "F");

          // Headline
          doc.setFont("helvetica", "bold");
          doc.setFontSize(22);
          doc.setTextColor(11, 21, 54);
          const splitHeadline = doc.splitTextToSize(sec.title || "", contentWidth);
          doc.text(splitHeadline, margin, margin + 18);

          let contentY = margin + 18 + splitHeadline.length * 9 + 4;

          // Metric Card (if present)
          if (sec.metricValue) {
            doc.setFillColor(239, 244, 255);
            doc.roundedRect(margin, contentY, 65, 22, 4, 4, "F");
            doc.setDrawColor(219, 234, 254);
            doc.setLineWidth(0.4);
            doc.roundedRect(margin, contentY, 65, 22, 4, 4, "S");

            doc.setFont("helvetica", "bold");
            doc.setFontSize(20);
            doc.setTextColor(accentRgb[0], accentRgb[1], accentRgb[2]);
            doc.text(sec.metricValue, margin + 5, contentY + 11);

            doc.setFont("helvetica", "bold");
            doc.setFontSize(8.5);
            doc.setTextColor(71, 85, 105);
            doc.text(sec.metricLabel || "", margin + 5, contentY + 17);

            contentY += 30;
          }

          // Bullets
          if (Array.isArray(sec.bullets) && sec.bullets.length > 0) {
            sec.bullets.forEach((bullet) => {
              doc.setFillColor(15, 23, 42);
              doc.circle(margin + 2.5, contentY - 1.2, 1.2, "F");

              doc.setFont("helvetica", "bold");
              doc.setFontSize(12);
              doc.setTextColor(30, 41, 59);
              const splitBullet = doc.splitTextToSize(bullet, contentWidth - 12);
              doc.text(splitBullet, margin + 8, contentY);
              contentY += splitBullet.length * 7 + 4;
            });
          }

          // Slide Footer
          doc.setDrawColor(241, 245, 249);
          doc.setLineWidth(0.4);
          doc.line(margin, pageHeight - 16, pageWidth - margin, pageHeight - 16);

          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(148, 163, 184);
          doc.text(companyProfile.companyName || "SolarTech Nigeria", margin, pageHeight - 9);
          doc.text(`${idx + 1} / ${totalSlides}`, pageWidth - margin, pageHeight - 9, { align: "right" });
        }
      }
    });

    const finalFilename =
      filename ||
      `${documentTitle.replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "_")}_${styleTemplate}.pdf`;
    const pdfBlob = doc.output("blob");
    triggerBlobDownload(pdfBlob, finalFilename);
    return;
  }

  let cursorY = margin;

  const isContract =
    documentType.toLowerCase().includes("contract") ||
    documentType.toLowerCase().includes("agreement") ||
    documentTitle.toLowerCase().includes("contract") ||
    documentTitle.toLowerCase().includes("agreement");

  const isMarketingPlan =
    !isContract &&
    (documentType.toLowerCase().includes("marketing") ||
      documentTitle.toLowerCase().includes("marketing"));

  // Header banner based on style and document type
  if (isMarketingPlan) {
    if (styleTemplate === "Creative") {
      // Creative Midnight Navy Top Banner (#131B4D)
      doc.setFillColor(19, 27, 77);
      doc.rect(0, 0, pageWidth, 48, "F");

      // Brand Avatar & Company name
      doc.setFillColor(accentRgb[0], accentRgb[1], accentRgb[2]);
      doc.roundedRect(margin, 8, 8, 8, 1.5, 1.5, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      const initials = (companyProfile.companyName || "SolarTech")
        .split(" ")
        .filter(Boolean)
        .map((w) => w[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();
      doc.text(initials, margin + 4, 13.5, { align: "center" });

      doc.setFontSize(10);
      doc.text(companyProfile.companyName || "SolarTech Nigeria", margin + 11, 11);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(203, 213, 225);
      doc.text(brandKit.tagline || "Clean power, built to last", margin + 11, 15);

      // Kicker & Document Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(199, 210, 254);
      doc.text("MARKETING PLAN", margin, 24);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.setTextColor(255, 255, 255);
      const planTitle = documentTitle && documentTitle.toLowerCase().includes("plan")
        ? documentTitle.toUpperCase()
        : `${(documentTitle || "MARKETING PLAN").toUpperCase()} 2026`;
      doc.text(planTitle, margin, 31);

      // Metadata Grid
      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(0.2);
      doc.line(margin, 35, pageWidth - margin, 35);

      doc.setFontSize(6.5);
      doc.setTextColor(148, 163, 184);
      doc.text("PREPARED FOR", margin, 39);
      doc.text("PREPARED BY", pageWidth / 2, 39);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text(companyProfile.preparedFor || "Commercial team", margin, 43);
      doc.text(companyProfile.preparedBy || companyProfile.companyName || "SolarTech Nigeria", pageWidth / 2, 43);

      cursorY = 56;
    } else if (styleTemplate === "Corporate") {
      // Corporate Executive Header
      doc.setFillColor(accentRgb[0], accentRgb[1], accentRgb[2]);
      doc.roundedRect(margin, cursorY, 8.5, 8.5, 2, 2, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      const initials = (companyProfile.companyName || "SolarTech")
        .split(" ")
        .filter(Boolean)
        .map((w) => w[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();
      doc.text(initials, margin + 4.25, cursorY + 5.8, { align: "center" });

      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.text(companyProfile.companyName || "SolarTech Nigeria", margin + 12, cursorY + 4);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(brandKit.tagline || "Clean power, built to last", margin + 12, cursorY + 8);

      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text("Marketing Plan", pageWidth - margin, cursorY + 5.5, { align: "right" });

      cursorY += 12;
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.4);
      doc.line(margin, cursorY, pageWidth - margin, cursorY);
      cursorY += 8;

      // Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(15, 23, 42);
      const planTitle = documentTitle && documentTitle.toLowerCase().includes("plan")
        ? documentTitle.toUpperCase()
        : `${(documentTitle || "MARKETING PLAN").toUpperCase()} 2026`;
      doc.text(planTitle, margin, cursorY);
      cursorY += 8;

      // Metadata
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text("PREPARED FOR", margin, cursorY);
      doc.text("PREPARED BY", pageWidth / 2, cursorY);
      cursorY += 4.5;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text(companyProfile.preparedFor || "Commercial team", margin, cursorY);
      doc.text(companyProfile.preparedBy || companyProfile.companyName || "SolarTech Nigeria", pageWidth / 2, cursorY);
      cursorY += 7;

      // Dark bottom line
      doc.setDrawColor(15, 23, 42);
      doc.setLineWidth(0.8);
      doc.line(margin, cursorY, pageWidth - margin, cursorY);
      cursorY += 10;
    } else {
      // Minimal Header
      doc.setFillColor(accentRgb[0], accentRgb[1], accentRgb[2]);
      doc.roundedRect(margin, cursorY, 8.5, 8.5, 2, 2, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      const initials = (companyProfile.companyName || "SolarTech")
        .split(" ")
        .filter(Boolean)
        .map((w) => w[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();
      doc.text(initials, margin + 4.25, cursorY + 5.8, { align: "center" });

      cursorY += 13;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text("Marketing Plan", margin, cursorY);
      cursorY += 7;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(17);
      doc.setTextColor(15, 23, 42);
      const planTitle = documentTitle && documentTitle.toLowerCase().includes("plan")
        ? documentTitle.toUpperCase()
        : `${(documentTitle || "MARKETING PLAN").toUpperCase()} 2026`;
      doc.text(planTitle, margin, cursorY);
      cursorY += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(brandKit.tagline || "Clean power, built to last", margin, cursorY);
      cursorY += 9;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text("PREPARED FOR", margin, cursorY);
      doc.text("PREPARED BY", pageWidth / 2, cursorY);
      cursorY += 4.5;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text(companyProfile.preparedFor || "Commercial team", margin, cursorY);
      doc.text(companyProfile.preparedBy || companyProfile.companyName || "SolarTech Nigeria", pageWidth / 2, cursorY);
      cursorY += 12;
    }
  } else if (isContract && styleTemplate !== "Minimal") {
    // Contract Navy Cover Banner matching platform design
    doc.setFillColor(19, 27, 77); // #131B4D
    doc.rect(0, 0, pageWidth, 52, "F");

    // Brand Avatar & Company name
    doc.setFillColor(accentRgb[0], accentRgb[1], accentRgb[2]);
    doc.roundedRect(margin, 8, 8, 8, 1.5, 1.5, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    const initials = (companyProfile.companyName || "SolarTech")
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
    doc.text(initials, margin + 4, 13.5, { align: "center" });

    doc.setFontSize(10);
    doc.text(companyProfile.companyName || "SolarTech Nigeria", margin + 11, 11);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(203, 213, 225);
    doc.text(brandKit.tagline || "Clean power, built to last", margin + 11, 15);

    // Kicker & Document Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(199, 210, 254);
    doc.text("CONTRACT", margin, 24);

    const contractTitle =
      documentTitle &&
      (documentTitle.toLowerCase().includes("contract") ||
        documentTitle.toLowerCase().includes("agreement"))
        ? documentTitle.toLowerCase().includes("partnership")
          ? "SERVICE AGREEMENT"
          : documentTitle.toUpperCase()
        : `${(documentTitle || "SERVICE").toUpperCase()} AGREEMENT`;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14.5);
    doc.setTextColor(255, 255, 255);
    doc.text(contractTitle, margin, 31);

    // Two-column metadata: Between / And
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.2);
    doc.line(margin, 36, pageWidth - margin, 36);

    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text("BETWEEN", margin, 40);
    doc.text("AND", pageWidth / 2, 40);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    const clientText = companyProfile.preparedFor
      ? companyProfile.preparedFor.toLowerCase().includes("client")
        ? companyProfile.preparedFor
        : `${companyProfile.preparedFor} ("the Client")`
      : 'Lagos SME Partners Ltd. ("the Client")';
    const providerText = companyProfile.companyName
      ? companyProfile.companyName.toLowerCase().includes("provider")
        ? companyProfile.companyName
        : `${companyProfile.companyName} ("the Provider")`
      : 'SolarTech Nigeria ("the Provider")';

    doc.text(clientText, margin, 44);
    doc.text(providerText, pageWidth / 2, 44);

    cursorY = 60;
  } else if (isContract) {
    // Minimal Contract Header
    doc.setFillColor(accentRgb[0], accentRgb[1], accentRgb[2]);
    doc.roundedRect(margin, cursorY, 8.5, 8.5, 2, 2, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    const initials = (companyProfile.companyName || "SolarTech")
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
    doc.text(initials, margin + 4.25, cursorY + 5.8, { align: "center" });

    cursorY += 12;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text("Contract", margin, cursorY);
    cursorY += 7;

    const contractTitle =
      documentTitle &&
      (documentTitle.toLowerCase().includes("contract") ||
        documentTitle.toLowerCase().includes("agreement"))
        ? documentTitle.toLowerCase().includes("partnership")
          ? "SERVICE AGREEMENT"
          : documentTitle.toUpperCase()
        : `${(documentTitle || "SERVICE").toUpperCase()} AGREEMENT`;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    doc.text(contractTitle, margin, cursorY);
    cursorY += 7;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(brandKit.tagline || "Clean power, built to last", margin, cursorY);
    cursorY += 10;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("Between", margin, cursorY);
    doc.text("And", pageWidth / 2, cursorY);

    cursorY += 4.5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    const clientText = companyProfile.preparedFor
      ? companyProfile.preparedFor.toLowerCase().includes("client")
        ? companyProfile.preparedFor
        : `${companyProfile.preparedFor} ("the Client")`
      : 'Lagos SME Partners Ltd. ("the Client")';
    const providerText = companyProfile.companyName
      ? companyProfile.companyName.toLowerCase().includes("provider")
        ? companyProfile.companyName
        : `${companyProfile.companyName} ("the Provider")`
      : 'SolarTech Nigeria ("the Provider")';

    doc.text(clientText, margin, cursorY);
    doc.text(providerText, pageWidth / 2, cursorY);

    cursorY += 12;
  } else if (styleTemplate === "Creative") {
    // Creative Midnight Navy Top Banner (#131B4D)
    doc.setFillColor(19, 27, 77);
    doc.rect(0, 0, pageWidth, 44, "F");

    // Brand Avatar & Company name
    doc.setFillColor(accentRgb[0], accentRgb[1], accentRgb[2]);
    doc.roundedRect(margin, 8, 8, 8, 1.5, 1.5, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    const initials = (companyProfile.companyName || "Ahiia")
      .split(" ")
      .map((w) => w[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
    doc.text(initials, margin + 4, 13.5, { align: "center" });

    doc.setFontSize(10);
    doc.text(companyProfile.companyName || "Ahiia", margin + 11, 11);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(203, 213, 225);
    doc.text(brandKit.tagline || "", margin + 11, 15);

    // Kicker & Document Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(199, 210, 254);
    doc.text(documentType.toUpperCase(), margin, 24);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(255, 255, 255);
    doc.text(documentTitle.toUpperCase(), margin, 30);

    // Metadata Grid
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.2);
    doc.line(margin, 34, pageWidth - margin, 34);

    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text("PREPARED FOR", margin, 38);
    doc.text("PREPARED BY", pageWidth / 2, 38);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(companyProfile.preparedFor || "—", margin, 41.5);
    doc.text(companyProfile.preparedBy || companyProfile.companyName || "—", pageWidth / 2, 41.5);

    cursorY = 52;
  } else if (styleTemplate === "Corporate") {
    doc.setFillColor(accentRgb[0], accentRgb[1], accentRgb[2]);
    doc.rect(margin, cursorY, 6, 20, "F");

    doc.setTextColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text(documentTitle, margin + 10, cursorY + 8);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(accentRgb[0], accentRgb[1], accentRgb[2]);
    doc.text(
      `${documentType.toUpperCase()} · ${companyProfile.companyName || "SolarTech"}`,
      margin + 10,
      cursorY + 16
    );

    cursorY += 28;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(margin, cursorY, pageWidth - margin, cursorY);
    cursorY += 8;
  } else {
    // Minimal
    doc.setTextColor(30, 41, 59);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text(documentTitle, margin, cursorY + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `${documentType} · Prepared for ${companyProfile.preparedFor || "Client"}`,
      margin,
      cursorY + 14
    );

    cursorY += 22;
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.line(margin, cursorY, pageWidth - margin, cursorY);
    cursorY += 8;
  }

  // Metadata block
  const metaRows = [
    companyProfile.preparedFor && `Prepared for: ${companyProfile.preparedFor}`,
    companyProfile.preparedBy && `Prepared by: ${companyProfile.preparedBy}`,
    companyProfile.processOwner && `Process Owner: ${companyProfile.processOwner}`,
    `Date: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}`,
  ].filter(Boolean);

  if (!isContract && metaRows.length > 0 && cursorY < pageHeight - 60) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(metaRows.join("   |   "), margin, cursorY);
    cursorY += 8;
  }

  // Helper for adding pages when reaching bottom
  const checkPageBreak = (neededSpace = 25) => {
    if (cursorY + neededSpace > pageHeight - margin - 15) {
      doc.addPage();
      cursorY = margin + 5;
    }
  };

  // Render Document Sections
  sections.forEach((sec, idx) => {
    checkPageBreak(30);

    // Section Title
    const displayTitle = isContract
      ? (/^\d+[.)]/.test(sec.title) ? sec.title : `${idx + 1}. ${sec.title}`)
      : (styleTemplate === "Corporate" ? sec.title.toUpperCase() : sec.title);

    if (styleTemplate === "Creative" || (isContract && styleTemplate !== "Minimal")) {
      doc.setFillColor(accentRgb[0], accentRgb[1], accentRgb[2]);
      doc.roundedRect(margin, cursorY - 2.5, 2, 6.5, 0.5, 0.5, "F");

      doc.setTextColor(accentRgb[0], accentRgb[1], accentRgb[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(displayTitle, margin + 4.5, cursorY + 2);
      cursorY += 9;
    } else if (isContract) {
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(displayTitle, margin, cursorY);
      cursorY += 8;
    } else if (styleTemplate === "Corporate") {
      doc.setTextColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(displayTitle, margin, cursorY);

      doc.setDrawColor(accentRgb[0], accentRgb[1], accentRgb[2]);
      doc.setLineWidth(0.8);
      doc.line(margin, cursorY + 2, margin + 25, cursorY + 2);
      cursorY += 8;
    } else {
      // Minimal
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(displayTitle, margin, cursorY);
      cursorY += 7;
    }

    // Lead text if present
    if (sec.leadText) {
      checkPageBreak(12);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9.5);
      doc.setTextColor(71, 85, 105);
      doc.text(sec.leadText, margin, cursorY);
      cursorY += 6;
    }

    // Paragraphs
    if (Array.isArray(sec.paragraphs)) {
      sec.paragraphs.forEach((p) => {
        if (!p) return;
        checkPageBreak(15);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(51, 65, 85);
        const splitText = doc.splitTextToSize(p, contentWidth);
        doc.text(splitText, margin, cursorY);
        cursorY += splitText.length * 5 + 3;
      });
    }

    // Bullets
    if (Array.isArray(sec.bullets)) {
      sec.bullets.forEach((b) => {
        if (!b) return;
        checkPageBreak(10);
        if ((isContract || isMarketingPlan) && styleTemplate === "Minimal") {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9.5);
          doc.setTextColor(51, 65, 85);
          doc.text("—", margin, cursorY);
          const splitText = doc.splitTextToSize(b, contentWidth - 8);
          doc.text(splitText, margin + 6, cursorY);
          cursorY += splitText.length * 5 + 3;
        } else if (isMarketingPlan && styleTemplate === "Corporate") {
          doc.setFillColor(15, 23, 42);
          doc.circle(margin + 2, cursorY - 1, 1, "F");

          doc.setFont("helvetica", "normal");
          doc.setFontSize(9.5);
          doc.setTextColor(51, 65, 85);
          const splitText = doc.splitTextToSize(b, contentWidth - 8);
          doc.text(splitText, margin + 6, cursorY);
          cursorY += splitText.length * 5 + 2;
        } else if (isMarketingPlan && styleTemplate === "Creative") {
          doc.setFillColor(accentRgb[0], accentRgb[1], accentRgb[2]);
          doc.rect(margin + 1, cursorY - 2.5, 2, 2, "F");

          doc.setFont("helvetica", "normal");
          doc.setFontSize(9.5);
          doc.setTextColor(51, 65, 85);
          const splitText = doc.splitTextToSize(b, contentWidth - 8);
          doc.text(splitText, margin + 6, cursorY);
          cursorY += splitText.length * 5 + 2;
        } else {
          doc.setFillColor(accentRgb[0], accentRgb[1], accentRgb[2]);
          doc.circle(margin + 2, cursorY - 1, 1, "F");

          doc.setFont("helvetica", "normal");
          doc.setFontSize(9.5);
          doc.setTextColor(51, 65, 85);
          const splitText = doc.splitTextToSize(b, contentWidth - 8);
          doc.text(splitText, margin + 6, cursorY);
          cursorY += splitText.length * 5 + 2;
        }
      });
    }

    // Steps (for SOPs or process lists)
    if (Array.isArray(sec.steps)) {
      sec.steps.forEach((step, sIdx) => {
        if (!step) return;
        checkPageBreak(12);
        // Step number badge
        doc.setFillColor(accentRgb[0], accentRgb[1], accentRgb[2]);
        doc.roundedRect(margin, cursorY - 3.5, 6, 6, 1, 1, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.text(String(sIdx + 1), margin + 3, cursorY + 0.8, { align: "center" });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(30, 41, 59);
        const splitStep = doc.splitTextToSize(step, contentWidth - 10);
        doc.text(splitStep, margin + 9, cursorY);
        cursorY += splitStep.length * 5 + 3;
      });
    }

    // Key-Value rows or Financial Overview Card
    if (isMarketingPlan && sec.isFinancialOverview && Array.isArray(sec.keyValueRows)) {
      checkPageBreak(sec.keyValueRows.length * 8 + 20);
      sec.keyValueRows.forEach((row, rIdx) => {
        const isTotal =
          row.isTotal ||
          rIdx === sec.keyValueRows.length - 1 ||
          /budget|total/i.test(row.key);
        if (isTotal) {
          if (styleTemplate === "Creative") {
            doc.setFillColor(239, 244, 255);
            doc.roundedRect(margin, cursorY - 2.5, contentWidth, 8, 2, 2, "F");
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9.5);
            doc.setTextColor(15, 23, 42);
            doc.text(row.key, margin + 4, cursorY + 2.5);
            doc.setTextColor(accentRgb[0], accentRgb[1], accentRgb[2]);
            doc.text(row.value, pageWidth - margin - 4, cursorY + 2.5, {
              align: "right",
            });
            cursorY += 11;
          } else if (styleTemplate === "Corporate") {
            doc.setFillColor(248, 250, 252);
            doc.roundedRect(margin, cursorY - 2.5, contentWidth, 8, 2, 2, "F");
            doc.setDrawColor(226, 232, 240);
            doc.setLineWidth(0.3);
            doc.roundedRect(margin, cursorY - 2.5, contentWidth, 8, 2, 2, "S");
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9.5);
            doc.setTextColor(15, 23, 42);
            doc.text(row.key, margin + 4, cursorY + 2.5);
            doc.text(row.value, pageWidth - margin - 4, cursorY + 2.5, {
              align: "right",
            });
            cursorY += 11;
          } else {
            // Minimal
            doc.setDrawColor(226, 232, 240);
            doc.setLineWidth(0.3);
            doc.line(margin, cursorY - 1, pageWidth - margin, cursorY - 1);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9.5);
            doc.setTextColor(15, 23, 42);
            doc.text(row.key, margin, cursorY + 3);
            doc.text(row.value, pageWidth - margin, cursorY + 3, {
              align: "right",
            });
            cursorY += 9;
          }
        } else {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(51, 65, 85);
          doc.text(row.key, margin, cursorY);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(15, 23, 42);
          doc.text(row.value, pageWidth - margin, cursorY, { align: "right" });
          cursorY += 6.5;
        }
      });
      cursorY += 4;
    } else if (isContract && Array.isArray(sec.keyValueRows)) {
      checkPageBreak(sec.keyValueRows.length * 8 + 10);
      sec.keyValueRows.forEach((row) => {
        if (!row?.key) return;
        const isBoldKey = /contract value|total|facility/i.test(row.key);
        doc.setFont("helvetica", isBoldKey ? "bold" : "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(15, 23, 42);
        doc.text(row.key, margin, cursorY);

        doc.setFont("helvetica", "bold");
        doc.text(row.value || "—", pageWidth - margin, cursorY, { align: "right" });
        cursorY += 6.5;
      });
      cursorY += 4;
    } else if (sec.isFinancialOverview && Array.isArray(sec.keyValueRows)) {
      if (styleTemplate === "Creative") {
        checkPageBreak(sec.keyValueRows.length * 9 + 25);
        sec.keyValueRows.forEach((row, rIdx) => {
          const isFacility =
            /facility sought|total/i.test(row.key) ||
            rIdx === sec.keyValueRows.length - 1;
          if (isFacility) {
            doc.setFillColor(239, 244, 255);
            doc.roundedRect(margin, cursorY - 3, contentWidth, 8, 2, 2, "F");
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9.5);
            doc.setTextColor(15, 23, 42);
            doc.text(row.key, margin + 4, cursorY + 1.5);
            doc.setTextColor(accentRgb[0], accentRgb[1], accentRgb[2]);
            doc.text(row.value, pageWidth - margin - 4, cursorY + 1.5, {
              align: "right",
            });
            cursorY += 10;
          } else {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.setTextColor(51, 65, 85);
            doc.text(row.key, margin, cursorY);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(15, 23, 42);
            doc.text(row.value, pageWidth - margin, cursorY, { align: "right" });
            doc.setDrawColor(241, 245, 249);
            doc.setLineWidth(0.3);
            doc.line(margin, cursorY + 2, pageWidth - margin, cursorY + 2);
            cursorY += 7.5;
          }
        });

        if (sec.disclosure) {
          cursorY += 2;
          doc.setFillColor(248, 250, 255);
          doc.roundedRect(margin, cursorY - 2, contentWidth, 14, 2, 2, "F");
          doc.setFillColor(accentRgb[0], accentRgb[1], accentRgb[2]);
          doc.rect(margin, cursorY - 2, 2, 14, "F");

          doc.setFont("helvetica", "bold");
          doc.setFontSize(8);
          doc.setTextColor(accentRgb[0], accentRgb[1], accentRgb[2]);
          doc.text(
            sec.disclosure.title || "Figures provided by you",
            margin + 5,
            cursorY + 2.5
          );

          doc.setFont("helvetica", "normal");
          doc.setFontSize(7.5);
          doc.setTextColor(71, 85, 105);
          const splitDisc = doc.splitTextToSize(
            sec.disclosure.content || "",
            contentWidth - 10
          );
          doc.text(splitDisc, margin + 5, cursorY + 6.5);
          cursorY += 16;
        }
      } else {
        const cardHeight =
          sec.keyValueRows.length * 8 + (sec.disclosure ? 24 : 10);
        checkPageBreak(cardHeight + 10);

        doc.setFillColor(235, 243, 255);
        doc.roundedRect(margin, cursorY - 2, contentWidth, cardHeight, 3, 3, "F");
        doc.setDrawColor(219, 234, 254);
        doc.setLineWidth(0.4);
        doc.roundedRect(margin, cursorY - 2, contentWidth, cardHeight, 3, 3, "S");

        cursorY += 5;
        sec.keyValueRows.forEach((row) => {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(51, 65, 85);
          doc.text(row.key, margin + 6, cursorY);

          doc.setFont("helvetica", "bold");
          doc.setFontSize(9.5);
          doc.setTextColor(15, 23, 42);
          doc.text(row.value, pageWidth - margin - 6, cursorY, {
            align: "right",
          });
          cursorY += 7.5;
        });

        if (sec.disclosure) {
          cursorY += 2;
          doc.setFillColor(255, 255, 255);
          doc.roundedRect(
            margin + 5,
            cursorY - 2,
            contentWidth - 10,
            14,
            2,
            2,
            "F"
          );
          doc.setDrawColor(219, 234, 254);
          doc.roundedRect(
            margin + 5,
            cursorY - 2,
            contentWidth - 10,
            14,
            2,
            2,
            "S"
          );

          doc.setFont("helvetica", "bold");
          doc.setFontSize(8);
          doc.setTextColor(30, 58, 138);
          doc.text(
            sec.disclosure.title || "Figures provided by you",
            margin + 8,
            cursorY + 2.5
          );

          doc.setFont("helvetica", "normal");
          doc.setFontSize(7.5);
          doc.setTextColor(71, 85, 105);
          const splitDisc = doc.splitTextToSize(
            sec.disclosure.content || "",
            contentWidth - 18
          );
          doc.text(splitDisc, margin + 8, cursorY + 6.5);
          cursorY += 16;
        }
        cursorY += 4;
      }
    } else if (Array.isArray(sec.keyValueRows)) {
      sec.keyValueRows.forEach((row) => {
        if (!row?.key) return;
        checkPageBreak(10);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);
        doc.text(`${row.key}:`, margin, cursorY);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(15, 23, 42);
        const splitVal = doc.splitTextToSize(row.value || "—", contentWidth - 45);
        doc.text(splitVal, margin + 40, cursorY);
        cursorY += Math.max(splitVal.length * 5, 6) + 1;
      });
      cursorY += 2;
    }

    // Callouts / Warnings
    if (Array.isArray(sec.callouts)) {
      sec.callouts.forEach((callout) => {
        checkPageBreak(18);
        const isWarn = callout.type === "warning";
        doc.setFillColor(isWarn ? 254 : 240, isWarn ? 242 : 249, isWarn ? 242 : 255);
        doc.roundedRect(margin, cursorY - 3, contentWidth, 14, 2, 2, "F");

        doc.setDrawColor(isWarn ? 239 : 59, isWarn ? 68 : 130, isWarn ? 68 : 246);
        doc.setLineWidth(0.8);
        doc.line(margin, cursorY - 3, margin, cursorY + 11);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(isWarn ? 185 : 30, isWarn ? 28 : 58, isWarn ? 28 : 138);
        doc.text(callout.title || "Note", margin + 4, cursorY + 2);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(71, 85, 105);
        doc.text(callout.content || "", margin + 4, cursorY + 7);

        cursorY += 18;
      });
    }

    // Guidance callout (Contracts)
    if (
      sec.guidance ||
      (isContract &&
        (/termination/i.test(sec.title || sec.key || "") ||
          /term/i.test(sec.title || sec.key || "")))
    ) {
      checkPageBreak(22);
      const guidTitle = sec.guidance?.title || "Guidance flagged this clause";
      const guidContent =
        sec.guidance?.content ||
        "No liability cap or governing-law clause is present. Review before sending — Ahiia does not add legal terms you did not provide.";
      doc.setFillColor(255, 253, 245);
      doc.roundedRect(margin, cursorY, contentWidth, 16, 1.5, 1.5, "F");
      doc.setFillColor(245, 158, 11);
      doc.rect(margin, cursorY, 1.5, 16, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(180, 83, 9);
      doc.text(guidTitle, margin + 5, cursorY + 5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(120, 53, 15);
      const splitGuid = doc.splitTextToSize(guidContent, contentWidth - 10);
      doc.text(splitGuid, margin + 5, cursorY + 10);
      cursorY += 20;
    }

    // In-clause Signatures
    if (
      sec.isSignatures ||
      (isContract &&
        /signature|signator|execution/i.test(sec.title || sec.key || ""))
    ) {
      checkPageBreak(30);
      const colWidth = (contentWidth - 15) / 2;
      const col2X = margin + colWidth + 15;

      doc.setDrawColor(15, 23, 42);
      doc.setLineWidth(0.5);
      doc.line(margin, cursorY + 5, margin + colWidth, cursorY + 5);
      doc.line(col2X, cursorY + 5, col2X + colWidth, cursorY + 5);

      cursorY += 9;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text("For the Client", margin, cursorY);
      doc.text("For the Provider", col2X, cursorY);

      cursorY += 4.5;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text(
        companyProfile.preparedFor || "Lagos SME Partners Ltd.",
        margin,
        cursorY
      );
      doc.text(
        companyProfile.companyName ||
          companyProfile.preparedBy ||
          "SolarTech Nigeria",
        col2X,
        cursorY
      );

      cursorY += 4;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text("Name, title and date", margin, cursorY);
      doc.text("Name, title and date", col2X, cursorY);
      cursorY += 10;
    }

    cursorY += 6;
  });

  // Automatic standalone Signatures section for contracts if not already present in sections
  if (
    isContract &&
    !sections.some((s) =>
      /signature|signator|execution/i.test(s.title || s.key || "")
    )
  ) {
    checkPageBreak(35);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(`${sections.length + 1}. Signatures`, margin, cursorY);
    cursorY += 8;

    const colWidth = (contentWidth - 15) / 2;
    const col2X = margin + colWidth + 15;

    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.5);
    doc.line(margin, cursorY + 5, margin + colWidth, cursorY + 5);
    doc.line(col2X, cursorY + 5, col2X + colWidth, cursorY + 5);

    cursorY += 9;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text("For the Client", margin, cursorY);
    doc.text("For the Provider", col2X, cursorY);

    cursorY += 4.5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(
      companyProfile.preparedFor || "Lagos SME Partners Ltd.",
      margin,
      cursorY
    );
    doc.text(
      companyProfile.companyName ||
        companyProfile.preparedBy ||
        "SolarTech Nigeria",
      col2X,
      cursorY
    );

    cursorY += 4;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text("Name, title and date", margin, cursorY);
    doc.text("Name, title and date", col2X, cursorY);
    cursorY += 10;
  }

  // Add Page Numbers & Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);

    if (styleTemplate === "Creative" || (isContract && styleTemplate !== "Minimal")) {
      doc.setDrawColor(accentRgb[0], accentRgb[1], accentRgb[2]);
      doc.setLineWidth(0.8);
    } else {
      doc.setDrawColor(241, 245, 249);
      doc.setLineWidth(0.4);
    }
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    if (isContract || isMarketingPlan) {
      doc.text(
        companyProfile.companyName || "SolarTech Nigeria",
        margin,
        pageHeight - 7
      );
    } else {
      doc.text(
        `${documentTitle} · ${styleTemplate} style`,
        margin,
        pageHeight - 7
      );
    }
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 7, {
      align: "right",
    });
  }

  const blob = doc.output("blob");
  const finalFilename =
    filename ||
    `${documentTitle.replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "_")}_${styleTemplate}.pdf`;
  triggerBlobDownload(blob, finalFilename);
  return blob;
}

/**
 * ============================================================================
 * 2. REAL PPTX GENERATION (Using pptxgenjs)
 * ============================================================================
 * Generates an editable, presentation-grade 16:9 slide deck.
 */
export async function exportToPptx({
  documentTitle = "Untitled Document",
  documentType = "Pitch Deck",
  styleTemplate = "Creative",
  brandKit = {},
  companyProfile = {},
  sections = [],
  filename,
}) {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = companyProfile.companyName || "Ahiia.AI";
  pres.company = companyProfile.companyName || "Ahiia.AI";
  pres.title = documentTitle;

  const primaryHex = cleanHex(brandKit.primaryColor, "0F172A");
  const accentHex = cleanHex(brandKit.secondaryColor, "2563EB");

  const isPitchDeck =
    documentType.toLowerCase().includes("deck") ||
    documentType.toLowerCase().includes("pitch") ||
    documentTitle.toLowerCase().includes("deck") ||
    documentTitle.toLowerCase().includes("pitch");

  // --------------------------------------------------------------------------
  // SLIDE 1: COVER / TITLE SLIDE
  // --------------------------------------------------------------------------
  const coverSlide = pres.addSlide();

  if (isPitchDeck) {
    if (styleTemplate === "Creative") {
      // Creative pitch deck: Midnight navy background #10183F
      coverSlide.background = { color: "10183F" };

      const initials = (companyProfile.companyName || "SolarTech")
        .split(" ")
        .filter(Boolean)
        .map((w) => w[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();

      // Brand badge in solid vibrant blue
      coverSlide.addShape(pres.ShapeType.roundRect, {
        x: 1.0,
        y: 0.8,
        w: 0.8,
        h: 0.8,
        fill: { color: accentHex },
        rectRadius: 0.15,
      });
      coverSlide.addText(initials, {
        x: 1.0,
        y: 0.8,
        w: 0.8,
        h: 0.8,
        fontSize: 16,
        bold: true,
        color: "FFFFFF",
        align: "center",
        valign: "middle",
        fontFace: "Arial",
      });

      // Company & Tagline beside badge
      coverSlide.addText(companyProfile.companyName || "SolarTech Nigeria", {
        x: 2.0,
        y: 0.8,
        w: 7.0,
        fontSize: 14,
        bold: true,
        color: "FFFFFF",
        fontFace: "Arial",
      });
      coverSlide.addText(brandKit.tagline || "Clean power, built to last", {
        x: 2.0,
        y: 1.15,
        w: 7.0,
        fontSize: 10,
        color: "93C5FD",
        fontFace: "Arial",
      });

      // Hero title (white)
      coverSlide.addText(documentTitle || "Powering Nigerian business without the grid", {
        x: 1.0,
        y: 2.6,
        w: 10.5,
        fontSize: 34,
        bold: true,
        color: "FFFFFF",
        fontFace: "Arial",
        lineSpacing: 40,
      });

      // Subtitle (light blue)
      coverSlide.addText(sections[0]?.subtitle || "Series-A raise • 2026", {
        x: 1.0,
        y: 4.8,
        w: 9.0,
        fontSize: 16,
        bold: true,
        color: "93C5FD",
        fontFace: "Arial",
      });

      // Bottom blue accent bar
      coverSlide.addShape(pres.ShapeType.rect, {
        x: 0,
        y: 6.4,
        w: "100%",
        h: 0.1,
        fill: { color: accentHex },
      });

      // Footer
      coverSlide.addText("Confidential • Investor presentation", {
        x: 1.0,
        y: 6.75,
        w: 8.0,
        fontSize: 10,
        color: "64748B",
        fontFace: "Arial",
      });
      coverSlide.addText(`1 / ${Math.max(1, sections.length)}`, {
        x: 10.3,
        y: 6.75,
        w: 2.0,
        fontSize: 10,
        color: "64748B",
        fontFace: "Arial",
        align: "right",
      });
    } else {
      coverSlide.background = { color: "FFFFFF" };
      if (styleTemplate !== "Minimal") {
        // Left brand blue vertical accent bar
        coverSlide.addShape(pres.ShapeType.rect, {
          x: 0,
          y: 0,
          w: 0.25,
          h: "100%",
          fill: { color: accentHex },
        });
      }

      const initials = (companyProfile.companyName || "SolarTech")
        .split(" ")
        .filter(Boolean)
        .map((w) => w[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();

      // Badge
      coverSlide.addShape(pres.ShapeType.roundRect, {
        x: 1.0,
        y: 0.8,
        w: 0.8,
        h: 0.8,
        fill: { color: accentHex },
        rectRadius: 0.15,
      });
      coverSlide.addText(initials, {
        x: 1.0,
        y: 0.8,
        w: 0.8,
        h: 0.8,
        fontSize: 16,
        bold: true,
        color: "FFFFFF",
        align: "center",
        valign: "middle",
        fontFace: "Arial",
      });

      if (styleTemplate !== "Minimal") {
        // Company & Tagline beside badge in Corporate
        coverSlide.addText(companyProfile.companyName || "SolarTech Nigeria", {
          x: 2.0,
          y: 0.8,
          w: 7.0,
          fontSize: 14,
          bold: true,
          color: "0F172A",
          fontFace: "Arial",
        });
        coverSlide.addText(brandKit.tagline || "Clean power, built to last", {
          x: 2.0,
          y: 1.15,
          w: 7.0,
          fontSize: 10,
          color: "64748B",
          fontFace: "Arial",
        });
      }

      // Hero title
      coverSlide.addText(documentTitle || "Powering Nigerian business without the grid", {
        x: 1.0,
        y: 2.6,
        w: 10.5,
        fontSize: 34,
        bold: true,
        color: "0B1536",
        fontFace: "Arial",
        lineSpacing: 40,
      });

      if (styleTemplate !== "Minimal") {
        // Accent line
        coverSlide.addShape(pres.ShapeType.roundRect, {
          x: 1.0,
          y: 4.4,
          w: 1.2,
          h: 0.08,
          fill: { color: accentHex },
          rectRadius: 0.04,
        });
      }

      // Subtitle
      coverSlide.addText(sections[0]?.subtitle || "Series-A raise • 2026", {
        x: 1.0,
        y: styleTemplate === "Minimal" ? 4.2 : 4.8,
        w: 9.0,
        fontSize: 16,
        bold: styleTemplate !== "Minimal",
        color: styleTemplate === "Minimal" ? "475569" : "0B1536",
        fontFace: "Arial",
      });

      // Footer
      coverSlide.addShape(pres.ShapeType.line, {
        x: 1.0,
        y: 6.6,
        w: 11.3,
        h: 0,
        line: { color: "E2E8F0", width: 1 },
      });
      coverSlide.addText(
        styleTemplate === "Minimal"
          ? `${companyProfile.companyName || "SolarTech Nigeria"} • ${brandKit.tagline || "Clean power, built to last"}`
          : "Confidential • Investor presentation",
        {
          x: 1.0,
          y: 6.75,
          w: 8.0,
          fontSize: 10,
          color: "94A3B8",
          fontFace: "Arial",
        }
      );
      coverSlide.addText(`1 / ${Math.max(1, sections.length)}`, {
        x: 10.3,
        y: 6.75,
        w: 2.0,
        fontSize: 10,
        color: "94A3B8",
        fontFace: "Arial",
        align: "right",
      });
    }
  } else if (styleTemplate === "Creative") {
    coverSlide.background = { color: primaryHex };
    // Accent shape
    coverSlide.addShape(pres.ShapeType.rect, {
      x: 0,
      y: 0,
      w: 0.35,
      h: "100%",
      fill: { color: accentHex },
    });
    // Category pill
    coverSlide.addText(documentType.toUpperCase(), {
      x: 1.0,
      y: 2.0,
      fontSize: 12,
      bold: true,
      color: accentHex,
      fontFace: "Arial",
    });
    // Title
    coverSlide.addText(documentTitle, {
      x: 1.0,
      y: 2.6,
      w: 11.0,
      fontSize: 36,
      bold: true,
      color: "FFFFFF",
      fontFace: "Arial",
    });
    // Subtitle / Prepared for
    coverSlide.addText(
      `Prepared for: ${companyProfile.preparedFor || "Valued Client"}\nBy: ${companyProfile.companyName || "Ahiia"} · ${new Date().toLocaleDateString()}`,
      {
        x: 1.0,
        y: 4.5,
        w: 9.0,
        fontSize: 14,
        color: "94A3B8",
        fontFace: "Arial",
      }
    );
  } else if (styleTemplate === "Corporate") {
    coverSlide.background = { color: "F8FAFC" };
    // Top border line
    coverSlide.addShape(pres.ShapeType.rect, {
      x: 0,
      y: 0,
      w: "100%",
      h: 0.2,
      fill: { color: accentHex },
    });
    // Accent block
    coverSlide.addShape(pres.ShapeType.rect, {
      x: 1.2,
      y: 2.2,
      w: 0.15,
      h: 1.8,
      fill: { color: accentHex },
    });
    coverSlide.addText(documentTitle, {
      x: 1.6,
      y: 2.2,
      w: 10.5,
      fontSize: 34,
      bold: true,
      color: primaryHex,
      fontFace: "Calibri",
    });
    coverSlide.addText(
      `${documentType.toUpperCase()} · ${companyProfile.companyName || "SolarTech"}`,
      {
        x: 1.6,
        y: 3.4,
        w: 10.0,
        fontSize: 14,
        bold: true,
        color: accentHex,
        fontFace: "Calibri",
      }
    );
    coverSlide.addText(
      `Prepared for: ${companyProfile.preparedFor || "Green Energy Solutions"}\nDate: ${new Date().toLocaleDateString()}`,
      {
        x: 1.6,
        y: 4.4,
        w: 9.0,
        fontSize: 12,
        color: "64748B",
        fontFace: "Calibri",
      }
    );
  } else {
    // Minimal
    coverSlide.background = { color: "FFFFFF" };
    coverSlide.addText(documentTitle, {
      x: 1.2,
      y: 2.8,
      w: 10.5,
      fontSize: 36,
      bold: true,
      color: "1E293B",
      fontFace: "Arial",
    });
    coverSlide.addText(
      `${documentType} · ${companyProfile.preparedFor || "Client"}`,
      {
        x: 1.2,
        y: 4.0,
        w: 10.0,
        fontSize: 13,
        color: "64748B",
        fontFace: "Arial",
      }
    );
  }

  // --------------------------------------------------------------------------
  // CONTENT SLIDES (One per Section)
  // --------------------------------------------------------------------------
  sections.forEach((sec, idx) => {
    if (isPitchDeck && idx === 0 && (sec.isCover || sec.key === "cover")) return;
    const slide = pres.addSlide();
    slide.background = { color: "FFFFFF" };

    if (isPitchDeck) {
      if (styleTemplate === "Creative") {
        // Creative Top Midnight Navy Banner
        slide.addShape(pres.ShapeType.rect, {
          x: 0,
          y: 0,
          w: "100%",
          h: 2.2,
          fill: { color: "10183F" },
        });

        // Kicker in sky blue
        slide.addText(sec.kicker || sec.title || "Traction", {
          x: 0.8,
          y: 0.35,
          w: 2.5,
          fontSize: 11,
          bold: true,
          color: "60A5FA",
          fontFace: "Arial",
        });

        // Giant Ghost Slide Number
        slide.addText(String(idx + 1).padStart(2, "0"), {
          x: 0.8,
          y: 0.65,
          w: 1.8,
          fontSize: 38,
          bold: true,
          color: "263366",
          fontFace: "Arial",
        });

        // Hero headline (bold white)
        slide.addText(sec.title || "", {
          x: 2.5,
          y: 0.6,
          w: 10.2,
          fontSize: 24,
          bold: true,
          color: "FFFFFF",
          fontFace: "Arial",
          lineSpacing: 30,
        });

        let currentY = 2.6;

        // Bullets
        if (Array.isArray(sec.bullets) && sec.bullets.length > 0) {
          const bulletItems = sec.bullets.map((b) => ({
            text: b,
            options: {
              bullet: { type: "round", color: accentHex },
              color: "0F172A",
              fontSize: 14,
              bold: true,
            },
          }));
          slide.addText(bulletItems, {
            x: 0.8,
            y: currentY,
            w: 11.5,
            h: 2.2,
            fontFace: "Arial",
            lineSpacing: 28,
          });
          currentY += Math.min(2.2, sec.bullets.length * 0.6 + 0.4);
        }

        // Solid Vibrant Blue Metric Card
        if (sec.metricValue) {
          slide.addShape(pres.ShapeType.roundRect, {
            x: 0.8,
            y: currentY,
            w: 4.8,
            h: 1.3,
            fill: { color: accentHex },
            rectRadius: 0.15,
          });
          slide.addText(sec.metricValue, {
            x: 1.0,
            y: currentY + 0.1,
            w: 4.4,
            fontSize: 26,
            bold: true,
            color: "FFFFFF",
            fontFace: "Arial",
          });
          slide.addText(sec.metricLabel || "Metric target", {
            x: 1.0,
            y: currentY + 0.75,
            w: 4.4,
            fontSize: 10,
            bold: false,
            color: "DBEAFE",
            fontFace: "Arial",
          });
        }

        // Footer
        slide.addText(companyProfile.companyName || "SolarTech Nigeria", {
          x: 0.8,
          y: 6.85,
          w: 6.0,
          fontSize: 10,
          color: "64748B",
          fontFace: "Arial",
        });
        slide.addText(`${idx + 1} / ${sections.length}`, {
          x: 10.5,
          y: 6.85,
          w: 2.0,
          fontSize: 10,
          color: "64748B",
          fontFace: "Arial",
          align: "right",
        });
        return;
      }

      if (styleTemplate === "Minimal") {
        // Minimal Kicker: Muted gray, spaced, no right dash
        slide.addText((sec.kicker || sec.title || "Traction").toUpperCase(), {
          x: 0.8,
          y: 0.5,
          w: 6.0,
          fontSize: 11,
          bold: true,
          color: "94A3B8",
          fontFace: "Arial",
        });
      } else {
        // Corporate Kicker: Vibrant blue with top-right dash
        slide.addText(sec.kicker || sec.title || "Traction", {
          x: 0.8,
          y: 0.5,
          w: 6.0,
          fontSize: 13,
          bold: true,
          color: accentHex,
          fontFace: "Arial",
        });

        // Top right dash
        slide.addShape(pres.ShapeType.roundRect, {
          x: 11.5,
          y: 0.55,
          w: 0.8,
          h: 0.06,
          fill: { color: accentHex },
          rectRadius: 0.03,
        });
      }

      // Headline
      slide.addText(sec.title, {
        x: 0.8,
        y: 1.0,
        w: 11.5,
        fontSize: 26,
        bold: true,
        color: "0B1536",
        fontFace: "Arial",
      });

      let currentY = 1.9;

      // Metric card
      if (sec.metricValue) {
        if (styleTemplate === "Minimal") {
          slide.addShape(pres.ShapeType.roundRect, {
            x: 0.8,
            y: currentY,
            w: 3.2,
            h: 1.2,
            fill: { color: "FFFFFF" },
            line: { color: "E2E8F0", width: 1 },
            rectRadius: 0.15,
          });
          slide.addText(sec.metricValue, {
            x: 1.0,
            y: currentY + 0.1,
            w: 2.8,
            fontSize: 24,
            bold: true,
            color: "0B1536",
            fontFace: "Arial",
          });
          slide.addText(sec.metricLabel || "", {
            x: 1.0,
            y: currentY + 0.65,
            w: 2.8,
            fontSize: 10,
            bold: false,
            color: "64748B",
            fontFace: "Arial",
          });
        } else {
          slide.addShape(pres.ShapeType.roundRect, {
            x: 0.8,
            y: currentY,
            w: 3.2,
            h: 1.2,
            fill: { color: "EFF4FF" },
            line: { color: "DBEAFE", width: 1 },
            rectRadius: 0.15,
          });
          slide.addText(sec.metricValue, {
            x: 1.0,
            y: currentY + 0.1,
            w: 2.8,
            fontSize: 24,
            bold: true,
            color: accentHex,
            fontFace: "Arial",
          });
          slide.addText(sec.metricLabel || "", {
            x: 1.0,
            y: currentY + 0.65,
            w: 2.8,
            fontSize: 10,
            bold: true,
            color: "475569",
            fontFace: "Arial",
          });
        }
        currentY += 1.5;
      }

      // Bullets
      if (Array.isArray(sec.bullets) && sec.bullets.length > 0) {
        if (styleTemplate === "Minimal") {
          const numberedItems = sec.bullets.map((b, bI) => ({
            text: `${String(bI + 1).padStart(2, "0")}   ${b}\n`,
            options: { bullet: false, color: "1E293B", fontSize: 14, bold: true },
          }));
          slide.addText(numberedItems, {
            x: 0.8,
            y: currentY,
            w: 11.5,
            h: 3.2,
            fontFace: "Arial",
            lineSpacing: 28,
          });
        } else {
          const bulletItems = sec.bullets.map((b) => ({
            text: b,
            options: { bullet: true, color: "1E293B", fontSize: 14, bold: true },
          }));
          slide.addText(bulletItems, {
            x: 0.8,
            y: currentY,
            w: 11.5,
            h: 3.2,
            fontFace: "Arial",
            lineSpacing: 26,
          });
        }
      }

      // Footer
      slide.addShape(pres.ShapeType.line, {
        x: 0.8,
        y: 6.7,
        w: 11.7,
        h: 0,
        line: { color: "E2E8F0", width: 1 },
      });
      slide.addText(companyProfile.companyName || "SolarTech Nigeria", {
        x: 0.8,
        y: 6.85,
        w: 6.0,
        fontSize: 10,
        color: "94A3B8",
        fontFace: "Arial",
      });
      slide.addText(`${idx + 1} / ${sections.length}`, {
        x: 10.5,
        y: 6.85,
        w: 2.0,
        fontSize: 10,
        color: "94A3B8",
        fontFace: "Arial",
        align: "right",
      });
      return;
    }

    const textColor = styleTemplate === "Creative" ? "FFFFFF" : "1E293B";
    const subtextColor = styleTemplate === "Creative" ? "94A3B8" : "475569";
    const cardBg = styleTemplate === "Creative" ? "1E293B" : "F8FAFC";

    // Slide Header
    slide.addText(sec.title, {
      x: 0.8,
      y: 0.6,
      w: 11.0,
      fontSize: 22,
      bold: true,
      color: styleTemplate === "Corporate" ? primaryHex : textColor,
      fontFace: "Arial",
    });

    slide.addShape(pres.ShapeType.line, {
      x: 0.8,
      y: 1.2,
      w: 11.7,
      h: 0,
      line: { color: accentHex, width: 2 },
    });

    let currentY = 1.6;

    // Lead text
    if (sec.leadText) {
      slide.addText(sec.leadText, {
        x: 0.8,
        y: currentY,
        w: 11.5,
        fontSize: 13,
        italic: true,
        color: subtextColor,
        fontFace: "Arial",
      });
      currentY += 0.5;
    }

    // Paragraphs
    if (Array.isArray(sec.paragraphs) && sec.paragraphs.length > 0) {
      const pText = sec.paragraphs.join("\n\n");
      slide.addText(pText, {
        x: 0.8,
        y: currentY,
        w: 11.5,
        h: 4.5,
        fontSize: 13,
        color: textColor,
        fontFace: "Arial",
        lineSpacing: 22,
      });
      currentY += 2.5;
    }

    // Bullets
    if (Array.isArray(sec.bullets) && sec.bullets.length > 0) {
      const bulletItems = sec.bullets.map((b) => ({
        text: b,
        options: { bullet: true, color: textColor, fontSize: 13 },
      }));
      slide.addText(bulletItems, {
        x: 0.8,
        y: currentY,
        w: 11.5,
        h: 4.0,
        fontFace: "Arial",
        lineSpacing: 24,
      });
    }

    // Procedure Steps
    if (Array.isArray(sec.steps) && sec.steps.length > 0) {
      const stepItems = sec.steps.map((s, sIdx) => ({
        text: `${sIdx + 1}.  ${s}`,
        options: { color: textColor, fontSize: 12, bold: false },
      }));
      slide.addText(stepItems, {
        x: 0.8,
        y: currentY,
        w: 11.5,
        h: 4.2,
        fontFace: "Arial",
        lineSpacing: 24,
      });
    }

    // Key-Value rows or Callouts
    if (Array.isArray(sec.keyValueRows) && sec.keyValueRows.length > 0) {
      const rows = sec.keyValueRows.map((r) => [
        { text: r.key, options: { bold: true, color: accentHex, fill: cardBg } },
        { text: r.value, options: { color: textColor, fill: cardBg } },
      ]);
      slide.addTable(rows, {
        x: 0.8,
        y: currentY,
        w: 11.5,
        fontSize: 12,
        colW: [3.5, 8.0],
        border: { color: "CBD5E1", pt: 1 },
      });
      currentY += rows.length * 0.45 + 0.4;

      if (sec.disclosure) {
        slide.addShape(pres.ShapeType.rect, {
          x: 0.8,
          y: currentY,
          w: 11.5,
          h: 0.9,
          fill: { color: "F1F5F9" },
          line: { color: "CBD5E1", width: 1 },
        });
        slide.addText(
          `${sec.disclosure.title}: ${sec.disclosure.content}`,
          {
            x: 1.0,
            y: currentY + 0.1,
            w: 11.1,
            fontSize: 10,
            italic: true,
            color: "475569",
            fontFace: "Arial",
          }
        );
      }
    }

    // Slide Footer
    slide.addText(
      `${documentTitle} · ${companyProfile.companyName || "Ahiia"}`,
      {
        x: 0.8,
        y: 6.9,
        w: 8.0,
        fontSize: 9,
        color: "94A3B8",
        fontFace: "Arial",
      }
    );
    slide.addText(`Slide ${idx + 2}`, {
      x: 10.5,
      y: 6.9,
      w: 2.0,
      fontSize: 9,
      color: "94A3B8",
      fontFace: "Arial",
      align: "right",
    });
  });

  const finalFilename =
    filename ||
    `${documentTitle.replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "_")}_${styleTemplate}.pptx`;
  await pres.writeFile({ fileName: finalFilename });
}

/**
 * ============================================================================
 * 3. REAL DOCX GENERATION (Using docx)
 * ============================================================================
 * Generates an editable Microsoft Word document (.docx).
 */
export async function exportToDocx({
  documentTitle = "Untitled Document",
  documentType = "Proposal",
  styleTemplate = "Corporate",
  brandKit = {},
  companyProfile = {},
  sections = [],
  filename,
}) {
  const primaryHex = cleanHex(brandKit.primaryColor, "0F172A");
  const accentHex = cleanHex(brandKit.secondaryColor, "2563EB");

  const isContract =
    documentType.toLowerCase().includes("contract") ||
    documentType.toLowerCase().includes("agreement") ||
    documentTitle.toLowerCase().includes("contract") ||
    documentTitle.toLowerCase().includes("agreement");

  const isMarketingPlan =
    !isContract &&
    (documentType.toLowerCase().includes("marketing") ||
      documentTitle.toLowerCase().includes("marketing"));

  const contractTitle =
    isContract &&
    (documentTitle.toLowerCase().includes("partnership")
      ? "SERVICE AGREEMENT"
      : documentTitle.toUpperCase());

  const planTitle =
    isMarketingPlan &&
    (documentTitle.toLowerCase().includes("plan")
      ? documentTitle.toUpperCase()
      : `${(documentTitle || "MARKETING PLAN").toUpperCase()} 2026`);

  const docChildren = [
    // Document Title
    new Paragraph({
      text: isMarketingPlan ? planTitle : isContract ? contractTitle : documentTitle,
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 120 },
      style: { run: { color: primaryHex, bold: true, size: 40 } },
    }),

    // Subtitle / Type
    new Paragraph({
      children: [
        new TextRun({
          text: isMarketingPlan
            ? `MARKETING PLAN  ·  ${companyProfile.companyName || "SolarTech Nigeria"}  ·  ${styleTemplate} Layout`
            : isContract
              ? `CONTRACT  ·  ${companyProfile.companyName || "SolarTech Nigeria"}`
              : `${documentType.toUpperCase()}  ·  ${companyProfile.companyName || "Ahiia"}  ·  ${styleTemplate} Style`,
          bold: true,
          color: accentHex,
          size: 20,
        }),
      ],
      spacing: { after: 240 },
    }),

    // Metadata details
    new Paragraph({
      children: [
        new TextRun({
          text: isMarketingPlan
            ? `Prepared for: ${companyProfile.preparedFor || "Commercial team"}   |   Prepared by: ${companyProfile.preparedBy || companyProfile.companyName || "SolarTech Nigeria"}`
            : isContract
              ? `Between: ${companyProfile.preparedFor || "Lagos SME Partners Ltd."} ("the Client")   |   And: ${companyProfile.companyName || "SolarTech Nigeria"} ("the Provider")`
              : `Prepared for: ${companyProfile.preparedFor || "Client"}   |   Date: ${new Date().toLocaleDateString()}`,
          color: "64748B",
          size: 18,
        }),
      ],
      spacing: { after: 400 },
    }),
  ];

  // Process sections
  sections.forEach((sec, idx) => {
    // Section Header
    const displayDocxTitle = isContract
      ? `${idx + 1}. ${sec.title}`
      : isMarketingPlan
        ? sec.title
        : `${idx + 1}. ${sec.title}`;

    docChildren.push(
      new Paragraph({
        text: displayDocxTitle,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 280, after: 120 },
        style: {
          run: {
            color: (isContract || isMarketingPlan) && styleTemplate === "Creative" ? accentHex : primaryHex,
            bold: true,
            size: 26,
          },
        },
      })
    );

    // Lead text
    if (sec.leadText) {
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: sec.leadText,
              italics: true,
              color: "475569",
              size: 20,
            }),
          ],
          spacing: { after: 120 },
        })
      );
    }

    // Paragraphs
    if (Array.isArray(sec.paragraphs)) {
      sec.paragraphs.forEach((p) => {
        if (!p) return;
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: p,
                color: "334155",
                size: 22,
              }),
            ],
            spacing: { after: 140 },
          })
        );
      });
    }

    // Bullets
    if (Array.isArray(sec.bullets)) {
      sec.bullets.forEach((b) => {
        if (!b) return;
        if ((isContract || isMarketingPlan) && styleTemplate === "Minimal") {
          docChildren.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `—  ${b}`,
                  color: "334155",
                  size: 22,
                }),
              ],
              spacing: { after: 100 },
              indent: { left: 360 },
            })
          );
        } else {
          docChildren.push(
            new Paragraph({
              text: b,
              bullet: { level: 0 },
              spacing: { after: 80 },
            })
          );
        }
      });
    }

    // Steps
    if (Array.isArray(sec.steps)) {
      sec.steps.forEach((step, sIdx) => {
        if (!step) return;
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Step ${sIdx + 1}: `,
                bold: true,
                color: accentHex,
              }),
              new TextRun({
                text: step,
                color: "1E293B",
              }),
            ],
            spacing: { after: 100 },
          })
        );
      });
    }

    // Key Value Rows
    if (Array.isArray(sec.keyValueRows) && sec.keyValueRows.length > 0) {
      const rows = sec.keyValueRows.map(
        (r) =>
          new TableRow({
            children: [
              new TableCell({
                width: { size: isContract ? 45 : 30, type: WidthType.PERCENTAGE },
                borders: isContract
                  ? {
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.SINGLE, size: 1, color: "F1F5F9" },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE },
                    }
                  : undefined,
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: r.key,
                        bold: /contract value|total/i.test(r.key) || !isContract,
                        color: primaryHex,
                        size: 22,
                      }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                width: { size: isContract ? 55 : 70, type: WidthType.PERCENTAGE },
                borders: isContract
                  ? {
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.SINGLE, size: 1, color: "F1F5F9" },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE },
                    }
                  : undefined,
                children: [
                  new Paragraph({
                    alignment: isContract ? AlignmentType.RIGHT : AlignmentType.LEFT,
                    children: [
                      new TextRun({
                        text: r.value || "—",
                        bold: isContract,
                        color: "0F172A",
                        size: 22,
                      }),
                    ],
                  }),
                ],
              }),
            ],
          })
      );

      docChildren.push(
        new Table({
          rows,
          width: { size: 100, type: WidthType.PERCENTAGE },
        })
      );

      if (sec.disclosure) {
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${sec.disclosure.title}: `,
                bold: true,
                color: accentHex,
              }),
              new TextRun({
                text: sec.disclosure.content,
                italics: true,
                color: "475569",
              }),
            ],
            spacing: { before: 120, after: 160 },
          })
        );
      }
    }

    // Callouts
    if (Array.isArray(sec.callouts)) {
      sec.callouts.forEach((c) => {
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `[${c.title || "Note"}]: `,
                bold: true,
                color: c.type === "warning" ? "DC2626" : accentHex,
              }),
              new TextRun({
                text: c.content || "",
                italics: true,
                color: "475569",
              }),
            ],
            spacing: { before: 100, after: 140 },
          })
        );
      });
    }

    // Guidance callout (Contracts)
    if (
      sec.guidance ||
      (isContract &&
        (/termination/i.test(sec.title || sec.key || "") ||
          /term/i.test(sec.title || sec.key || "")))
    ) {
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "Guidance flagged this clause: ",
              bold: true,
              color: "B45309",
            }),
            new TextRun({
              text:
                sec.guidance?.content ||
                "No liability cap or governing-law clause is present. Review before sending — Ahiia does not add legal terms you did not provide.",
              italics: true,
              color: "92400E",
            }),
          ],
          spacing: { before: 120, after: 160 },
        })
      );
    }
  });

  // Standalone signatures table for Contracts
  if (isContract) {
    docChildren.push(
      new Paragraph({
        text: "Signatures",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 280, after: 160 },
        style: { run: { color: primaryHex, bold: true, size: 26 } },
      }),
      new Table({
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "___________________________",
                        color: "0F172A",
                      }),
                    ],
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "For the Client\n",
                        color: "64748B",
                        size: 18,
                      }),
                      new TextRun({
                        text: companyProfile.preparedFor || "Lagos SME Partners Ltd.\n",
                        bold: true,
                        color: "0F172A",
                        size: 20,
                      }),
                      new TextRun({
                        text: "Name, title and date",
                        color: "94A3B8",
                        size: 16,
                      }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "___________________________",
                        color: "0F172A",
                      }),
                    ],
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "For the Provider\n",
                        color: "64748B",
                        size: 18,
                      }),
                      new TextRun({
                        text:
                          companyProfile.companyName ||
                          companyProfile.preparedBy ||
                          "SolarTech Nigeria\n",
                        bold: true,
                        color: "0F172A",
                        size: 20,
                      }),
                      new TextRun({
                        text: "Name, title and date",
                        color: "94A3B8",
                        size: 16,
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
        width: { size: 100, type: WidthType.PERCENTAGE },
      })
    );
  }

  const doc = new DocxDocument({
    sections: [
      {
        properties: {},
        children: docChildren,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const finalFilename =
    filename ||
    `${documentTitle.replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "_")}_${styleTemplate}.docx`;
  triggerBlobDownload(blob, finalFilename);
  return blob;
}
