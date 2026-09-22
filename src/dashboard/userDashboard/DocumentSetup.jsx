import React, { useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { getTemplate } from "../../config/documentTemplates";
import SetupFooter from "../components/document-setup/SetupFooter";
import OptionalInformation from "../components/document-setup/OptionalInformation";
import GenerateModal from "../components/document-setup/GenerateModal";
import SetupSidebar from "../components/document-setup/SetupSidebar";
import { FORM_REGISTRY } from "../components/document-setup/FormRegistery";

const DocumentSetup = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();

  const template = getTemplate(templateId);
  const registryEntry = FORM_REGISTRY[templateId];

  const [formData, setFormData] = useState({});
  const [optionalValues, setOptionalValues] = useState({});
  const [writingStyle, setWritingStyle] = useState("professional");
  const [showModal, setShowModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleField = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleOptionalChange = (key, value) =>
    setOptionalValues((prev) => ({ ...prev, [key]: value }));

  const completedKeys = useMemo(
    () => (registryEntry ? registryEntry.getCompletedSections(formData) : []),
    [registryEntry, formData],
  );

  if (!template || !registryEntry) {
    return (
      <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200/80 p-8 text-center">
        <p className="text-sm text-slate-500">
          We couldn't find that document type.{" "}
          <Link
            to="/dashboard/create-document"
            className="text-blue-600 font-bold"
          >
            Go back and pick one
          </Link>
          .
        </p>
      </div>
    );
  }

  const { Form } = registryEntry;
  const totalRequired = template.requiredSections.length;
  const allRequiredComplete = completedKeys.length === totalRequired;

  const optionalAddedCount = template.optionalSections.filter(
    (s) => (optionalValues[s.key] || "").trim().length > 0,
  ).length;

  const writingStyleLabel =
    {
      professional: "Professional",
      "clear-simple": "Clear & Simple",
      persuasive: "Persuasive",
    }[writingStyle] || "Professional";

  const handleReviewAndGenerate = () => {
    if (!allRequiredComplete) return;
    setShowModal(true);
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    // Placeholder for the real generation call — wire up to the backend here.
    setTimeout(() => {
      setIsGenerating(false);
      setShowModal(false);
      navigate("/dashboard/documents");
    }, 900);
  };

  const handleSaveDraft = () => {
    // Placeholder for draft-save call.
  };

  return (
    <div className="max-w-6xl mx-auto pb-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-3">
        <Link to="/dashboard/create-document" className="hover:text-slate-600">
          Create Document
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span>{template.title}</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-700 font-bold">Setup</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        {/* Main column */}
        <div className="space-y-5 min-w-0">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Set up your {template.title}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Add a few details and Ahiia.Ai will turn them into a
                professional document.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <template.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {template.title}
                </p>
                <p className="text-xs text-slate-400">{template.desc}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate("/dashboard/create-document")}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shrink-0"
            >
              Change document
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
            <h3 className="text-sm font-bold text-slate-900">
              Tell us about your document
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Provide the information Ahiia needs to create your document. You
              can add more details later.
            </p>
          </div>

          <Form data={formData} onField={handleField} />

          <OptionalInformation
            sections={template.optionalSections}
            values={optionalValues}
            onChange={handleOptionalChange}
          />

          <SetupFooter
            completedCount={completedKeys.length}
            totalRequired={totalRequired}
            onBack={() => navigate("/dashboard/create-document")}
            onSaveDraft={handleSaveDraft}
            onReviewAndGenerate={handleReviewAndGenerate}
          />
        </div>

        {/* Sidebar */}
        <SetupSidebar
          templateTitle={template.title}
          requiredSections={template.requiredSections}
          completedKeys={completedKeys}
          writingStyle={writingStyle}
          onWritingStyleChange={setWritingStyle}
        />
      </div>

      {showModal && (
        <GenerateModal
          templateTitle={template.title}
          optionalAddedCount={optionalAddedCount}
          optionalTotalCount={template.optionalSections.length}
          writingStyleLabel={writingStyleLabel}
          onEdit={() => setShowModal(false)}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
        />
      )}
    </div>
  );
};

export default DocumentSetup;
