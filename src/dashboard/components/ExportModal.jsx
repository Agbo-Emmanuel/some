import React, { useState, useEffect } from "react";
import { X, Check, Download, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { exportDocument, updateDocumentStatus } from "../../services/document.service";
import {
  exportToPdf,
  exportToPptx,
  exportToDocx,
} from "../../services/documentExportEngine";

/**
 * Standard formats mapped by document type.
 * Each document template in the platform can provide or inherit its supported formats.
 */
export const DEFAULT_FORMATS_BY_TYPE = {
  "pitch-deck": [
    {
      id: "PPTX",
      name: "PPTX",
      description:
        "Editable slides for PowerPoint, Keynote or Google Slides. Every slide stays its own slide.",
    },
    {
      id: "PDF",
      name: "PDF",
      description:
        "One 16:9 page per slide, in order. Best for sending to investors.",
    },
  ],
  pitchdeck: [
    {
      id: "PPTX",
      name: "PPTX",
      description:
        "Editable slides for PowerPoint, Keynote or Google Slides. Every slide stays its own slide.",
    },
    {
      id: "PDF",
      name: "PDF",
      description:
        "One 16:9 page per slide, in order. Best for sending to investors.",
    },
  ],
  sop: [
    {
      id: "PDF",
      name: "PDF",
      description:
        "Clean, standardized procedural document suitable for internal compliance and team distribution.",
    },
    {
      id: "DOCX",
      name: "DOCX",
      description:
        "Editable Word document for team process updates and policy revisions.",
    },
  ],
  "business-proposal": [
    {
      id: "PDF",
      name: "PDF",
      description:
        "High-resolution print-ready document. Best for sending to clients and signing.",
    },
    {
      id: "DOCX",
      name: "DOCX",
      description:
        "Fully editable Word document with preserved layout, tables and pricing.",
    },
    {
      id: "PPTX",
      name: "PPTX",
      description:
        "Slide deck overview for executive presentation.",
    },
  ],
  proposal: [
    {
      id: "PDF",
      name: "PDF",
      description:
        "High-resolution print-ready document. Best for sending to clients and signing.",
    },
    {
      id: "DOCX",
      name: "DOCX",
      description:
        "Fully editable Word document with preserved layout, tables and pricing.",
    },
    {
      id: "PPTX",
      name: "PPTX",
      description:
        "Slide deck overview for executive presentation.",
    },
  ],
  contract: [
    {
      id: "PDF",
      name: "PDF",
      description:
        "Legally formatted document ready for signature and execution.",
    },
    {
      id: "DOCX",
      name: "DOCX",
      description:
        "Editable agreement text for legal review and redlining.",
    },
  ],
  "marketing-plan": [
    {
      id: "PDF",
      name: "PDF",
      description:
        "Comprehensive presentation-ready marketing plan document.",
    },
    {
      id: "PPTX",
      name: "PPTX",
      description:
        "Slide deck format for marketing reviews and stakeholder presentations.",
    },
    {
      id: "DOCX",
      name: "DOCX",
      description:
        "Editable strategic brief and plan document.",
    },
  ],
  marketingplan: [
    {
      id: "PDF",
      name: "PDF",
      description:
        "Comprehensive presentation-ready marketing plan document.",
    },
    {
      id: "PPTX",
      name: "PPTX",
      description:
        "Slide deck format for marketing reviews and stakeholder presentations.",
    },
    {
      id: "DOCX",
      name: "DOCX",
      description:
        "Editable strategic brief and plan document.",
    },
  ],
  "business-plan": [
    {
      id: "PDF",
      name: "PDF",
      description:
        "Full business plan report with executive summary and financial forecasts.",
    },
    {
      id: "DOCX",
      name: "DOCX",
      description:
        "Editable document for continuous business planning and revision.",
    },
  ],
  businessplan: [
    {
      id: "PDF",
      name: "PDF",
      description:
        "Full business plan report with executive summary and financial forecasts.",
    },
    {
      id: "DOCX",
      name: "DOCX",
      description:
        "Editable document for continuous business planning and revision.",
    },
  ],
};

const DEFAULT_FALLBACK_FORMATS = [
  {
    id: "PDF",
    name: "PDF",
    description:
      "Standard high-resolution document. Best for sharing, presentation and printing.",
  },
  {
    id: "DOCX",
    name: "DOCX",
    description:
      "Fully editable Word document with preserved formatting and styles.",
  },
  {
    id: "PPTX",
    name: "PPTX",
    description:
      "Editable slides for PowerPoint, Keynote or Google Slides.",
  },
];

/**
 * Standard available design styles across the platform
 */
export const AVAILABLE_STYLES = [
  { id: "Corporate", name: "Corporate" },
  { id: "Minimal", name: "Minimal" },
  { id: "Creative", name: "Creative" },
];

/**
 * Reusable Centralized Export Modal Component
 */
const ExportModal = ({
  isOpen,
  onClose,
  documentId,
  documentType = "Proposal",
  documentTypeLabel,
  documentTitle = "Untitled Document",
  currentStyle = "Creative",
  onStyleChange,
  supportedFormats,
  availableStyles = AVAILABLE_STYLES,
  brandKit = {},
  companyName = "SolarTech Nigeria",
  companyProfile = {},
  sections = [],
  summaryText,
  itemCount,
  onExport,
}) => {
  // Normalize document type key
  const normalizedType = String(documentType || "proposal")
    .toLowerCase()
    .replace(/[_\s]/g, "-");

  // Determine formats list
  const formatsList =
    supportedFormats && supportedFormats.length > 0
      ? supportedFormats
      : DEFAULT_FORMATS_BY_TYPE[normalizedType] || DEFAULT_FALLBACK_FORMATS;

  const [selectedFormat, setSelectedFormat] = useState(
    formatsList[0]?.id || "PDF"
  );
  const [selectedStyle, setSelectedStyle] = useState(currentStyle);
  const [isExporting, setIsExporting] = useState(false);

  // Sync internal style when currentStyle prop changes or modal opens
  useEffect(() => {
    if (currentStyle) {
      setSelectedStyle(currentStyle);
    }
  }, [currentStyle, isOpen]);

  // Sync default format when formatsList updates
  useEffect(() => {
    if (formatsList && formatsList.length > 0) {
      const match = formatsList.find((f) => f.id === selectedFormat);
      if (!match) {
        setSelectedFormat(formatsList[0].id);
      }
    }
  }, [formatsList]);

  // Prevent background scrolling while modal is open, but preserve cleanup
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle style change
  const handleSelectStyle = (styleId) => {
    setSelectedStyle(styleId);
    if (onStyleChange) {
      onStyleChange(styleId);
    }
  };

  // Compute initials for brand icon
  const initials = (companyProfile.companyName || companyName || "SolarTech Nigeria")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "SN";

  // Derive dynamic summary text
  const fontName = brandKit.font || "Montserrat";
  const displayDocType =
    documentTypeLabel ||
    (normalizedType.includes("pitch")
      ? "Pitch Deck"
      : normalizedType.includes("sop")
        ? "SOP"
        : normalizedType.includes("proposal")
          ? "Business Proposal"
          : normalizedType.includes("contract")
            ? "Contract"
            : normalizedType.includes("marketing")
              ? "Marketing Plan"
              : normalizedType.includes("business-plan")
                ? "Business Plan"
                : documentType);

  const defaultSummary = (() => {
    if (normalizedType.includes("pitch")) {
      const count = itemCount || (sections?.length || 5);
      return `${count} individual 16:9 slides in their current order ${selectedStyle} style with your logo, ${fontName} and brand colors.`;
    }
    if (normalizedType.includes("sop")) {
      const count = itemCount || (sections?.length || 4);
      return `${count} operational sections in their current order ${selectedStyle} style with your logo, ${fontName} and brand colors.`;
    }
    const count = itemCount || (sections?.length || 4);
    return `${count} document sections in their current order ${selectedStyle} style with your logo, ${fontName} and brand colors.`;
  })();

  const activeSummaryText = summaryText || defaultSummary;

  // Execute export download
  const handleDownload = async () => {
    setIsExporting(true);

    try {
      // 1. If custom onExport handler provided, invoke it
      if (onExport) {
        await onExport({
          format: selectedFormat,
          styleTemplate: selectedStyle,
          documentId,
          documentTitle,
          documentType: displayDocType,
          brandKit,
          companyProfile,
          sections,
        });
        toast.success(`Exported ${documentTitle} as ${selectedFormat}`);
        onClose();
        return;
      }

      // 2. Try backend API export if documentId exists and is valid
      let backendExportSucceeded = false;
      if (documentId && documentId !== "new") {
        try {
          const res = await exportDocument(documentId, {
            format: selectedFormat,
            styleTemplate: selectedStyle,
            responseType: "blob",
          });

          const downloadUrl =
            res?.downloadUrl ||
            res?.url ||
            res?.data?.downloadUrl ||
            res?.data?.url ||
            res?.fileUrl ||
            res?.data?.fileUrl;

          const blobData =
            res?.data ||
            res?.file ||
            (res instanceof Blob ? res : null);

          if (downloadUrl) {
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = `${(documentTitle || "document").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "_")}_${selectedStyle}.${selectedFormat.toLowerCase()}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            backendExportSucceeded = true;
          } else if (blobData instanceof Blob && blobData.size > 0) {
            const url = URL.createObjectURL(blobData);
            const link = document.createElement("a");
            const safeName = (documentTitle || "document")
              .replace(/[^\w\s-]/g, "")
              .trim()
              .replace(/\s+/g, "_");
            link.href = url;
            link.download = `${safeName}_${selectedStyle}.${selectedFormat.toLowerCase()}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            backendExportSucceeded = true;
          }
        } catch (apiErr) {
          console.warn("Backend export endpoint not available or errored, generating client document:", apiErr);
        }
      }

      // 3. High-fidelity Client Document Generator (PDF, PPTX, DOCX)
      // Generates the real document content, structure, styling, and branding.
      // NEVER touches window.print() or captures any UI elements!
      if (!backendExportSucceeded) {
        const payload = {
          documentTitle,
          documentType: displayDocType,
          styleTemplate: selectedStyle,
          brandKit,
          companyProfile: {
            companyName: companyProfile.companyName || companyName,
            ...companyProfile,
          },
          sections: Array.isArray(sections) && sections.length > 0 ? sections : [
            {
              title: "Executive Summary",
              paragraphs: [
                `This document outlines the strategic specifications, procedural scope, and deliverables for ${documentTitle}.`,
              ],
            },
          ],
        };

        if (selectedFormat === "PDF") {
          await exportToPdf(payload);
        } else if (selectedFormat === "PPTX") {
          await exportToPptx(payload);
        } else if (selectedFormat === "DOCX") {
          await exportToDocx(payload);
        } else {
          await exportToPdf(payload);
        }
      }

      if (documentId && documentId !== "new") {
        try {
          await updateDocumentStatus(documentId, { status: "Exported" });
          window.dispatchEvent(
            new CustomEvent("ahiia:document-updated", {
              detail: { documentId, status: "Exported" },
            })
          );
        } catch (err) {
          console.warn("Could not sync exported status with server:", err);
        }
      }

      toast.success(`Downloaded ${documentTitle} (${selectedFormat})`);
      onClose();
    } catch (err) {
      console.error("Export failed:", err);
      toast.error("Failed to export document. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
    >
      <div className="flex min-h-full items-center justify-center p-3 sm:p-4 md:p-6 text-center">
        <div
          className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-[480px] sm:max-w-[500px] max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] flex flex-col overflow-hidden text-left relative animate-in zoom-in-95 duration-150 my-auto"
          onClick={(e) => e.stopPropagation()}
        >
        {/* ================================================================== */}
        {/* MODAL HEADER                                                       */}
        {/* ================================================================== */}
        <div className="p-4 sm:p-5 md:p-6 pb-3 sm:pb-3.5 flex items-start justify-between shrink-0">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Export {displayDocType}
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5 line-clamp-1">
              {documentTitle}
            </p>
          </div>
          <button
            id="export-modal-close-btn"
            type="button"
            onClick={onClose}
            disabled={isExporting}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Close export dialog"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        <div className="border-b border-slate-100 shrink-0" />

        <div className="p-4 sm:p-5 md:p-6 pt-3 sm:pt-3.5 space-y-3 sm:space-y-3.5 overflow-y-auto overflow-x-hidden flex-1 min-h-0">
          {/* ================================================================ */}
          {/* 1. FILE FORMAT SELECTION                                         */}
          {/* ================================================================ */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 mb-1.5">
              File format
            </h3>
            <div className="space-y-2">
              {formatsList.map((format) => {
                const isSelected = selectedFormat === format.id;
                return (
                  <div
                    key={format.id}
                    onClick={() => !isExporting && setSelectedFormat(format.id)}
                    className={`flex items-start gap-3 p-3 rounded-2xl cursor-pointer text-left transition-all ${
                      isSelected
                        ? "border-2 border-[#2563EB] bg-blue-50/20 shadow-xs"
                        : "border border-slate-200 hover:border-slate-300 bg-white"
                    } ${isExporting ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    {/* Format Icon */}
                    <div className="w-8 h-8 rounded-xl bg-blue-50/80 border border-blue-100 flex items-center justify-center shrink-0 mt-0.5 text-[#2563EB]">
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="8" y1="13" x2="16" y2="13" />
                        <line x1="8" y1="17" x2="12" y2="17" />
                      </svg>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-black text-slate-900 tracking-wide uppercase">
                        {format.name}
                      </p>
                      <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                        {format.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ================================================================ */}
          {/* 2. STYLE SELECTION                                               */}
          {/* ================================================================ */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 mb-1.5">
              Style
            </h3>
            <div className="grid grid-cols-3 gap-2 sm:gap-2.5 md:gap-3">
              {availableStyles.map((style) => {
                const isSelected = selectedStyle === style.id;

                return (
                  <div
                    key={style.id}
                    onClick={() => !isExporting && handleSelectStyle(style.id)}
                    className={`rounded-2xl p-2 pt-2.5 flex flex-col items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? "border-2 border-[#2563EB] bg-blue-50/15 shadow-xs"
                        : "border border-slate-200 hover:border-slate-300 bg-white"
                    } ${isExporting ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    {/* Visual Miniature Document Preview Thumbnail */}
                    <div className="w-full h-16 sm:h-20 rounded-xl border border-slate-200/90 bg-white p-1.5 flex flex-col justify-between overflow-hidden shadow-2xs">
                      {style.id === "Corporate" && (
                        <>
                          <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-xs bg-[#2563EB]" />
                            <div className="w-4 h-1.5 bg-slate-700 rounded-xs" />
                          </div>
                          <div className="space-y-1">
                            <div className="w-full h-1 bg-slate-300 rounded-xs" />
                            <div className="w-4/5 h-1 bg-slate-200 rounded-xs" />
                            <div className="w-3/5 h-1 bg-slate-100 rounded-xs" />
                          </div>
                        </>
                      )}

                      {style.id === "Minimal" && (
                        <div className="space-y-1.5">
                          <div className="w-3 h-0.5 bg-[#2563EB] rounded-xs" />
                          <div className="w-full h-1 bg-slate-700 rounded-xs" />
                          <div className="w-4/5 h-0.5 bg-slate-300 rounded-xs" />
                          <div className="w-3/5 h-0.5 bg-slate-200 rounded-xs" />
                          <div className="w-1/2 h-0.5 bg-slate-100 rounded-xs" />
                        </div>
                      )}

                      {style.id === "Creative" && (
                        <div className="-m-1.5 flex flex-col h-[calc(100%+12px)]">
                          <div className="h-4.5 bg-[#131B4D] p-1 flex items-center gap-1 shrink-0">
                            <div className="w-2.5 h-2 rounded-xs bg-[#2563EB]" />
                            <div className="w-4 h-1 bg-white/70 rounded-xs" />
                          </div>
                          <div className="p-1.5 space-y-1">
                            <div className="w-full h-1 bg-[#2563EB] rounded-xs" />
                            <div className="w-4/5 h-0.5 bg-slate-300 rounded-xs" />
                            <div className="w-3/5 h-0.5 bg-slate-200 rounded-xs" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Style Label with Active Checkmark */}
                    <div className="mt-2 text-center flex items-center justify-center gap-1">
                      <span className="text-xs font-bold text-slate-800">
                        {style.name}
                      </span>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-[#2563EB] stroke-[3]" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Changing the style here also updates the document in the editor.
            </p>
          </div>

          {/* ================================================================ */}
          {/* 3. EXPORT SUMMARY CARD                                            */}
          {/* ================================================================ */}
          <div className="rounded-2xl bg-blue-50/30 border border-slate-200/80 p-3 sm:p-3.5 flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-xs shadow-xs shrink-0"
              style={{
                backgroundColor: brandKit.secondaryColor || "#2563EB",
              }}
            >
              {initials}
            </div>

            <p className="text-xs text-slate-700 leading-snug font-medium">
              {activeSummaryText}
            </p>
          </div>
        </div>

        {/* ================================================================== */}
        {/* MODAL FOOTER & ACTIONS                                             */}
        {/* ================================================================== */}
        <div className="border-t border-slate-100 p-3 sm:p-4 px-4 sm:px-6 md:px-7 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 bg-slate-50/50 shrink-0">
          <button
            id="export-modal-cancel-btn"
            type="button"
            onClick={onClose}
            disabled={isExporting}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            id="export-modal-download-btn"
            type="button"
            onClick={handleDownload}
            disabled={isExporting}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#131B4D] hover:bg-[#1C2666] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 active:scale-95"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Export {selectedFormat}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  </div>
);
};

export default ExportModal;
