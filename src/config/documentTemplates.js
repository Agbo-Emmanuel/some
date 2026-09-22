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

export const getTemplate = (id) => TEMPLATES.find((t) => t.id === id);

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
