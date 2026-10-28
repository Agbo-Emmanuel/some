import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import {
  ChevronRight,
  ChevronLeft,
  Eye,
  Download,
  Sparkles,
  RotateCcw,
  Check,
  Edit2,
  Trash2,
  Plus,
  Copy,
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
  ArrowDown,
  Presentation,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  getDocumentById,
  updateDocument,
  updateDocumentStyle,
  updateDocumentContent,
  updateDocumentStatus,
  regenerateDocumentSection,
  documentAssistantAction,
} from "../../services/document.service";
import { getUserProfile } from "../../services/profile.service";
import { getBrandKit } from "../../services/brandKit.service";
import ExportModal from "../components/ExportModal";
import {
  resolveSectionKey,
  buildDocumentContentPayload,
  serializeSectionToString,
} from "../../config/documentTemplates";

// ============================================================================
// Generated content -> structured UI sections
// ----------------------------------------------------------------------------
// The workspace renders ONLY what the backend generated. There is no demo /
// mock content anywhere in this file. The backend stores a section-keyed map
// ({ [sectionKey]: string }) whose keys come from the document blueprint
// (e.g. "coverPage", "executiveSummary"...). Each string is parsed into the
// layout primitives the renderer already supports (paragraphs, bullets,
// numbered steps, key/value rows) so generated text keeps the intended layout.
// ============================================================================
const BULLET_LINE_RE = /^\s*[-*\u2022\u2023\u25AA\u2013\u2014]\s+(.*)$/;
const STEP_LINE_RE = /^\s*\d{1,2}[.)]\s+(.*)$/;
const SUB_CLAUSE_RE = /^\s*(\d+\.\d+(?:\.\d+)?|\([a-z0-9]+\))\s+(.*)$/;
const KEY_VALUE_LINE_RE = /^\s*([^:.!?]{1,48}):\s+(.+)$/;
const FINANCIAL_LINE_RE = /^\s*([A-Za-z\s]{3,35}?)(?::|\s{2,}|\t)\s*([₦$€£]?\s*[\d,]+(?:\.\d+)?%?|\d+%).*$/;
const MD_HEADING_RE = /^\s*#{1,6}\s+/;

export const DEFAULT_CONTRACT_SECTIONS = [
  {
    id: "parties-purpose",
    sectionKey: "partiesAndPurpose",
    title: "Parties & Purpose",
    paragraphs: [
      "This agreement is made between Lagos SME Partners Ltd, of 14 Adeola Odeku Street, Victoria Island, Lagos, and SolarTech Nigeria, for the supply, installation and maintenance of solar power systems across the Client's partner sites.",
    ],
  },
  {
    id: "obligations",
    sectionKey: "obligations",
    title: "Obligations",
    bullets: [
      "The Provider shall design, supply, install and commission each system at the agreed sites.",
      "The Provider shall maintain each installed system for 24 months from handover.",
      "The Client shall provide site access, existing load data and a nominated contact per site.",
      "The Client shall obtain any landlord or regulatory consent required before installation.",
    ],
  },
  {
    id: "payment-terms",
    sectionKey: "paymentTerms",
    title: "Payment Terms",
    keyValueRows: [
      { key: "Contract value", value: "₦86,000,000" },
      { key: "On signing", value: "40%" },
      { key: "On delivery to site", value: "40%" },
      { key: "On commissioning", value: "20%" },
    ],
  },
  {
    id: "term-termination",
    sectionKey: "termTermination",
    title: "Term & Termination",
    paragraphs: [
      "This agreement commences on 1 October 2026 and runs for 24 months. Either party may terminate on 60 days' written notice, or immediately on material breach that remains uncured after 30 days.",
    ],
    guidance: {
      title: "Guidance flagged this clause",
      content:
        "No liability cap or governing-law clause is present. Review before sending — Ahiia does not add legal terms you did not provide.",
    },
  },
  {
    id: "signatures",
    sectionKey: "signatures",
    title: "Signatures",
    isSignatures: true,
  },
];

export const DEFAULT_MARKETING_PLAN_SECTIONS = [
  {
    id: "sec-objectives",
    key: "objectives",
    title: "Objectives",
    leadText:
      "Generate qualified commercial solar enquiries in Lagos, Ogun and Oyo, and shorten the time between first enquiry and site assessment.",
    paragraphs: [],
    bullets: [
      "Grow inbound enquiries from operators spending ₦1.5M+ monthly on diesel",
      "Book site assessments within seven days of first contact",
      "Publish installed-system evidence buyers can verify",
    ],
  },
  {
    id: "sec-audience-message",
    key: "audienceMessage",
    title: "Audience & Message",
    paragraphs: [
      "Operations and finance decision-makers at commercial sites carrying heavy diesel costs. The message is measured output: what the system produced, what it replaced, and what it cost.",
    ],
  },
  {
    id: "sec-channels-campaigns",
    key: "channelsCampaigns",
    title: "Channels & Campaigns",
    paragraphs: [],
    keyValueRows: [
      {
        key: "Search",
        value: "Commercial solar and diesel-cost intent terms",
      },
      {
        key: "LinkedIn",
        value: "Installed-site case studies, fortnightly",
      },
      {
        key: "Partnerships",
        value: "Industrial park and facility-management referrals",
      },
      {
        key: "Events",
        value: "Two trade sessions per half",
      },
    ],
  },
  {
    id: "sec-budget-timeline",
    key: "budgetTimeline",
    title: "Budget & Timeline",
    isFinancialOverview: true,
    paragraphs: [
      "Campaigns run in two halves, with a review at the end of H1 before the second tranche is committed.",
    ],
    keyValueRows: [
      {
        key: "Search and paid social",
        value: "₦6,400,000",
      },
      {
        key: "Content and case studies",
        value: "₦3,200,000",
      },
      {
        key: "Events and partnerships",
        value: "₦2,400,000",
      },
      {
        key: "Annual budget",
        value: "₦12,000,000",
        isTotal: true,
      },
    ],
  },
];

export const PITCH_DECK_SLIDE_TEMPLATES = [
  {
    key: "cover",
    name: "Cover Slide",
    kicker: "Cover",
    title: "Powering Nigerian business without the grid",
    subtitle: "Series-A raise • 2026",
    footerNote: "Confidential • Investor presentation",
    isCover: true,
    description: "Hero title, company badge, tagline, and presentation metadata.",
  },
  {
    key: "problem",
    name: "Problem",
    kicker: "Problem",
    title: "Diesel is the default, and it is expensive",
    bullets: [
      "Commercial operators spend ₦1.5M+ monthly on diesel",
      "Outages damage equipment and halt production",
      "Existing solar vendors sell hardware, not outcomes",
    ],
    description: "The core customer pain points, inefficiencies, and market urgency.",
  },
  {
    key: "solution",
    name: "Solution",
    kicker: "Solution",
    title: "Designed, installed and measured by one team",
    bullets: [
      "Systems sized against twelve months of metered load",
      "Monitoring desk accountable for output",
      "24-month maintenance included on every install",
    ],
    description: "Your productized solution and how it directly solves customer pain.",
  },
  {
    key: "marketOpportunity",
    name: "Market Opportunity",
    kicker: "Market Opportunity",
    title: "₦1.8T addressable market in commercial off-grid power",
    metricValue: "₦1.8T",
    metricLabel: "Total addressable commercial market",
    bullets: [
      "Over 45,000 commercial facilities rely on diesel generators",
      "Grid tariffs escalating 40%+ annually pushing operators to solar",
      "Targeting mid-sized manufacturing, cold storage, and logistics hubs",
    ],
    description: "Total addressable market (TAM), serviceable market, and growth tailwinds.",
  },
  {
    key: "product",
    name: "Product",
    kicker: "Product",
    title: "Turnkey solar systems with live telemetry and SLA",
    bullets: [
      "Tier-1 bifacial solar arrays with intelligent hybrid inverters",
      "High-cycle LiFePO4 battery banks with 10-year design life",
      "24/7 remote monitoring desk with automated dispatch for faults",
    ],
    description: "Detailed product features, technology architecture, and IP advantages.",
  },
  {
    key: "businessModel",
    name: "Business Model",
    kicker: "Business Model",
    title: "Hardware margins plus recurring service contracts",
    metricValue: "85%",
    metricLabel: "Multi-year recurring revenue contract coverage",
    bullets: [
      "Direct equipment sales with 28% gross margin",
      "Mandatory 24-month service agreement generating recurring ARR",
      "Performance monitoring subscription with predictive maintenance",
    ],
    description: "Revenue streams, pricing strategy, unit economics, and customer contracts.",
  },
  {
    key: "traction",
    name: "Traction",
    kicker: "Traction",
    title: "Installed, monitored, renewing",
    metricValue: "₦480M",
    metricLabel: "2026 revenue target",
    bullets: [
      "38 commercial systems installed",
      "94% maintenance renewal rate",
      "Average payback under 30 months",
    ],
    description: "Key milestones, growth metrics, revenue momentum, and proof of retention.",
  },
  {
    key: "competition",
    name: "Competitive Landscape",
    kicker: "Competitive Landscape",
    title: "Performance-guaranteed vs transactional component sellers",
    bullets: [
      "Transactional importers provide no service or load engineering",
      "International EPCs focus exclusively on utility-scale projects > 2MW",
      "SolarTech owns the commercial sweet spot (50kW – 500kW)",
    ],
    description: "Market positioning, competitive moats, and differentiation factors.",
  },
  {
    key: "goToMarket",
    name: "Go-To-Market Strategy",
    kicker: "Go-To-Market Strategy",
    title: "Direct engineering sales with industrial cluster partnerships",
    bullets: [
      "Partnering with industrial park associations across Lagos and Ogun",
      "Audited diesel displacement studies used as primary sales weapon",
      "Referral incentives yielding 42% of new commercial pipeline",
    ],
    description: "Customer acquisition channels, strategic partners, and sales execution.",
  },
  {
    key: "team",
    name: "Team",
    kicker: "Team",
    title: "Experienced renewable engineers and energy operators",
    bullets: [
      "Executive leadership with 15+ years in African power infrastructure",
      "Certified in-house installation engineers and grid technicians",
      "Advisors from leading West African energy finance institutions",
    ],
    description: "Founders, executive leadership, technical capability, and advisors.",
  },
  {
    key: "financials",
    name: "Financials",
    kicker: "Financials",
    title: "Profitable unit economics with accelerating ARR",
    metricValue: "44%",
    metricLabel: "Projected 3-year revenue CAGR",
    bullets: [
      "₦180M revenue achieved in 2025 across first 38 installations",
      "₦480M projected for 2026 based on signed commercial LOIs",
      "EBITDA positive from Q3 2026 with 32% contribution margin",
    ],
    description: "Revenue projections, unit economics, gross margins, and profitability path.",
  },
  {
    key: "theAsk",
    name: "The Ask",
    kicker: "The Ask",
    title: "Seeking ₦75M to expand across the Southwest",
    bullets: [
      "Two additional installation crews",
      "Storage inventory for faster delivery",
      "Monitoring desk capacity",
    ],
    description: "Funding requirement, target milestone timeline, and capital allocation.",
  },
  {
    key: "closing",
    name: "Closing Slide",
    kicker: "Closing Slide",
    title: "Powering Nigerian business into a resilient solar future",
    subtitle: "Join us in scaling clean, reliable energy across Nigeria",
    footerNote: "investors@solartech.ng • +234 (0) 1 234 5678",
    isClosing: true,
    bullets: [
      "Contact: Chidi Okafor, Managing Director",
      "Headquarters: Victoria Island, Lagos, Nigeria",
      "Data room available upon request",
    ],
    description: "Contact information, call to action, and summary closing statement.",
  },
];

export const DEFAULT_PITCH_DECK_SECTIONS = [
  {
    id: "slide-cover",
    key: "cover",
    kicker: "Cover",
    title: "Powering Nigerian business without the grid",
    subtitle: "Series-A raise • 2026",
    footerNote: "Confidential • Investor presentation",
    isCover: true,
  },
  {
    id: "slide-problem",
    key: "problem",
    kicker: "Problem",
    title: "Diesel is the default, and it is expensive",
    bullets: [
      "Commercial operators spend ₦1.5M+ monthly on diesel",
      "Outages damage equipment and halt production",
      "Existing solar vendors sell hardware, not outcomes",
    ],
  },
  {
    id: "slide-solution",
    key: "solution",
    kicker: "Solution",
    title: "Designed, installed and measured by one team",
    bullets: [
      "Systems sized against twelve months of metered load",
      "Monitoring desk accountable for output",
      "24-month maintenance included on every install",
    ],
  },
  {
    id: "slide-traction",
    key: "traction",
    kicker: "Traction",
    title: "Installed, monitored, renewing",
    metricValue: "₦480M",
    metricLabel: "2026 revenue target",
    bullets: [
      "38 commercial systems installed",
      "94% maintenance renewal rate",
      "Average payback under 30 months",
    ],
  },
  {
    id: "slide-the-ask",
    key: "theAsk",
    kicker: "The Ask",
    title: "Seeking ₦75M to expand across the Southwest",
    bullets: [
      "Two additional installation crews",
      "Storage inventory for faster delivery",
      "Monitoring desk capacity",
    ],
  },
];

const stripInlineMarkdown = (s) =>
  String(s)
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .trim();

const toSectionId = (key) =>
  String(key)
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

const humanizeSectionKey = (key) =>
  String(key)
    .replace(/[_-]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (c) => c.toUpperCase());

// Non-string values (arrays / objects) are normalised to text first.
const normalizeSectionValue = (value) => {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) {
    return value
      .map((v) => (typeof v === "string" ? `\u2022 ${v}` : JSON.stringify(v)))
      .join("\n");
  }
  if (typeof value === "object") {
    return Object.entries(value)
      .map(([k, v]) => `${k}: ${typeof v === "string" ? v : JSON.stringify(v)}`)
      .join("\n");
  }
  return String(value);
};

/**
 * Parses a generated text block into renderer-friendly fields.
 * Round-trips with serializeSectionToString (bullets "\u2022 ", steps "1. ", "Key: Value").
 */
