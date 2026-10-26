import {
  FileText,
  Briefcase,
  LayoutGrid,
  FileSignature,
  Megaphone,
  ClipboardList,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Single source of truth for every document type: what shows on the picker
// card, what the setup page's required sections are, and what counts as
// "complete" for the progress checklist + Review & Generate modal.
// ---------------------------------------------------------------------------

export const TEMPLATES = [
  {
    id: "business-proposal",
    title: "Business Proposal",
    desc: "Create persuasive proposals faster.",
    icon: FileText,
    inputSummary:
      "Client, client need, project/service, proposed solution, price, timeline",
    requiredSections: [
      { key: "executiveSummary", label: "Executive Summary" },
      { key: "scopeOfWork", label: "Scope of Work" },
      { key: "pricing", label: "Pricing" },
      { key: "timeline", label: "Timeline" },
    ],
    optionalSections: [
      {
        key: "aboutUs",
        label: "About Us",
        helper:
          "Add information that helps establish your company's credibility.",
      },
      {
        key: "terms",
        label: "Terms",
        helper:
          "Add payment terms, cancellation policies or other relevant terms.",
      },
      {
        key: "additionalInformation",
        label: "Additional information",
        helper: "Anything else Ahiia should take into account",
      },
    ],
  },
  {
    id: "pitch-deck",
    title: "Pitch Deck",
    desc: "Turn your business idea into an investor-ready presentation.",
    icon: Briefcase,
    inputSummary:
      "Purpose of pitch, specific ask, funding amount/use if applicable, traction",
    requiredSections: [{ key: "documentBrief", label: "Document brief" }],
    optionalSections: [
      {
        key: "traction",
        label: "What traction or achievements do you have?",
        helper: "Customers, revenue, installations, partnerships.",
      },
      {
        key: "additionalInformation",
        label: "Additional information",
        helper: "Anything else Ahiia should take into account",
      },
    ],
  },
  {
    id: "sop",
    title: "SOP",
    desc: "Document your processes consistently.",
    icon: LayoutGrid,
    inputSummary:
      "Process being documented, people/roles, steps, tools/resources, exceptions",
    requiredSections: [{ key: "theProcess", label: "The process" }],
    optionalSections: [
      {
        key: "additionalInformation",
        label: "Additional information",
        helper: "Anything else Ahiia should take into account",
      },
    ],
  },
  {
    id: "contract",
    title: "Contract",
    desc: "Generate professionally structured business agreements.",
    icon: FileSignature,
    inputSummary:
      "Other party, agreement purpose, obligations, payment, duration, termination, specific terms",
    requiredSections: [
      { key: "otherParty", label: "Other party" },
      { key: "theAgreement", label: "The agreement" },
    ],
    optionalSections: [
      {
        key: "additionalInformation",
        label: "Additional information",
        helper:
          "Confidentiality, warranties, dispute resolution or anything else Ahiia should take into account",
      },
    ],
  },
  {
    id: "marketing-plan",
    title: "Marketing Plan",
    desc: "Turn your marketing strategy into a structured plan.",
    icon: Megaphone,
    inputSummary:
      "Campaign/product being marketed, campaign objective, timeframe, budget, specific campaign instructions",
    requiredSections: [
      { key: "whatYouAreMarketing", label: "What you are marketing" },
    ],
    optionalSections: [
      {
        key: "additionalInformation",
        label: "Additional information",
        helper: "Anything else Ahiia should take into account.",
      },
    ],
  },
  {
    id: "business-plan",
    title: "Business plan",
    desc: "Turn your business idea into a clear, structured plan for growth.",
    icon: ClipboardList,
    inputSummary:
      "Purpose of plan, current objective, focus areas, financial information",
    requiredSections: [
      { key: "documentBrief", label: "Document brief" },
      { key: "financialInformation", label: "Financial information" },
    ],
    optionalSections: [
      {
        key: "additionalInformation",
        label: "Additional information",
        helper: "Anything else Ahiia should take into account",
      },
    ],
  },
];

export const getTemplate = (id) => {
  if (!id) return undefined;
  const target = String(id).toLowerCase().replace(/_/g, "-");
  return (
    TEMPLATES.find((t) => t.id === id || t.id.toLowerCase() === target) ||
    TEMPLATES.find(
      (t) =>
        DOCUMENT_TYPE_MAP[t.id]?.toLowerCase() === target ||
        DOCUMENT_TYPE_MAP[target]?.toLowerCase() ===
          DOCUMENT_TYPE_MAP[t.id]?.toLowerCase(),
    )
  );
};

// Placeholder company profile — in the real app this comes from the
// Company Profile API/store.
export const COMPANY_PROFILE = {
  companyName: "SolarTech Nigeria",
  industry: "Renewable Energy",
  fields: [
    { label: "Company name · SolarTech Nigeria", complete: true },
    { label: "Industry · Renewable Energy", complete: true },
    { label: "Company description", complete: true },
    { label: "Target Audience", complete: true },
    { label: "Competitive Advantage", complete: true },
    { label: "Location", complete: true },
  ],
};

export const WRITING_STYLES = [
  { id: "professional", label: "Professional", tag: "Recommended" },
  { id: "clear-simple", label: "Clear & Simple" },
  { id: "persuasive", label: "Persuasive" },
];

export const STYLE_TEMPLATES = [
  {
    id: "Corporate",
    label: "Corporate",
    tag: "Recommended",
    desc: "Executive tone, structured tables, formal headings",
  },
  {
    id: "Minimal",
    label: "Minimal",
    desc: "Clean typography, light dividers, condensed spacing",
  },
  {
    id: "Creative",
    label: "Creative",
    desc: "Bold accent badges, modern section blocks, high contrast",
  },
];

export const DOCUMENT_TYPE_MAP = {
  "business-proposal": "Proposal",
  proposal: "Proposal",
  "pitch-deck": "PitchDeck",
  pitchdeck: "PitchDeck",
  sop: "SOP",
  contract: "Contract",
  "marketing-plan": "MarketingPlan",
  marketingplan: "MarketingPlan",
  "business-plan": "BusinessPlan",
  businessplan: "BusinessPlan",
};

/**
 * Resolves a section object to the backend blueprint section key (e.g. "executiveSummary")
 * @param {Object} section
 * @param {string} [docType]
 * @returns {string}
 */
export const resolveSectionKey = (section, docType) => {
  if (!section) return "";
  if (section.sectionKey) return section.sectionKey;
  if (section.key) return section.key;

  const raw = section.id || section.title || "";
  const camelCandidate = raw
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""))
    .replace(/^(.)/, (c) => c.toLowerCase());

  const template = getTemplate(docType);
  if (template) {
    const allSections = [
      ...(template.requiredSections || []),
      ...(template.optionalSections || []),
    ];

    const exactMatch = allSections.find(
      (s) => s.key === camelCandidate || s.key === section.id
    );
    if (exactMatch) return exactMatch.key;

    const labelMatch = allSections.find(
      (s) =>
        s.label?.toLowerCase().replace(/[^a-z0-9]/g, "") ===
        section.title?.toLowerCase().replace(/[^a-z0-9]/g, "")
    );
    if (labelMatch) return labelMatch.key;
  }

  return camelCandidate;
};

