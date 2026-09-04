import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  createUserProfile,
  createAiProfile,
  updateUserProfile,
  getUserProfile,
} from "../../services/profile.service";
import { updateBrandKit, getBrandKit } from "../../services/brandKit.service";
import logo from "../../assets/ahiia_icon.svg";
import { uploadImageToCloudinary } from "../../utils/cloudinary";

// ─── Industry taxonomy (main category → sub-industries) ────────────────────
const INDUSTRY_CATEGORIES = [
  {
    label: "Professional Services",
    icon: "🏢",
    subs: [
      "Consulting",
      "Business Advisory",
      "Management Consulting",
      "Accounting & Bookkeeping",
      "Auditing",
      "Legal Services",
      "Human Resources",
      "Recruitment",
      "Training & Coaching",
    ],
  },
  {
    label: "Technology & Software",
    icon: "💻",
    subs: [
      "Software Development",
      "SaaS",
      "AI & Machine Learning",
      "IT Services",
      "Cybersecurity",
      "FinTech",
      "EdTech",
      "HealthTech",
      "E-commerce Technology",
      "Digital Platforms",
    ],
  },
  {
    label: "Digital & Creative Services",
    icon: "📱",
    subs: [
      "Digital Marketing",
      "Advertising",
      "Social Media Management",
      "Branding",
      "Graphic Design",
      "Web Design & Development",
      "Content Creation",
      "Photography",
      "Videography",
      "Media & Publishing",
    ],
  },
  {
    label: "Construction & Engineering",
    icon: "🏗️",
    subs: [
      "Construction",
      "Civil Engineering",
      "Mechanical Engineering",
      "Electrical Engineering",
      "Architecture",
      "Quantity Surveying",
      "Building Materials",
      "Plumbing",
      "HVAC",
      "Facility Management",
    ],
  },
  {
    label: "Real Estate & Property",
    icon: "🏠",
    subs: [
      "Real Estate Agency",
      "Property Development",
      "Property Management",
      "Facility Management",
      "Real Estate Investment",
      "Property Consultancy",
      "Short-let / Vacation Rentals",
    ],
  },
  {
    label: "Retail & E-commerce",
    icon: "🛒",
    subs: [
      "Retail",
      "Wholesale",
      "E-commerce",
      "Online Marketplace",
      "Consumer Products",
      "Fashion Retail",
      "Electronics",
      "Supermarket / Grocery",
      "Beauty Products",
    ],
  },
  {
    label: "Manufacturing & Industrial",
    icon: "🏭",
    subs: [
      "Manufacturing",
      "Food Manufacturing",
      "Textile Manufacturing",
      "Chemical Manufacturing",
      "Plastics",
      "Packaging",
      "Furniture Manufacturing",
      "Machinery & Equipment",
      "Electrical Products",
      "Automotive Manufacturing",
    ],
  },
  {
    label: "Logistics & Transportation",
    icon: "🚚",
    subs: [
      "Logistics",
      "Freight & Cargo",
      "Courier & Delivery",
      "Transportation",
      "Haulage",
      "Shipping",
      "Aviation Services",
      "Maritime Services",
      "Supply Chain Management",
    ],
  },
  {
    label: "Finance & Insurance",
    icon: "💰",
    subs: [
      "Banking",
      "Financial Services",
      "Investment",
      "Insurance",
      "Microfinance",
      "Wealth Management",
      "Accounting",
      "Payments",
      "Cryptocurrency / Blockchain",
    ],
  },
  {
    label: "Healthcare & Wellness",
    icon: "🏥",
    subs: [
      "Hospitals",
      "Clinics",
      "Medical Services",
      "Pharmaceuticals",
      "Medical Equipment",
      "Laboratories",
      "Dental Services",
      "Fitness & Wellness",
      "Mental Wellness",
      "Healthcare Consultancy",
    ],
  },
  {
    label: "Food, Restaurant & Hospitality",
    icon: "🍽️",
    subs: [
      "Restaurant",
      "Catering",
      "Food & Beverage",
      "Bakery",
      "Hotel",
      "Hospitality",
      "Bar & Lounge",
      "Event Catering",
      "Travel & Tourism",
    ],
  },
  {
    label: "Education & Training",
    icon: "🎓",
    subs: [
      "Primary Education",
      "Secondary Education",
      "Higher Education",
      "Vocational Training",
      "Online Education",
      "Professional Training",
      "Tutoring",
      "Educational Consultancy",
      "Corporate Training",
    ],
  },
  {
    label: "Agriculture & Agribusiness",
    icon: "🌾",
    subs: [
      "Farming",
      "Livestock",
      "Poultry",
      "Fisheries",
      "Aquaculture",
      "Agro-processing",
      "Agricultural Equipment",
      "Agricultural Consultancy",
      "Food Production",
    ],
  },
  {
    label: "Energy & Utilities",
    icon: "⚡",
    subs: [
      "Oil & Gas",
      "Renewable Energy",
      "Solar Energy",
      "Electricity",
      "Power Solutions",
      "Water & Utilities",
      "Waste Management",
      "Environmental Services",
    ],
  },
  {
    label: "Beauty, Fashion & Lifestyle",
    icon: "💄",
    subs: [
      "Fashion Design",
      "Clothing",
      "Tailoring",
      "Beauty Salon",
      "Barbershop",
      "Spa",
      "Cosmetics",
      "Skincare",
      "Jewellery",
      "Personal Care",
    ],
  },
  {
    label: "Entertainment & Events",
    icon: "🎬",
    subs: [
      "Entertainment",
      "Music",
      "Film & Television",
      "Events Management",
      "Event Planning",
      "Talent Management",
      "Sports & Recreation",
      "Gaming",
      "Arts & Culture",
    ],
  },
  {
    label: "Home & Personal Services",
    icon: "🧹",
    subs: [
      "Cleaning Services",
      "Security Services",
      "Laundry",
      "Home Maintenance",
      "Landscaping",
      "Interior Design",
      "Personal Services",
      "Domestic Services",
    ],
  },
  {
    label: "Security & Safety",
    icon: "🛡️",
    subs: [
      "Security Services",
      "Private Security",
      "Safety Consultancy",
      "Security Technology",
      "Risk Management",
      "Emergency Services",
    ],
  },
  {
    label: "Science & Research",
    icon: "🧪",
    subs: [
      "Research & Development",
      "Biotechnology",
      "Scientific Services",
      "Laboratory Services",
      "Environmental Research",
      "Data & Analytics",
    ],
  },
  {
    label: "Import, Export & Trading",
    icon: "📦",
    subs: [
      "Import & Export",
      "General Trading",
      "Commodity Trading",
      "International Trade",
      "Distribution",
      "Procurement",
      "Sourcing",
    ],
  },
  {
    label: "Government, NGO & Social Impact",
    icon: "🏛️",
    subs: [
      "Non-Profit Organisation",
      "NGO",
      "Charity",
      "Foundation",
      "Social Enterprise",
      "Community Development",
      "Government Contractor",
      "Development Organisation",
    ],
  },
  {
    label: "Mining & Natural Resources",
    icon: "⛏️",
    subs: [
      "Mining",
      "Minerals",
      "Quarrying",
      "Natural Resources",
      "Solid Minerals",
      "Oil & Gas Services",
    ],
  },
  {
    label: "Automotive",
    icon: "🚗",
    subs: [
      "Automobile Sales",
      "Auto Repairs",
      "Car Rental",
      "Auto Parts",
      "Vehicle Services",
      "Transportation Services",
    ],
  },
  {
    label: "Telecommunications",
    icon: "📡",
    subs: [
      "Telecommunications",
      "Internet Services",
      "Network Infrastructure",
      "Fibre Optics",
      "Communication Equipment",
      "Telecom Consultancy",
    ],
  },
  {
    label: "Corporate & B2B Services",
    icon: "🏢",
    subs: [
      "Procurement",
      "Outsourcing",
      "Business Support",
      "Administrative Services",
      "Corporate Services",
      "B2B Services",
      "Business Process Outsourcing",
    ],
  },
  {
    label: "Freelance & Independent Professionals",
    icon: "🧑‍💼",
    subs: [
      "Freelancer",
      "Independent Consultant",
      "Coach",
      "Contractor",
      "Creative Professional",
      "Professional Practitioner",
    ],
  },
  {
    label: "Other / General Business",
    icon: "🏪",
    subs: ["General / Other"],
  },
];

