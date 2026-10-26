import React, { useState, useEffect, useMemo } from "react";
import {
  Pencil,
  RotateCw,
  CheckCircle2,
  UploadCloud,
  ChevronDown,
  Loader2,
  Building2,
  Check,
  AlertCircle,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  updateBusinessContext,
  patchUserProfile,
  createAiProfile,
} from "../../services/profile.service";
import { uploadImageToCloudinary } from "../../utils/cloudinary";

const INDUSTRIES = [
  "Financial services",
  "Financial Services",
  "Renewable Energy",
  "Manufacturing",
  "Logistics & Supply Chain",
  "Retail & E-commerce",
  "Technology & Software",
  "Construction",
  "Healthcare",
  "Education",
];

const DEFAULT_SECTIONS = [
  {
    id: "mission",
    title: "Mission",
    hint: "What your business does today, and for whom.",
    body: "We help clients by providing financial services, enabling better outcomes and measurable growth.",
  },
  {
    id: "vision",
    title: "Vision",
    hint: "Where the business is heading over the next few years.",
    body: "To be the leading provider in Financial services, known for quality and consistency.",
  },
  {
    id: "competitiveAdvantage",
    title: "Competitive advantage",
    hint: "Why customers choose you over the alternatives.",
    body: "My service providers are very fast.",
  },
  {
    id: "targetAudience",
    title: "Target audience",
    hint: "The customers your documents usually speak to.",
    body: "Nigerians seeking reliable and accessible financial services.",
  },
];

// ---- One editable / regeneratable profile section -----------------------
function ProfileSection({ section, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(section.body);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    setDraft(section.body || "");
  }, [section.body]);

  const handleSave = () => {
    onSave(section.id, draft);
    setEditing(false);
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      // Try AI profile endpoint if available, fallback to enriched context
      let newText = "";
      try {
        const res = await createAiProfile({ field: section.id });
        newText = res?.content || res?.text || res?.data;
      } catch {
        newText = `${section.body} Designed to deliver high performance, trust and growth in the Nigerian market.`;
      }
      onSave(section.id, newText);
      setDraft(newText);
      toast.success(`${section.title} regenerated!`);
    } catch {
      toast.error("Could not regenerate section.");
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <div className="py-4 first:pt-0 last:pb-0">
      <div className="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
        <div className="min-w-0">
          <h4 className="text-sm font-bold text-slate-900">{section.title}</h4>
          <p className="text-xs text-slate-400 mt-0.5">{section.hint}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setDraft(section.body || "");
              setEditing((e) => !e);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" />
            {editing ? "Close" : "Edit"}
          </button>
          <button
            type="button"
            onClick={handleRegenerate}
            disabled={regenerating}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-60 disabled:cursor-wait cursor-pointer"
          >
            {regenerating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
            ) : (
              <RotateCw className="w-3.5 h-3.5" />
            )}
            Regenerate
          </button>
        </div>
      </div>

      {editing ? (
        <div className="mt-3">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#131B4D]/15 focus:border-[#131B4D]/40 transition-shadow resize-none"
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={() => {
                setDraft(section.body || "");
                setEditing(false);
              }}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-3.5 py-1.5 rounded-lg bg-[#131B4D] text-white text-xs font-bold hover:bg-[#1B2666] transition-colors cursor-pointer"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <p
          className={`text-sm text-slate-600 leading-relaxed mt-2 transition-opacity duration-200 ${
            regenerating ? "opacity-40" : "opacity-100"
          }`}
        >
          {section.body || (
            <span className="italic text-slate-400">
              No description added yet. Click Edit to add details.
            </span>
          )}
        </p>
      )}
    </div>
  );
}