const parseTextToSectionBody = (text) => {
  const paragraphs = [];
  const bullets = [];
  const steps = [];
  const subClauses = [];
  const keyValueRows = [];
  let tableRows = null;

  const blocks = String(text || "")
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n+/)
    .map((b) => b.trim())
    .filter(Boolean);

  blocks.forEach((block) => {
    const lines = block
      .split("\n")
      .map((l) => l.replace(MD_HEADING_RE, "").trim())
      .filter(Boolean);

    // 1. Detect Markdown Table
    const pipeLines = lines.filter((l) => l.startsWith("|") && l.endsWith("|"));
    if (pipeLines.length >= 3 && pipeLines[1].includes("---")) {
      const headers = pipeLines[0]
        .split("|")
        .map((s) => s.trim())
        .filter(Boolean);
      const rows = [];
      for (let i = 2; i < pipeLines.length; i++) {
        const cells = pipeLines[i]
          .split("|")
          .map((s) => s.trim())
          .filter(Boolean);
        if (cells.length > 0) {
          const rowObj = {};
          headers.forEach((h, hIdx) => {
            rowObj[h] = stripInlineMarkdown(cells[hIdx] || "");
          });
          rows.push(rowObj);
        }
      }
      if (rows.length > 0) {
        tableRows = rows;
        return;
      }
    }

    // 2. Detect Key-Value or Financial breakdown block
    const isKeyValueBlock =
      lines.length >= 2 &&
      lines.every(
        (l) =>
          (KEY_VALUE_LINE_RE.test(l) || FINANCIAL_LINE_RE.test(l)) &&
          !BULLET_LINE_RE.test(l) &&
          !STEP_LINE_RE.test(l)
      );

    if (isKeyValueBlock) {
      lines.forEach((l) => {
        const m = l.match(KEY_VALUE_LINE_RE) || l.match(FINANCIAL_LINE_RE);
        if (m) {
          keyValueRows.push({
            key: stripInlineMarkdown(m[1]),
            value: stripInlineMarkdown(m[2]),
          });
        }
      });
      return;
    }

    let buffer = [];
    const flush = () => {
      if (buffer.length) {
        paragraphs.push(stripInlineMarkdown(buffer.join(" ")));
        buffer = [];
      }
    };

    lines.forEach((line) => {
      const bullet = line.match(BULLET_LINE_RE);
      if (bullet) {
        flush();
        bullets.push(stripInlineMarkdown(bullet[1]));
        return;
      }
      const subClause = line.match(SUB_CLAUSE_RE);
      if (subClause) {
        flush();
        subClauses.push({
          number: subClause[1],
          text: stripInlineMarkdown(subClause[2]),
        });
        return;
      }
      const step = line.match(STEP_LINE_RE);
      if (step) {
        flush();
        steps.push(stripInlineMarkdown(step[1]));
        return;
      }
      const fin = line.match(FINANCIAL_LINE_RE);
      if (fin && (fin[1].toLowerCase().includes("value") || fin[1].toLowerCase().includes("signing") || fin[1].toLowerCase().includes("delivery") || fin[1].toLowerCase().includes("commissioning") || fin[1].toLowerCase().includes("total"))) {
        flush();
        keyValueRows.push({
          key: stripInlineMarkdown(fin[1]),
          value: stripInlineMarkdown(fin[2]),
        });
        return;
      }
      buffer.push(line);
    });
    flush();
  });

  const body = {};
  // A trailing "...:" paragraph directly introducing a list becomes its lead text
  if (
    bullets.length > 0 &&
    paragraphs.length > 0 &&
    paragraphs[paragraphs.length - 1].endsWith(":")
  ) {
    body.leadText = paragraphs.pop();
  }
  if (paragraphs.length > 0) body.paragraphs = paragraphs;
  if (bullets.length > 0) body.bullets = bullets;
  if (steps.length > 0) body.steps = steps;
  if (subClauses.length > 0) body.subClauses = subClauses;
  if (keyValueRows.length > 0) body.keyValueRows = keyValueRows;
  if (tableRows && tableRows.length > 0) body.tableRows = tableRows;

  if (Object.keys(body).length === 0 && String(text || "").trim()) {
    body.paragraphs = [String(text).trim()];
  }
  return body;
};

const buildSectionFromGenerated = (
  key,
  value,
  isBusinessPlan = false,
  isSop = false,
  isContract = false,
  isMarketingPlan = false,
  isPitchDeck = false
) => {
  const text = normalizeSectionValue(value).trim();
  if (!text) return null;
  let humanTitle = humanizeSectionKey(key);
  let kicker = humanTitle;
  let isCover = false;
  let isClosing = false;
  let subtitle = "";
  let metricVal = "";
  let metricLbl = "";

  if (isContract) {
    if (/parties/i.test(key) || /parties/i.test(humanTitle)) {
      humanTitle = "Parties & Purpose";
    } else if (/obligation/i.test(key) || /obligation/i.test(humanTitle)) {
      humanTitle = "Obligations";
    } else if (
      /payment/i.test(key) ||
      /payment/i.test(humanTitle) ||
      /pricing/i.test(key) ||
      /terms/i.test(key)
    ) {
      humanTitle = "Payment Terms";
    } else if (
      /term/i.test(key) ||
      /termination/i.test(key) ||
      /duration/i.test(key)
    ) {
      humanTitle = "Term & Termination";
    } else if (
      /signature/i.test(key) ||
      /signator/i.test(key) ||
      /execution/i.test(key)
    ) {
      humanTitle = "Signatures";
    }
  } else if (isMarketingPlan) {
    if (/objective/i.test(key) || /objective/i.test(humanTitle) || /goal/i.test(key)) {
      humanTitle = "Objectives";
    } else if (/audience/i.test(key) || /message/i.test(key) || /target/i.test(key)) {
      humanTitle = "Audience & Message";
    } else if (/channel/i.test(key) || /campaign/i.test(key) || /strategy/i.test(key)) {
      humanTitle = "Channels & Campaigns";
    } else if (/budget/i.test(key) || /timeline/i.test(key) || /spend/i.test(key) || /pricing/i.test(key)) {
      humanTitle = "Budget & Timeline";
    }
  } else if (isPitchDeck) {
    if (/cover/i.test(key) || /cover/i.test(humanTitle)) {
      humanTitle = text.split("\n")[0] || "Powering Nigerian business without the grid";
      kicker = "Cover";
      isCover = true;
      subtitle = "Series-A raise • 2026";
    } else if (/problem/i.test(key) || /problem/i.test(humanTitle)) {
      kicker = "Problem";
    } else if (/solution/i.test(key) || /solution/i.test(humanTitle)) {
      kicker = "Solution";
    } else if (/market/i.test(key) || /opportunity/i.test(key)) {
      kicker = "Market Opportunity";
      metricVal = "₦1.8T";
      metricLbl = "Total addressable commercial market";
    } else if (/product/i.test(key) || /service/i.test(key)) {
      kicker = "Product";
    } else if (/business/i.test(key) || /model/i.test(key)) {
      kicker = "Business Model";
      metricVal = "85%";
      metricLbl = "Multi-year recurring revenue contract coverage";
    } else if (/traction/i.test(key) || /milestone/i.test(key)) {
      kicker = "Traction";
      metricVal = "₦480M";
      metricLbl = "2026 revenue target";
    } else if (/compet/i.test(key) || /landscape/i.test(key)) {
      kicker = "Competitive Landscape";
    } else if (/strategy/i.test(key) || (/market/i.test(key) && /go/i.test(key))) {
      kicker = "Go-To-Market Strategy";
    } else if (/team/i.test(key) || /founder/i.test(key)) {
      kicker = "Team";
    } else if (/financial/i.test(key) || /projection/i.test(key)) {
      kicker = "Financials";
      metricVal = "44%";
      metricLbl = "Projected 3-year revenue CAGR";
    } else if (/ask/i.test(key) || /funding/i.test(key) || /raise/i.test(key)) {
      kicker = "The Ask";
    } else if (/closing/i.test(key) || /conclusion/i.test(key)) {
      kicker = "Closing Slide";
      isClosing = true;
      subtitle = "Join us in scaling clean, reliable energy across Nigeria";
    }
  }

  const isFinancial =
    /financial/i.test(key) ||
    /financial/i.test(humanTitle) ||
    /facility/i.test(key) ||
    (isMarketingPlan && (/budget/i.test(key) || /budget/i.test(humanTitle)));
  const isTermination =
    /term/i.test(key) ||
    /termination/i.test(key) ||
    /term/i.test(humanTitle) ||
    /termination/i.test(humanTitle);
  const isSignatures =
    /signature/i.test(key) ||
    /signator/i.test(key) ||
    /execution/i.test(key) ||
    /signature/i.test(humanTitle) ||
    /signator/i.test(humanTitle);
  const parsed = parseTextToSectionBody(text);

  return {
    id: toSectionId(key),
    sectionKey: key,
    title: humanTitle,
    kicker: isPitchDeck ? kicker : humanTitle,
    ...(isCover ? { isCover: true, subtitle } : {}),
    ...(isClosing ? { isClosing: true, subtitle } : {}),
    ...(metricVal ? { metricValue: metricVal, metricLabel: metricLbl } : {}),
    ...(/executive\s*summary/i.test(humanTitle) ? { isHighlighted: true } : {}),
    ...(isFinancial && (isBusinessPlan || isMarketingPlan || parsed.keyValueRows)
      ? {
          isFinancialOverview: true,
          ...(isBusinessPlan
            ? {
                disclosure: {
                  title: "Figures provided by you",
                  content:
                    "Every number in this plan comes from the financial information you entered. Ahiia does not generate projections you did not supply.",
                },
              }
            : {}),
        }
      : {}),
    ...(isContract && isTermination
      ? {
          guidance: {
            title: "Guidance flagged this clause",
            content:
              "No liability cap or governing-law clause is present. Review before sending — Ahiia does not add legal terms you did not provide.",
          },
        }
      : {}),
    ...(isSignatures ? { isSignatures: true } : {}),
    ...parsed,
  };
};