const PRESET_PALETTES = [
  { primary: "#1E40AF", secondary: "#3B82F6" },
  { primary: "#0F172A", secondary: "#2563EB" },
  { primary: "#047857", secondary: "#10B981" },
  { primary: "#B91C1C", secondary: "#EF4444" },
  { primary: "#6D28D9", secondary: "#8B5CF6" },
  { primary: "#7C2D12", secondary: "#EA580C" },
];

const SIDEBAR_DATA = {
  1: {
    title: "One setup, every document",
    desc: "What you tell Ahiia now is reused across every proposal, plan and contract you create.",
  },
  2: {
    title: "Your business, on file",
    desc: "Name, industry and description become the header of every document Ahiia builds.",
  },
  3: {
    title: "Context beats prompting",
    desc: "Your offer, audience and advantage shape the language in every section.",
  },
  4: {
    title: "You stay the editor",
    desc: "Ahiia drafts the structured version of your business. You approve every line.",
  },
  5: {
    title: "Consistent by default",
    desc: "Colours, font and logo are applied to covers, headings and callouts automatically.",
  },
  6: {
    title: "Ready to launch",
    desc: "Your workspace profile is completely set up. Start generating high-value proposals now.",
  },
};

const CHECKLIST = [
  "Executive Summary",
  "Company Profile",
  "Project Scope",
  "Implementation Plan",
  "Budget",
  "Timeline",
  "Terms & Conditions",
];

// ─── Spinner ───────────────────────────────────────────────────────────────────
const Spinner = () => (
  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
);

