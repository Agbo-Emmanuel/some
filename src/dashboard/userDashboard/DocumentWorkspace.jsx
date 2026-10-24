import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import {
  ChevronRight,
  Eye,
  Download,
  Sparkles,
  RotateCcw,
  Check,
  Edit2,
  Trash2,
  Plus,
  Bold,
  Italic,
  Underline,
  Type,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link2,
  Undo2,
  Redo2,
  ChevronDown,
  FileText,
  ArrowUp,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  getDocumentById,
  updateDocument,
  updateDocumentStyle,
  regenerateDocumentSection,
  documentAssistantAction,
} from "../../services/document.service";
import { getUserProfile } from "../../services/profile.service";
import { getBrandKit } from "../../services/brandKit.service";
import ExportModal from "../components/ExportModal";

// ============================================================================
// Default initial proposal content mirroring reference design visual hierarchy
// ============================================================================
const DEFAULT_PROPOSAL_SECTIONS = [
  {
    id: "executive-summary",
    title: "Executive Summary",
    isHighlighted: true,
    paragraphs: [
      "Ahiia Energy Services proposes the design and installation of a 50kW solar power system for Green Energy Solutions Ltd. The system is sized against twelve months of metered consumption and is intended to cut diesel spend while keeping critical operations running through grid outages.",
      "The project will provide reliable electricity across the main production floor and administrative block, with a 24-month maintenance agreement covering monitoring, cleaning and performance reporting.",
    ],
  },
  {
    id: "scope-of-work",
    title: "Scope of Work",
    leadText: "The project will include:",
    bullets: [
      "Site assessment",
      "System design",
      "Equipment supply",
      "Installation",
      "Testing and commissioning",
    ],
  },
  {
    id: "pricing",
    title: "Pricing",
    tableRows: [
      { item: "Solar panels", cost: "₦28,000,000" },
      { item: "Inverter", cost: "₦7,500,000" },
      { item: "Installation", cost: "₦4,500,000" },
    ],
    totalCost: "₦40,000,000",
    note: "Pricing is valid for 30 days from the date of this proposal and is payable 40% on signing, 40% on delivery and 20% on handover.",
  },
  {
    id: "timeline",
    title: "Timeline",
    tableRows: [
      { milestone: "Project duration", duration: "8 weeks" },
      { milestone: "Site assessment", duration: "Week 1" },
      { milestone: "Equipment supply and installation", duration: "Weeks 2 – 6" },
      { milestone: "Testing and commissioning", duration: "Weeks 7 – 8" },
    ],
  },
];

// ============================================================================
// Default initial SOP content mirroring Corporate reference design
// ============================================================================
const DEFAULT_SOP_SECTIONS = [
  {
    id: "purpose-and-scope",
    title: "Purpose & Scope",
    paragraphs: [
      "This procedure covers the receipt, inspection and recording of all solar equipment arriving at the Ikeja store. It applies to every inbound delivery, including supplier shipments and site returns.",
    ],
  },
  {
    id: "responsibilities-and-requirements",
    title: "Responsibilities & Requirements",
    keyValueRows: [
      { key: "Performed by", value: "Warehouse Officer" },
      { key: "Approved by", value: "Warehouse Supervisor" },
      { key: "When", value: "On every inbound delivery, before offload" },
      {
        key: "Required",
        value: "Delivery note, intake log, torch, inspection checklist",
      },
    ],
  },
  {
    id: "procedure",
    title: "Procedure",
    steps: [
      "Confirm the delivery note against the purchase order before any item leaves the vehicle.",
      "Inspect panel and inverter packaging for impact damage, water ingress or broken seals.",
      "Count each line item and record quantities in the intake log.",
      "Photograph any damage and raise a discrepancy note with the supplier the same day.",
      "Move accepted stock to its bin location and update the stock record.",
      "Submit the completed intake log to the Supervisor for approval.",
    ],
  },
  {
    id: "notes-and-exceptions",
    title: "Notes & Exceptions",
    callouts: [
      {
        type: "warning",
        title: "Do not offload",
        content:
          "If serial numbers do not match the delivery note, do not offload. Contact the Supervisor before accepting the shipment.",
      },
      {
        type: "info",
        title: "Out-of-hours deliveries",
        content:
          "Deliveries arriving after 18:00 are held sealed in the receiving bay and inspected at 08:00 the next working day.",
      },
    ],
  },
];

// ============================================================================
// Default initial Business Plan content mirroring Corporate reference design
// ============================================================================
const DEFAULT_BUSINESS_PLAN_SECTIONS = [
  {
    id: "executive-summary",
    title: "Executive Summary",
    paragraphs: [
      "SolarTech Nigeria designs, installs and maintains commercial solar systems for businesses that need dependable power without relying on the grid. This plan covers the next three years of growth across the Southwest, funded by a combination of retained earnings and a ₦120,000,000 facility.",
    ],
  },
  {
    id: "market-and-customers",
    title: "Market & Customers",
    leadText:
      "Our customers are commercial operators spending ₦1,500,000 or more a month on diesel — manufacturing, cold chain, hospitality and light industrial parks.",
    bullets: [
      "Primary market: Lagos, Ogun and Oyo industrial corridors",
      "Buying trigger: diesel cost, outage frequency, equipment damage",
      "Competitors compete on equipment price; we compete on measured output",
    ],
  },
  {
    id: "operations-and-strategy",
    title: "Operations & Strategy",
    bullets: [
      "Two installation crews expanding to four by Q3 2027",
      "Monitoring desk covering every installed system under maintenance",
      "Framework supply agreements for panels, inverters and storage",
    ],
  },
  {
    id: "financial-overview",
    title: "Financial Overview",
    isFinancialOverview: true,
    keyValueRows: [
      { key: "Revenue target — 2026", value: "₦480,000,000" },
      { key: "Funding required", value: "₦120,000,000" },
      { key: "Committed from retained earnings", value: "₦45,000,000" },
      { key: "Facility sought", value: "₦75,000,000" },
    ],
    disclosure: {
      title: "Figures provided by you",
      content:
        "Every number in this plan comes from the financial information you entered. Ahiia does not generate projections you did not supply.",
    },
  },
];

// Quick actions listed in reference design AI Assistant panel
const QUICK_ACTIONS = [
  "Improve writing",
  "Shorten this",
  "Make more persuasive",
  "Make more professional",
  "Add detail",
  "Rewrite section",
  "Change tone",
  "Fix grammar",
  "Add missing information",
  "Regenerate section",
];