// Converts the backend section map into UI sections, preserving backend order.
const parseSectionMapToSections = (
  map,
  isBusinessPlan = false,
  isSop = false,
  isContract = false,
  isMarketingPlan = false,
  isPitchDeck = false
) => {
  if (!map || typeof map !== "object" || Array.isArray(map)) return null;
  return Object.entries(map)
    .map(([key, value]) =>
      buildSectionFromGenerated(
        key,
        value,
        isBusinessPlan,
        isSop,
        isContract,
        isMarketingPlan,
        isPitchDeck
      )
    )
    .filter(Boolean);
};

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

  // Document metadata state
  const [docData, setDocData] = useState(null);
  const [docTitle, setDocTitle] = useState(navState.docTitle || "");
  const [revisionCount, setRevisionCount] = useState(
    navState.revisionCount ?? 0
  );
  const [docStatus, setDocStatus] = useState(
    navState.status || (navState.revisionCount > 1 ? "Saved" : "Draft")
  );
  const [saveStatus, setSaveStatus] = useState("saved"); // "saved" | "saving" | "unsaved" | "error"
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [isNotFound, setIsNotFound] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [loading, setLoading] = useState(
    Boolean(documentId && documentId !== "new")
  );

  const lastSavedSnapshotRef = useRef(null);
  const autosaveTimerRef = useRef(null);
  const hasLoadedInitialRef = useRef(false);
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

  // Pitch Deck Presentation Studio State
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [showSlidePickerModal, setShowSlidePickerModal] = useState(false);

  // Editable sections - populated exclusively from generated backend content
  const [sections, setSections] = useState([]);
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [editingContent, setEditingContent] = useState({});

  // Brand Kit & Company Profile
  const [brandKit, setBrandKit] = useState({
    configured: true,
    font: "Montserrat",
    primaryColor: "#0F172A",
    secondaryColor: "#2563EB",
    tagline: "",
  });
  const [companyProfile, setCompanyProfile] = useState({
    companyName: "",
    preparedFor: "",
    preparedBy: "",
    processOwner: "",
    issuedBy: "",
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

  // Persistent document content sync (PUT /api/v1/documents/:id/content)
  const persistContent = async (
    currentSections = sections,
    title = docTitle,
    style = styleTemplate,
    isManual = false
  ) => {
    if (!documentId || documentId === "new") {
      if (isManual) {
        toast.warning("Document does not have a valid server ID to persist.");
      }
      return false;
    }

    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = null;
    }

    setIsSaving(true);
    setSaveStatus("saving");
    setSaveError(null);

    const docTypeVal =
      docData?.documentType || docData?.type || navState.docType || "Proposal";

    // Build the compliant section-keyed JSON object where every section has a non-empty string value
    const contentMap = buildDocumentContentPayload(currentSections, docTypeVal);

    const payload = {
      content: contentMap,
    };

    try {
      const res = await updateDocumentContent(documentId, payload);
      const updatedDoc = res?.data || res;
      if (updatedDoc?.revisionCount !== undefined) {
        setRevisionCount(updatedDoc.revisionCount);
      } else if (updatedDoc?.revisions !== undefined) {
        setRevisionCount(updatedDoc.revisions);
      }

      lastSavedSnapshotRef.current = JSON.stringify({
        sections: currentSections,
        title: title || docTitle,
        styleTemplate: style || styleTemplate,
      });

      setIsDirty(false);
      setSaveStatus("saved");
      setDocStatus("Saved");
      setLastSavedAt(new Date());

      // Sync saved status with backend
      try {
        await updateDocumentStatus(documentId, { status: "Saved" });
      } catch (statusErr) {
        console.warn("Could not sync status with server:", statusErr);
      }

      window.dispatchEvent(
        new CustomEvent("ahiia:document-updated", {
          detail: { documentId, status: "Saved" },
        })
      );

      if (isManual) {
        toast.success("Document saved successfully");
      }
      return true;
    } catch (err) {
      console.error("Failed to persist document content:", err);
      if (
        err.response?.status === 404 ||
        err.response?.data?.code === "DOCUMENT_NOT_FOUND"
      ) {
        setIsNotFound(true);
      }
      const requestErrors = err.response?.data?.errors?.request;
      const validationMsg = Array.isArray(requestErrors)
        ? requestErrors[0]
        : typeof requestErrors === "string"
          ? requestErrors
          : null;

      const msg =
        validationMsg ||
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.message ||
        "Failed to save document";
      setSaveError(msg);
      setSaveStatus("error");
      if (isManual) {
        toast.error(msg);
      }
      return false;
    } finally {
      setIsSaving(false);
    }
  };

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
              if (doc.revisionCount !== undefined) setRevisionCount(doc.revisionCount);
              if (doc.styleTemplate) setStyleTemplate(doc.styleTemplate);
              const initialStatus =
                doc.status && doc.status !== "Draft"
                  ? doc.status
                  : (doc.revisionCount && doc.revisionCount > 1) ||
                    (doc.updatedAt && doc.createdAt && doc.updatedAt !== doc.createdAt)
                    ? "Saved"
                    : doc.status || "Draft";
              setDocStatus(initialStatus);

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
              const docIsContract =
                !docIsBusinessPlan &&
                !docIsSop &&
                (docTypeVal === "Contract" ||
                  docTypeVal.toLowerCase().includes("contract") ||
                  docTypeVal.toLowerCase().includes("agreement") ||
                  (doc.title && doc.title.toLowerCase().includes("contract")) ||
                  (doc.title && doc.title.toLowerCase().includes("agreement")));
              const docIsMarketingPlan =
                !docIsBusinessPlan &&
                !docIsSop &&
                !docIsContract &&
                (docTypeVal === "Marketing Plan" ||
                  docTypeVal.toLowerCase().includes("marketing") ||
                  (doc.title && doc.title.toLowerCase().includes("marketing")) ||
                  (documentId && documentId.toLowerCase().includes("marketing")));
              const docIsPitchDeck =
                !docIsBusinessPlan &&
                !docIsSop &&
                !docIsContract &&
                !docIsMarketingPlan &&
                (docTypeVal === "Pitch Deck" ||
                  docTypeVal.toLowerCase().includes("pitch") ||
                  docTypeVal.toLowerCase().includes("deck") ||
                  (doc.title && (doc.title.toLowerCase().includes("pitch") || doc.title.toLowerCase().includes("deck"))) ||
                  (documentId && (documentId.toLowerCase().includes("pitch") || documentId.toLowerCase().includes("deck"))));

              // Inspect existing content in doc.content or doc.sections
              let loadedSections = null;
              if (doc.content) {
                if (Array.isArray(doc.content.sections)) {
                  loadedSections = doc.content.sections;
                } else if (Array.isArray(doc.content)) {
                  loadedSections = doc.content;
                } else if (
                  typeof doc.content === "object" &&
                  !Array.isArray(doc.content)
                ) {
                  loadedSections = parseSectionMapToSections(
                    doc.content,
                    docIsBusinessPlan,
                    docIsSop,
                    docIsContract,
                    docIsMarketingPlan,
                    docIsPitchDeck
                  );
                } else if (typeof doc.content === "string") {
                  try {
                    const parsed = JSON.parse(doc.content);
                    if (Array.isArray(parsed?.sections)) {
                      loadedSections = parsed.sections;
                    } else if (Array.isArray(parsed)) {
                      loadedSections = parsed;
                    } else if (
                      parsed &&
                      typeof parsed === "object" &&
                      !Array.isArray(parsed)
                    ) {
                      loadedSections = parseSectionMapToSections(
                        parsed,
                        docIsBusinessPlan,
                        docIsSop,
                        docIsContract,
                        docIsMarketingPlan,
                        docIsPitchDeck
                      );
                    }
                  } catch {
                    // ignore JSON parse error
                  }
                }
              } else if (Array.isArray(doc.sections)) {
                loadedSections = doc.sections;
              }

              // Resolved sections from loaded content, falling back to defaults if empty
              const resolvedSections =
                Array.isArray(loadedSections) && loadedSections.length > 0
                  ? loadedSections
                  : docIsPitchDeck
                    ? DEFAULT_PITCH_DECK_SECTIONS
                    : docIsMarketingPlan
                      ? DEFAULT_MARKETING_PLAN_SECTIONS
                      : docIsContract
                        ? DEFAULT_CONTRACT_SECTIONS
                        : [];
              setSections(resolvedSections);

              // Header metadata comes from the user's own structured inputs
              const inputs =
                doc.structuredInputs || navState.structuredInputs || {};
              setCompanyProfile((prev) => ({
                ...prev,
                companyName:
                  doc.companyName ||
                  inputs.companyName ||
                  prev.companyName ||
                  "SolarTech Nigeria",
                preparedFor:
                  inputs.preparedFor ||
                  inputs.clientName ||
                  inputs.clientCompany ||
                  inputs.partyName ||
                  inputs.otherParty ||
                  (docIsPitchDeck
                    ? "Investor presentation"
                    : docIsMarketingPlan
                      ? "Commercial team"
                      : docIsContract
                        ? 'Lagos SME Partners Ltd. ("the Client")'
                        : prev.preparedFor),
                preparedBy:
                  inputs.preparedBy ||
                  inputs.companyName ||
                  prev.preparedBy ||
                  (docIsMarketingPlan
                    ? "SolarTech Nigeria"
                    : docIsContract
                      ? 'SolarTech Nigeria ("the Provider")'
                      : prev.preparedBy),
                processOwner:
                  inputs.processOwner || inputs.performer || prev.processOwner,
                issuedBy: inputs.issuedBy || prev.issuedBy,
              }));

              lastSavedSnapshotRef.current = JSON.stringify({
                sections: resolvedSections || sections,
                title: doc.title || docTitle,
                styleTemplate: doc.styleTemplate || styleTemplate,
              });
              hasLoadedInitialRef.current = true;
              setIsDirty(false);
              setSaveStatus("saved");
            }
          } catch (err) {
            console.warn(
              "Could not load document by ID, using local initialized context:",
              err
            );
            const isMarketingDoc =
              documentId === "marketing-strategy-2026" ||
              (documentId && documentId.toLowerCase().includes("marketing")) ||
              navState.docType === "marketing-plan" ||
              navState.docType === "Marketing Plan" ||
              (docTitle && docTitle.toLowerCase().includes("marketing"));

            const isContractDoc =
              documentId === "lagos-sme-partnership-contract" ||
              (documentId && documentId.toLowerCase().includes("contract")) ||
              (documentId && documentId.toLowerCase().includes("partnership")) ||
              navState.docType === "contract" ||
              (docTitle && docTitle.toLowerCase().includes("contract"));

            const isPitchDeckDoc =
              documentId === "series-a-investor-deck" ||
              (documentId && (documentId.toLowerCase().includes("pitch") || documentId.toLowerCase().includes("deck") || documentId.toLowerCase().includes("series-a"))) ||
              navState.docType === "pitch-deck" ||
              navState.docType === "Pitch Deck" ||
              (docTitle && (docTitle.toLowerCase().includes("pitch") || docTitle.toLowerCase().includes("deck") || docTitle.toLowerCase().includes("investor deck")));

            if (isPitchDeckDoc) {
              setDocTitle(docTitle || "Series-A Investor Deck");
              setRevisionCount((prev) => (prev > 0 ? prev : (navState.revisionCount ?? 2)));
              setDocStatus((prev) => (prev !== "Draft" ? prev : "Draft"));
              setSaveStatus("saved");
              setStyleTemplate("Corporate");
              setIsNotFound(false);
              setSections(DEFAULT_PITCH_DECK_SECTIONS);
              setCompanyProfile((prev) => ({
                ...prev,
                companyName: prev.companyName || "SolarTech Nigeria",
                preparedFor: prev.preparedFor || "Investor presentation",
                preparedBy: prev.preparedBy || "SolarTech Nigeria",
              }));
              setBrandKit((prev) => ({
                ...prev,
                configured: true,
                font: prev.font || "Montserrat",
                primaryColor: prev.primaryColor || "#0F172A",
                secondaryColor: prev.secondaryColor || "#2563EB",
                tagline: prev.tagline || "Clean power, built to last",
              }));
              lastSavedSnapshotRef.current = JSON.stringify({
                sections: DEFAULT_PITCH_DECK_SECTIONS,
                title: "Series-A Investor Deck",
                styleTemplate: "Corporate",
              });
              hasLoadedInitialRef.current = true;
            } else if (isMarketingDoc) {
              setDocTitle(docTitle || "Marketing Strategy 2026");
              setRevisionCount((prev) => (prev > 0 ? prev : (navState.revisionCount ?? 2)));
              setDocStatus((prev) => (prev !== "Draft" ? prev : "Draft"));
              setSaveStatus("saved");
              setStyleTemplate(navState.styleTemplate || "Minimal");
              setIsNotFound(false);
              setSections(DEFAULT_MARKETING_PLAN_SECTIONS);
              setCompanyProfile((prev) => ({
                ...prev,
                companyName: prev.companyName || "SolarTech Nigeria",
                preparedFor: prev.preparedFor || "Commercial team",
                preparedBy: prev.preparedBy || "SolarTech Nigeria",
              }));
              setBrandKit((prev) => ({
                ...prev,
                configured: true,
                font: prev.font || "Montserrat",
                primaryColor: prev.primaryColor || "#0F172A",
                secondaryColor: prev.secondaryColor || "#2563EB",
                tagline: prev.tagline || "Clean power, built to last",
              }));
              lastSavedSnapshotRef.current = JSON.stringify({
                sections: DEFAULT_MARKETING_PLAN_SECTIONS,
                title: "Marketing Strategy 2026",
                styleTemplate: navState.styleTemplate || "Minimal",
              });
              hasLoadedInitialRef.current = true;
            } else if (isContractDoc) {
              setDocTitle(docTitle || "Lagos SME Partnership Contract");
              setRevisionCount((prev) => (prev > 0 ? prev : (navState.revisionCount ?? 2)));
              setDocStatus((prev) => (prev !== "Draft" ? prev : "Draft"));
              setSaveStatus("saved");
              setStyleTemplate("Corporate");
              setIsNotFound(false);
              setSections(DEFAULT_CONTRACT_SECTIONS);
              setCompanyProfile((prev) => ({
                ...prev,
                companyName: prev.companyName || "SolarTech Nigeria",
                preparedFor: prev.preparedFor || 'Lagos SME Partners Ltd. ("the Client")',
                preparedBy: prev.preparedBy || 'SolarTech Nigeria ("the Provider")',
              }));
              setBrandKit((prev) => ({
                ...prev,
                configured: true,
                font: prev.font || "Montserrat",
                primaryColor: prev.primaryColor || "#0F172A",
                secondaryColor: prev.secondaryColor || "#2563EB",
                tagline: prev.tagline || "Clean power, built to last",
              }));
              lastSavedSnapshotRef.current = JSON.stringify({
                sections: DEFAULT_CONTRACT_SECTIONS,
                title: "Lagos SME Partnership Contract",
                styleTemplate: "Corporate",
              });
              hasLoadedInitialRef.current = true;
            } else {
              if (
                err.response?.status === 404 ||
                err.response?.data?.code === "DOCUMENT_NOT_FOUND"
              ) {
                setIsNotFound(true);
              }
              hasLoadedInitialRef.current = true;
              lastSavedSnapshotRef.current = JSON.stringify({
                sections,
                title: docTitle,
                styleTemplate,
              });
              setSaveStatus("error");
              setSaveError(
                err.response?.data?.message ||
                  err.message ||
                  "Failed to load document from server"
              );
            }
          }
        } else {
          hasLoadedInitialRef.current = true;
          lastSavedSnapshotRef.current = JSON.stringify({
            sections,
            title: docTitle,
            styleTemplate,
          });
          setSaveStatus("saved");
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

  // Debounced Autosave and dirty state tracking
  useEffect(() => {
    if (!hasLoadedInitialRef.current) return;
    if (!documentId || documentId === "new") return;

    const currentSnapshot = JSON.stringify({
      sections,
      title: docTitle,
      styleTemplate,
    });

    if (
      lastSavedSnapshotRef.current &&
      currentSnapshot !== lastSavedSnapshotRef.current
    ) {
      setIsDirty(true);
      setSaveStatus("unsaved");

      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }

      autosaveTimerRef.current = setTimeout(() => {
        persistContent(sections, docTitle, styleTemplate, false);
      }, 1500);
    } else if (
      lastSavedSnapshotRef.current &&
      currentSnapshot === lastSavedSnapshotRef.current
    ) {
      setIsDirty(false);
      if (saveStatus !== "saving") {
        setSaveStatus("saved");
      }
    }

    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, [sections, docTitle, styleTemplate, documentId]);

  // Protect unsaved changes before user navigates or reloads
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  // Handle Style Selection
  const handleSelectStyle = async (newStyle) => {
    setStyleTemplate(newStyle);
    setShowStyleMenu(false);

    try {
      if (documentId && documentId !== "new") {
        await updateDocumentStyle(documentId, { styleTemplate: newStyle });
      }
      await persistContent(sections, docTitle, newStyle, false);
      toast.success(`Style changed to ${newStyle}`);
    } catch (err) {
      console.error("Failed to update style:", err);
      toast.error("Failed to update style");
    }
  };

  // Execute AI action (from Quick Action chip or Custom Input) with real API responses
  const handleExecuteAi = async (promptText) => {
    const finalPrompt = (promptText || aiAssistantPrompt).trim();
    if (!finalPrompt) return;

    if (!documentId || documentId === "new") {
      toast.error("Document must be saved to the server before running AI actions.");
      return;
    }

    setIsAiProcessing(true);
    setSaveStatus("saving");

    try {
      const targetSec = selectedSectionId
        ? sections.find((s) => s.id === selectedSectionId)
        : null;

      let updatedSections = [...sections];

      if (targetSec) {
        // Resolve blueprint section key conforming to backend document blueprint (e.g. "executiveSummary")
        const docType =
          docData?.documentType || docData?.type || navState.docType || "Proposal";
        const sectionKey = resolveSectionKey(targetSec, docType);

        // Targeted section regeneration via actual backend endpoint (POST /api/v1/documents/:id/regenerate-section)
        const aiRes = await regenerateDocumentSection(documentId, {
          sectionKey,
        });

        const aiData = aiRes?.data || aiRes;

        let parsedContent = aiData?.content;
        if (typeof parsedContent === "string") {
          try {
            parsedContent = JSON.parse(parsedContent);
          } catch {
            // Keep as string
          }
        }

        const regeneratedSec =
          aiData?.section ||
          aiData?.data?.section ||
          (aiData?.id === targetSec.id ? aiData : null);

        if (regeneratedSec) {
          updatedSections = updatedSections.map((sec) =>
            sec.id === targetSec.id
              ? {
                  ...sec,
                  ...regeneratedSec,
                  id: sec.id,
                  title: regeneratedSec.title || sec.title,
                }
              : sec
          );
        } else if (Array.isArray(parsedContent?.sections) || Array.isArray(aiData?.sections)) {
          updatedSections = parsedContent?.sections || aiData?.sections;
        } else if (Array.isArray(parsedContent)) {
          updatedSections = updatedSections.map((sec) => {
            if (sec.id === targetSec.id) {
              if (sec.paragraphs) {
                return { ...sec, paragraphs: parsedContent };
              }
              if (sec.steps) {
                return { ...sec, steps: parsedContent };
              }
              if (sec.bullets) {
                return { ...sec, bullets: parsedContent };
              }
            }
            return sec;
          });
        } else if (typeof parsedContent === "object" && parsedContent !== null) {
          updatedSections = updatedSections.map((sec) =>
            sec.id === targetSec.id
              ? { ...sec, ...parsedContent, id: sec.id }
              : sec
          );
        } else if (typeof parsedContent === "string" || typeof aiData?.text === "string") {
          const newText = (parsedContent || aiData?.text || "").trim();
          if (newText) {
            updatedSections = updatedSections.map((sec) =>
              sec.id === targetSec.id
                ? {
                    id: sec.id,
                    sectionKey: sec.sectionKey || sectionKey,
                    title: sec.title,
                    ...(sec.isHighlighted ? { isHighlighted: true } : {}),
                    ...parseTextToSectionBody(newText),
                  }
                : sec
            );
          }
        }

        const successMessage =
          aiData?.actionApplied || `Updated "${targetSec.title}" with AI`;
        toast.success(successMessage);
      } else {
        // Whole document refinement via actual backend endpoint
        const aiRes = await documentAssistantAction(documentId, {
          action: "refine_document",
          prompt: finalPrompt,
        });

        const aiData = aiRes?.data || aiRes;
        const newSecs =
          aiData?.content?.sections ||
          aiData?.sections ||
          aiData?.document?.content?.sections ||
          (Array.isArray(aiData?.content) ? aiData.content : null);

        if (Array.isArray(newSecs) && newSecs.length > 0) {
          updatedSections = newSecs;
        }

        toast.success("Document updated with AI revisions");
      }

      setSections(updatedSections);
      setRevisionCount((prev) => prev + 1);
      setAiAssistantPrompt("");

      // Persist the actual AI generated updates immediately to document content storage
      await persistContent(updatedSections, docTitle, styleTemplate, false);
    } catch (err) {
      console.error("AI action failed:", err);
      const requestErrors = err.response?.data?.errors?.request;
      const validationMsg = Array.isArray(requestErrors)
        ? requestErrors[0]
        : typeof requestErrors === "string"
          ? requestErrors
          : null;

      const errMsg =
        validationMsg ||
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.message ||
        "Failed to apply AI changes";
      toast.error(errMsg);
      setSaveStatus("saved");
    } finally {
      setIsAiProcessing(false);
    }
  };

  // Export handler - opens standard centralized export experience
  const handleExport = () => {
    setShowExportModal(true);
  };

  // Section Editing Handlers with persistence
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

  const saveEditingSection = async (secId) => {
    const updatedSections = sections.map((sec) => {
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
    });

    setSections(updatedSections);
    setEditingSectionId(null);
    await persistContent(updatedSections, docTitle, styleTemplate, true);
  };

  const deleteSection = async (secId) => {
    const updatedSections = sections.filter((s) => s.id !== secId);
    setSections(updatedSections);
    toast.info("Section removed");
    await persistContent(updatedSections, docTitle, styleTemplate, true);
  };

  const addSectionItem = async (secId) => {
    const updatedSections = sections.map((s) => {
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
    });

    setSections(updatedSections);
    await persistContent(updatedSections, docTitle, styleTemplate, false);
    toast.success("Added new item");
  };

  // Slide Presentation Studio Operations
  const handlePrevSlide = () => {
    setActiveSlideIndex((i) => Math.max(0, i - 1));
  };

  const handleNextSlide = () => {
    setActiveSlideIndex((i) => Math.min(sections.length - 1, i + 1));
  };

  const handleMoveSlideUp = async (idx) => {
    if (idx <= 0) return;
    const nextSections = [...sections];
    const temp = nextSections[idx - 1];
    nextSections[idx - 1] = nextSections[idx];
    nextSections[idx] = temp;
    setSections(nextSections);
    setActiveSlideIndex(idx - 1);
    await persistContent(nextSections, docTitle, styleTemplate, false);
    toast.info("Slide order updated");
  };

  const handleMoveSlideDown = async (idx) => {
    if (idx >= sections.length - 1) return;
    const nextSections = [...sections];
    const temp = nextSections[idx + 1];
    nextSections[idx + 1] = nextSections[idx];
    nextSections[idx] = temp;
    setSections(nextSections);
    setActiveSlideIndex(idx + 1);
    await persistContent(nextSections, docTitle, styleTemplate, false);
    toast.info("Slide order updated");
  };

  const handleDuplicateSlide = async (idx) => {
    const target = sections[idx];
    if (!target) return;
    const copy = {
      ...target,
      id: `slide-${Date.now()}`,
      title: `${target.title} (Copy)`,
    };
    const nextSections = [...sections];
    nextSections.splice(idx + 1, 0, copy);
    setSections(nextSections);
    setActiveSlideIndex(idx + 1);
    await persistContent(nextSections, docTitle, styleTemplate, false);
    toast.success("Slide duplicated");
  };

  const handleDeleteSlide = async (idx) => {
    if (sections.length <= 1) {
      toast.warning("Presentations must contain at least one slide");
      return;
    }
    const nextSections = sections.filter((_, i) => i !== idx);
    setSections(nextSections);
    setActiveSlideIndex(Math.min(idx, nextSections.length - 1));
    await persistContent(nextSections, docTitle, styleTemplate, false);
    toast.info("Slide removed");
  };

  const handleAddPointToSlide = async (slideIdx) => {
    const nextSections = sections.map((sec, i) => {
      if (i === slideIdx) {
        const curBullets = sec.bullets || [];
        return {
          ...sec,
          bullets: [...curBullets, "New key point for this slide"],
        };
      }
      return sec;
    });
    setSections(nextSections);
    await persistContent(nextSections, docTitle, styleTemplate, false);
    toast.success("Point added to slide");
  };

  const handleDeletePointFromSlide = async (slideIdx, pointIdx) => {
    const nextSections = sections.map((sec, i) => {
      if (i === slideIdx) {
        const curBullets = (sec.bullets || []).filter((_, pI) => pI !== pointIdx);
        return {
          ...sec,
          bullets: curBullets,
        };
      }
      return sec;
    });
    setSections(nextSections);
    await persistContent(nextSections, docTitle, styleTemplate, false);
    toast.info("Point removed");
  };

  const handleAddSlideFromTemplate = async (template) => {
    const newSlide = {
      id: `slide-${Date.now()}`,
      key: template.key,
      kicker: template.kicker,
      title: template.title,
      subtitle: template.subtitle,
      footerNote: template.footerNote,
      isCover: Boolean(template.isCover),
      isClosing: Boolean(template.isClosing),
      metricValue: template.metricValue,
      metricLabel: template.metricLabel,
      bullets: template.bullets ? [...template.bullets] : undefined,
    };
    const insertIdx = activeSlideIndex + 1;
    const nextSections = [...sections];
    nextSections.splice(insertIdx, 0, newSlide);
    setSections(nextSections);
    setActiveSlideIndex(insertIdx);
    setShowSlidePickerModal(false);
    await persistContent(nextSections, docTitle, styleTemplate, false);
    toast.success(`Added "${template.name}" slide`);
  };

  const docType =
    navState.docType ||
    docData?.documentType ||
    docData?.documentTypeLabel ||
    (docTitle && docTitle.toLowerCase().includes("business plan")
      ? "BusinessPlan"
      : docTitle && docTitle.toLowerCase().includes("sop")
        ? "SOP"
        : docTitle &&
            (docTitle.toLowerCase().includes("contract") ||
              docTitle.toLowerCase().includes("agreement"))
          ? "Contract"
          : docTitle && docTitle.toLowerCase().includes("marketing")
            ? "Marketing Plan"
            : docTitle &&
                (docTitle.toLowerCase().includes("pitch") ||
                  docTitle.toLowerCase().includes("deck"))
              ? "Pitch Deck"
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

  const isContract =
    !isBusinessPlan &&
    !isSop &&
    (docType === "Contract" ||
      docType === "contract" ||
      (docTitle && docTitle.toLowerCase().includes("contract")) ||
      (docTitle && docTitle.toLowerCase().includes("agreement")) ||
      location.pathname.toLowerCase().includes("contract") ||
      location.search.toLowerCase().includes("contract"));

  const isMarketingPlan =
    !isBusinessPlan &&
    !isSop &&
    !isContract &&
    (docType === "Marketing Plan" ||
      docType === "marketing-plan" ||
      docType === "marketing" ||
      (docTitle && docTitle.toLowerCase().includes("marketing")) ||
      location.pathname.toLowerCase().includes("marketing") ||
      location.search.toLowerCase().includes("marketing"));

  const isPitchDeck =
    !isBusinessPlan &&
    !isSop &&
    !isContract &&
    !isMarketingPlan &&
    (docType === "Pitch Deck" ||
      docType === "pitch-deck" ||
      docType === "pitch" ||
      docType === "PitchDeck" ||
      (docTitle &&
        (docTitle.toLowerCase().includes("pitch") ||
          docTitle.toLowerCase().includes("deck") ||
          docTitle.toLowerCase().includes("investor deck"))) ||
      location.pathname.toLowerCase().includes("pitch") ||
      location.pathname.toLowerCase().includes("deck") ||
      location.pathname.toLowerCase().includes("series-a") ||
      location.search.toLowerCase().includes("pitch") ||
      location.search.toLowerCase().includes("deck"));

  const safeSlideIndex = Math.min(
    Math.max(0, activeSlideIndex),
    Math.max(0, sections.length - 1)
  );
  const currentSlide = sections[safeSlideIndex] || sections[0] || {};

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
              {docTitle || (loading ? "\u00A0" : "Untitled document")}
            </span>
          </div>

          {/* Title & Metadata Badges */}
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {docTitle || "\u00A0"}
            </h1>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 font-medium flex-wrap">
              <span className="text-slate-500 font-medium">
                {isContract
                  ? "Contract"
                  : isBusinessPlan
                    ? "Business Plan"
                    : isSop
                      ? "SOP"
                      : isMarketingPlan
                        ? "Marketing Plan"
                        : isPitchDeck
                          ? "Pitch Deck"
                          : (navState.docType || "Document")}
              </span>
              <span className="text-slate-300">•</span>
              <span>{docStatus === "Finalized" ? "Finalized" : "Draft"}</span>
              <span className="text-slate-300">•</span>
              <span>
                {revisionCount} {revisionCount === 1 ? "revision" : "revisions"}
              </span>
              <span className="text-slate-300">•</span>
              {saveStatus === "saving" ? (
                <span className="inline-flex items-center gap-1 text-blue-600 font-semibold animate-pulse">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving</span>
                </span>
              ) : saveStatus === "unsaved" ? (
                <span className="inline-flex items-center gap-1 text-amber-600 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  <span>Unsaved changes</span>
                </span>
              ) : saveStatus === "error" ? (
                <span className="inline-flex items-center gap-1 text-rose-600 font-semibold">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Save failed</span>
                  <button
                    type="button"
                    onClick={() =>
                      persistContent(sections, docTitle, styleTemplate, true)
                    }
                    className="underline text-[11px] hover:text-rose-700 ml-1 cursor-pointer font-bold"
                  >
                    Retry
                  </button>
                </span>
              ) : (
                <span
                  className="inline-flex items-center gap-1 text-emerald-600 font-semibold"
                  title={
                    lastSavedAt
                      ? `Saved at ${lastSavedAt.toLocaleTimeString()}`
                      : "All changes saved"
                  }
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Saved</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 relative">
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
            aria-pressed={showAiAssistant}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#131B4D] focus-visible:ring-offset-2 active:scale-[0.98] ${
              showAiAssistant
                ? "bg-[#131B4D] border border-[#131B4D] text-white ring-2 ring-[#131B4D]/20 shadow-sm"
                : "bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 hover:text-slate-900 active:bg-[#131B4D] active:border-[#131B4D] active:text-white"
            }`}
          >
            <Sparkles
              className={`w-3.5 h-3.5 transition-colors ${
                showAiAssistant ? "text-indigo-300" : "text-blue-600"
              }`}
            />
            <span>AI Assistant</span>
          </button>

          {/* Manual Save Button (visible when modifications exist or saving) */}
          {(isDirty || isSaving || saveStatus === "error") && (
            <button
              id="document-manual-save-btn"
              type="button"
              disabled={isSaving}
              onClick={() =>
                persistContent(sections, docTitle, styleTemplate, true)
              }
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all shadow-xs cursor-pointer ${
                isDirty || saveStatus === "error"
                  ? "bg-blue-600 hover:bg-blue-700 border-blue-600 text-white shadow-blue-500/20 shadow-md"
                  : "border-slate-200 bg-white text-slate-400 cursor-not-allowed opacity-60"
              }`}
              title={isDirty ? "Save changes now" : "All changes saved"}
            >
              {isSaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
              ) : (
                <Check className="w-3.5 h-3.5 text-white" />
              )}
              <span>{isSaving ? "Saving..." : "Save Changes"}</span>
            </button>
          )}

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

      {/* 404 Not Found Banner */}
      {isNotFound && (
        <div className="mb-6 p-4 rounded-2xl border border-amber-300 bg-amber-50/90 shadow-xs flex items-start gap-3.5">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm text-amber-900">
            <p className="font-bold text-amber-950">
              Document Not Found (404)
            </p>
            <p className="text-xs text-amber-800 mt-1 leading-relaxed">
              The document ID in your URL (<span className="font-mono bg-amber-100/90 px-1 py-0.5 rounded text-amber-900">{documentId}</span>) does not exist in the remote database. Changes cannot be persisted to this ID.
            </p>
            <div className="flex flex-wrap items-center gap-2.5 mt-3">
              <Link
                to="/dashboard/documents"
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white transition-colors shadow-xs"
              >
                Go to Documents List
              </Link>
              <Link
                to="/dashboard/create-document"
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-900 hover:bg-amber-100/60 transition-colors shadow-2xs"
              >
                Create New Document
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 2. MAIN WORKSPACE CONTAINER: DOCUMENT CANVAS + AI ASSISTANT PANEL     */}
      {/* ==================================================================== */}
      {isPitchDeck ? (
        /* ==================================================================== */
        /* CORPORATE PITCH DECK PRESENTATION STUDIO                              */
        /* ==================================================================== */
        <div className="flex flex-col xl:flex-row items-start gap-6 relative">
          {/* 1. LEFT COLUMN: SLIDES THUMBNAILS DRAWER (Hidden in Preview Presentation Mode) */}
          {!isPreviewMode && (
            <div className="w-full xl:w-72 shrink-0">
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sticky top-6">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Presentation className="w-4 h-4 text-slate-500" />
                    <h3 className="text-sm font-bold text-slate-800">Slides</h3>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">
                    {sections.length} {sections.length === 1 ? "slide" : "slides"}
                  </span>
                </div>

                {/* Thumbnails list */}
                <div className="space-y-3.5 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
                {sections.map((slide, sIdx) => {
                  const isActive = sIdx === safeSlideIndex;
                  const slideNumberStr = String(sIdx + 1).padStart(2, "0");
                  const slideKicker =
                    slide.kicker ||
                    (sIdx === 0
                      ? "Cover"
                      : slide.title?.length > 20
                        ? `${slide.title.substring(0, 20)}...`
                        : slide.title || `Slide ${sIdx + 1}`);

                  return (
                    <div key={slide.id || `thumb-${sIdx}`} className="space-y-1.5">
                      <div className="flex items-start gap-2.5">
                        <span className="text-xs font-bold text-slate-400 mt-1 w-5 shrink-0">
                          {slideNumberStr}
                        </span>

                        <div className="flex-1 min-w-0">
                          {/* Mini Slide Card Preview */}
                          <div
                            onClick={() => {
                              setActiveSlideIndex(sIdx);
                              setSelectedSectionId(slide.id);
                            }}
                            className={`aspect-[16/10] w-full rounded-xl border bg-white p-2.5 relative cursor-pointer transition-all duration-150 overflow-hidden ${
                              isActive
                                ? "border-2 border-[#2563EB] ring-4 ring-blue-500/10 shadow-xs"
                                : "border-slate-200 hover:border-slate-300 hover:shadow-2xs"
                            }`}
                          >
                            {/* Visual representation of slide content inside mini card */}
                            {sIdx === 0 || slide.isCover ? (
                              styleTemplate === "Creative" ? (
                                /* Creative Cover Thumbnail (Dark navy with bottom blue stripe) */
                                <div className="h-full flex flex-col justify-between p-1.5 bg-[#10183F] rounded-lg relative overflow-hidden">
                                  <div className="w-3.5 h-3.5 rounded-xs bg-[#2563EB] text-[6px] text-white flex items-center justify-center font-bold">
                                    {companyInitials || "SN"}
                                  </div>
                                  <div className="space-y-1 my-auto">
                                    <div className="w-4/5 h-1.5 bg-white rounded-full" />
                                    <div className="w-1/2 h-1 bg-white/70 rounded-full" />
                                    <div className="w-2/5 h-0.5 bg-blue-300 rounded-full mt-1" />
                                  </div>
                                  <div className="w-full h-1 bg-[#2563EB] rounded-full mt-auto" />
                                </div>
                              ) : styleTemplate === "Minimal" ? (
                                /* Minimal Cover Thumbnail */
                                <div className="h-full flex flex-col justify-between p-1 relative">
                                  <div className="w-3.5 h-3.5 rounded-xs bg-[#2563EB] text-[6px] text-white flex items-center justify-center font-bold">
                                    {companyInitials || "SN"}
                                  </div>
                                  <div className="space-y-1 my-auto">
                                    <div className="w-4/5 h-1.5 bg-[#0B1536] rounded-full" />
                                    <div className="w-1/2 h-1 bg-[#0B1536] rounded-full" />
                                    <div className="w-2/5 h-0.5 bg-slate-400 rounded-full mt-1" />
                                  </div>
                                  <div className="w-12 h-0.5 bg-slate-300 rounded-full" />
                                </div>
                              ) : (
                                /* Corporate Cover Thumbnail */
                                <div className="h-full flex flex-col justify-between pl-2 relative">
                                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#2563EB] rounded-full" />
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-3 h-3 rounded-xs bg-[#2563EB] text-[6px] text-white flex items-center justify-center font-bold">
                                      {companyInitials || "SN"}
                                    </div>
                                    <div className="w-12 h-1 bg-slate-400 rounded-full" />
                                  </div>
                                  <div className="space-y-1 my-auto">
                                    <div className="w-3/4 h-1.5 bg-[#0B1536] rounded-full" />
                                    <div className="w-1/2 h-1 bg-[#0B1536] rounded-full" />
                                    <div className="w-4 h-0.5 bg-[#2563EB] rounded-full mt-1" />
                                  </div>
                                  <div className="w-10 h-0.5 bg-slate-300 rounded-full" />
                                </div>
                              )
                            ) : slide.metricValue ? (
                              styleTemplate === "Creative" ? (
                                /* Creative Content with Metric (Navy top banner, solid blue metric pill) */
                                <div className="h-full flex flex-col justify-between bg-white rounded-lg overflow-hidden">
                                  <div className="bg-[#10183F] p-1 flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                      <span className="text-[6px] font-bold text-blue-400">
                                        {slide.kicker || "Traction"}
                                      </span>
                                      <span className="text-[7px] font-black text-[#263366]">
                                        {String(sIdx + 1).padStart(2, "0")}
                                      </span>
                                    </div>
                                    <div className="w-1/2 h-1 bg-white rounded-full" />
                                  </div>
                                  <div className="p-1 flex-1 flex flex-col justify-between">
                                    <div className="space-y-0.5">
                                      <div className="flex items-center gap-1">
                                        <div className="w-1 h-1 rounded-full bg-[#2563EB] shrink-0" />
                                        <div className="w-4/5 h-0.5 bg-slate-300 rounded-full" />
                                      </div>
                                    </div>
                                    <div className="bg-[#2563EB] rounded px-1 py-0.5 w-fit">
                                      <span className="text-[6px] font-black text-white">
                                        {slide.metricValue}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="h-full flex flex-col justify-between">
                                  <div className="flex items-center justify-between">
                                    <span
                                      className={`text-[7px] font-bold ${
                                        styleTemplate === "Minimal"
                                          ? "text-slate-400 uppercase tracking-wider"
                                          : "text-[#2563EB]"
                                      }`}
                                    >
                                      {slide.kicker || "Traction"}
                                    </span>
                                    {styleTemplate !== "Minimal" && (
                                      <div className="w-3 h-0.5 bg-[#2563EB] rounded-full" />
                                    )}
                                  </div>
                                  <div className="w-4/5 h-1 bg-[#0B1536] rounded-full" />
                                  <div
                                    className={`rounded px-1 py-0.5 border w-fit ${
                                      styleTemplate === "Minimal"
                                        ? "bg-white border-slate-200"
                                        : "bg-blue-50/80 border-blue-100/80"
                                    }`}
                                  >
                                    <span
                                      className={`text-[7px] font-black ${
                                        styleTemplate === "Minimal"
                                          ? "text-[#0B1536]"
                                          : "text-[#2563EB]"
                                      }`}
                                    >
                                      {slide.metricValue}
                                    </span>
                                  </div>
                                  <div className="space-y-0.5">
                                    <div className="w-full h-0.5 bg-slate-200 rounded-full" />
                                    <div className="w-2/3 h-0.5 bg-slate-200 rounded-full" />
                                  </div>
                                </div>
                              )
                            ) : (
                              styleTemplate === "Creative" ? (
                                /* Creative Content Thumbnail (Navy top banner, lower white with blue dots) */
                                <div className="h-full flex flex-col justify-between bg-white rounded-lg overflow-hidden">
                                  <div className="bg-[#10183F] p-1 flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                      <span className="text-[6px] font-bold text-blue-400">
                                        {slide.kicker || "Problem"}
                                      </span>
                                      <span className="text-[7px] font-black text-[#263366]">
                                        {String(sIdx + 1).padStart(2, "0")}
                                      </span>
                                    </div>
                                    <div className="w-1/2 h-1 bg-white rounded-full" />
                                  </div>
                                  <div className="p-1 space-y-1 mt-auto">
                                    <div className="flex items-center gap-1">
                                      <div className="w-1 h-1 rounded-full bg-[#2563EB] shrink-0" />
                                      <div className="w-4/5 h-0.5 bg-slate-300 rounded-full" />
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <div className="w-1 h-1 rounded-full bg-[#2563EB] shrink-0" />
                                      <div className="w-3/5 h-0.5 bg-slate-300 rounded-full" />
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="h-full flex flex-col justify-between">
                                  <div className="flex items-center justify-between">
                                    <span
                                      className={`text-[7px] font-bold ${
                                        styleTemplate === "Minimal"
                                          ? "text-slate-400 uppercase tracking-wider"
                                          : "text-[#2563EB]"
                                      }`}
                                    >
                                      {slide.kicker || "Problem"}
                                    </span>
                                    {styleTemplate !== "Minimal" && (
                                      <div className="w-3 h-0.5 bg-[#2563EB] rounded-full" />
                                    )}
                                  </div>
                                  <div className="space-y-0.5 my-0.5">
                                    <div className="w-4/5 h-1 bg-[#0B1536] rounded-full" />
                                    <div className="w-1/2 h-1 bg-[#0B1536] rounded-full" />
                                  </div>
                                  <div className="space-y-1 mt-auto">
                                    {styleTemplate === "Minimal" ? (
                                      <>
                                        <div className="flex items-center gap-1">
                                          <span className="text-[5px] text-slate-400 font-mono">01</span>
                                          <div className="w-4/5 h-0.5 bg-slate-300 rounded-full" />
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <span className="text-[5px] text-slate-400 font-mono">02</span>
                                          <div className="w-3/5 h-0.5 bg-slate-300 rounded-full" />
                                        </div>
                                      </>
                                    ) : (
                                      <>
                                        <div className="flex items-center gap-1">
                                          <div className="w-1 h-1 rounded-full bg-slate-800 shrink-0" />
                                          <div className="w-4/5 h-0.5 bg-slate-300 rounded-full" />
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <div className="w-1 h-1 rounded-full bg-slate-800 shrink-0" />
                                          <div className="w-3/5 h-0.5 bg-slate-300 rounded-full" />
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                              )
                            )}
                          </div>

                          {/* Slide Title / Kicker */}
                          <div className="pt-1 flex items-center justify-between">
                            <span
                              onClick={() => {
                                setActiveSlideIndex(sIdx);
                                setSelectedSectionId(slide.id);
                              }}
                              className={`text-xs font-bold cursor-pointer transition-colors truncate ${
                                isActive ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
                              }`}
                            >
                              {slideKicker}
                            </span>
                          </div>

                          {/* Active Micro-action Buttons (Matching mockups) */}
                          {isActive && (
                            <div className="flex items-center gap-1 pt-1 animate-in fade-in duration-150">
                              <button
                                type="button"
                                title="Move slide up"
                                disabled={sIdx === 0}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveSlideUp(sIdx);
                                }}
                                className="w-6 h-6 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                title="Move slide down"
                                disabled={sIdx === sections.length - 1}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveSlideDown(sIdx);
                                }}
                                className="w-6 h-6 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                title="Duplicate slide"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDuplicateSlide(sIdx);
                                }}
                                className="w-6 h-6 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                title="Delete slide"
                                disabled={sections.length <= 1}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSlide(sIdx);
                                }}
                                className="w-6 h-6 rounded-md border border-slate-200 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* + Add slide Button at bottom of drawer */}
                <button
                  type="button"
                  onClick={() => setShowSlidePickerModal(true)}
                  className="w-full mt-3 py-3 border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 rounded-xl text-xs font-bold text-slate-600 hover:text-blue-600 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add slide</span>
                </button>
              </div>
            </div>
          </div>
          )}

          {/* 2. CENTER COLUMN: PRESENTATION CANVAS & CONTROLS */}
          <div className="flex-1 w-full min-w-0 space-y-4">
            {/* Header info row */}
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
                <span>{isPreviewMode ? "Presenting" : "Editing"}</span>
                <span className="text-slate-900 font-bold">
                  {currentSlide?.kicker || currentSlide?.title || "Cover"}
                </span>
                <span>
                  Slide {safeSlideIndex + 1} of {sections.length}
                </span>
              </div>

              {!isPreviewMode && (() => {
                const currentSlideId = currentSlide?.id || `slide-${safeSlideIndex}`;
                const isSlideTargeted = showAiAssistant && selectedSectionId === currentSlideId;

                return (
                  <button
                    type="button"
                    aria-pressed={isSlideTargeted}
                    onClick={() => {
                      if (isSlideTargeted) {
                        setSelectedSectionId(null);
                      } else {
                        setShowAiAssistant(true);
                        setSelectedSectionId(currentSlideId);
                      }
                    }}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border text-xs font-semibold shadow-2xs transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#131B4D] focus-visible:ring-offset-2 active:scale-[0.98] ${
                      isSlideTargeted
                        ? "bg-[#131B4D] border-[#131B4D] text-white ring-2 ring-[#131B4D]/20 shadow-sm"
                        : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 hover:text-slate-900 active:bg-[#131B4D] active:border-[#131B4D] active:text-white"
                    }`}
                  >
                    <Sparkles
                      className={`w-3.5 h-3.5 transition-colors ${
                        isSlideTargeted ? "text-indigo-300" : "text-blue-600"
                      }`}
                    />
                    <span>AI Edit this slide</span>
                  </button>
                );
              })()}
            </div>

            {/* 16:9 Presentation Canvas */}
            <div
              className={`rounded-2xl border border-slate-200/90 shadow-sm relative min-h-[500px] sm:min-h-[540px] flex flex-col justify-between overflow-hidden transition-all ${
                styleTemplate === "Creative"
                  ? safeSlideIndex === 0 || currentSlide.isCover
                    ? "bg-[#10183F] p-8 sm:p-12 lg:p-14 text-white"
                    : "bg-white p-0"
                  : "bg-white p-8 sm:p-12 lg:p-14"
              }`}
              style={{
                fontFamily: brandKit.font ? `${brandKit.font}, sans-serif` : "inherit",
              }}
            >
              {safeSlideIndex === 0 || currentSlide.isCover ? (
                /* COVER SLIDE */
                styleTemplate === "Creative" ? (
                  /* CREATIVE COVER SLIDE (Matches Creative visual identity) */
                  <>
                    {/* Top Brand Header */}
                    <div className="flex items-center gap-3.5">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-extrabold text-base tracking-wider bg-[#2563EB] shadow-sm"
                      >
                        {companyInitials || "SN"}
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-white leading-tight">
                          {companyProfile.companyName || "SolarTech Nigeria"}
                        </h2>
                        <p className="text-xs text-blue-200/80 font-medium">
                          {brandKit.tagline || "Clean power, built to last"}
                        </p>
                      </div>
                    </div>

                    {/* Hero Headline & Subtitle */}
                    <div className="my-auto py-8">
                      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15] max-w-2xl">
                        {currentSlide.title || "Powering Nigerian business without the grid"}
                      </h1>
                      <p className="text-base sm:text-lg font-bold text-blue-300 mt-6">
                        {currentSlide.subtitle || "Series-A raise • 2026"}
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-blue-900/60 pt-4 flex items-center justify-between text-xs text-blue-200/70 font-medium mt-auto">
                      <span>
                        {currentSlide.footerNote || "Confidential • Investor presentation"}
                      </span>
                      <span>
                        {safeSlideIndex + 1} / {sections.length}
                      </span>
                    </div>

                    {/* Bottom bright blue accent bar */}
                    <div className="absolute left-0 right-0 bottom-0 h-2 bg-[#2563EB]" />
                  </>
                ) : styleTemplate === "Minimal" ? (
                  /* MINIMAL COVER SLIDE (Matches user screenshot media_1793199746302.png) */
                  <>
                    {/* Top Standalone Brand Badge */}
                    <div className="flex items-center gap-3.5">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-extrabold text-lg tracking-wider shadow-xs"
                        style={{ backgroundColor: brandKit.secondaryColor || "#2563EB" }}
                      >
                        {companyInitials || "SN"}
                      </div>
                    </div>

                    {/* Hero Headline & Subtitle */}
                    <div className="my-auto py-6">
                      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0B1536] tracking-tight leading-[1.15] max-w-2xl mb-6">
                        {currentSlide.title || "Powering Nigerian business without the grid"}
                      </h1>
                      <p className="text-base sm:text-lg font-medium text-slate-700">
                        {currentSlide.subtitle || "Series-A raise • 2026"}
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-xs text-slate-400 font-normal mt-auto">
                      <span>
                        {companyProfile.companyName || "SolarTech Nigeria"} • {brandKit.tagline || "Clean power, built to last"}
                      </span>
                      <span>
                        {safeSlideIndex + 1} / {sections.length}
                      </span>
                    </div>
                  </>
                ) : (
                  /* CORPORATE COVER SLIDE (Matches user screenshot media_1793196640657.png) */
                  <>
                    {/* Left thick vertical brand blue accent bar */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-3 rounded-l-2xl"
                      style={{ backgroundColor: brandKit.secondaryColor || "#2563EB" }}
                    />

                    {/* Top Brand Header */}
                    <div className="flex items-center gap-3.5">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-extrabold text-base tracking-wider shadow-sm"
                        style={{ backgroundColor: brandKit.secondaryColor || "#2563EB" }}
                      >
                        {companyInitials || "SN"}
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-slate-900 leading-tight">
                          {companyProfile.companyName || "SolarTech Nigeria"}
                        </h2>
                        <p className="text-xs text-slate-500 font-medium">
                          {brandKit.tagline || "Clean power, built to last"}
                        </p>
                      </div>
                    </div>

                    {/* Hero Headline & Subtitle */}
                    <div className="my-auto py-8">
                      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0B1536] tracking-tight leading-[1.15] max-w-2xl">
                        {currentSlide.title || "Powering Nigerian business without the grid"}
                      </h1>
                      <div
                        className="w-14 h-1.5 rounded-full my-6"
                        style={{ backgroundColor: brandKit.secondaryColor || "#2563EB" }}
                      />
                      <p className="text-base sm:text-lg font-bold text-[#0B1536]">
                        {currentSlide.subtitle || "Series-A raise • 2026"}
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-slate-200/80 pt-4 flex items-center justify-between text-xs text-slate-500 font-medium mt-auto">
                      <span>
                        {currentSlide.footerNote || "Confidential • Investor presentation"}
                      </span>
                      <span>
                        {safeSlideIndex + 1} / {sections.length}
                      </span>
                    </div>
                  </>
                )
              ) : (
                /* CONTENT SLIDE (Problem, Solution, Traction, The Ask, etc.) */
                styleTemplate === "Creative" ? (
                  /* CREATIVE CONTENT SLIDE (Matches screenshots 1 through 5) */
                  <>
                    {/* Top full-width Dark Navy Banner */}
                    <div className="bg-[#10183F] p-6 sm:p-8 lg:p-10 text-white flex items-center gap-6 sm:gap-10 shrink-0">
                      <div className="shrink-0 flex flex-col items-start min-w-[70px] sm:min-w-[90px]">
                        <span className="text-xs sm:text-sm font-bold text-blue-400 mb-0.5">
                          {currentSlide.kicker || currentSlide.title || "Problem"}
                        </span>
                        <span className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#263366] tracking-tight leading-none">
                          {String(safeSlideIndex + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight flex-1">
                        {currentSlide.title}
                      </h2>
                    </div>

                    {/* Lower White Body */}
                    <div className="p-6 sm:p-8 lg:p-10 flex-1 flex flex-col justify-between bg-white">
                      {/* Bullet Points with Vibrant Blue Dots */}
                      <div className="space-y-4 my-2 flex-1">
                        {(currentSlide.bullets || []).map((point, pIdx) => (
                          <div key={pIdx} className="flex items-start group">
                            <span className="w-2 h-2 rounded-full bg-[#2563EB] mt-2.5 shrink-0 mr-4" />
                            <span className="text-base sm:text-lg font-bold text-slate-900 leading-snug flex-1">
                              {point}
                            </span>
                            {!isPreviewMode && (
                              <button
                                type="button"
                                onClick={() => handleDeletePointFromSlide(safeSlideIndex, pIdx)}
                                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 p-1 transition-opacity ml-2"
                                title="Remove point"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}

                        {/* Fallback paragraphs if present */}
                        {Array.isArray(currentSlide.paragraphs) &&
                          currentSlide.paragraphs.map((p, pI) => (
                            <p key={pI} className="text-base sm:text-lg font-normal text-slate-700 leading-relaxed">
                              {p}
                            </p>
                          ))}
                      </div>

                      {/* Highlight Metric Card if present (Solid Vibrant Blue Card matching screenshot 2) */}
                      {currentSlide.metricValue && (
                        <div className="bg-[#2563EB] rounded-2xl px-8 py-5 text-white max-w-lg shadow-sm mb-4">
                          <div className="text-3xl sm:text-4xl font-black text-white">
                            {currentSlide.metricValue}
                          </div>
                          <div className="text-xs sm:text-sm font-medium text-blue-100 mt-1">
                            {currentSlide.metricLabel || "Metric target"}
                          </div>
                        </div>
                      )}

                      {/* Action Link: + Add point */}
                      {!isPreviewMode && (
                        <div className="pt-2 pb-1">
                          <button
                            type="button"
                            onClick={() => handleAddPointToSlide(safeSlideIndex)}
                            className="text-xs font-bold text-slate-500 hover:text-blue-600 inline-flex items-center gap-1.5 py-1 transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add point</span>
                          </button>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="pt-4 flex items-center justify-between text-xs text-slate-500 font-medium mt-auto">
                        <span>{companyProfile.companyName || "SolarTech Nigeria"}</span>
                        <span>
                          {safeSlideIndex + 1} / {sections.length}
                        </span>
                      </div>
                    </div>
                  </>
                ) : styleTemplate === "Minimal" ? (
                  /* MINIMAL CONTENT SLIDE (Matches user screenshots media_1793199745971 through 1793199746297) */
                  <>
                    {/* Top Row: Spaced-out uppercase kicker in muted slate */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                        {currentSlide.kicker || currentSlide.title || "Problem"}
                      </span>
                    </div>

                    {/* Headline */}
                    <div className="mt-4 mb-2">
                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0B1536] tracking-tight leading-tight">
                        {currentSlide.title}
                      </h2>
                    </div>

                    {/* Highlight Metric Card (Minimal clean card) */}
                    {currentSlide.metricValue && (
                      <div className="inline-block bg-white border border-slate-200/90 rounded-2xl px-6 py-4 my-3 max-w-sm shadow-2xs">
                        <div className="text-3xl sm:text-4xl font-black text-[#0B1536] tracking-tight">
                          {currentSlide.metricValue}
                        </div>
                        <div className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
                          {currentSlide.metricLabel || "Metric target"}
                        </div>
                      </div>
                    )}

                    {/* Bullet Points with 01, 02, 03 Numbered prefix */}
                    <div className="space-y-4 my-2 flex-1">
                      {(currentSlide.bullets || []).map((point, pIdx) => (
                        <div key={pIdx} className="flex items-start group">
                          <span className="text-sm font-semibold font-mono text-slate-400 mt-0.5 shrink-0 mr-3.5 tracking-tight w-6">
                            {String(pIdx + 1).padStart(2, "0")}
                          </span>
                          <span className="text-base sm:text-lg font-medium text-slate-800 leading-snug flex-1">
                            {point}
                          </span>
                          {!isPreviewMode && (
                            <button
                              type="button"
                              onClick={() => handleDeletePointFromSlide(safeSlideIndex, pIdx)}
                              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 p-1 transition-opacity ml-2"
                              title="Remove point"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}

                      {/* Fallback paragraphs if present */}
                      {Array.isArray(currentSlide.paragraphs) &&
                        currentSlide.paragraphs.map((p, pI) => (
                          <p key={pI} className="text-base sm:text-lg font-normal text-slate-700 leading-relaxed">
                            {p}
                          </p>
                        ))}
                    </div>

                    {/* Action Link: + Add point (below list in Minimal) */}
                    {!isPreviewMode && (
                      <div className="pt-2 pb-1">
                        <button
                          type="button"
                          onClick={() => handleAddPointToSlide(safeSlideIndex)}
                          className="text-xs font-bold text-slate-500 hover:text-blue-600 inline-flex items-center gap-1.5 py-1 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add point</span>
                        </button>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-xs text-slate-400 font-medium mt-auto">
                      <span>{companyProfile.companyName || "SolarTech Nigeria"}</span>
                      <span>
                        {safeSlideIndex + 1} / {sections.length}
                      </span>
                    </div>
                  </>
                ) : (
                  /* CORPORATE CONTENT SLIDE (Matches user screenshots media_1793196640420 through 1793196640607) */
                  <>
                    {/* Top Row: Kicker & Accent Dash */}
                    <div className="flex items-center justify-between">
                      <span
                        className="text-sm font-bold tracking-wide"
                        style={{ color: brandKit.secondaryColor || "#2563EB" }}
                      >
                        {currentSlide.kicker || currentSlide.title || "Traction"}
                      </span>
                      <div
                        className="w-8 h-1 rounded-full"
                        style={{ backgroundColor: brandKit.secondaryColor || "#2563EB" }}
                      />
                    </div>

                    {/* Headline */}
                    <div className="mt-4 mb-2">
                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0B1536] tracking-tight leading-tight">
                        {currentSlide.title}
                      </h2>
                    </div>

                    {/* Highlight Metric Card (for Traction or Financials) */}
                    {currentSlide.metricValue && (
                      <div className="inline-block bg-[#eff4ff] border border-blue-100 rounded-2xl px-6 py-4 my-3 max-w-sm">
                        <div
                          className="text-3xl sm:text-4xl font-black tracking-tight"
                          style={{ color: brandKit.secondaryColor || "#2563EB" }}
                        >
                          {currentSlide.metricValue}
                        </div>
                        <div className="text-xs sm:text-sm font-semibold text-slate-600 mt-0.5">
                          {currentSlide.metricLabel || "Metric target"}
                        </div>
                      </div>
                    )}

                    {/* Action Link: + Add point (above list in Corporate) */}
                    {!isPreviewMode && (
                      <div className="pt-2 pb-1">
                        <button
                          type="button"
                          onClick={() => handleAddPointToSlide(safeSlideIndex)}
                          className="text-xs font-bold text-slate-500 hover:text-blue-600 inline-flex items-center gap-1.5 py-1 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add point</span>
                        </button>
                      </div>
                    )}

                    {/* Bullet Points with solid round black dots */}
                    <div className="space-y-4 my-2 flex-1">
                      {(currentSlide.bullets || []).map((point, pIdx) => (
                        <div key={pIdx} className="flex items-start group">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-900 mt-2.5 shrink-0 mr-3.5" />
                          <span className="text-base sm:text-lg font-medium text-slate-800 leading-snug flex-1">
                            {point}
                          </span>
                          {!isPreviewMode && (
                            <button
                              type="button"
                              onClick={() => handleDeletePointFromSlide(safeSlideIndex, pIdx)}
                              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 p-1 transition-opacity ml-2"
                              title="Remove point"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}

                      {/* Fallback paragraphs if present */}
                      {Array.isArray(currentSlide.paragraphs) &&
                        currentSlide.paragraphs.map((p, pI) => (
                          <p key={pI} className="text-base sm:text-lg font-normal text-slate-700 leading-relaxed">
                            {p}
                          </p>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-xs text-slate-500 font-medium mt-auto">
                      <span>{companyProfile.companyName || "SolarTech Nigeria"}</span>
                      <span>
                        {safeSlideIndex + 1} / {sections.length}
                      </span>
                    </div>
                  </>
                )
              )}
            </div>

            {/* Bottom Pager Controls */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={safeSlideIndex === 0}
                  onClick={handlePrevSlide}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                <span className="text-xs font-semibold text-slate-600 px-2">
                  Slide {safeSlideIndex + 1} of {sections.length}
                </span>

                <button
                  type="button"
                  disabled={safeSlideIndex === sections.length - 1}
                  onClick={handleNextSlide}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {!isPreviewMode && (
                <button
                  type="button"
                  onClick={() => setShowSlidePickerModal(true)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add slide after this one</span>
                </button>
              )}
            </div>
          </div>

          {/* 3. RIGHT COLUMN: AI ASSISTANT PANEL */}
          {showAiAssistant && !isPreviewMode && (
            <div className="w-full xl:w-96 shrink-0 transition-all">
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sticky top-6 space-y-4">
                <div className="flex items-start justify-between pb-2 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <h3 className="text-sm font-bold text-slate-800">
                        AI Assistant
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                      Improve and refine your document with Ahiia.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAiAssistant(false)}
                    className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    aria-label="Close AI Assistant"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Context Target Banner matching mockup */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                  <p className="text-xs font-bold text-slate-800">
                    Editing {currentSlide?.kicker || currentSlide?.title || "Cover"} — Slide {safeSlideIndex + 1}
                  </p>
                </div>

                {/* Quick actions list */}
                <div>
                  <h4 className="text-xs font-bold text-slate-800 mb-2.5">
                    Quick actions
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "Improve writing",
                      "Shorten this",
                      "Make more persuasive",
                      "Make more professional",
                      "Add detail",
                      "Rewrite section",
                      "Change tone",
                      "Fix grammar",
                      "Add missing information",
                      "Regenerate slide",
                    ].map((action) => (
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

                {/* Prompt Box */}
                <div>
                  <h4 className="text-xs font-bold text-slate-800 mb-2">
                    What would you like to change?
                  </h4>
                  <div className="relative rounded-xl border border-slate-200 bg-white p-3 shadow-2xs focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all">
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

                {/* AI Processing Feedback */}
                {isAiProcessing && (
                  <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 bg-blue-50 p-2.5 rounded-xl animate-pulse">
                    <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                    <span>Ahiia AI is optimizing your slide...</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row items-start gap-6 relative">
        {/* ================================================================== */}
        {/* LEFT COLUMN: DOCUMENT PAPER SHEET                                  */}
        {/* ================================================================== */}
        <div className="flex-1 w-full min-w-0">
          <div
            className={`bg-white rounded-2xl shadow-sm border border-slate-200/90 w-full p-6 sm:p-10 lg:p-14 transition-all duration-300 ${
              styleTemplate === "Minimal"
                ? "font-sans border-slate-100"
                : styleTemplate === "Creative" || (isContract && styleTemplate !== "Minimal")
                  ? "overflow-hidden font-sans"
                  : "font-sans"
            }`}
            style={{
              fontFamily: brandKit.font
                ? `${brandKit.font}, sans-serif`
                : "inherit",
            }}
          >
            {/* Document Header Row */}
            {loading ? (
              <div className="space-y-6 animate-pulse" aria-hidden="true">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 shrink-0" />
                  <div className="space-y-1.5">
                    <div className="h-3 w-32 rounded bg-slate-200" />
                    <div className="h-2.5 w-24 rounded bg-slate-100" />
                  </div>
                </div>
                <div className="h-8 w-3/4 rounded-lg bg-slate-200" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-slate-100">
                  {[0, 1].map((i) => (
                    <div key={`hdr-sk-${i}`} className="space-y-1.5">
                      <div className="h-2.5 w-20 rounded bg-slate-100" />
                      <div className="h-3.5 w-40 rounded bg-slate-200" />
                    </div>
                  ))}
                </div>
              </div>
            ) : isContract && styleTemplate !== "Minimal" ? (
              /* ==================================================================== */
              /* CONTRACT SIGNATURE COVER BANNER (Matches Reference Design)           */
              /* ==================================================================== */
              <div className="-m-6 sm:-m-10 lg:-m-14 rounded-t-2xl bg-[#131B4D] p-6 sm:p-10 lg:p-12 mb-8 sm:mb-10 text-white shadow-xs">
                {/* Brand Row: Logo badge + Company name + Tagline beside it */}
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
                      {companyProfile.companyName || "SolarTech Nigeria"}
                    </h2>
                    <p className="text-xs text-slate-300 mt-0.5 font-normal">
                      {brandKit.tagline || "Clean power, built to last"}
                    </p>
                  </div>
                </div>

                {/* Title & Document Type Kicker */}
                <div className="mt-8 mb-6">
                  <p className="text-[11px] font-semibold text-indigo-200/90 tracking-wide mb-1.5 uppercase">
                    Contract
                  </p>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
                    {docTitle &&
                    (docTitle.toLowerCase().includes("contract") ||
                      docTitle.toLowerCase().includes("agreement"))
                      ? docTitle.toLowerCase().includes("partnership")
                        ? "SERVICE AGREEMENT"
                        : docTitle.toUpperCase()
                      : `${(docTitle || "SERVICE").toUpperCase()} AGREEMENT`}
                  </h1>
                </div>

                {/* Two-column metadata: Between / And */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-3 border-t border-white/10">
                  <div>
                    <p className="text-[11px] font-medium text-slate-400 mb-1">
                      Between
                    </p>
                    <p className="text-xs sm:text-[13px] font-bold text-white">
                      {companyProfile.preparedFor
                        ? companyProfile.preparedFor
                            .toLowerCase()
                            .includes("client")
                          ? companyProfile.preparedFor
                          : `${companyProfile.preparedFor} ("the Client")`
                        : 'Lagos SME Partners Ltd. ("the Client")'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-slate-400 mb-1">
                      And
                    </p>
                    <p className="text-xs sm:text-[13px] font-bold text-white">
                      {companyProfile.companyName
                        ? companyProfile.companyName
                            .toLowerCase()
                            .includes("provider")
                          ? companyProfile.companyName
                          : `${companyProfile.companyName} ("the Provider")`
                        : 'SolarTech Nigeria ("the Provider")'}
                    </p>
                  </div>
                </div>
              </div>
            ) : isMarketingPlan ? (
              styleTemplate === "Creative" ? (
                /* ==================================================================== */
                /* CREATIVE MARKETING PLAN BANNER (Matches Reference Image 1)           */
                /* ==================================================================== */
                <div className="-m-6 sm:-m-10 lg:-m-14 rounded-t-2xl bg-[#131B4D] p-6 sm:p-10 lg:p-12 mb-8 sm:mb-10 text-white shadow-xs">
                  {/* Brand Row: Logo badge + Company name + Tagline beside it */}
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
                        {companyProfile.companyName || "SolarTech Nigeria"}
                      </h2>
                      <p className="text-xs text-slate-300 mt-0.5 font-normal">
                        {brandKit.tagline || "Clean power, built to last"}
                      </p>
                    </div>
                  </div>

                  {/* Title & Document Type Kicker */}
                  <div className="mt-8 mb-6">
                    <p className="text-xs text-slate-300 font-medium tracking-normal mb-1.5">
                      Marketing Plan
                    </p>
                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
                      {docTitle && docTitle.toLowerCase().includes("plan")
                        ? docTitle.toUpperCase()
                        : `${(docTitle || "MARKETING PLAN").toUpperCase()} 2026`}
                    </h1>
                  </div>

                  {/* Two-column metadata */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-3 border-t border-white/10">
                    <div>
                      <p className="text-[11px] font-medium text-slate-400 mb-1">
                        Prepared for
                      </p>
                      <p className="text-xs sm:text-[13px] font-bold text-white">
                        {companyProfile.preparedFor || "Commercial team"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-slate-400 mb-1">
                        Prepared by
                      </p>
                      <p className="text-xs sm:text-[13px] font-bold text-white">
                        {companyProfile.preparedBy || companyProfile.companyName || "SolarTech Nigeria"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : styleTemplate === "Corporate" ? (
                /* ==================================================================== */
                /* CORPORATE MARKETING PLAN HEADER (Matches Reference Image 2)          */
                /* ==================================================================== */
                <div className="space-y-6 pb-6 border-b border-slate-900 mb-8">
                  {/* Top Row: Brand Info on Left, "Marketing Plan" on Right */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-200">
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
                        <h2 className="text-sm font-bold text-slate-900 leading-tight">
                          {companyProfile.companyName || "SolarTech Nigeria"}
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5 font-normal">
                          {brandKit.tagline || "Clean power, built to last"}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-500 font-medium">
                      Marketing Plan
                    </span>
                  </div>

                  {/* Title */}
                  <div className="pt-2">
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">
                      {docTitle && docTitle.toLowerCase().includes("plan")
                        ? docTitle.toUpperCase()
                        : `${(docTitle || "MARKETING PLAN").toUpperCase()} 2026`}
                    </h1>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                    <div>
                      <p className="text-[11px] font-medium text-slate-400 mb-1">
                        Prepared for
                      </p>
                      <p className="text-xs sm:text-[13px] font-bold text-slate-900">
                        {companyProfile.preparedFor || "Commercial team"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-slate-400 mb-1">
                        Prepared by
                      </p>
                      <p className="text-xs sm:text-[13px] font-bold text-slate-900">
                        {companyProfile.preparedBy || companyProfile.companyName || "SolarTech Nigeria"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* ==================================================================== */
                /* MINIMAL MARKETING PLAN HEADER (Matches Reference Image 3)            */
                /* ==================================================================== */
                <div className="space-y-6 mb-8">
                  {/* Badge */}
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white text-xs shadow-xs shrink-0"
                    style={{
                      backgroundColor: brandKit.secondaryColor || "#2563EB",
                    }}
                  >
                    {companyInitials}
                  </div>

                  {/* Kicker + Title + Tagline */}
                  <div>
                    <p className="text-xs text-slate-400 font-medium mb-2">
                      Marketing Plan
                    </p>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight uppercase mb-2">
                      {docTitle && docTitle.toLowerCase().includes("plan")
                        ? docTitle.toUpperCase()
                        : `${(docTitle || "MARKETING PLAN").toUpperCase()} 2026`}
                    </h1>
                    <p className="text-xs sm:text-[13px] text-slate-500 font-normal">
                      {brandKit.tagline || "Clean power, built to last"}
                    </p>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                    <div>
                      <p className="text-[11px] font-medium text-slate-400 mb-1">
                        Prepared for
                      </p>
                      <p className="text-xs sm:text-[13px] font-bold text-slate-900">
                        {companyProfile.preparedFor || "Commercial team"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-slate-400 mb-1">
                        Prepared by
                      </p>
                      <p className="text-xs sm:text-[13px] font-bold text-slate-900">
                        {companyProfile.preparedBy || companyProfile.companyName || "SolarTech Nigeria"}
                      </p>
                    </div>
                  </div>
                </div>
              )
            ) : styleTemplate === "Creative" ? (
              /* ==================================================================== */
              /* UNIVERSAL CREATIVE COVER BANNER (Matches Reference Across All Docs)   */
              /* ==================================================================== */
              <div className="-m-6 sm:-m-10 lg:-m-14 rounded-t-2xl bg-[#131B4D] p-6 sm:p-10 lg:p-12 mb-8 sm:mb-10 text-white shadow-xs">
                {/* Brand Row */}
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
                      {companyProfile.companyName || "Ahiia"}
                    </h2>
                    <p className="text-xs text-slate-300 mt-0.5 font-normal">
                      {brandKit.tagline || ""}
                    </p>
                  </div>
                </div>

                {/* Title & Document Type Kicker */}
                <div className="mt-8 mb-6">
                  <p className="text-[11px] font-semibold text-indigo-200/90 tracking-wide mb-2 uppercase">
                    {isBusinessPlan
                      ? "Business Plan"
                      : isSop
                        ? "Standard Operating Procedure"
                        : (navState.docType || docData?.documentType || "Business Proposal")}
                  </p>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
                    {docTitle || "\u00A0"}
                  </h1>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-3 border-t border-white/10">
                  <div>
                    <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">
                      {isSop ? "Process owner" : "Prepared for"}
                    </p>
                    <p className="text-sm font-bold text-white">
                      {(isSop ? companyProfile.processOwner : companyProfile.preparedFor) || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">
                      {isSop ? "Issued by" : "Prepared by"}
                    </p>
                    <p className="text-sm font-bold text-white">
                      {(isSop ? companyProfile.issuedBy : companyProfile.preparedBy) || companyProfile.companyName || "—"}
                    </p>
                  </div>
                </div>
              </div>
            ) : isBusinessPlan ? (
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
                      {brandKit.tagline}
                    </p>
                  </div>

                  {/* Two-column metadata: Prepared for / Prepared by */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-1">
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Prepared for
                      </p>
                      <p className="text-sm font-bold text-slate-900">
                        {companyProfile.preparedFor || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Prepared by
                      </p>
                      <p className="text-sm font-bold text-slate-900">
                        {companyProfile.preparedBy || "—"}
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
                      {docTitle || "\u00A0"}
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
                        {companyProfile.preparedFor || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-normal text-slate-400 mb-1">
                        Prepared by
                      </p>
                      <p className="text-xs sm:text-[13px] font-bold text-slate-900">
                        {companyProfile.preparedBy || "—"}
                      </p>
                    </div>
                  </div>
                </div>
              )
            ) : isSop ? (
              styleTemplate === "Minimal" ? (
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
                      {docTitle || "\u00A0"}
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
                        {companyProfile.processOwner || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-normal text-slate-400 mb-1">
                        Issued by
                      </p>
                      <p className="text-xs sm:text-[13px] font-bold text-slate-900">
                        {companyProfile.issuedBy || companyProfile.companyName || "—"}
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
                      {docTitle || "\u00A0"}
                    </h1>
                  </div>

                  {/* Metadata Grid: Process owner / Issued by */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-slate-200">
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Process owner
                      </p>
                      <p className="text-sm font-bold text-slate-900">
                        {companyProfile.processOwner || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Issued by
                      </p>
                      <p className="text-sm font-bold text-slate-900">
                        {companyProfile.issuedBy || companyProfile.companyName || "—"}
                      </p>
                    </div>
                  </div>
                </div>
              )
            ) : isContract ? (
              styleTemplate === "Corporate" ? (
                /* Corporate Contract Header (Faithfully matching design) */
                <div className="space-y-6">
                  {/* Initials Badge */}
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-white text-xs shadow-xs shrink-0"
                    style={{
                      backgroundColor: brandKit.secondaryColor || "#2563EB",
                    }}
                  >
                    {companyInitials}
                  </div>

                  {/* Kicker + Title + Tagline */}
                  <div>
                    <p className="text-xs text-slate-400 font-medium tracking-normal mb-1.5">
                      Contract
                    </p>
                    <h1 className="text-2xl sm:text-3xl font-black text-[#131B4D] tracking-tight uppercase mb-1.5">
                      {docTitle &&
                      (docTitle.toLowerCase().includes("contract") ||
                        docTitle.toLowerCase().includes("agreement"))
                        ? docTitle.toLowerCase().includes("partnership")
                          ? "SERVICE AGREEMENT"
                          : docTitle.toUpperCase()
                        : `${(docTitle || "SERVICE").toUpperCase()} AGREEMENT`}
                    </h1>
                    <p className="text-xs text-slate-500 font-normal">
                      {brandKit.tagline || ""}
                    </p>
                  </div>

                  {/* Two-column metadata: Between / And without bottom border */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-1">
                    <div>
                      <p className="text-[11px] font-normal text-slate-400 mb-1">
                        Between
                      </p>
                      <p className="text-xs sm:text-[13px] font-bold text-slate-900">
                        {companyProfile.preparedFor
                          ? companyProfile.preparedFor
                              .toLowerCase()
                              .includes("client")
                            ? companyProfile.preparedFor
                            : `${companyProfile.preparedFor} ("the Client")`
                          : 'Lagos SME Partners Ltd. ("the Client")'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-normal text-slate-400 mb-1">
                        And
                      </p>
                      <p className="text-xs sm:text-[13px] font-bold text-slate-900">
                        {companyProfile.companyName
                          ? companyProfile.companyName
                              .toLowerCase()
                              .includes("provider")
                            ? companyProfile.companyName
                            : `${companyProfile.companyName} ("the Provider")`
                          : 'SolarTech Nigeria ("the Provider")'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Minimal Contract Header */
                <div>
                  <div className="flex items-start justify-between gap-4 pb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm shadow-xs shrink-0"
                        style={{
                          backgroundColor: brandKit.secondaryColor || "#2563EB",
                        }}
                      >
                        {companyInitials}
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-slate-900 leading-tight">
                          {companyProfile.companyName}
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5 font-normal">
                          {brandKit.tagline || ""}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-slate-400 tracking-normal">
                      Contract
                    </span>
                  </div>

                  {/* Contract Document Title */}
                  <div className="mt-7 mb-6">
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">
                      {docTitle &&
                      (docTitle.toLowerCase().includes("contract") ||
                        docTitle.toLowerCase().includes("agreement"))
                        ? docTitle.toLowerCase().includes("partnership")
                          ? "SERVICE AGREEMENT"
                          : docTitle.toUpperCase()
                        : `${(docTitle || "SERVICE").toUpperCase()} AGREEMENT`}
                    </h1>
                  </div>

                  {/* Contract Parties Grid: Between / And */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-slate-200">
                    <div>
                      <p className="text-xs font-normal text-slate-400 mb-1">
                        Between
                      </p>
                      <p className="text-xs sm:text-[13px] font-bold text-slate-900">
                        {companyProfile.preparedFor
                          ? companyProfile.preparedFor
                              .toLowerCase()
                              .includes("client")
                            ? companyProfile.preparedFor
                            : `${companyProfile.preparedFor} ("the Client")`
                          : 'Lagos SME Partners Ltd. ("the Client")'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-normal text-slate-400 mb-1">
                        And
                      </p>
                      <p className="text-xs sm:text-[13px] font-bold text-slate-900">
                        {companyProfile.companyName
                          ? companyProfile.companyName
                              .toLowerCase()
                              .includes("provider")
                            ? companyProfile.companyName
                            : `${companyProfile.companyName} ("the Provider")`
                          : 'SolarTech Nigeria ("the Provider")'}
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
                    {docTitle || "\u00A0"}
                  </h1>
                </div>

                {/* Metadata Grid: Prepared for / Prepared by */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-slate-200">
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Prepared for
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {companyProfile.preparedFor || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Prepared by
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {companyProfile.preparedBy || "—"}
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* ================================================================ */}
            {/* SECTIONS                                                         */}
            {/* ================================================================ */}
            <div
              key={loading ? "doc-loading" : "doc-ready"}
              aria-busy={loading}
              className={`mt-8 doc-fade-in ${
                styleTemplate === "Minimal" ? "space-y-8" : "space-y-10"
              }`}
            >
              {/* Skeleton mirrors section spacing so the swap causes no layout shift */}
              {loading &&
                [0, 1, 2].map((i) => (
                  <div
                    key={`sec-sk-${i}`}
                    className="p-2 -mx-2 animate-pulse"
                    aria-hidden="true"
                  >
                    <div className="h-4 w-40 rounded-md bg-slate-200 mb-4" />
                    <div className="space-y-2.5">
                      <div className="h-3 w-full rounded bg-slate-100" />
                      <div className="h-3 w-11/12 rounded bg-slate-100" />
                      <div className="h-3 w-4/6 rounded bg-slate-100" />
                    </div>
                  </div>
                ))}

              {!loading && sections.length === 0 && (
                <div className="flex flex-col items-center justify-center text-center py-16 px-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/40">
                  <FileText className="w-8 h-8 text-slate-300 mb-3" />
                  <p className="text-sm font-bold text-slate-700">
                    No generated content yet
                  </p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm leading-relaxed">
                    This document has no generated sections on the server yet.
                    Generate it from the document setup page to populate it.
                  </p>
                </div>
              )}

              {!loading && sections.map((section, idx) => {
                const isEditing = editingSectionId === section.id;
                const isSelectedForAi = selectedSectionId === section.id;
                const displayClauseTitle = isContract
                  ? /^\d+[.)]/.test(section.title)
                    ? section.title
                    : `${idx + 1}. ${section.title}`
                  : section.title;

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
                    {!(
                      section.isFinancialOverview &&
                      isBusinessPlan &&
                      styleTemplate === "Corporate" &&
                      !isEditing
                    ) && (
                      <div className="flex items-center justify-between pb-2 mb-2">
                        <div className="flex items-center gap-2">
                          {(styleTemplate === "Creative" || (isContract && styleTemplate !== "Minimal")) && (
                            <span
                              className="w-1.5 h-4.5 rounded-full shrink-0"
                              style={{
                                backgroundColor: brandKit.secondaryColor || "#2563EB",
                              }}
                            />
                          )}
                          <h3
                            className={`tracking-tight ${
                              styleTemplate === "Creative" || (isContract && styleTemplate !== "Minimal")
                                ? "text-base sm:text-lg font-bold text-[#2563EB]"
                                : styleTemplate === "Minimal"
                                  ? "text-xs sm:text-[13px] font-bold text-slate-900"
                                  : isBusinessPlan
                                    ? "text-xs sm:text-[13px] font-bold text-slate-900"
                                    : "text-base font-extrabold text-slate-900"
                            }`}
                            style={
                              (styleTemplate === "Creative" || (isContract && styleTemplate !== "Minimal")) && brandKit.secondaryColor
                                ? { color: brandKit.secondaryColor }
                                : {}
                            }
                          >
                            {displayClauseTitle}
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
                              aria-pressed={isSelectedForAi && showAiAssistant}
                              onClick={() => {
                                if (isSelectedForAi && showAiAssistant) {
                                  setSelectedSectionId(null);
                                } else {
                                  setSelectedSectionId(section.id);
                                  setShowAiAssistant(true);
                                  toast.info(
                                    `AI Assistant targeting: ${section.title}`
                                  );
                                }
                              }}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#131B4D] focus-visible:ring-offset-2 active:scale-[0.98] ${
                                isSelectedForAi && showAiAssistant
                                  ? "bg-[#131B4D] border-[#131B4D] text-white ring-2 ring-[#131B4D]/20 shadow-xs"
                                  : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 hover:text-slate-900 active:bg-[#131B4D] active:border-[#131B4D] active:text-white"
                              }`}
                            >
                              <Sparkles
                                className={`w-3 h-3 transition-colors ${
                                  isSelectedForAi && showAiAssistant
                                    ? "text-indigo-300"
                                    : "text-blue-600"
                                }`}
                              />
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
                      isMarketingPlan ? (
                        /* ==================================================================== */
                        /* MARKETING PLAN BUDGET & TIMELINE (Interchangeable 3 Styles)           */
                        /* ==================================================================== */
                        <div className="space-y-4">
                          {styleTemplate === "Creative" ? (
                            <div className="space-y-1">
                              <p className="text-xs text-slate-400 font-medium mb-1">Pricing</p>
                              {section.keyValueRows?.map((row, idx) => {
                                const isTotal =
                                  row.isTotal ||
                                  idx === (section.keyValueRows?.length || 0) - 1 ||
                                  /budget|total/i.test(row.key);
                                return isTotal ? (
                                  <div
                                    key={idx}
                                    className="bg-[#eff4ff] border border-blue-100/90 rounded-xl px-4 py-3.5 my-2 flex items-center justify-between shadow-2xs"
                                  >
                                    <span className="text-xs sm:text-[13px] font-extrabold text-slate-900">
                                      {row.key}
                                    </span>
                                    <span
                                      className="text-xs sm:text-[13px] font-extrabold text-right"
                                      style={{ color: brandKit.secondaryColor || "#2563EB" }}
                                    >
                                      {row.value}
                                    </span>
                                  </div>
                                ) : (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between text-xs sm:text-[13px] py-2"
                                  >
                                    <span className="text-slate-800 font-normal">
                                      {row.key}
                                    </span>
                                    <span className="font-extrabold text-slate-900 text-right">
                                      {row.value}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          ) : styleTemplate === "Corporate" ? (
                            <div className="space-y-1">
                              {section.keyValueRows?.map((row, idx) => {
                                const isTotal =
                                  row.isTotal ||
                                  idx === (section.keyValueRows?.length || 0) - 1 ||
                                  /budget|total/i.test(row.key);
                                return isTotal ? (
                                  <div
                                    key={idx}
                                    className="bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 my-2 flex items-center justify-between shadow-2xs"
                                  >
                                    <span className="text-xs sm:text-[13px] font-extrabold text-slate-900">
                                      {row.key}
                                    </span>
                                    <span className="text-xs sm:text-[13px] font-extrabold text-slate-900 text-right">
                                      {row.value}
                                    </span>
                                  </div>
                                ) : (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between text-xs sm:text-[13px] py-2"
                                  >
                                    <span className="text-slate-800 font-normal">
                                      {row.key}
                                    </span>
                                    <span className="font-extrabold text-slate-900 text-right">
                                      {row.value}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            /* Minimal */
                            <div className="space-y-1">
                              {section.keyValueRows?.map((row, idx) => {
                                const isTotal =
                                  row.isTotal ||
                                  idx === (section.keyValueRows?.length || 0) - 1 ||
                                  /budget|total/i.test(row.key);
                                return isTotal ? (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between text-xs sm:text-[13px] py-2 pt-3 border-t border-slate-200 mt-2"
                                  >
                                    <span className="text-xs sm:text-[13px] font-extrabold text-slate-900">
                                      {row.key}
                                    </span>
                                    <span className="text-xs sm:text-[13px] font-extrabold text-slate-900 text-right">
                                      {row.value}
                                    </span>
                                  </div>
                                ) : (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between text-xs sm:text-[13px] py-2"
                                  >
                                    <span className="text-slate-800 font-normal">
                                      {row.key}
                                    </span>
                                    <span className="font-bold text-slate-900 text-right">
                                      {row.value}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Trailing Narrative Paragraph */}
                          {Array.isArray(section.paragraphs) && section.paragraphs.length > 0 && (
                            <div className="pt-2 space-y-2">
                              {section.paragraphs.map((p, pIdx) => (
                                <p
                                  key={pIdx}
                                  className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal"
                                >
                                  {p}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : styleTemplate === "Corporate" ? (
                        /* Corporate Light-Blue Financial Overview Card (Reference Design) */
                        <div className="bg-[#EAF1FC] rounded-2xl p-6 sm:p-7 space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-xs sm:text-[13px] font-bold text-slate-900">
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
                                  aria-pressed={isSelectedForAi && showAiAssistant}
                                  onClick={() => {
                                    if (isSelectedForAi && showAiAssistant) {
                                      setSelectedSectionId(null);
                                    } else {
                                      setSelectedSectionId(section.id);
                                      setShowAiAssistant(true);
                                      toast.info(
                                        `AI Assistant targeting: ${section.title}`
                                      );
                                    }
                                  }}
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#131B4D] focus-visible:ring-offset-2 active:scale-[0.98] ${
                                    isSelectedForAi && showAiAssistant
                                      ? "bg-[#131B4D] border-[#131B4D] text-white ring-2 ring-[#131B4D]/20 shadow-xs"
                                      : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 hover:text-slate-900 active:bg-[#131B4D] active:border-[#131B4D] active:text-white"
                                  }`}
                                >
                                  <Sparkles
                                    className={`w-3 h-3 transition-colors ${
                                      isSelectedForAi && showAiAssistant
                                        ? "text-indigo-300"
                                        : "text-blue-600"
                                    }`}
                                  />
                                  <span>AI Edit</span>
                                </button>
                              </div>
                            )}
                          </div>

                          <div className="space-y-3 pt-1">
                            {section.keyValueRows?.map((row, idx) => {
                              const isFacilitySought = /facility sought/i.test(row.key);
                              return (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between text-xs sm:text-[13px] py-1"
                                >
                                  <span
                                    className={
                                      isFacilitySought
                                        ? "font-extrabold text-slate-900"
                                        : "text-slate-800 font-normal"
                                    }
                                  >
                                    {row.key}
                                  </span>
                                  <span className="font-extrabold text-slate-900 text-right">
                                    {row.value}
                                  </span>
                                </div>
                              );
                            })}
                          </div>

                          {section.disclosure && (
                            <div className="bg-white rounded-xl p-4 border border-blue-100/60 shadow-2xs mt-4 space-y-1">
                              <p className="text-[11px] font-bold text-blue-600">
                                {section.disclosure.title}
                              </p>
                              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                                {section.disclosure.content}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : styleTemplate === "Creative" ? (
                        /* Creative Financial Overview Layout (Matching Reference Design) */
                        <div className="space-y-4">
                          <div className="space-y-1">
                            {section.keyValueRows?.map((row, idx) => {
                              const isLastRow = idx === (section.keyValueRows?.length || 0) - 1;
                              const isFacilitySought = /facility sought/i.test(row.key);
                              const isHighlightedRow =
                                isFacilitySought ||
                                (isLastRow && /facility|sought|total|fund/i.test(row.key));

                              return isHighlightedRow ? (
                                <div
                                  key={idx}
                                  className="bg-[#eff4ff] rounded-xl px-4 py-3 my-2 flex items-center justify-between shadow-2xs"
                                >
                                  <span className="text-xs sm:text-[13px] font-extrabold text-slate-900">
                                    {row.key}
                                  </span>
                                  <span
                                    className="text-xs sm:text-[13px] font-extrabold text-right"
                                    style={{ color: brandKit.secondaryColor || "#2563EB" }}
                                  >
                                    {row.value}
                                  </span>
                                </div>
                              ) : (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between text-xs sm:text-[13px] py-2.5 border-b border-slate-100"
                                >
                                  <span className="text-slate-800 font-medium">
                                    {row.key}
                                  </span>
                                  <span className="font-extrabold text-slate-900 text-right">
                                    {row.value}
                                  </span>
                                </div>
                              );
                            })}
                          </div>

                          {section.disclosure && (
                            <div
                              className="bg-[#f8faff] border-l-[3px] rounded-r-xl p-4 mt-4 space-y-1"
                              style={{ borderLeftColor: brandKit.secondaryColor || "#2563EB" }}
                            >
                              <p
                                className="text-[11px] font-bold"
                                style={{ color: brandKit.secondaryColor || "#2563EB" }}
                              >
                                {section.disclosure.title}
                              </p>
                              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                                {section.disclosure.content}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Dedicated Financial Overview Rows & Callout Card (Minimal) */
                        <div className="space-y-4">
                          <div className="space-y-0 divide-y divide-slate-100 border-t border-b border-slate-100">
                            {section.keyValueRows?.map((row, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between text-xs sm:text-[13px] py-2.5"
                              >
                                <span className="text-slate-800 font-semibold">
                                  {row.key}
                                </span>
                                <span className="font-extrabold text-slate-900 text-right">
                                  {row.value}
                                </span>
                              </div>
                            ))}
                          </div>

                          {section.disclosure && (
                            <div className="bg-[#f0f6ff]/75 border-l-[3px] border-[#2563EB] rounded-r-xl p-3.5 space-y-1 mt-4">
                              <p className="text-[11px] font-bold text-[#2563EB]">
                                {section.disclosure.title}
                              </p>
                              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                                {section.disclosure.content}
                              </p>
                            </div>
                          )}
                        </div>
                      )
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
                                  {isMarketingPlan ? (
                                    styleTemplate === "Creative" ? (
                                      <span
                                        className="w-2 h-2 rounded-[2px] mt-1.5 shrink-0"
                                        style={{
                                          backgroundColor: brandKit.secondaryColor || "#2563EB",
                                        }}
                                      />
                                    ) : styleTemplate === "Corporate" ? (
                                      <span className="w-1.5 h-1.5 rounded-full bg-slate-900 mt-2 shrink-0" />
                                    ) : (
                                      <span className="text-slate-400 font-normal shrink-0 select-none leading-relaxed">
                                        —
                                      </span>
                                    )
                                  ) : styleTemplate === "Creative" || (isContract && styleTemplate !== "Minimal") ? (
                                    <span
                                      className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                                      style={{
                                        backgroundColor: brandKit.secondaryColor || "#2563EB",
                                      }}
                                    />
                                  ) : isContract ? (
                                    <span className="text-slate-400 font-normal shrink-0 select-none leading-relaxed">
                                      —
                                    </span>
                                  ) : isBusinessPlan ? (
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

                        {/* Legal Sub-clauses (1.1, 1.2, (a), (b)) */}
                        {section.subClauses && (
                          <div className="space-y-2 mt-2 pl-2">
                            {section.subClauses.map((sub, sIdx) => (
                              <div
                                key={sIdx}
                                className="flex items-start gap-2.5 text-xs sm:text-[13px] text-slate-700 leading-relaxed"
                              >
                                <span className="font-bold text-slate-900 shrink-0 select-none">
                                  {sub.number}
                                </span>
                                <span className="font-normal">{sub.text}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Key-Value Rows (Responsibilities & Requirements & Payment Terms) */}
                        {section.keyValueRows && (
                          <div className="space-y-2 pt-1 max-w-2xl">
                            {section.keyValueRows.map((row, rIdx) => {
                              const isTotalRow =
                                isContract &&
                                (row.key.toLowerCase().includes("value") ||
                                  row.key.toLowerCase().includes("total") ||
                                  row.key.toLowerCase().includes("contract value") ||
                                  row.key.toLowerCase().includes("agreed payment"));
                              return (
                                <div
                                  key={rIdx}
                                  className={`flex items-center justify-between text-xs sm:text-[13px] py-1 ${
                                    styleTemplate === "Minimal"
                                      ? ""
                                      : "border-b border-slate-50 last:border-b-0"
                                  }`}
                                >
                                  <span
                                    className={
                                      isTotalRow
                                        ? "font-bold text-slate-900"
                                        : "text-slate-700 font-normal"
                                    }
                                  >
                                    {row.key}
                                  </span>
                                  <span
                                    className={`text-right ${
                                      isTotalRow
                                        ? "font-black text-slate-900 text-sm sm:text-[15px] tracking-tight"
                                        : "font-bold text-slate-900"
                                    }`}
                                  >
                                    {row.value}
                                  </span>
                                </div>
                              );
                            })}
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

                        {/* Universal Table / Schedule Renderer */}
                        {section.tableRows && section.id !== "pricing" && section.id !== "timeline" && (
                          <div className="mt-4 overflow-x-auto">
                            <table className="w-full text-left text-xs sm:text-[13px] border-collapse">
                              <thead>
                                <tr className="border-b border-slate-200 bg-slate-50/50">
                                  {Object.keys(section.tableRows[0] || {}).map((header, hIdx) => (
                                    <th
                                      key={hIdx}
                                      className="py-2.5 px-3 font-bold text-slate-800 uppercase tracking-wider text-[11px]"
                                    >
                                      {header.replace(/([A-Z])/g, " $1").trim()}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {section.tableRows.map((row, rIdx) => (
                                  <tr key={rIdx} className="hover:bg-slate-50/40 transition-colors">
                                    {Object.values(row).map((cell, cIdx) => (
                                      <td key={cIdx} className="py-2.5 px-3 text-slate-700">
                                        {String(cell)}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            {section.totalCost && (
                              <div className="pt-3 flex items-center justify-between text-sm font-black border-t-2 border-slate-200">
                                <span className="text-slate-900 uppercase">Total</span>
                                <span className="text-slate-900 font-extrabold">{section.totalCost}</span>
                              </div>
                            )}
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
                        {/* Guidance callout card (Contracts) */}
                        {(section.guidance ||
                          (isContract &&
                            (/termination/i.test(section.title || section.key || "") ||
                              /term/i.test(section.title || section.key || "") ||
                              /law/i.test(section.title || section.key || "")))) && (
                          <div className="bg-[#FFFDF5] border border-amber-200/80 border-l-[3px] border-l-amber-500 rounded-r-xl p-4 mt-4 space-y-1">
                            <p className="text-xs font-bold text-[#B45309]">
                              {section.guidance?.title || "Guidance flagged this clause"}
                            </p>
                            <p className="text-xs text-amber-950/90 leading-relaxed font-normal">
                              {section.guidance?.content ||
                                "No liability cap or governing-law clause is present. Review before sending — Ahiia does not add legal terms you did not provide."}
                            </p>
                          </div>
                        )}

                        {/* Signatures execution block inside section */}
                        {(section.isSignatures ||
                          /signature|signator|execution/i.test(section.title || section.key || "")) && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 pt-6 mt-4">
                            <div>
                              <div className="border-t border-slate-900 w-full mb-3" />
                              <p className="text-[11px] font-medium text-slate-500 mb-1">
                                For the Client
                              </p>
                              <p className="text-xs sm:text-sm font-bold text-slate-900">
                                {companyProfile.preparedFor || "Lagos SME Partners Ltd."}
                              </p>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                Name, title and date
                              </p>
                            </div>
                            <div>
                              <div className="border-t border-slate-900 w-full mb-3" />
                              <p className="text-[11px] font-medium text-slate-500 mb-1">
                                For the Provider
                              </p>
                              <p className="text-xs sm:text-sm font-bold text-slate-900">
                                {companyProfile.companyName ||
                                  companyProfile.preparedBy ||
                                  "SolarTech Nigeria"}
                              </p>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                Name, title and date
                              </p>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}

              {/* Automatic Standalone Signatures Clause if not already present in contract sections */}
              {isContract &&
                !sections.some((s) =>
                  /signature|signator|execution/i.test(s.title || s.key || "")
                ) && (
                  <div className="p-2 -mx-2">
                    <h3 className="tracking-tight text-sm sm:text-base font-black text-slate-900 pb-2 mb-2">
                      {`${sections.length + 1}. Signatures`}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 pt-6 mt-2">
                      <div>
                        <div className="border-t border-slate-900 w-full mb-3" />
                        <p className="text-[11px] font-medium text-slate-500 mb-1">
                          For the Client
                        </p>
                        <p className="text-xs sm:text-sm font-bold text-slate-900">
                          {companyProfile.preparedFor || "Lagos SME Partners Ltd."}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Name, title and date
                        </p>
                      </div>
                      <div>
                        <div className="border-t border-slate-900 w-full mb-3" />
                        <p className="text-[11px] font-medium text-slate-500 mb-1">
                          For the Provider
                        </p>
                        <p className="text-xs sm:text-sm font-bold text-slate-900">
                          {companyProfile.companyName ||
                            companyProfile.preparedBy ||
                            "SolarTech Nigeria"}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Name, title and date
                        </p>
                      </div>
                    </div>
                  </div>
                )}
            </div>

            {/* Document Footer Row */}
            <div
              className={`mt-14 pt-3.5 flex items-center justify-between text-[11px] font-normal ${
                styleTemplate === "Creative" || (isContract && styleTemplate !== "Minimal")
                  ? "border-t-2 border-[#2563EB] text-slate-500"
                  : styleTemplate === "Minimal"
                    ? "border-t border-slate-100 text-slate-400"
                    : "border-t border-slate-200/80 text-slate-400"
              }`}
              style={
                styleTemplate === "Creative" || (isContract && styleTemplate !== "Minimal")
                  ? { borderTopColor: brandKit.secondaryColor || "#2563EB" }
                  : {}
              }
            >
              <span>{companyProfile.companyName || "SolarTech Nigeria"}</span>
              <span>Page 1 of 1</span>
            </div>
          </div>
        </div>

        {/* ================================================================== */}
        {/* RIGHT COLUMN: AI ASSISTANT PANEL (Matching Reference Image)        */}
        {/* ================================================================== */}
        {showAiAssistant && (
          <div className="w-full lg:w-[330px] xl:w-[350px] shrink-0 sticky top-24 animate-in fade-in slide-in-from-right-4 duration-200">
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
      )}

      {/* Slide Template Picker Modal */}
      {showSlidePickerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Add Pitch Deck Slide
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Choose from 13 standard investor-ready pitch deck templates.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSlidePickerModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto py-4 space-y-2.5 flex-1 pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PITCH_DECK_SLIDE_TEMPLATES.map((tpl) => (
                  <div
                    key={tpl.key}
                    onClick={() => handleAddSlideFromTemplate(tpl)}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/20 transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                          {tpl.kicker}
                        </span>
                        {tpl.metricValue && (
                          <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                            {tpl.metricValue}
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {tpl.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {tpl.description}
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-400 group-hover:text-blue-600">
                      <span>Insert slide</span>
                      <Plus className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowSlidePickerModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
            {`${styleTemplate} layout`}
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
              : isContract
                ? "contract"
                : (navState.docType || docData?.templateType || "pitch-deck")
        }
        documentTypeLabel={
          isBusinessPlan
            ? "Business Plan"
            : isSop
              ? "SOP"
              : isContract
                ? "Contract"
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