const CompanyProfile = () => {
  const [loading, setLoading] = useState(true);
  const [hasExistingProfile, setHasExistingProfile] = useState(false);
  const [profileRaw, setProfileRaw] = useState(null);
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("Financial services");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoName, setLogoName] = useState("");
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [completenessPercent, setCompletenessPercent] = useState(80);
  const [missingFields, setMissingFields] = useState([]);
  const [sections, setSections] = useState(DEFAULT_SECTIONS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Fetch company profile on mount
  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await getUserProfile();
        const data = response?.companyName
          ? response
          : response?.data || response;

        if (isMounted && data && (data.id || data.companyName)) {
          setHasExistingProfile(true);
          setProfileRaw(data);
          setCompanyName(data.companyName || "");
          setIndustry(data.industry || "Financial services");
          setDescription(data.description || data.businessDescription || "");
          setLogoUrl(data.logoUrl || "");
          if (data.logoUrl) {
            const parts = data.logoUrl.split("/");
            setLogoName(parts[parts.length - 1] || "company-logo");
          }
          if (typeof data.completenessPercent === "number") {
            setCompletenessPercent(data.completenessPercent);
          }
          if (Array.isArray(data.missingFields)) {
            setMissingFields(data.missingFields);
          }

          setSections([
            {
              id: "mission",
              title: "Mission",
              hint: "What your business does today, and for whom.",
              body:
                data.mission ||
                "We help clients by providing financial services, enabling better outcomes and measurable growth.",
            },
            {
              id: "vision",
              title: "Vision",
              hint: "Where the business is heading over the next few years.",
              body:
                data.vision ||
                "To be the leading provider in Financial services, known for quality and consistency.",
            },
            {
              id: "competitiveAdvantage",
              title: "Competitive advantage",
              hint: "Why customers choose you over the alternatives.",
              body:
                data.competitiveAdvantage ||
                "My service providers are very fast.",
            },
            {
              id: "targetAudience",
              title: "Target audience",
              hint: "The customers your documents usually speak to.",
              body:
                data.targetAudience ||
                "Nigerians seeking accessible and reliable financial services.",
            },
          ]);
        } else if (isMounted) {
          setHasExistingProfile(false);
        }
      } catch (err) {
        if (
          err.response?.status === 404 ||
          err.response?.data?.code === "COMPANY_PROFILE_REQUIRED" ||
          err.response?.data?.code === "COMPANY_PROFILE_NOT_FOUND"
        ) {
          if (isMounted) {
            setHasExistingProfile(false);
            setProfileRaw(null);
          }
        } else {
          console.error("Error loading user profile:", err);
          toast.error("Could not load company profile data.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute completeness score dynamically
  const pct = useMemo(() => {
    if (typeof completenessPercent === "number" && completenessPercent > 0) {
      return completenessPercent;
    }
    const filledCount = [
      companyName,
      industry,
      description,
      logoUrl,
      ...sections.map((s) => s.body),
    ].filter((val) => typeof val === "string" && val.trim().length > 0).length;
    const totalCount = 4 + sections.length;
    return Math.round((filledCount / totalCount) * 100);
  }, [completenessPercent, companyName, industry, description, logoUrl, sections]);

  const updateSection = async (id, body) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, body } : s)));
    try {
      if (!hasExistingProfile) {
        if (companyName.trim()) {
          const createRes = await createUserProfile({
            companyName: companyName.trim(),
            industry: industry || "Financial services",
            description: description || "",
            businessDescription: description || "",
            logoUrl: logoUrl || "",
            [id]: body,
          });
          setHasExistingProfile(true);
          const created = createRes?.data || createRes;
          if (created && typeof created === "object") {
            setProfileRaw((prev) => ({ ...prev, ...created }));
          }
        } else {
          toast.info(
            "Please enter your company name and click Save Changes to persist your profile."
          );
          return;
        }
      }
      await updateUserProfile(id, "update", body);
      toast.success("Section updated successfully!");
      // Broadcast update to header and overview
      window.dispatchEvent(
        new CustomEvent("ahiia:profile-updated", {
          detail: {
            ...profileRaw,
            companyName,
            industry,
            description,
            logoUrl,
            [id]: body,
          },
        })
      );
    } catch (err) {
      console.warn("Single field API save warning, will sync on full save:", err);
    }
  };

  const handleSaveChanges = async () => {
    if (!companyName || !companyName.trim()) {
      toast.error("Please enter your company name before saving.");
      return;
    }

    setSaving(true);
    setSaved(false);

    const sectionMap = sections.reduce((acc, s) => {
      acc[s.id] = s.body;
      return acc;
    }, {});

    const cleanCompanyName = companyName.trim();
    const cleanIndustry = industry || "Financial services";
    const cleanDesc = description || "";

    const payload = {
      companyName: cleanCompanyName,
      industry: cleanIndustry,
      description: cleanDesc,
      businessDescription: cleanDesc,
      logoUrl: logoUrl || "",
      mission: sectionMap.mission || "",
      vision: sectionMap.vision || "",
      competitiveAdvantage: sectionMap.competitiveAdvantage || "",
      targetAudience: sectionMap.targetAudience || "",
      businessStage: profileRaw?.businessStage || "Growing",
      marketsServed: profileRaw?.marketsServed || "Global",
    };

    try {
      let savedData = null;

      if (!hasExistingProfile) {
        // Profile does not exist yet: create it via POST /api/v1/profile
        try {
          const createRes = await createUserProfile(payload);
          savedData = createRes?.data || createRes;
          setHasExistingProfile(true);
        } catch (createErr) {
          if (
            createErr.response?.status !== 409 &&
            createErr.response?.status !== 400
          ) {
            throw createErr;
          }
        }
      }

      // Sync business context
      try {
        const updateRes = await updateBusinessContext(payload);
        savedData = updateRes?.data || updateRes || savedData;
        setHasExistingProfile(true);
      } catch (ctxErr) {
        const isProfileRequired =
          ctxErr?.response?.data?.code === "COMPANY_PROFILE_REQUIRED" ||
          ctxErr?.response?.status === 404 ||
          (typeof ctxErr?.response?.data?.message === "string" &&
            ctxErr.response.data.message.includes("Create a company profile"));

        if (isProfileRequired) {
          const createRes = await createUserProfile(payload);
          savedData = createRes?.data || createRes;
          setHasExistingProfile(true);

          // Retry updating business context with the created profile
          try {
            const retryRes = await updateBusinessContext(payload);
            savedData = retryRes?.data || retryRes || savedData;
          } catch (retryErr) {
            console.warn(
              "Context sync after profile creation warning:",
              retryErr
            );
          }
        } else {
          // Fall back to patchUserProfile if available
          try {
            const patchRes = await patchUserProfile(payload);
            savedData = patchRes?.data || patchRes || savedData;
          } catch {
            throw ctxErr;
          }
        }
      }

      setSaved(true);
      if (savedData && typeof savedData === "object") {
        setProfileRaw((prev) => ({ ...prev, ...savedData }));
        if (typeof savedData.completenessPercent === "number") {
          setCompletenessPercent(savedData.completenessPercent);
        }
        if (Array.isArray(savedData.missingFields)) {
          setMissingFields(savedData.missingFields);
        }
      }
      toast.success("Company profile saved successfully!");

      // Dispatch event to update Header and Overview in real-time
      window.dispatchEvent(
        new CustomEvent("ahiia:profile-updated", {
          detail: { ...profileRaw, ...payload, ...(savedData || {}) },
        })
      );

      setTimeout(() => setSaved(false), 2200);
    } catch (err) {
      console.error("Failed to save changes:", err);
      toast.error(
        err.response?.data?.message ||
          "Failed to save profile changes. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingLogo(true);
      setLogoName(file.name);
      const uploadedUrl = await uploadImageToCloudinary(file);
      setLogoUrl(uploadedUrl);
      toast.success("Logo uploaded successfully!");

      // Auto-notify profile update with new logo
      window.dispatchEvent(
        new CustomEvent("ahiia:profile-updated", {
          detail: {
            ...profileRaw,
            companyName,
            industry,
            description,
            logoUrl: uploadedUrl,
          },
        }),
      );
    } catch (err) {
      console.error("Logo upload error:", err);
      toast.error(err.message || "Failed to upload logo.");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const industryOptions = useMemo(() => {
    if (
      industry &&
      !INDUSTRIES.some((i) => i.toLowerCase() === industry.toLowerCase())
    ) {
      return [industry, ...INDUSTRIES];
    }
    return INDUSTRIES;
  }, [industry]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-blue-600 tracking-wider">
              Profile Setup
            </span>
            {companyName && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700">
                <Building2 className="w-3 h-3 text-blue-600" />
                {companyName}
              </span>
            )}
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Company Profile
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Keep your business information up to date so Ahiia can create more
            relevant documents.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSaveChanges}
          disabled={saving || loading}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#131B4D] hover:bg-[#1B2666] active:scale-[0.98] text-white font-bold text-sm shadow-xs transition-all disabled:opacity-70 disabled:cursor-wait shrink-0 cursor-pointer"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : saved ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Saved
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </div>

      {/* Completeness bar & missing fields reminder */}
      <div className="bg-white px-5 sm:px-6 py-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-2.5">
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
            Profile completeness
          </span>
          <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#3B4CCA] transition-all duration-700 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs font-black text-[#131B4D] whitespace-nowrap">
            {pct}%
          </span>
        </div>

        {missingFields && missingFields.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
            <span className="text-[11px] text-slate-400 font-medium">
              Suggested additions to reach 100%:
            </span>
            {missingFields.map((field) => (
              <span
                key={field}
                className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 capitalize"
              >
                {field.replace(/([A-Z])/g, " $1")}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* Business information */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-black text-slate-900">
              Business information
            </h3>
            {loading && (
              <span className="inline-flex items-center gap-1 text-[11px] text-blue-600 font-semibold">
                <Loader2 className="w-3 h-3 animate-spin" />
                Loading...
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mb-5">
            The facts Ahiia references in every document it structures.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Company name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Acme Innovations"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#131B4D]/15 focus:border-[#131B4D]/40 transition-shadow"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Industry
              </label>
              <div className="relative">
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full appearance-none px-3.5 py-2.5 pr-9 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#131B4D]/15 focus:border-[#131B4D]/40 transition-shadow"
                >
                  {industryOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Company description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Describe what your company does..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#131B4D]/15 focus:border-[#131B4D]/40 transition-shadow resize-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Logo
                </label>
                <span className="text-[11px] text-slate-400">
                  Used on exports
                </span>
              </div>

              {logoUrl ? (
                <div className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 bg-slate-50/70">
                  <img
                    src={logoUrl}
                    alt={companyName || "Logo"}
                    className="w-12 h-12 rounded-xl object-contain bg-white border border-slate-200/80 p-1 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {logoName || "Active Logo"}
                    </p>
                    <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Configured & applied
                    </p>
                  </div>
                  <label className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-white hover:border-slate-300 transition-colors cursor-pointer shrink-0">
                    {isUploadingLogo ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      "Change"
                    )}
                    <input
                      type="file"
                      accept="image/*,.svg"
                      className="hidden"
                      onChange={handleLogoUpload}
                      disabled={isUploadingLogo}
                    />
                  </label>
                </div>
              ) : (
                <label className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-dashed border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 cursor-pointer transition-colors">
                  <input
                    type="file"
                    accept="image/*,.svg"
                    className="hidden"
                    onChange={handleLogoUpload}
                    disabled={isUploadingLogo}
                  />
                  <span className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                    {isUploadingLogo ? (
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    ) : (
                      <UploadCloud className="w-5 h-5" />
                    )}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-slate-700">
                      {isUploadingLogo ? "Uploading logo..." : "Upload logo"}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      PNG, JPG, or SVG up to 5MB
                    </p>
                  </div>
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Business profile sections */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-black text-slate-900">
            Business Profile
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Ahiia uses this foundation to personalize document tone, facts, and
            proposals.
          </p>

          <div className="divide-y divide-slate-100 mt-4">
            {sections.map((section) => (
              <ProfileSection
                key={section.id}
                section={section}
                onSave={updateSection}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;