// ─── Main Component ───────────────────────────────────────────────────────────
const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(2);
  const [loading, setLoading] = useState(false);
  const [savingCards, setSavingCards] = useState({});
  const contentRef = useRef(null);

  // Step 2 — Business Details
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  // Step 2 — Industry selection (main category + multi-select sub-industries)
  const [activeCategory, setActiveCategory] = useState("");
  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [industryOpen, setIndustryOpen] = useState(false);
  const industryRef = useRef(null);

  // Step 3 — Business Context
  const [offer, setOffer] = useState("");
  const [audience, setAudience] = useState("");
  const [advantage, setAdvantage] = useState("");

  // Step 4 — AI-drafted profile cards
  const [aiCards, setAiCards] = useState([
    {
      id: "mission",
      title: "Mission",
      content: "",
      isEditing: false,
      isAccepted: false,
      action: "Accept", // "Accept" | "Edit" | "Regenerate"
    },
    {
      id: "vision",
      title: "Vision",
      content: "",
      isEditing: false,
      isAccepted: false,
      action: "Accept",
    },
    {
      id: "advantage",
      title: "Competitive advantage",
      content: "",
      isEditing: false,
      isAccepted: false,
      action: "Accept",
    },
    {
      id: "audience",
      title: "Target audience",
      content: "",
      isEditing: false,
      isAccepted: false,
      action: "Accept",
    },
  ]);

  // Step 5 — Brand Kit
  const [primaryColor, setPrimaryColor] = useState("#0F172A");
  const [secondaryColor, setSecondaryColor] = useState("#2563EB");
  const [font, setFont] = useState("");
  const [tagline, setTagline] = useState("");

  // ── Pre-load any existing data ────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [profileRes, brandRes] = await Promise.allSettled([
          getUserProfile(),
          getBrandKit(),
        ]);
        if (profileRes.status === "fulfilled" && profileRes.value) {
          const p = profileRes.value;
          if (p.companyName) setCompanyName(p.companyName);
          if (p.industry) {
            setIndustry(p.industry);
            const parsed = p.industry
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);
            setSelectedIndustries(parsed);
            // Open the panel on the category that owns the first saved sub-industry
            const owningCategory = INDUSTRY_CATEGORIES.find((cat) =>
              cat.subs.some((s) => parsed.includes(s)),
            );
            if (owningCategory) setActiveCategory(owningCategory.label);
          }
          if (p.description) setDescription(p.description);
          if (p.logoUrl) setLogoUrl(p.logoUrl);
          setAiCards((prev) =>
            prev.map((c) => ({
              ...c,
              content:
                c.id === "mission"
                  ? (p.mission ?? c.content)
                  : c.id === "vision"
                    ? (p.vision ?? c.content)
                    : c.id === "advantage"
                      ? (p.competitiveAdvantage ?? c.content)
                      : c.id === "audience"
                        ? (p.targetAudience ?? c.content)
                        : c.content,
            })),
          );
        }
        if (brandRes.status === "fulfilled" && brandRes.value) {
          const b = brandRes.value;
          if (b.primaryColor) setPrimaryColor(b.primaryColor);
          if (b.secondaryColor) setSecondaryColor(b.secondaryColor);
          if (b.font) setFont(b.font);
          if (b.tagline) setTagline(b.tagline);
        }
      } catch (error) {
        console.log(error);
      }
    };
    load();
  }, []);

  // Keep the flat `industry` string (sent to the backend) in sync with the
  // selected sub-industries, e.g. "Software Development, FinTech"
  useEffect(() => {
    setIndustry(selectedIndustries.join(", "));
  }, [selectedIndustries]);

  // Scroll the step panel back to the top whenever the step changes, so a
  // person who scrolled down on a long step doesn't land mid-page on the next.
  // Also close the industry dropdown so it doesn't linger open on a step
  // where it's no longer visible.
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    setIndustryOpen(false);
  }, [step]);

  // Close the industry dropdown when the person taps/clicks outside it —
  // this is what makes it behave like a familiar mobile dropdown rather
  // than a panel that has to be manually collapsed.
  useEffect(() => {
    if (!industryOpen) return;
    const handleClickOutside = (e) => {
      if (industryRef.current && !industryRef.current.contains(e.target)) {
        setIndustryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [industryOpen]);

  // ── Industry select helpers ────────────────────────────────────────────────
  const toggleCategory = (label) =>
    setActiveCategory((prev) => (prev === label ? "" : label));

  const toggleSubIndustry = (sub) =>
    setSelectedIndustries((prev) =>
      prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub],
    );

  const removeSubIndustry = (sub) =>
    setSelectedIndustries((prev) => prev.filter((s) => s !== sub));

  // ── AI card helpers ────────────────────────────────────────────────────────
  const updateCardContent = (id, content) =>
    setAiCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, content } : c)),
    );

  const toggleEdit = (id) =>
    setAiCards((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              isEditing: !c.isEditing,
              // When closing the edit panel (Done), mark action as Edit
              action: c.isEditing ? "Edit" : c.action,
            }
          : c,
      ),
    );

  const toggleAccept = (id) =>
    setAiCards((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, isAccepted: !c.isAccepted, action: "Accept" } : c,
      ),
    );

  const acceptAll = () =>
    setAiCards((prev) =>
      prev.map((c) => ({ ...c, isAccepted: true, action: "Accept" })),
    );

  const regenerate = (id) => {
    const co = companyName || "our business";
    const ind = industry || "our field";
    const map = {
      mission: `Empowering ${ind} clients through ${co}'s standard of excellence, reliability, and measurable outcomes.`,
      vision: `To be the most trusted partner in ${ind}, recognised for integrity, innovation, and client-first delivery.`,
      advantage: `${co} combines deep ${ind} expertise with a repeatable, quality-assured execution process.`,
      audience: `Decision-makers and organisations in ${ind} seeking reliable, results-driven services.`,
    };
    if (map[id]) {
      // Update content AND mark action as Regenerate
      setAiCards((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, content: map[id], action: "Regenerate" } : c,
        ),
      );
      toast.info("Draft regenerated");
    }
  };

  // ── Step submit handlers ───────────────────────────────────────────────────
  const submitStep2 = async () => {
    if (!companyName.trim()) {
      toast.error("Please enter your business name");
      return;
    }
    setLoading(true);
    try {
      await createUserProfile({
        companyName,
        industry,
        description,
        logoUrl: logoUrl || undefined,
      });
    } catch (err) {
      if (err.response?.status === 400 || err.response?.status === 409) {
        // Fall back to field-by-field updates
        const fields = [
          { field: "companyName", value: companyName },
          { field: "industry", value: industry },
          { field: "description", value: description },
          ...(logoUrl ? [{ field: "logoUrl", value: logoUrl }] : []),
        ];
        try {
          await Promise.allSettled(
            fields.map(({ field, value }) =>
              updateUserProfile(field, "update", value),
            ),
          );
        } catch (error) {
          console.log(error);
        }
      }
    } finally {
      setLoading(false);
      setStep(3);
    }
  };

  const submitStep3 = async () => {
    setLoading(true);
    try {
      const res = await createAiProfile({ offer, audience, advantage });
      if (res) {
        if (res.mission) updateCardContent("mission", res.mission);
        if (res.vision) updateCardContent("vision", res.vision);
        if (res.competitiveAdvantage)
          updateCardContent("advantage", res.competitiveAdvantage);
        if (res.targetAudience)
          updateCardContent("audience", res.targetAudience);
      }
    } catch (error) {
      console.log(error);
      // Generate smart defaults from user input
      if (offer)
        updateCardContent(
          "mission",
          `We help clients by providing ${offer}, enabling better outcomes and measurable growth.`,
        );
      if (audience) updateCardContent("audience", audience);
      if (advantage) updateCardContent("advantage", advantage);
      if (!aiCards[0].content)
        updateCardContent(
          "vision",
          `To be the leading provider in ${industry || "our industry"}, known for quality and consistency.`,
        );
    } finally {
      setLoading(false);
      setStep(4);
    }
  };

  // Map card id → backend field name
  const CARD_FIELD_MAP = {
    mission: "mission",
    vision: "vision",
    advantage: "competitiveAdvantage",
    audience: "targetAudience",
  };

  const submitStep4 = async () => {
    setLoading(true);
    let anyError = false;

    // Save each card one-by-one with the correct action for that card
    for (const card of aiCards) {
      const fieldName = CARD_FIELD_MAP[card.id];
      if (!fieldName || !card.content) continue;

      setSavingCards((prev) => ({ ...prev, [card.id]: true }));
      try {
        // action must be exactly "Accept", "Edit", or "Regenerate"
        await updateUserProfile(fieldName, card.action, card.content);
      } catch (error) {
        console.log(`Failed to save ${card.id}:`, error);
        anyError = true;
      } finally {
        setSavingCards((prev) => ({ ...prev, [card.id]: false }));
      }
    }

    setLoading(false);
    if (anyError) {
      toast.error("Some fields could not be saved. Please try again.");
    } else {
      toast.success("Profile saved successfully");
      setStep(5);
    }
  };

  const submitStep5 = async () => {
    setLoading(true);
    try {
      await updateBrandKit({ primaryColor, secondaryColor, font, tagline });
      toast.success("Brand kit saved");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setStep(6);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const theLogoUrl = await uploadImageToCloudinary(file);
      setLogoUrl(theLogoUrl);
      toast.success("Logo attached");
    } catch (error) {
      console.log(error);
      toast.error("failed to upload the logo pls try again");
    }
  };

  const acceptedCount = aiCards.filter((c) => c.isAccepted).length;

  // ── Shared button styles ───────────────────────────────────────────────────
  // w-full on mobile so the action bar stacks into full-width, easy-to-tap
  // buttons instead of being squeezed onto one row.
  const primaryBtn =
    "w-full sm:w-auto inline-flex cursor-pointer items-center justify-center gap-2 px-7 py-3 rounded-xl bg-[#141B4D] hover:bg-[#1E2A78] text-white text-sm font-bold shadow-md transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed";
  const ghostBtn =
    "w-full sm:w-auto text-center px-4 py-2.5 cursor-pointer text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors";
  const outlineBtn =
    "w-full sm:w-auto text-center px-6 py-2.5 cursor-pointer rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors";

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-0 sm:p-6 lg:p-10"
      style={{
        background:
          "linear-gradient(135deg, #070A1E 0%, #0E1538 50%, #18235C 100%)",
      }}
    >
      {/* One-time page-load fade for step content; kept subtle and only fires
          on step change (not on every re-render) via the `key` below. */}
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="w-full max-w-[1240px] min-h-screen sm:min-h-0 lg:min-h-[700px] bg-white sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row">
        {/* ═══════════════════════════════════════════════════════════════════
            LEFT PANEL — step content
        ═══════════════════════════════════════════════════════════════════ */}
        <div
          ref={contentRef}
          className="flex-1 flex flex-col p-5 sm:p-8 lg:p-10 overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div
              className="flex items-center gap-2.5 cursor-pointer select-none"
              onClick={() => navigate("/")}
            >
              <img src={logo} alt="AHIIA.AI" className="h-6 w-6" />
              <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900">
                AHIIA.AI
              </span>
            </div>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="text-xs sm:text-sm cursor-pointer font-semibold text-slate-500 hover:text-slate-900 transition-colors"
            >
              Save &amp; exit
            </button>
          </div>

          {/* Step progress */}
          <div className="mb-6 sm:mb-8">
            <p className="text-xs font-bold text-slate-400 mb-2">{step} of 6</p>
            <div className="grid grid-cols-6 gap-1.5">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className={`h-1.5 rounded-full transition-all duration-500 ${n <= step ? "bg-[#141B4D]" : "bg-slate-200"}`}
                />
              ))}
            </div>
          </div>

          {/* ── Step 1: Welcome ──────────────────────────────────────────── */}
          {step === 1 && (
            <div
              key="step-1"
              className="flex-1 flex flex-col"
              style={{ animation: "fadeSlideIn 0.35s ease-out" }}
            >
              <h1 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 leading-tight tracking-tight">
                Let's set up your business.
              </h1>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                Give Ahiia a little context about your business so it can create
                better, more relevant outputs for you.
              </p>

              <div className="mt-6 flex-1 bg-slate-50 border border-slate-100 rounded-2xl p-4 sm:p-6 space-y-4">
                <p className="text-xs text-slate-400 font-medium">
                  Takes about two minutes. You can change anything later.
                </p>

                {[
                  {
                    icon: (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.8}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
                        />
                      </svg>
                    ),
                    title: "Business profile",
                    sub: "Name, industry, what you do",
                  },
                  {
                    icon: (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.8}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                        />
                      </svg>
                    ),
                    title: "Business context",
                    sub: "Offer, audience, advantage",
                  },
                  {
                    icon: (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.8}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z"
                        />
                      </svg>
                    ),
                    title: "Brand details",
                    sub: "Colours, font, logo",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex items-center gap-4 bg-white border border-slate-100 rounded-xl p-4 shadow-sm"
                  >
                    <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {item.title}
                      </p>
                      <p className="text-xs text-slate-400">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 2: Business Details ──────────────────────────────────── */}
          {step === 2 && (
            <div
              key="step-2"
              className="flex-1 flex flex-col"
              style={{ animation: "fadeSlideIn 0.35s ease-out" }}
            >
              <h1 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 leading-tight tracking-tight">
                Tell us about your business
              </h1>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                This information helps Ahiia understand what your business does.
              </p>

              <div className="mt-6 bg-slate-50 border border-slate-100 rounded-2xl p-4 sm:p-6 space-y-5">
                {/* Business Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2">
                    Business name
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. SolarTech Nigeria"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  />
                </div>

                {/* Industry — a proper dropdown, closed by default. On mobile
                    this is what keeps the step short: nothing takes up
                    permanent space, and the list opens as a self-contained,
                    internally-scrolling panel instead of pushing the page
                    down or spreading across two columns. */}
                <div ref={industryRef} className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-800">
                      Industry
                    </label>
                    {selectedIndustries.length > 0 && (
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                        {selectedIndustries.length} selected
                      </span>
                    )}
                  </div>

                  {/* Selected sub-industries as removable chips */}
                  {selectedIndustries.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {selectedIndustries.map((sub) => (
                        <button
                          key={sub}
                          type="button"
                          onClick={() => removeSubIndustry(sub)}
                          className="inline-flex cursor-pointer items-center gap-1.5 pl-3 pr-2 py-1 rounded-full bg-indigo-600 text-white text-xs font-semibold shadow-sm transition-all duration-200 hover:bg-indigo-700"
                        >
                          {sub}
                          <span className="text-indigo-200 hover:text-white transition-colors">
                            ×
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Dropdown trigger — looks and behaves like a select */}
                  <button
                    type="button"
                    onClick={() => setIndustryOpen((o) => !o)}
                    aria-expanded={industryOpen}
                    className="w-full flex items-center cursor-pointer justify-between gap-2 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-left hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                  >
                    <span
                      className={
                        selectedIndustries.length > 0
                          ? "font-semibold text-slate-800"
                          : "text-slate-400"
                      }
                    >
                      {selectedIndustries.length > 0
                        ? `${selectedIndustries.length} ${selectedIndustries.length === 1 ? "industry" : "industries"} added`
                        : "Select your industry"}
                    </span>
                    <svg
                      className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${industryOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m19.5 8.25-7.5 7.5-7.5-7.5"
                      />
                    </svg>
                  </button>

                  {/* Dropdown panel — floats above the page (absolute), so
                      opening it never reflows or lengthens the step; it
                      scrolls internally once it hits max-height. */}
                  {industryOpen && (
                    <div
                      className="absolute left-0 right-0 z-20 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden"
                      style={{ animation: "fadeSlideIn 0.15s ease-out" }}
                    >
                      <div className="max-h-72 overflow-y-auto">
                        {INDUSTRY_CATEGORIES.map((cat) => {
                          const active = activeCategory === cat.label;
                          const countInCat = cat.subs.filter((s) =>
                            selectedIndustries.includes(s),
                          ).length;
                          return (
                            <div
                              key={cat.label}
                              className="border-b border-slate-50 last:border-b-0"
                            >
                              <button
                                type="button"
                                onClick={() => toggleCategory(cat.label)}
                                className={`w-full flex items-center cursor-pointer gap-2 px-4 py-2.5 text-left text-xs font-semibold transition-colors duration-150 ${
                                  countInCat > 0
                                    ? "bg-indigo-50/70 text-indigo-700"
                                    : "text-slate-700 hover:bg-slate-50"
                                }`}
                              >
                                <span className="shrink-0">{cat.icon}</span>
                                <span className="flex-1 truncate">
                                  {cat.label}
                                </span>
                                {countInCat > 0 && (
                                  <span className="inline-flex items-center justify-center h-4 w-4 shrink-0 rounded-full bg-indigo-600 text-white text-[9px] font-bold">
                                    {countInCat}
                                  </span>
                                )}
                                <svg
                                  className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform duration-200 ${active ? "rotate-180" : ""}`}
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="m19.5 8.25-7.5 7.5-7.5-7.5"
                                  />
                                </svg>
                              </button>

                              {active && (
                                <div className="bg-slate-50 px-4 py-2 space-y-0.5">
                                  {cat.subs.map((sub) => {
                                    const checked =
                                      selectedIndustries.includes(sub);
                                    return (
                                      <label
                                        key={sub}
                                        className={`flex items-center gap-2 cursor-pointer text-xs font-medium px-2 py-1.5 rounded-lg transition-colors duration-150 ${
                                          checked
                                            ? "text-indigo-700 bg-indigo-100/70"
                                            : "text-slate-700 hover:bg-white"
                                        }`}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={checked}
                                          onChange={() =>
                                            toggleSubIndustry(sub)
                                          }
                                          className="h-3.5 w-3.5 rounded cursor-pointer accent-indigo-600 shrink-0"
                                        />
                                        <span className="truncate">{sub}</span>
                                      </label>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Sticky footer so closing the dropdown never needs
                          a scroll — important on small phone screens. */}
                      <div className="sticky bottom-0 bg-white border-t border-slate-100 p-2">
                        <button
                          type="button"
                          onClick={() => setIndustryOpen(false)}
                          className="w-full cursor-pointer py-2 rounded-lg text-xs font-bold text-white bg-[#141B4D] hover:bg-[#1E2A78] transition-colors"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2">
                    Business description
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) =>
                      setDescription(e.target.value.slice(0, 240))
                    }
                    placeholder="Briefly describe what your business does..."
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    {description.length}/240 — one or two sentences is plenty
                  </p>
                </div>

                {/* Logo Upload */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2">
                    Logo
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer border border-dashed border-slate-200 bg-white rounded-xl px-4 py-3 hover:border-indigo-300 hover:bg-indigo-50/30 transition-colors">
                    <svg
                      className="h-5 w-5 text-indigo-500 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                      />
                    </svg>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800">
                        {logoUrl ? "Change your logo" : "Upload your logo"}
                      </p>
                      <p className="text-xs text-slate-400">
                        SVG or PNG, up to 2 MB
                      </p>
                    </div>
                    {logoUrl && (
                      <img
                        src={logoUrl}
                        alt="Logo"
                        className="h-8 w-8 rounded-md object-contain ml-auto border border-slate-200 shrink-0"
                      />
                    )}
                    <input
                      type="file"
                      accept=".png,.svg,image/*"
                      onChange={handleLogoUpload}
                      className="sr-only"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: Business Context ──────────────────────────────────── */}
          {step === 3 && (
            <div
              key="step-3"
              className="flex-1 flex flex-col"
              style={{ animation: "fadeSlideIn 0.35s ease-out" }}
            >
              <h1 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 leading-tight tracking-tight">
                Help us understand your business
              </h1>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                Share the essentials. Ahiia will use this context across your
                business documents.
              </p>

              <div className="mt-6 bg-slate-50 border border-slate-100 rounded-2xl p-4 sm:p-6 space-y-5 flex-1">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2">
                    What do you offer?
                  </label>
                  <input
                    type="text"
                    value={offer}
                    onChange={(e) => setOffer(e.target.value)}
                    placeholder="Products or services your business provides"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2">
                    Who do you serve?
                  </label>
                  <input
                    type="text"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    placeholder="Your target customers or audience"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-800">
                      What makes you different?
                    </label>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-200 px-2 py-0.5 rounded">
                      Optional
                    </span>
                  </div>
                  <input
                    type="text"
                    value={advantage}
                    onChange={(e) => setAdvantage(e.target.value)}
                    placeholder="What gives your business an advantage?"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  />
                </div>

                <div className="flex items-start gap-2.5 bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-xs text-indigo-700 leading-relaxed">
                  <svg
                    className="h-4 w-4 shrink-0 mt-0.5 text-indigo-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm1 11H9v-2h2v2zm0-4H9V7h2v2z" />
                  </svg>
                  <span>
                    Ahiia turns these answers into your mission, vision,
                    advantage and audience — you review everything before it is
                    saved.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 4: AI Profile Review ─────────────────────────────────── */}
          {step === 4 && (
            <div
              key="step-4"
              className="flex-1 flex flex-col"
              style={{ animation: "fadeSlideIn 0.35s ease-out" }}
            >
              <h1 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 leading-tight tracking-tight">
                Here's what we've understood.
              </h1>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                Drafted from your business details. Edit anything that is not
                quite right — nothing is saved until you continue.
              </p>

              <div className="mt-6 bg-slate-50 border border-slate-100 rounded-2xl p-4 sm:p-5 flex-1 flex flex-col">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                  <span className="text-xs font-bold text-slate-600">
                    {acceptedCount} of {aiCards.length} accepted
                  </span>
                  <button
                    type="button"
                    onClick={acceptAll}
                    className="text-xs cursor-pointer font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    Accept all
                  </button>
                </div>

                <div className="space-y-3 overflow-y-auto flex-1">
                  {aiCards.map((card) => (
                    <div
                      key={card.id}
                      className={`bg-white border rounded-xl p-4 transition-all duration-200 ${
                        card.isAccepted
                          ? "border-emerald-400/50 ring-1 ring-emerald-400/20"
                          : "border-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          {card.title}
                        </p>
                        {savingCards[card.id] && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-500">
                            <span className="inline-block h-2.5 w-2.5 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
                            Saving…
                          </span>
                        )}
                      </div>

                      {card.isEditing ? (
                        <textarea
                          rows={3}
                          value={card.content}
                          onChange={(e) =>
                            updateCardContent(card.id, e.target.value)
                          }
                          className="w-full text-xs font-medium text-slate-800 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                          autoFocus
                        />
                      ) : (
                        <p className="text-xs font-medium text-slate-700 leading-relaxed">
                          {card.content || (
                            <span className="italic text-slate-400">
                              No content yet — click Edit to add.
                            </span>
                          )}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-2 mt-3 pt-2.5 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => toggleEdit(card.id)}
                          className="inline-flex cursor-pointer items-center gap-1 px-3 py-1.5 text-[11px] font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          <svg
                            className="h-3 w-3"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z"
                            />
                          </svg>
                          {card.isEditing ? "Done" : "Edit"}
                        </button>
                        <button
                          type="button"
                          onClick={() => regenerate(card.id)}
                          className="inline-flex cursor-pointer items-center gap-1 px-3 py-1.5 text-[11px] font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          <svg
                            className="h-3 w-3"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                            />
                          </svg>
                          Regenerate
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleAccept(card.id)}
                          className={`ml-auto inline-flex cursor-pointer items-center gap-1 px-4 py-1.5 text-[11px] font-bold rounded-lg transition-all duration-200 ${
                            card.isAccepted
                              ? "bg-emerald-600 text-white hover:bg-emerald-700"
                              : "bg-[#141B4D] text-white hover:bg-[#1E2A78]"
                          }`}
                        >
                          <svg
                            className="h-3.5 w-3.5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2.5}
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m4.5 12.75 6 6 9-13.5"
                            />
                          </svg>
                          {card.isAccepted ? "Accepted" : "Accept"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 5: Brand Kit ─────────────────────────────────────────── */}
          {step === 5 && (
            <div
              key="step-5"
              className="flex-1 flex flex-col"
              style={{ animation: "fadeSlideIn 0.35s ease-out" }}
            >
              <h1 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 leading-tight tracking-tight">
                Help us understand your business
              </h1>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                Share the essentials. Ahiia will use this context across your
                business documents.
              </p>

              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-5 flex-1">
                {/* Inputs */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 sm:p-5 space-y-5">
                  {/* Logo */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-800">
                        Logo
                      </label>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        Optional
                      </span>
                    </div>
                    <label className="flex flex-wrap items-center gap-2.5 cursor-pointer border border-slate-200 bg-white rounded-xl px-4 py-3 hover:border-indigo-300 hover:bg-indigo-50/20 transition">
                      <svg
                        className="h-4 w-4 text-indigo-500 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                        />
                      </svg>
                      <span className="text-xs font-bold text-slate-700">
                        {logoUrl ? "Change logo" : "Upload your logo"}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Used on covers and headers
                      </span>
                      <input
                        type="file"
                        accept=".png,.svg,image/*"
                        onChange={handleLogoUpload}
                        className="sr-only"
                      />
                    </label>
                  </div>

                  {/* Colour presets */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-800">
                        Brand colours
                      </label>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        Optional
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      {PRESET_PALETTES.map((p, i) => (
                        <button
                          key={i}
                          type="button"
                          title={`${p.primary} / ${p.secondary}`}
                          onClick={() => {
                            setPrimaryColor(p.primary);
                            setSecondaryColor(p.secondary);
                          }}
                          className={`h-6 w-6 rounded-full cursor-pointer overflow-hidden flex border-2 transition-all hover:scale-110 ${primaryColor === p.primary ? "border-indigo-500" : "border-transparent"}`}
                        >
                          <span
                            className="w-1/2 h-full"
                            style={{ backgroundColor: p.primary }}
                          />
                          <span
                            className="w-1/2 h-full"
                            style={{ backgroundColor: p.secondary }}
                          />
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        {
                          label: "Primary",
                          val: primaryColor,
                          set: setPrimaryColor,
                        },
                        {
                          label: "Secondary",
                          val: secondaryColor,
                          set: setSecondaryColor,
                        },
                      ].map(({ label, val, set }) => (
                        <div key={label}>
                          <p className="text-[10px] font-bold text-slate-500 mb-1">
                            {label}
                          </p>
                          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-2 py-1.5">
                            <input
                              type="color"
                              value={val}
                              onChange={(e) => set(e.target.value)}
                              className="h-5 w-5 rounded cursor-pointer border-0 bg-transparent p-0 shrink-0"
                            />
                            <input
                              type="text"
                              value={val}
                              onChange={(e) => set(e.target.value)}
                              className="text-xs font-mono text-slate-800 w-full min-w-0 focus:outline-none bg-transparent"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Font */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-2">
                      Font{" "}
                      <span className="font-semibold text-slate-400">
                        Optional
                      </span>
                    </label>
                    <input
                      type="text"
                      value={font}
                      onChange={(e) => setFont(e.target.value)}
                      placeholder="e.g. Inter, Roboto, Outfit"
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>

                  {/* Tagline */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-2">
                      Tagline{" "}
                      <span className="font-semibold text-slate-400">
                        Optional
                      </span>
                    </label>
                    <input
                      type="text"
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      placeholder="e.g. Clean power, built to last"
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>
                </div>

                {/* Live preview */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 sm:p-5 flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Live preview
                  </span>
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex-1 flex flex-col">
                    <div
                      className="px-4 py-3 flex items-center justify-between"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <span className="text-xs font-bold text-white">
                        {companyName || "Company name"}
                      </span>
                    </div>
                    <div className="p-4 space-y-2.5 flex-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">
                        Proposal
                      </span>
                      <p className="text-sm font-bold text-slate-900">
                        Example Document Title
                      </p>
                      <p className="text-xs font-semibold text-slate-600">
                        Example Heading
                      </p>
                      <div className="h-1.5 w-4/5 rounded-full bg-slate-100" />
                      <div className="h-1.5 w-3/5 rounded-full bg-slate-100" />
                      <button
                        type="button"
                        className="mt-2 px-3.5 py-1.5 cursor-pointer rounded-lg text-xs font-bold text-white"
                        style={{ backgroundColor: secondaryColor }}
                      >
                        Example Button
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-3 leading-snug">
                    Applied to document covers, headings and callouts.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 6: All Done ─────────────────────────────────────────── */}
          {step === 6 && (
            <div
              key="step-6"
              className="flex-1 flex flex-col items-center justify-center text-center py-8 px-2 sm:px-4"
              style={{ animation: "fadeSlideIn 0.35s ease-out" }}
            >
              <div className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center mb-5">
                <svg
                  className="h-10 w-10 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m4.5 12.75 6 6 9-13.5"
                  />
                </svg>
              </div>
              <h1 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 leading-tight tracking-tight">
                Your workspace is ready!
              </h1>
              <p className="mt-3 text-sm text-slate-500 max-w-md leading-relaxed">
                Your business profile and brand kit have been successfully
                configured. You're ready to generate high-converting proposals,
                contracts, and business plans.
              </p>
              <div className="mt-8 w-full max-w-sm bg-slate-50 border border-slate-100 rounded-2xl p-5 text-left space-y-3">
                {[
                  ["Business Name", companyName || "—"],
                  ["Industry", industry || "—"],
                  ["AI Profile", "Configured ✓"],
                  ["Brand Palette", null],
                ].map(([label, val]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between gap-3 text-xs py-2 border-b border-slate-200 last:border-0"
                  >
                    <span className="text-slate-500 font-semibold shrink-0">
                      {label}
                    </span>
                    {label === "Brand Palette" ? (
                      <div className="flex items-center gap-1.5">
                        <span
                          className="h-4 w-4 rounded-full border border-slate-300"
                          style={{ backgroundColor: primaryColor }}
                        />
                        <span
                          className="h-4 w-4 rounded-full border border-slate-300"
                          style={{ backgroundColor: secondaryColor }}
                        />
                      </div>
                    ) : (
                      <span
                        className={`font-bold text-right truncate ${label === "AI Profile" ? "text-emerald-600" : "text-slate-900"}`}
                      >
                        {val}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Bottom action bar ─────────────────────────────────────────── */}
          <div className="mt-8 pt-5 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {step > 1 && step < 6 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className={outlineBtn}
              >
                Back
              </button>
            ) : (
              <div className="hidden sm:block" />
            )}

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3">
              {step === 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => navigate("/dashboard")}
                    className={ghostBtn}
                  >
                    Skip for now
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className={primaryBtn}
                  >
                    Get started
                  </button>
                </>
              )}
              {step === 2 && (
                <button
                  type="button"
                  onClick={submitStep2}
                  disabled={loading}
                  className={primaryBtn}
                >
                  {loading ? (
                    <>
                      <Spinner />
                      Saving...
                    </>
                  ) : (
                    "Continue"
                  )}
                </button>
              )}
              {step === 3 && (
                <button
                  type="button"
                  onClick={submitStep3}
                  disabled={loading}
                  className={primaryBtn}
                >
                  {loading ? (
                    <>
                      <Spinner />
                      Generating...
                    </>
                  ) : (
                    "Continue"
                  )}
                </button>
              )}
              {step === 4 && (
                <>
                  <button
                    type="button"
                    onClick={() => setStep(5)}
                    className={ghostBtn}
                  >
                    Skip AI profile
                  </button>
                  <button
                    type="button"
                    onClick={submitStep4}
                    disabled={loading}
                    className={primaryBtn}
                  >
                    {loading ? (
                      <>
                        <Spinner />
                        Saving...
                      </>
                    ) : (
                      "Continue"
                    )}
                  </button>
                </>
              )}
              {step === 5 && (
                <>
                  <button
                    type="button"
                    onClick={() => setStep(6)}
                    className={ghostBtn}
                  >
                    Skip for now
                  </button>
                  <button
                    type="button"
                    onClick={submitStep5}
                    disabled={loading}
                    className={primaryBtn}
                  >
                    {loading ? (
                      <>
                        <Spinner />
                        Saving...
                      </>
                    ) : (
                      "Continue"
                    )}
                  </button>
                </>
              )}
              {step === 6 && (
                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className={primaryBtn}
                >
                  Launch Workspace
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            RIGHT PANEL — persistent dark navy sidebar
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="hidden lg:flex lg:w-[400px] xl:w-[440px] bg-[#080D24] flex-col justify-between p-8 border-l border-white/5 shrink-0">
          <div>
            {/* Badge */}
            <span className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-xs font-bold text-indigo-300 tracking-wide">
              Workspace setup
            </span>

            {/* Document preview card */}
            <div className="mt-7 bg-[#0C1230] border border-white/8 rounded-2xl p-5 shadow-2xl space-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">
                  Proposal
                </p>
                <h3 className="mt-1 text-base font-bold text-white leading-tight">
                  {companyName
                    ? `${companyName} Project`
                    : "Solar Installation Project"}
                </h3>
                <span className="inline-block mt-1.5 text-[11px] font-semibold text-indigo-300 bg-indigo-950/60 border border-indigo-700/40 px-2.5 py-0.5 rounded">
                  N50M Project Value
                </span>
              </div>

              <div className="space-y-1.5 pt-3 border-t border-white/5">
                {CHECKLIST.map((item, idx) => (
                  <div
                    key={item}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 border border-white/5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-500 w-4">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <span className="text-xs font-semibold text-slate-200">
                        {item}
                      </span>
                    </div>
                    <span className="h-4 w-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <svg
                        className="h-2.5 w-2.5 text-emerald-400"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m4.5 12.75 6 6 9-13.5"
                        />
                      </svg>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Dynamic step message */}
          <div className="pt-6 border-t border-white/8">
            <h2 className="text-lg font-bold text-white leading-snug">
              {SIDEBAR_DATA[step].title}
            </h2>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              {SIDEBAR_DATA[step].desc}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