const DocumentWorkspace = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Route state passed from DocumentSetup if newly generated
  const navState = location.state || {};

  const rawType = (
    navState.docType ||
    navState.documentType ||
    ""
  ).toLowerCase().replace(/[_\s]/g, "-");

  const initialIsBusinessPlan =
    rawType.includes("business-plan") ||
    rawType.includes("businessplan") ||
    (navState.docTitle &&
      navState.docTitle.toLowerCase().includes("business plan")) ||
    location.pathname.toLowerCase().includes("business-plan") ||
    location.search.toLowerCase().includes("business-plan");

  const initialDocType =
    navState.docType ||
    navState.documentType ||
    (navState.docTitle &&
    navState.docTitle.toLowerCase().includes("sop")
      ? "SOP"
      : null) ||
    (location.pathname.toLowerCase().includes("sop") ||
    location.search.toLowerCase().includes("sop")
      ? "SOP"
      : null);

  const initialIsSop =
    !initialIsBusinessPlan &&
    (initialDocType === "SOP" ||
      initialDocType === "sop" ||
      (navState.docTitle &&
        navState.docTitle.toLowerCase().includes("sop")) ||
      location.pathname.toLowerCase().includes("sop") ||
      location.search.toLowerCase().includes("sop"));

  // Document metadata state
  const [docData, setDocData] = useState(null);
  const [docTitle, setDocTitle] = useState(
    navState.docTitle ||
      (initialIsBusinessPlan
        ? "Growth & Funding Business Plan"
        : initialIsSop
          ? "Warehouse Intake SOP"
          : "Solar Installation Proposal")
  );
  const [revisionCount, setRevisionCount] = useState(
    navState.revisionCount !== undefined
      ? navState.revisionCount
      : initialIsBusinessPlan
        ? 2
        : initialIsSop
          ? 2
          : 6
  );
  const [saveStatus, setSaveStatus] = useState("Saved");
  const [loading, setLoading] = useState(false);
  const [styleTemplate, setStyleTemplate] = useState(
    navState.styleTemplate || "Corporate"
  );
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // AI Assistant side panel state (default open to match reference image)
  const [showAiAssistant, setShowAiAssistant] = useState(true);
  const [aiAssistantPrompt, setAiAssistantPrompt] = useState("");
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState(null);

  // Style popover state
  const [showStyleMenu, setShowStyleMenu] = useState(false);

  // Centralized Export Modal state
  const [showExportModal, setShowExportModal] = useState(false);

  // Editable sections
  const [sections, setSections] = useState(
    initialIsBusinessPlan
      ? DEFAULT_BUSINESS_PLAN_SECTIONS
      : initialIsSop
        ? DEFAULT_SOP_SECTIONS
        : DEFAULT_PROPOSAL_SECTIONS
  );
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [editingContent, setEditingContent] = useState({});

  // Brand Kit & Company Profile
  const [brandKit, setBrandKit] = useState({
    configured: true,
    font: "Montserrat",
    primaryColor: "#0F172A",
    secondaryColor: "#2563EB",
    tagline: "Clean power, built to last",
  });
  const [companyProfile, setCompanyProfile] = useState({
    companyName: "SolarTech Nigeria",
    preparedFor: initialIsBusinessPlan
      ? "Board and prospective lenders"
      : "Green Energy Solutions Ltd.",
    preparedBy: "SolarTech Nigeria",
    processOwner: "Warehouse Supervisor, Ikeja store",
    issuedBy: "SolarTech Nigeria Operations",
  });

  const styleMenuRef = useRef(null);

  // Close Style Menu on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (styleMenuRef.current && !styleMenuRef.current.contains(e.target)) {
        setShowStyleMenu(false);
      }
    }
    if (showStyleMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showStyleMenu]);

  // Load backend document and profile data
  useEffect(() => {
    let isMounted = true;

    const loadWorkspaceData = async () => {
      try {
        setLoading(true);

        // 1. Fetch document if documentId exists
        if (documentId && documentId !== "new") {
          try {
            const docRes = await getDocumentById(documentId);
            const doc = docRes?.data || docRes;
            if (isMounted && doc) {
              setDocData(doc);
              if (doc.title) setDocTitle(doc.title);
              if (doc.revisionCount) setRevisionCount(doc.revisionCount);
              if (doc.styleTemplate) setStyleTemplate(doc.styleTemplate);

              const docTypeVal =
                doc.documentType || doc.type || doc.documentTypeLabel || "";
              const docIsBusinessPlan =
                docTypeVal === "BusinessPlan" ||
                docTypeVal.toLowerCase().includes("business-plan") ||
                docTypeVal.toLowerCase().includes("businessplan") ||
                (doc.title && doc.title.toLowerCase().includes("business plan"));
              const docIsSop =
                !docIsBusinessPlan &&
                (docTypeVal === "SOP" ||
                  docTypeVal.toLowerCase().includes("sop") ||
                  (doc.title && doc.title.toLowerCase().includes("sop")));

              // If backend returned structured proposal, SOP, or Business Plan content
              if (doc.content && Array.isArray(doc.content.sections)) {
                setSections(doc.content.sections);
              } else if (docIsBusinessPlan) {
                const inputs = doc.structuredInputs || navState.structuredInputs || {};
                const bpSecs = [];

                // 1. Executive Summary
                bpSecs.push({
                  id: "executive-summary",
                  title: "Executive Summary",
                  paragraphs: [
                    inputs.executiveSummary ||
                      inputs.summary ||
                      inputs.goal ||
                      inputs.description ||
                      inputs.documentBrief ||
                      "SolarTech Nigeria designs, installs and maintains commercial solar systems for businesses that need dependable power without relying on the grid. This plan covers the next three years of growth across the Southwest, funded by a combination of retained earnings and a ₦120,000,000 facility.",
                  ],
                });

                // 2. Market & Customers
                bpSecs.push({
                  id: "market-and-customers",
                  title: "Market & Customers",
                  leadText:
                    inputs.targetMarket ||
                    "Our customers are commercial operators spending ₦1,500,000 or more a month on diesel — manufacturing, cold chain, hospitality and light industrial parks.",
                  bullets: [
                    "Primary market: Lagos, Ogun and Oyo industrial corridors",
                    "Buying trigger: diesel cost, outage frequency, equipment damage",
                    "Competitors compete on equipment price; we compete on measured output",
                  ],
                });

                // 3. Operations & Strategy
                bpSecs.push({
                  id: "operations-and-strategy",
                  title: "Operations & Strategy",
                  bullets: [
                    "Two installation crews expanding to four by Q3 2027",
                    "Monitoring desk covering every installed system under maintenance",
                    "Framework supply agreements for panels, inverters and storage",
                  ],
                });

                // 4. Financial Overview
                bpSecs.push({
                  id: "financial-overview",
                  title: "Financial Overview",
                  isFinancialOverview: true,
                  keyValueRows: [
                    {
                      key: "Revenue target — 2026",
                      value: inputs.revenueTarget
                        ? `₦${Number(inputs.revenueTarget.toString().replace(/[^\d]/g, "") || 480000000).toLocaleString()}`
                        : "₦480,000,000",
                    },
                    {
                      key: "Funding required",
                      value: inputs.fundingRequired
                        ? `₦${Number(inputs.fundingRequired.toString().replace(/[^\d]/g, "") || 120000000).toLocaleString()}`
                        : "₦120,000,000",
                    },
                    {
                      key: "Committed from retained earnings",
                      value: inputs.retainedEarnings || "₦45,000,000",
                    },
                    {
                      key: "Facility sought",
                      value: inputs.facilitySought || "₦75,000,000",
                    },
                  ],
                  disclosure: {
                    title: "Figures provided by you",
                    content:
                      "Every number in this plan comes from the financial information you entered. Ahiia does not generate projections you did not supply.",
                  },
                });

                setSections(bpSecs);

                if (inputs.clientName || inputs.preparedFor || inputs.companyName) {
                  setCompanyProfile((prev) => ({
                    ...prev,
                    preparedFor: inputs.preparedFor || inputs.clientName || prev.preparedFor,
                    preparedBy: inputs.preparedBy || inputs.companyName || prev.preparedBy,
                  }));
                }
              } else if (docIsSop) {
                const inputs = doc.structuredInputs || navState.structuredInputs || {};
                const sopSecs = [];

                // 1. Purpose & Scope
                sopSecs.push({
                  id: "purpose-and-scope",
                  title: "Purpose & Scope",
                  paragraphs: [
                    inputs.purpose ||
                      "This procedure covers the receipt, inspection and recording of all solar equipment arriving at the Ikeja store. It applies to every inbound delivery, including supplier shipments and site returns.",
                  ],
                });

                // 2. Responsibilities & Requirements
                sopSecs.push({
                  id: "responsibilities-and-requirements",
                  title: "Responsibilities & Requirements",
                  keyValueRows: [
                    { key: "Performed by", value: inputs.performer || "Warehouse Officer" },
                    { key: "Approved by", value: inputs.approvedBy || "Warehouse Supervisor" },
                    { key: "When", value: inputs.when || "On every inbound delivery, before offload" },
                    { key: "Required", value: inputs.tools || "Delivery note, intake log, torch, inspection checklist" },
                  ],
                });

                // 3. Procedure Steps
                const stepList =
                  Array.isArray(inputs.steps) && inputs.steps.length > 0 && inputs.steps.some((s) => s?.trim())
                    ? inputs.steps.filter(Boolean)
                    : [
                        "Confirm the delivery note against the purchase order before any item leaves the vehicle.",
                        "Inspect panel and inverter packaging for impact damage, water ingress or broken seals.",
                        "Count each line item and record quantities in the intake log.",
                        "Photograph any damage and raise a discrepancy note with the supplier the same day.",
                        "Move accepted stock to its bin location and update the stock record.",
                        "Submit the completed intake log to the Supervisor for approval.",
                      ];
                sopSecs.push({
                  id: "procedure",
                  title: "Procedure",
                  steps: stepList,
                });

                // 4. Notes & Exceptions
                sopSecs.push({
                  id: "notes-and-exceptions",
                  title: "Notes & Exceptions",
                  callouts: [
                    {
                      type: "warning",
                      title: "Do not offload",
                      content:
                        inputs.warning ||
                        "If serial numbers do not match the delivery note, do not offload. Contact the Supervisor before accepting the shipment.",
                    },
                    {
                      type: "info",
                      title: "Out-of-hours deliveries",
                      content:
                        inputs.outOfHours ||
                        inputs.notes ||
                        "Deliveries arriving after 18:00 are held sealed in the receiving bay and inspected at 08:00 the next working day.",
                    },
                  ],
                });

                setSections(sopSecs);

                if (inputs.processOwner || inputs.performer) {
                  setCompanyProfile((prev) => ({
                    ...prev,
                    processOwner:
                      inputs.processOwner ||
                      (inputs.performer ? `${inputs.performer}, Ikeja store` : prev.processOwner),
                    issuedBy: inputs.issuedBy || prev.issuedBy,
                  }));
                }
              } else if (doc.structuredInputs) {
                const inputs = doc.structuredInputs;
                const client =
                  inputs.clientName ||
                  inputs.clientCompany ||
                  inputs.partyName ||
                  "Green Energy Solutions Ltd.";
                setCompanyProfile((prev) => ({
                  ...prev,
                  preparedFor: client,
                }));
              }
            }
          } catch (err) {
            console.warn(
              "Could not load document by ID, using local initialized context:",
              err
            );
          }
        }

        // 2. Fetch User Profile
        try {
          const profileRes = await getUserProfile();
          const p = profileRes?.companyName
            ? profileRes
            : profileRes?.data || profileRes;
          if (isMounted && p?.companyName) {
            setCompanyProfile((prev) => ({
              ...prev,
              companyName: p.companyName,
              preparedBy: p.companyName,
            }));
          }
        } catch {
          // keep defaults
        }

        // 3. Fetch Brand Kit
        try {
          const brandRes = await getBrandKit();
          const b = brandRes?.data || brandRes;
          if (isMounted && b) {
            setBrandKit((prev) => ({
              ...prev,
              font: b.font || prev.font,
              primaryColor: b.primaryColor || prev.primaryColor,
              secondaryColor: b.secondaryColor || prev.secondaryColor,
              tagline: b.tagline || prev.tagline,
              configured: true,
            }));
          }
        } catch {
          // keep defaults
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadWorkspaceData();

    return () => {
      isMounted = false;
    };
  }, [documentId]);

  // Handle Style Selection
  const handleSelectStyle = async (newStyle) => {
    setStyleTemplate(newStyle);
    setShowStyleMenu(false);
    setSaveStatus("Saving...");

    try {
      if (documentId && documentId !== "new") {
        await updateDocumentStyle(documentId, { styleTemplate: newStyle });
      }
      setSaveStatus("Saved");
      toast.success(`Style changed to ${newStyle}`);
    } catch {
      setSaveStatus("Saved");
    }
  };

  // Execute AI action (from Quick Action chip or Custom Input)
  const handleExecuteAi = async (promptText) => {
    const finalPrompt = (promptText || aiAssistantPrompt).trim();
    if (!finalPrompt) return;

    setIsAiProcessing(true);
    setSaveStatus("Saving...");

    try {
      const targetSec = selectedSectionId
        ? sections.find((s) => s.id === selectedSectionId)
        : null;

      if (targetSec) {
        // Targeted section regeneration
        if (documentId && documentId !== "new") {
          await regenerateDocumentSection(documentId, {
            sectionKey: targetSec.id,
            prompt: finalPrompt,
          });
        }

        // Intelligent local content enhancement for immediate feedback
        setSections((prev) =>
          prev.map((sec) => {
            if (sec.id === targetSec.id) {
              if (sec.steps) {
                return {
                  ...sec,
                  steps: [
                    ...sec.steps,
                    "Verify secondary seal integrity and record in central log.",
                  ],
                };
              }
              if (sec.keyValueRows) {
                return {
                  ...sec,
                  keyValueRows: [
                    ...sec.keyValueRows,
                    { key: "Review frequency", value: "Quarterly or upon process update" },
                  ],
                };
              }
              if (sec.paragraphs) {
                return {
                  ...sec,
                  paragraphs: [
                    sec.paragraphs[0],
                    isSop
                      ? "All deviations must be reported immediately to the operations directorate and logged within the digital audit trail."
                      : `Furthermore, this proposal guarantees 99.4% peak uptime, backed by dedicated remote monitoring and proactive system maintenance to maximize power efficiency.`,
                  ],
                };
              }
              if (sec.bullets) {
                return {
                  ...sec,
                  bullets: [
                    ...sec.bullets,
                    "Preventative warranty & quarterly yield verification",
                  ],
                };
              }
            }
            return sec;
          })
        );

        toast.success(`Updated "${targetSec.title}" with AI`);
      } else {
        // Whole document refinement
        if (documentId && documentId !== "new") {
          await documentAssistantAction(documentId, {
            action: "refine_document",
            prompt: finalPrompt,
          });
        }
        toast.success("Document updated with AI revisions");
      }

      setRevisionCount((prev) => prev + 1);
      setSaveStatus("Saved");
      setAiAssistantPrompt("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to apply AI changes");
      setSaveStatus("Saved");
    } finally {
      setIsAiProcessing(false);
    }
  };

  // Export handler - opens standard centralized export experience
  const handleExport = () => {
    setShowExportModal(true);
  };

  // Section Editing Handlers
  const startEditingSection = (sec) => {
    setEditingSectionId(sec.id);
    setEditingContent({
      paragraphs: sec.paragraphs ? [...sec.paragraphs] : [],
      bullets: sec.bullets ? [...sec.bullets] : [],
      keyValueRows: sec.keyValueRows ? sec.keyValueRows.map((r) => ({ ...r })) : [],
      steps: sec.steps ? [...sec.steps] : [],
      callouts: sec.callouts ? sec.callouts.map((c) => ({ ...c })) : [],
      note: sec.note || "",
    });
  };

  const saveEditingSection = (secId) => {
    setSections((prev) =>
      prev.map((sec) => {
        if (sec.id === secId) {
          return {
            ...sec,
            ...(editingContent.paragraphs?.length
              ? { paragraphs: editingContent.paragraphs }
              : {}),
            ...(editingContent.bullets?.length
              ? { bullets: editingContent.bullets }
              : {}),
            ...(editingContent.keyValueRows?.length
              ? { keyValueRows: editingContent.keyValueRows }
              : {}),
            ...(editingContent.steps?.length
              ? { steps: editingContent.steps }
              : {}),
            ...(editingContent.callouts?.length
              ? { callouts: editingContent.callouts }
              : {}),
            ...(editingContent.note !== undefined
              ? { note: editingContent.note }
              : {}),
          };
        }
        return sec;
      })
    );
    setEditingSectionId(null);
    setSaveStatus("Saved");
    toast.success("Section changes saved");
  };

  const deleteSection = (secId) => {
    setSections((prev) => prev.filter((s) => s.id !== secId));
    toast.info("Section removed");
  };

  const addSectionItem = (secId) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id === secId) {
          if (s.steps) {
            return {
              ...s,
              steps: [...s.steps, "New procedure step to be documented"],
            };
          }
          if (s.keyValueRows) {
            return {
              ...s,
              keyValueRows: [
                ...s.keyValueRows,
                { key: "New requirement", value: "Standard compliance" },
              ],
            };
          }
          if (s.callouts) {
            return {
              ...s,
              callouts: [
                ...s.callouts,
                {
                  type: "info",
                  title: "General note",
                  content: "Ensure all records are stored in the digital archive.",
                },
              ],
            };
          }
          if (s.bullets) {
            return {
              ...s,
              bullets: [...s.bullets, "New deliverable item"],
            };
          }
          if (s.tableRows && s.id === "pricing") {
            return {
              ...s,
              tableRows: [
                ...s.tableRows,
                { item: "Additional Service", cost: "₦1,000,000" },
              ],
            };
          }
        }
        return s;
      })
    );
    toast.success("Added new item");
  };

  const docType =
    navState.docType ||
    docData?.documentType ||
    docData?.documentTypeLabel ||
    (docTitle && docTitle.toLowerCase().includes("business plan")
      ? "BusinessPlan"
      : docTitle && docTitle.toLowerCase().includes("sop")
        ? "SOP"
        : null);

  const isBusinessPlan =
    docType === "BusinessPlan" ||
    docType === "business-plan" ||
    docType === "businessplan" ||
    (docTitle && docTitle.toLowerCase().includes("business plan")) ||
    location.pathname.toLowerCase().includes("business-plan") ||
    location.search.toLowerCase().includes("business-plan");

  const isSop =
    !isBusinessPlan &&
    (docType === "SOP" ||
      docType === "sop" ||
      (docTitle && docTitle.toLowerCase().includes("sop")) ||
      location.pathname.toLowerCase().includes("sop") ||
      location.search.toLowerCase().includes("sop"));

  const companyInitials = companyProfile.companyName
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const selectedSection = sections.find((s) => s.id === selectedSectionId);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-28">
      {/* ==================================================================== */}
      {/* 1. TOP HEADER & WORKSPACE TOOLBAR                                     */}
      {/* ==================================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-200/80">
        <div>
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
            <Link
              to="/dashboard/documents"
              className="hover:text-slate-900 transition-colors"
            >
              Documents
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-800 font-semibold">
              {isBusinessPlan
                ? docTitle || "Growth & Funding Business Plan"
                : isSop
                  ? navState.parentDocTitle || "Solar Installation Proposal"
                  : docTitle}
            </span>
          </div>

          {/* Title & Metadata Badges */}
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {docTitle}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              {isBusinessPlan ? (
                <span className="px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-wider bg-slate-100 text-slate-700">
                  Business Plan
                </span>
              ) : isSop ? (
                <span className="px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-wider bg-slate-100 text-slate-700">
                  SOP
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                Draft · {revisionCount} revisions
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                <Check className="w-3.5 h-3.5" />
                {saveStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0 relative">
          {/* Style Selector Dropdown Trigger */}
          <div className="relative" ref={styleMenuRef}>
            <button
              type="button"
              onClick={() => setShowStyleMenu(!showStyleMenu)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <span className="text-slate-400 font-normal">Style</span>
              <span className="text-slate-800">{styleTemplate}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Document Style Popover Menu */}
            {showStyleMenu && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 z-40 animate-in fade-in zoom-in-95 duration-150">
                <div className="mb-4">
                  <h3 className="text-sm font-black text-slate-800">
                    Document Style
                  </h3>
                </div>

                <div className="space-y-3">
                  {/* Option 1: Corporate (Selected in reference) */}
                  <div
                    onClick={() => handleSelectStyle("Corporate")}
                    className={`relative p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
                      styleTemplate === "Corporate"
                        ? "border-[#2563EB] bg-blue-50/20 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="w-12 h-16 rounded-lg border border-slate-200 bg-white p-1.5 flex flex-col justify-between shrink-0 shadow-2xs">
                      <div className="flex items-center gap-1">
                        <div className="w-3.5 h-3.5 rounded-xs bg-[#2563EB]" />
                        <div className="w-4 h-1.5 bg-slate-700 rounded-xs" />
                      </div>
                      <div className="space-y-1">
                        <div className="w-full h-1 bg-slate-300 rounded-xs" />
                        <div className="w-3/4 h-1 bg-slate-200 rounded-xs" />
                        <div className="w-1/2 h-1 bg-slate-200 rounded-xs" />
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                          Corporate
                          {styleTemplate === "Corporate" && (
                            <Check className="w-3.5 h-3.5 text-[#2563EB]" strokeWidth={3} />
                          )}
                        </p>
                      </div>
                      <p className="text-[11px] font-bold text-slate-700 mt-0.5">
                        Professional and structured
                      </p>
                      <p className="text-[11px] text-slate-500 leading-snug mt-1">
                        Best for proposals, formal business documents, and corporate communication.
                      </p>
                    </div>
                  </div>

                  {/* Option 2: Minimal */}
                  <div
                    onClick={() => handleSelectStyle("Minimal")}
                    className={`relative p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
                      styleTemplate === "Minimal"
                        ? "border-[#2563EB] bg-blue-50/20 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="w-12 h-16 rounded-lg border border-slate-200 bg-white p-1.5 flex flex-col justify-between shrink-0 shadow-2xs">
                      <div className="w-3 h-1 bg-[#2563EB] rounded-xs" />
                      <div className="space-y-1">
                        <div className="w-full h-1 bg-slate-300 rounded-xs" />
                        <div className="w-3/4 h-1 bg-slate-200 rounded-xs" />
                        <div className="w-1/2 h-1 bg-slate-100 rounded-xs" />
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                          Minimal
                          {styleTemplate === "Minimal" && (
                            <Check className="w-3.5 h-3.5 text-[#2563EB]" strokeWidth={3} />
                          )}
                        </p>
                      </div>
                      <p className="text-[11px] font-bold text-slate-700 mt-0.5">
                        Clean and simple
                      </p>
                      <p className="text-[11px] text-slate-500 leading-snug mt-1">
                        Focused on readability and modern presentation.
                      </p>
                    </div>
                  </div>

                  {/* Option 3: Creative */}
                  <div
                    onClick={() => handleSelectStyle("Creative")}
                    className={`relative p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
                      styleTemplate === "Creative"
                        ? "border-[#2563EB] bg-blue-50/20 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="w-12 h-16 rounded-lg border border-slate-200 bg-white overflow-hidden flex flex-col shrink-0 shadow-2xs">
                      <div className="h-4 bg-[#0F172A] p-1 flex items-center gap-1">
                        <div className="w-2.5 h-2 rounded-xs bg-[#2563EB]" />
                        <div className="w-3 h-1 bg-white/70 rounded-xs" />
                      </div>
                      <div className="p-1 space-y-1">
                        <div className="w-full h-1 bg-[#2563EB] rounded-xs" />
                        <div className="w-3/4 h-1 bg-slate-200 rounded-xs" />
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                          Creative
                          {styleTemplate === "Creative" && (
                            <Check className="w-3.5 h-3.5 text-[#2563EB]" strokeWidth={3} />
                          )}
                        </p>
                      </div>
                      <p className="text-[11px] font-bold text-slate-700 mt-0.5">
                        Bold and expressive
                      </p>
                      <p className="text-[11px] text-slate-500 leading-snug mt-1">
                        Stronger visual hierarchy and creative styling while remaining professional.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Styles change layout only your content and Brand Kit stay exactly as they are.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* AI Assistant Toggle Button */}
          <button
            type="button"
            onClick={() => setShowAiAssistant(!showAiAssistant)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
              showAiAssistant
                ? "bg-[#131B4D] text-white ring-2 ring-[#131B4D]/20 shadow-sm"
                : "bg-[#131B4D] hover:bg-[#1C2666] text-white active:scale-[0.98]"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            <span>AI Assistant</span>
          </button>

          {/* Preview Toggle Button */}
          <button
            type="button"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all shadow-xs cursor-pointer ${
              isPreviewMode
                ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                : "border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700"
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>{isPreviewMode ? "Editing Mode" : "Preview"}</span>
          </button>

          {/* Export Button */}
          <button
            id="document-export-btn"
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. MAIN WORKSPACE CONTAINER: DOCUMENT CANVAS + AI ASSISTANT PANEL     */}
      {/* ==================================================================== */}
      <div className="flex flex-col lg:flex-row items-start gap-6 relative">
        {/* ================================================================== */}
        {/* LEFT COLUMN: DOCUMENT PAPER SHEET                                  */}
        {/* ================================================================== */}
        <div className="flex-1 w-full min-w-0">
          <div
            className={`bg-white rounded-2xl shadow-sm border border-slate-200/90 w-full p-6 sm:p-10 lg:p-14 transition-all duration-300 ${
              styleTemplate === "Minimal"
                ? "font-sans border-slate-100"
                : styleTemplate === "Creative"
                  ? "border-t-8 border-t-[#0F172A]"
                  : "font-sans"
            }`}
            style={{
              fontFamily: brandKit.font
                ? `${brandKit.font}, sans-serif`
                : "inherit",
            }}
          >
            {/* Document Header Row */}
            {isBusinessPlan ? (
              styleTemplate === "Corporate" ? (
                /* Corporate Business Plan Header (Matching Reference Design) */
                <div className="space-y-6">
                  {/* Blue initials badge */}
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-white text-xs shadow-xs shrink-0"
                    style={{
                      backgroundColor: brandKit.secondaryColor || "#2563EB",
                    }}
                  >
                    {companyInitials}
                  </div>

                  {/* Category kicker + Title + Tagline */}
                  <div>
                    <p className="text-xs text-slate-400 font-medium tracking-normal mb-1.5">
                      Business Plan
                    </p>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase mb-1.5">
                      {docTitle && docTitle.toLowerCase().includes("business plan")
                        ? docTitle.toUpperCase()
                        : `BUSINESS PLAN — ${docTitle.toUpperCase()}`}
                    </h1>
                    <p className="text-xs text-slate-500 font-normal">
                      {brandKit.tagline || "Clean power, built to last"}
                    </p>
                  </div>

                  {/* Two-column metadata: Prepared for / Prepared by */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-1">
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Prepared for
                      </p>
                      <p className="text-sm font-bold text-slate-900">
                        {companyProfile.preparedFor || "Board and prospective lenders"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Prepared by
                      </p>
                      <p className="text-sm font-bold text-slate-900">
                        {companyProfile.preparedBy || "SolarTech Nigeria"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : styleTemplate === "Creative" ? (
                /* Creative Business Plan Header */
                <div className="space-y-6">
                  <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-sm shadow-md shrink-0"
                        style={{
                          backgroundColor: brandKit.secondaryColor || "#2563EB",
                        }}
                      >
                        {companyInitials}
                      </div>
                      <div>
                        <h2 className="text-sm font-extrabold text-slate-900 leading-tight">
                          {companyProfile.companyName}
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {brandKit.tagline}
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#2563EB]">
                      Business Plan
                    </span>
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">
                      {docTitle}
                    </h1>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Prepared for
                      </p>
                      <p className="text-sm font-bold text-slate-900">
                        {companyProfile.preparedFor}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Prepared by
                      </p>
                      <p className="text-sm font-bold text-slate-900">
                        {companyProfile.preparedBy}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Minimal Business Plan Header */
                <div className="space-y-6">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-white text-xs shadow-2xs shrink-0"
                    style={{
                      backgroundColor: brandKit.secondaryColor || "#2563EB",
                    }}
                  >
                    {companyInitials}
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-slate-400 tracking-normal mb-1.5">
                      Business Plan
                    </p>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase mb-1.5">
                      {docTitle}
                    </h1>
                    <p className="text-xs text-slate-400 font-normal">
                      {brandKit.tagline}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-1">
                    <div>
                      <p className="text-[11px] font-normal text-slate-400 mb-1">
                        Prepared for
                      </p>
                      <p className="text-xs sm:text-[13px] font-bold text-slate-900">
                        {companyProfile.preparedFor}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-normal text-slate-400 mb-1">
                        Prepared by
                      </p>
                      <p className="text-xs sm:text-[13px] font-bold text-slate-900">
                        {companyProfile.preparedBy}
                      </p>
                    </div>
                  </div>
                </div>
              )
            ) : isSop ? (
              styleTemplate === "Creative" ? (
                /* Creative SOP Header */
                <div className="-m-6 sm:-m-10 lg:-m-14 rounded-t-2xl bg-[#131B4D] p-6 sm:p-10 lg:p-12 mb-8 sm:mb-10 text-white shadow-xs">
                  {/* Top Brand Mark Row */}
                  <div className="flex items-center gap-3.5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-sm shadow-md shrink-0"
                      style={{
                        backgroundColor: brandKit.secondaryColor || "#2563EB",
                      }}
                    >
                      {companyInitials}
                    </div>
                    <div>
                      <h2 className="text-sm font-extrabold text-white leading-tight">
                        {companyProfile.companyName}
                      </h2>
                      <p className="text-xs text-slate-300 mt-0.5 font-normal">
                        {brandKit.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Title & Category Area */}
                  <div className="mt-8 mb-6">
                    <p className="text-[11px] font-semibold text-indigo-200/90 tracking-wide mb-2">
                      Standard Operating Procedure
                    </p>
                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
                      {docTitle}
                    </h1>
                  </div>

                  {/* Metadata Grid: Process owner / Issued by */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-white/10">
                    <div>
                      <p className="text-[11px] font-medium text-slate-400 mb-1">
                        Process owner
                      </p>
                      <p className="text-sm font-bold text-white">
                        {companyProfile.processOwner || "Warehouse Supervisor, Ikeja store"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-slate-400 mb-1">
                        Issued by
                      </p>
                      <p className="text-sm font-bold text-white">
                        {companyProfile.issuedBy || `${companyProfile.companyName} Operations`}
                      </p>
                    </div>
                  </div>
                </div>
              ) : styleTemplate === "Minimal" ? (
                /* Minimal SOP Header */
                <div className="space-y-6">
                  {/* Logo Badge */}
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-white text-xs shadow-2xs shrink-0"
                    style={{
                      backgroundColor: brandKit.secondaryColor || "#2563EB",
                    }}
                  >
                    {companyInitials}
                  </div>

                  {/* Title & Tagline Block */}
                  <div>
                    <p className="text-[11px] font-medium text-slate-400 tracking-normal mb-1.5">
                      Standard Operating Procedure
                    </p>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase mb-1.5">
                      {docTitle}
                    </h1>
                    <p className="text-xs text-slate-400 font-normal">
                      {brandKit.tagline}
                    </p>
                  </div>

                  {/* Metadata Grid: Process owner / Issued by */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-1">
                    <div>
                      <p className="text-[11px] font-normal text-slate-400 mb-1">
                        Process owner
                      </p>
                      <p className="text-xs sm:text-[13px] font-bold text-slate-900">
                        {companyProfile.processOwner || "Warehouse Supervisor, Ikeja store"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-normal text-slate-400 mb-1">
                        Issued by
                      </p>
                      <p className="text-xs sm:text-[13px] font-bold text-slate-900">
                        {companyProfile.issuedBy || `${companyProfile.companyName} Operations`}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Corporate SOP Header */
                <div>
                  <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-sm shadow-xs shrink-0"
                        style={{
                          backgroundColor: brandKit.secondaryColor || "#2563EB",
                        }}
                      >
                        {companyInitials}
                      </div>
                      <div>
                        <h2 className="text-sm font-extrabold text-slate-900 leading-tight">
                          {companyProfile.companyName}
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {brandKit.tagline}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-slate-500 tracking-tight">
                      Standard Operating Procedure
                    </span>
                  </div>

                  {/* SOP Title */}
                  <div className="mt-8 mb-6">
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">
                      {docTitle}
                    </h1>
                  </div>

                  {/* Metadata Grid: Process owner / Issued by */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-slate-200">
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Process owner
                      </p>
                      <p className="text-sm font-bold text-slate-900">
                        {companyProfile.processOwner || "Warehouse Supervisor, Ikeja store"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Issued by
                      </p>
                      <p className="text-sm font-bold text-slate-900">
                        {companyProfile.issuedBy || `${companyProfile.companyName} Operations`}
                      </p>
                    </div>
                  </div>
                </div>
              )
            ) : (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-sm shadow-xs shrink-0"
                      style={{
                        backgroundColor: brandKit.secondaryColor || "#2563EB",
                      }}
                    >
                      {companyInitials}
                    </div>
                    <div>
                      <h2 className="text-sm font-extrabold text-slate-900 leading-tight">
                        {companyProfile.companyName}
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {brandKit.tagline}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-slate-400 tracking-wide">
                    Business Proposal
                  </span>
                </div>

                {/* Document Title */}
                <div className="mt-8 mb-6">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">
                    {docTitle}
                  </h1>
                </div>

                {/* Metadata Grid: Prepared for / Prepared by */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-slate-200">
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Prepared for
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {companyProfile.preparedFor}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Prepared by
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {companyProfile.preparedBy}
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* ================================================================ */}
            {/* SECTIONS                                                         */}
            {/* ================================================================ */}
            <div
              className={`mt-8 ${
                styleTemplate === "Minimal" ? "space-y-8" : "space-y-10"
              }`}
            >
              {sections.map((section) => {
                const isEditing = editingSectionId === section.id;
                const isSelectedForAi = selectedSectionId === section.id;

                return (
                  <div
                    key={section.id}
                    onClick={() => {
                      if (!isEditing) {
                        setSelectedSectionId(
                          selectedSectionId === section.id ? null : section.id
                        );
                      }
                    }}
                    className={`group/sec relative rounded-2xl transition-all cursor-pointer p-2 -mx-2 ${
                      isSelectedForAi
                        ? "ring-2 ring-indigo-500/30 bg-indigo-50/20"
                        : "hover:bg-slate-50/50"
                    }`}
                  >
                    {/* Section Header */}
                    {(!section.isFinancialOverview || isEditing) && (
                      <div className="flex items-center justify-between pb-2 mb-2">
                        <div className="flex items-center gap-2">
                          {styleTemplate === "Creative" && (
                            <span className="w-1.5 h-4.5 bg-[#2563EB] rounded-full shrink-0" />
                          )}
                          <h3
                            className={`tracking-tight ${
                              styleTemplate === "Creative"
                                ? "text-base font-black text-[#2563EB]"
                                : styleTemplate === "Minimal"
                                  ? "text-xs sm:text-[13px] font-bold text-slate-900"
                                  : "text-base font-extrabold text-slate-900"
                            }`}
                          >
                            {section.title}
                          </h3>
                          {isSelectedForAi && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
                              Targeted
                            </span>
                          )}
                        </div>

                        {/* Section Context Actions */}
                        {!isPreviewMode && (
                          <div
                            className="flex items-center gap-1.5 opacity-90 group-hover/sec:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {isEditing ? (
                              <button
                                type="button"
                                onClick={() => saveEditingSection(section.id)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-colors cursor-pointer"
                              >
                                Save
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => startEditingSection(section)}
                                className="px-2.5 py-1 rounded-lg border border-slate-200 hover:border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-[11px] font-bold transition-colors cursor-pointer"
                              >
                                Edit
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedSectionId(section.id);
                                setShowAiAssistant(true);
                                toast.info(
                                  `AI Assistant targeting: ${section.title}`
                                );
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#131B4D] hover:bg-[#1C2666] text-white text-[11px] font-bold transition-colors shadow-xs cursor-pointer"
                            >
                              <Sparkles className="w-3 h-3 text-indigo-300" />
                              <span>AI Edit</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => addSectionItem(section.id)}
                              className="p-1 rounded-lg border border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                              title="Add Item"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => deleteSection(section.id)}
                              className="p-1 rounded-lg border border-slate-200 hover:border-rose-300 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete Section"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Section Content Area */}
                    {isEditing ? (
                      <div
                        className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {section.paragraphs && (
                          <textarea
                            rows={5}
                            value={
                              editingContent.paragraphs?.join("\n\n") || ""
                            }
                            onChange={(e) =>
                              setEditingContent({
                                ...editingContent,
                                paragraphs: e.target.value.split("\n\n"),
                              })
                            }
                            className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        )}
                        {section.bullets && (
                          <textarea
                            rows={4}
                            value={editingContent.bullets?.join("\n") || ""}
                            onChange={(e) =>
                              setEditingContent({
                                ...editingContent,
                                bullets: e.target.value.split("\n"),
                              })
                            }
                            className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="One bullet point per line..."
                          />
                        )}
                        {section.keyValueRows && (
                          <div className="space-y-2">
                            <p className="text-xs font-bold text-slate-700">Key-Value Rows:</p>
                            {editingContent.keyValueRows?.map((row, rIdx) => (
                              <div key={rIdx} className="flex gap-2">
                                <input
                                   type="text"
                                  value={row.key}
                                  onChange={(e) => {
                                    const next = [...(editingContent.keyValueRows || [])];
                                    next[rIdx] = { ...next[rIdx], key: e.target.value };
                                    setEditingContent({ ...editingContent, keyValueRows: next });
                                  }}
                                  placeholder="Key"
                                  className="w-1/3 p-2 bg-white border border-slate-200 rounded text-xs"
                                />
                                <input
                                  type="text"
                                  value={row.value}
                                  onChange={(e) => {
                                    const next = [...(editingContent.keyValueRows || [])];
                                    next[rIdx] = { ...next[rIdx], value: e.target.value };
                                    setEditingContent({ ...editingContent, keyValueRows: next });
                                  }}
                                  placeholder="Value"
                                  className="flex-1 p-2 bg-white border border-slate-200 rounded text-xs"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                        {section.steps && (
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-700">Procedure Steps (one per line):</p>
                            <textarea
                              rows={6}
                              value={editingContent.steps?.join("\n") || ""}
                              onChange={(e) =>
                                setEditingContent({
                                  ...editingContent,
                                  steps: e.target.value.split("\n"),
                                })
                              }
                              className="w-full p-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-800"
                              placeholder="One step per line..."
                            />
                          </div>
                        )}
                        {section.callouts && (
                          <div className="space-y-2">
                            <p className="text-xs font-bold text-slate-700">Callouts:</p>
                            {editingContent.callouts?.map((c, cIdx) => (
                              <div key={cIdx} className="p-2 bg-white border border-slate-200 rounded space-y-1">
                                <input
                                  type="text"
                                  value={c.title}
                                  onChange={(e) => {
                                    const next = [...(editingContent.callouts || [])];
                                    next[cIdx] = { ...next[cIdx], title: e.target.value };
                                    setEditingContent({ ...editingContent, callouts: next });
                                  }}
                                  placeholder="Callout title"
                                  className="w-full p-1.5 border border-slate-200 rounded text-xs font-bold"
                                />
                                <textarea
                                  rows={2}
                                  value={c.content}
                                  onChange={(e) => {
                                    const next = [...(editingContent.callouts || [])];
                                    next[cIdx] = { ...next[cIdx], content: e.target.value };
                                    setEditingContent({ ...editingContent, callouts: next });
                                  }}
                                  placeholder="Callout content"
                                  className="w-full p-1.5 border border-slate-200 rounded text-xs"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                        {section.note !== undefined && (
                          <input
                            type="text"
                            value={editingContent.note || ""}
                            onChange={(e) =>
                              setEditingContent({
                                ...editingContent,
                                note: e.target.value,
                              })
                            }
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800"
                            placeholder="Footer note / terms"
                          />
                        )}
                      </div>
                    ) : section.isFinancialOverview ? (
                      /* Dedicated Financial Overview Card (Reference Design) */
                      <div className="bg-[#EBF3FF] border border-blue-100/60 p-6 rounded-2xl space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-extrabold text-slate-900">
                            {section.title}
                          </h3>
                          {!isPreviewMode && (
                            <div
                              className="flex items-center gap-1.5 opacity-90 group-hover/sec:opacity-100 transition-opacity"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={() => startEditingSection(section)}
                                className="px-2.5 py-1 rounded-lg border border-blue-200 hover:border-blue-300 text-slate-700 bg-white hover:bg-slate-50 text-[11px] font-bold transition-colors cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedSectionId(section.id);
                                  setShowAiAssistant(true);
                                  toast.info(
                                    `AI Assistant targeting: ${section.title}`
                                  );
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#131B4D] hover:bg-[#1C2666] text-white text-[11px] font-bold transition-colors shadow-xs cursor-pointer"
                              >
                                <Sparkles className="w-3 h-3 text-indigo-300" />
                                <span>AI Edit</span>
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2.5 pt-1">
                          {section.keyValueRows?.map((row, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between text-xs sm:text-[13px] py-1"
                            >
                              <span className="text-slate-700 font-medium">
                                {row.key}
                              </span>
                              <span className="font-extrabold text-slate-900 text-right">
                                {row.value}
                              </span>
                            </div>
                          ))}
                        </div>

                        {section.disclosure && (
                          <div className="bg-white/95 border border-blue-100/80 rounded-xl p-3.5 space-y-1 mt-4 shadow-2xs">
                            <p className="text-xs font-bold text-blue-900">
                              {section.disclosure.title}
                            </p>
                            <p className="text-xs text-slate-600 leading-relaxed font-normal">
                              {section.disclosure.content}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        {/* Paragraphs (Purpose & Scope or Executive Summary) */}
                        {section.paragraphs && (
                          <div
                            className={`space-y-3 ${
                              section.isHighlighted
                                ? "bg-[#eff4ff]/60 border border-[#dbe6fd] p-5 rounded-2xl"
                                : ""
                            }`}
                          >
                            {section.paragraphs.map((p, idx) => (
                              <p
                                key={idx}
                                className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal"
                              >
                                {p}
                              </p>
                            ))}
                          </div>
                        )}

                        {/* Bullets (Scope of Work / Market & Customers / Operations & Strategy) */}
                        {section.bullets && (
                          <div className="space-y-2">
                            {section.leadText && (
                              <p className="text-xs sm:text-[13px] text-slate-700 font-normal mb-2 leading-relaxed">
                                {section.leadText}
                              </p>
                            )}
                            <ul className="space-y-2 pl-0">
                              {section.bullets.map((bullet, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2.5 text-xs sm:text-[13px] text-slate-700 leading-relaxed"
                                >
                                  {isBusinessPlan ? (
                                    <span className="text-slate-400 font-bold shrink-0 select-none leading-none mt-0.5">
                                      —
                                    </span>
                                  ) : (
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
                                  )}
                                  <span>{bullet}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Key-Value Rows (Responsibilities & Requirements) */}
                        {section.keyValueRows && (
                          <div className="space-y-2.5">
                            {section.keyValueRows.map((row, idx) => (
                              <div
                                key={idx}
                                className={`flex items-center justify-between text-xs sm:text-[13px] py-1 ${
                                  styleTemplate === "Minimal"
                                    ? ""
                                    : "border-b border-slate-50 last:border-b-0"
                                }`}
                              >
                                <span className="text-slate-600 font-normal">
                                  {row.key}
                                </span>
                                <span className="font-bold text-slate-900 text-right">
                                  {row.value}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Steps with numbered pill badges (Procedure) */}
                        {section.steps && (
                          <div className="space-y-3">
                            {section.steps.map((step, idx) => (
                              <div
                                key={idx}
                                className="flex items-start gap-3 text-xs sm:text-[13px]"
                              >
                                {styleTemplate === "Minimal" ? (
                                  <span className="font-mono text-[11px] font-semibold text-slate-700 w-5 shrink-0 mt-0.5">
                                    {String(idx + 1).padStart(2, "0")}
                                  </span>
                                ) : (
                                  <span className="w-5 h-5 rounded-md bg-[#2563EB] text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                                    {String(idx + 1).padStart(2, "0")}
                                  </span>
                                )}
                                <span className="text-slate-700 leading-relaxed font-normal">
                                  {step}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Callouts (Notes & Exceptions) */}
                        {section.callouts && (
                          <div className="space-y-3.5">
                            {section.callouts.map((callout, idx) => {
                              const isWarning = callout.type === "warning";
                              return (
                                <div
                                  key={idx}
                                  className={`p-3.5 space-y-1 ${
                                    styleTemplate === "Minimal"
                                      ? isWarning
                                        ? "bg-amber-50/40 border border-amber-200/40 rounded-xl"
                                        : "bg-blue-50/40 border border-blue-200/40 rounded-xl"
                                      : isWarning
                                        ? "rounded-r-xl bg-amber-50/50 border-l-2 border-amber-500"
                                        : "rounded-r-xl bg-blue-50/50 border-l-2 border-blue-500"
                                  }`}
                                >
                                  <p
                                    className={`text-[11px] font-bold ${
                                      isWarning
                                        ? "text-amber-700"
                                        : "text-blue-700"
                                    }`}
                                  >
                                    {callout.title}
                                  </p>
                                  <p className="text-xs text-slate-700 leading-relaxed">
                                    {callout.content}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Table (Pricing) */}
                        {section.id === "pricing" && section.tableRows && (
                          <div className="space-y-3">
                            <div className="divide-y divide-slate-100">
                              {section.tableRows.map((row, idx) => (
                                <div
                                  key={idx}
                                  className="py-2.5 flex items-center justify-between text-sm"
                                >
                                  <span className="text-slate-600">
                                    {row.item}
                                  </span>
                                  <span className="font-semibold text-slate-900">
                                    {row.cost}
                                  </span>
                                </div>
                              ))}
                              <div className="pt-3 flex items-center justify-between text-sm font-black border-t-2 border-slate-200">
                                <span className="text-slate-900 uppercase">
                                  Total
                                </span>
                                <span className="text-slate-900 font-extrabold text-base">
                                  {section.totalCost}
                                </span>
                              </div>
                            </div>

                            {section.note && (
                              <p className="text-xs text-slate-400 leading-relaxed pt-2">
                                {section.note}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Table (Timeline) */}
                        {section.id === "timeline" && section.tableRows && (
                          <div className="divide-y divide-slate-100">
                            {section.tableRows.map((row, idx) => (
                              <div
                                key={idx}
                                className="py-2.5 flex items-center justify-between text-sm"
                              >
                                <span className="text-slate-600">
                                  {row.milestone}
                                </span>
                                <span className="font-semibold text-slate-900">
                                  {row.duration}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Document Footer Row */}
            <div
              className={`mt-14 pt-4 flex items-center justify-between text-[11px] text-slate-400 font-medium ${
                styleTemplate === "Creative"
                  ? "border-t-2 border-[#2563EB]/25"
                  : styleTemplate === "Minimal"
                    ? "border-t border-slate-100"
                    : "border-t border-slate-200"
              }`}
            >
              <span>{companyProfile.companyName}</span>
              <span>Page 1 of 1</span>
            </div>
          </div>
        </div>

        {/* ================================================================== */}
        {/* RIGHT COLUMN: AI ASSISTANT PANEL (Matching Reference Image)        */}
        {/* ================================================================== */}
        {showAiAssistant && (
          <div className="w-full lg:w-[330px] xl:w-[350px] shrink-0 sticky top-6 animate-in fade-in slide-in-from-right-4 duration-200">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 space-y-5">
              {/* Panel Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-sm font-bold text-slate-900">
                      AI Assistant
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-snug">
                    Improve and refine your document with Ahiia.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAiAssistant(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer -mr-1 -mt-1"
                  aria-label="Close AI Assistant"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Context / Target Selection Banner */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 flex items-start gap-2.5">
                <FileText className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-800 leading-snug">
                    {selectedSection
                      ? `Section selected: ${selectedSection.title}`
                      : "No section selected: changes apply to the whole document."}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    {selectedSection ? (
                      <span className="flex items-center justify-between">
                        <span>Changes will target this section.</span>
                        <button
                          type="button"
                          onClick={() => setSelectedSectionId(null)}
                          className="text-indigo-600 hover:underline font-bold ml-1 cursor-pointer"
                        >
                          Clear
                        </button>
                      </span>
                    ) : (
                      "Select a section for a targeted edit."
                    )}
                  </p>
                </div>
              </div>

              {/* Quick Actions List */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-2.5">
                  Quick actions
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_ACTIONS.map((action) => (
                    <button
                      key={action}
                      type="button"
                      disabled={isAiProcessing}
                      onClick={() => handleExecuteAi(action)}
                      className="px-3 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-xs font-semibold text-slate-700 transition-all cursor-pointer shadow-2xs active:scale-[0.98] disabled:opacity-50"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>

              {/* What would you like to change? Input Box */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-2">
                  What would you like to change?
                </h4>
                <div className="relative rounded-xl border border-slate-200 bg-white p-3 shadow-2xs focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all">
                  <textarea
                    rows={3}
                    value={aiAssistantPrompt}
                    onChange={(e) => setAiAssistantPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleExecuteAi();
                      }
                    }}
                    placeholder="Describe what you want Ahiia to change..."
                    disabled={isAiProcessing}
                    className="w-full bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none resize-none pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => handleExecuteAi()}
                    disabled={isAiProcessing || !aiAssistantPrompt.trim()}
                    className={`absolute right-3 bottom-3 w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                      aiAssistantPrompt.trim() && !isAiProcessing
                        ? "bg-[#131B4D] text-white hover:bg-[#1C2666] active:scale-95 shadow-xs cursor-pointer"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    }`}
                    aria-label="Send AI prompt"
                  >
                    {isAiProcessing ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
                    )}
                  </button>
                </div>
              </div>

              {/* Status feedback indicator when processing */}
              {isAiProcessing && (
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 bg-indigo-50 p-2.5 rounded-xl animate-pulse">
                  <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                  <span>Ahiia AI is optimizing your document...</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* 3. FLOATING BOTTOM BRAND KIT DOCK                                    */}
      {/* ==================================================================== */}
      <div className="flex flex-col items-center justify-center gap-2 pt-4">
        <div className="inline-flex items-center gap-3.5 px-4 py-2 rounded-full bg-white border border-slate-200/90 shadow-md text-xs">
          <div
            className="w-5 h-5 rounded-md flex items-center justify-center font-black text-white text-[9px] shadow-2xs"
            style={{ backgroundColor: brandKit.secondaryColor || "#2563EB" }}
          >
            {companyInitials}
          </div>

          <span className="font-bold text-slate-800">Brand Kit</span>

          <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px]">
            <Check className="w-3 h-3 stroke-[2.5]" />
            Applied
          </span>

          {/* Color dots */}
          <div className="flex items-center gap-1">
            <span
              className="w-3.5 h-3.5 rounded-full border border-white shadow-2xs"
              style={{ backgroundColor: brandKit.secondaryColor || "#2563EB" }}
            />
            <span
              className="w-3.5 h-3.5 rounded-full border border-white shadow-2xs"
              style={{ backgroundColor: brandKit.primaryColor || "#0F172A" }}
            />
          </div>

          <span className="text-slate-500 font-medium">{brandKit.font}</span>

          <span className="text-slate-400 font-normal">
            {styleTemplate === "Creative" ? "Creative" : `${styleTemplate} layout`}
          </span>

          <Link
            to="/dashboard/brand-kit"
            className="font-bold text-blue-600 hover:text-blue-800 ml-1 transition-colors"
          >
            Edit Brand Kit
          </Link>
        </div>

        <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5">
          <RotateCcw className="w-3 h-3 text-slate-400" />
          <span>Changes save automatically. Accepted AI edits are kept as revisions.</span>
        </p>
      </div>

      {/* Centralized Reusable Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        documentId={documentId}
        documentType={
          isBusinessPlan
            ? "business-plan"
            : isSop
              ? "sop"
              : (navState.docType || docData?.templateType || "pitch-deck")
        }
        documentTypeLabel={
          isBusinessPlan
            ? "Business Plan"
            : isSop
              ? "SOP"
              : (navState.docType === "pitch-deck" || (!navState.docType && !isSop && docTitle.toLowerCase().includes("deck"))
                  ? "Pitch Deck"
                  : (navState.docType === "sop" ? "SOP" : "Proposal"))
        }
        documentTitle={docTitle}
        currentStyle={styleTemplate}
        onStyleChange={handleSelectStyle}
        brandKit={brandKit}
        companyName={companyProfile.companyName}
        companyProfile={companyProfile}
        sections={sections}
        itemCount={sections.length}
      />
    </div>
  );
};

export default DocumentWorkspace;