/**
 * Serializes a rich UI section object into a clean, non-empty text string.
 * Conforms to backend requirement: "Every document section must have a non-empty string value."
 * @param {Object} sec
 * @returns {string}
 */
export const serializeSectionToString = (sec) => {
  if (!sec) return "";
  if (typeof sec === "string") return sec.trim();
  if (typeof sec.content === "string" && sec.content.trim()) {
    return sec.content.trim();
  }

  const parts = [];

  if (sec.leadText && typeof sec.leadText === "string" && sec.leadText.trim()) {
    parts.push(sec.leadText.trim());
  }

  if (Array.isArray(sec.paragraphs) && sec.paragraphs.length > 0) {
    const textParas = sec.paragraphs
      .map((p) => (typeof p === "string" ? p.trim() : JSON.stringify(p)))
      .filter(Boolean);
    if (textParas.length > 0) parts.push(textParas.join("\n\n"));
  }

  if (Array.isArray(sec.bullets) && sec.bullets.length > 0) {
    const bulletLines = sec.bullets
      .map((b) => (typeof b === "string" ? `• ${b.trim()}` : `• ${JSON.stringify(b)}`))
      .filter(Boolean);
    if (bulletLines.length > 0) parts.push(bulletLines.join("\n"));
  }

  if (Array.isArray(sec.steps) && sec.steps.length > 0) {
    const stepLines = sec.steps
      .map((s, idx) => (typeof s === "string" ? `${idx + 1}. ${s.trim()}` : `${idx + 1}. ${JSON.stringify(s)}`))
      .filter(Boolean);
    if (stepLines.length > 0) parts.push(stepLines.join("\n"));
  }

  if (Array.isArray(sec.keyValueRows) && sec.keyValueRows.length > 0) {
    const kvLines = sec.keyValueRows
      .filter((r) => r && (r.key || r.value))
      .map((r) => `${r.key || "Item"}: ${r.value || ""}`);
    if (kvLines.length > 0) parts.push(kvLines.join("\n"));
  }

  if (Array.isArray(sec.tableRows) && sec.tableRows.length > 0) {
    const tableLines = sec.tableRows.map((r) => {
      if (r.item && r.cost) return `${r.item}: ${r.cost}`;
      if (r.milestone && r.duration) return `${r.milestone}: ${r.duration}`;
      return Object.entries(r).map(([k, v]) => `${k}: ${v}`).join(", ");
    });
    if (tableLines.length > 0) parts.push(tableLines.join("\n"));
  }

  if (sec.totalCost) {
    parts.push(`Total: ${sec.totalCost}`);
  }

  if (sec.note && typeof sec.note === "string" && sec.note.trim()) {
    parts.push(sec.note.trim());
  }

  if (Array.isArray(sec.callouts) && sec.callouts.length > 0) {
    const calloutLines = sec.callouts
      .map((c) => (c.title ? `[${c.type || "Note"}] ${c.title}: ${c.content || ""}` : c.content))
      .filter(Boolean);
    if (calloutLines.length > 0) parts.push(calloutLines.join("\n"));
  }

  const result = parts.join("\n\n").trim();
  return result || sec.title || "Section content to be provided.";
};

/**
 * Builds the PUT /api/v1/documents/{id}/content payload.
 * Maps every section to its blueprint section key with a non-empty string value.
 * Only sections that actually exist in the document are sent - no placeholder
 * sections are injected (generated blueprint keys can differ from setup-form keys).
 * @param {Array} sections
 * @param {string} [docType]
 * @returns {Object} Section-keyed JSON object with non-empty string values
 */
export const buildDocumentContentPayload = (sections, docType) => {
  const contentMap = {};

  (sections || []).forEach((sec) => {
    const key = sec.sectionKey || resolveSectionKey(sec, docType);
    if (key) {
      const strVal = serializeSectionToString(sec);
      contentMap[key] = strVal && strVal.trim() ? strVal.trim() : "Details to be provided.";
    }
  });

  return contentMap;
};

