import React, { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ChevronRight,
  FileText,
  Layers,
  Sparkles,
  Check,
  AlertCircle,
  Clock,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  getTemplate,
  DOCUMENT_TYPE_MAP,
} from "../../config/documentTemplates";
import {
  createDocument,
  createDocumentDraft,
  getDocuments,
  startDocumentGeneration,
  waitForDocumentGeneration,
} from "../../services/document.service";
import SetupFooter from "../components/document-setup/SetupFooter";
import OptionalInformation from "../components/document-setup/OptionalInformation";
import GenerateModal from "../components/document-setup/GenerateModal";
import SetupSidebar from "../components/document-setup/SetupSidebar";
import {
  FORM_REGISTRY,
  getFormRegistryEntry,
} from "../components/document-setup/FormRegistery";

const DocumentSetup = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();

  const template = getTemplate(templateId);
  const registryEntry =
    getFormRegistryEntry(templateId) ||
    (template && getFormRegistryEntry(template.id)) ||
    FORM_REGISTRY[templateId];

  const [title, setTitle] = useState("");
  const [isTitleManual, setIsTitleManual] = useState(false);
  const [formData, setFormData] = useState({});
  const [optionalValues, setOptionalValues] = useState({});
  const [writingStyle, setWritingStyle] = useState("professional");
  const [styleTemplate, setStyleTemplate] = useState("Corporate");
  const [showModal, setShowModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  // Async polling queue state
  const [isPolling, setIsPolling] = useState(false);
  const [pollingStatus, setPollingStatus] = useState("Queued");
  const abortControllerRef = useRef(null);
  const isMountedRef = useRef(true);

  // Referenced documents state
  const [availableDocs, setAvailableDocs] = useState([]);
  const [selectedDocIds, setSelectedDocIds] = useState([]);
  const [showRefDocs, setShowRefDocs] = useState(false);

  // Cleanup AbortController on unmount to prevent memory leaks and state updates
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Resume on Refresh (Idempotency): Check sessionStorage for pending background generation
  useEffect(() => {
    const rawPending = sessionStorage.getItem("ahiia_pending_generation");
    if (!rawPending) return;

    let pending;
    try {
      pending = JSON.parse(rawPending);
    } catch (e) {
      console.warn("Invalid ahiia_pending_generation in sessionStorage:", e);
      sessionStorage.removeItem("ahiia_pending_generation");
      return;
    }

    // Only resume if it belongs to this template (or no template specified)
    if (pending.templateId && templateId && pending.templateId !== templateId) {
      return;
    }

    // Restore and preserve user inputs in case of error or cancellation
    if (pending.payload) {
      if (pending.payload.title) {
        setTitle(pending.payload.title);
        setIsTitleManual(true);
      }
      if (pending.payload.structuredInputs) {
        const { optionalInformation, ...rest } = pending.payload.structuredInputs;
        setFormData(rest);
        if (optionalInformation) {
          setOptionalValues(optionalInformation);
        }
      }
      if (pending.payload.writingStyle) {
        const styleKey = Object.entries({
          professional: "Professional",
          "clear-simple": "Clear & Simple",
          persuasive: "Persuasive",
        }).find(([, v]) => v.toLowerCase() === pending.payload.writingStyle.toLowerCase())?.[0];
        if (styleKey) setWritingStyle(styleKey);
      }
      if (pending.payload.styleTemplate) {
        setStyleTemplate(pending.payload.styleTemplate);
      }
      if (pending.payload.referencedDocumentIds) {
        setSelectedDocIds(pending.payload.referencedDocumentIds);
      }
    }

    // Skip the setup form and immediately transition to the Polling UI
    setIsPolling(true);
    setIsGenerating(true);
    setPollingStatus(pending.job?.status || "Queued");

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const resumePollingJob = async () => {
      try {
        let job = pending.job;
        if (!job) {
          try {
            job = await startDocumentGeneration(
              pending.payload,
              pending.requestKey,
              controller.signal
            );
            pending.job = job;
            sessionStorage.setItem("ahiia_pending_generation", JSON.stringify(pending));
          } catch (startErr) {
            if (startErr.response?.status === 404) {
              console.warn(
                "Async endpoint returned 404 on resume. Falling back to synchronous creation."
              );
              sessionStorage.removeItem("ahiia_pending_generation");
              const syncResult = await createDocument(pending.payload);
              const createdId =
                syncResult?.id ||
                syncResult?.data?.id ||
                syncResult?.document?.id ||
                syncResult?.documentId;

              if (!createdId) {
                throw new Error("Document created, but no valid document ID was returned by the server.");
              }

              if (isMountedRef.current) {
                setIsPolling(false);
                setIsGenerating(false);
              }
              toast.success(`"${pending.payload?.title || "Document"}" created successfully!`);
              navigate(`/dashboard/documents/${createdId}`, {
                state: {
                  document: syncResult,
                  newlyCreated: true,
                  newlyCreatedId: createdId,
                  docTitle: pending.payload?.title,
                  docType: pending.payload?.documentType,
                  styleTemplate: pending.payload?.styleTemplate,
                  structuredInputs: pending.payload?.structuredInputs,
                },
              });
              return;
            }
            throw startErr;
          }
        }

        if (isMountedRef.current && job?.status) {
          setPollingStatus(job.status);
        }

        const document = await waitForDocumentGeneration(job, {
          signal: controller.signal,
          onStatus: (statusObj) => {
            if (isMountedRef.current) {
              setPollingStatus(statusObj.status || "Generating");
            }
          },
        });

        // Extract document.id (NEVER the job's id)
        const docId = document?.id || document?.documentId || document?.data?.id;
        if (!docId) {
          throw new Error("Generation completed, but returned document is missing a valid ID.");
        }

        sessionStorage.removeItem("ahiia_pending_generation");
        if (isMountedRef.current) {
          setIsPolling(false);
          setIsGenerating(false);
        }
        toast.success(`"${pending.payload?.title || "Document"}" generated successfully!`);

        navigate(`/dashboard/documents/${docId}`, {
          state: {
            document,
            newlyCreated: true,
            newlyCreatedId: docId,
            docTitle: pending.payload?.title,
            docType: pending.payload?.documentType,
            styleTemplate: pending.payload?.styleTemplate,
            structuredInputs: pending.payload?.structuredInputs,
          },
        });
      } catch (err) {
        if (
          err.name === "AbortError" ||
          controller.signal.aborted ||
          err.message?.includes("Polling stopped")
        ) {
          console.log("Resume polling stopped via user abort or unmount.");
          if (isMountedRef.current) {
            setIsPolling(false);
            setIsGenerating(false);
          }
          return;
        }

        console.error("Resume polling failed:", err);
        sessionStorage.removeItem("ahiia_pending_generation");
        if (isMountedRef.current) {
          setIsPolling(false);
          setIsGenerating(false);
          const errMsg = extractApiErrorMessage(
            err,
            "Failed to complete document generation."
          );
          toast.error(errMsg);
        }
      }
    };

    resumePollingJob();

    return () => {
      controller.abort();
    };
  }, [templateId, navigate]);

  // Auto-generate title suggestion based on input if user hasn't explicitly edited title
  useEffect(() => {
    if (isTitleManual || !template) return;
    const client =
      formData.clientName ||
      formData.clientCompany ||
      formData.partyName ||
      formData.companyName;
    if (client) {
      setTitle(`${client.trim()} - ${template.title}`);
    } else {
      setTitle(template.title);
    }
  }, [formData, template, isTitleManual]);

  // Load user's past documents for referencing
  useEffect(() => {
    let isMounted = true;
    const fetchExistingDocs = async () => {
      try {
        const response = await getDocuments({ pageSize: 15 });
        const list = Array.isArray(response)
          ? response
          : Array.isArray(response?.items)
            ? response.items
            : Array.isArray(response?.data)
              ? response.data
              : [];
        if (isMounted) setAvailableDocs(list);
      } catch (err) {
        console.warn("Could not load past documents for referencing:", err);
      }
    };
    fetchExistingDocs();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleField = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleOptionalChange = (key, value) =>
    setOptionalValues((prev) => ({ ...prev, [key]: value }));

  const toggleReferencedDoc = (docId) => {
    setSelectedDocIds((prev) =>
      prev.includes(docId)
        ? prev.filter((id) => id !== docId)
        : [...prev, docId],
    );
  };

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
    if (!allRequiredComplete) {
      const missing = template.requiredSections
        .filter((s) => !completedKeys.includes(s.key))
        .map((s) => s.label);
      toast.warn(
        `Please complete the required section${
          missing.length > 1 ? "s" : ""
        }: ${missing.join(", ")}`,
      );
      return;
    }
    setShowModal(true);
  };

  // Helper to extract clean error message from API response (supports ProblemDetails / errors dict)
  const extractApiErrorMessage = (err, fallback) => {
    const data = err.response?.data;
    if (!data) return err.message || fallback;

    if (data.errors && typeof data.errors === "object") {
      const msgs = [];
      Object.values(data.errors).forEach((val) => {
        if (Array.isArray(val)) {
          msgs.push(...val.filter(Boolean));
        } else if (typeof val === "string" && val.trim()) {
          msgs.push(val.trim());
        }
      });
      if (msgs.length > 0) return msgs.join(" ");
    }

    return (
      data.message ||
      data.detail ||
      data.title ||
      err.message ||
      fallback
    );
  };

  // Build the payload conforming strictly to the Create Document API schema
  const buildPayload = () => {
    const documentType =
      DOCUMENT_TYPE_MAP[templateId] ||
      DOCUMENT_TYPE_MAP[template?.id] ||
      templateId ||
      "Proposal";
    const docTitle = (title || "").trim() || template.title;

    // Filter out blank optional fields so payload remains clean and compact
    const cleanedOptional = Object.entries(optionalValues).reduce(
      (acc, [key, val]) => {
        if (
          typeof val === "string"
            ? val.trim().length > 0
            : val !== undefined && val !== null
        ) {
          acc[key] = typeof val === "string" ? val.trim() : val;
        }
        return acc;
      },
      {},
    );

    // CRITICAL: structuredInputs must be a JSON object, NOT JSON.stringify!
    // The backend API validator explicitly enforces that structuredInputs is a JSON object.
    const structuredInputs = {
      ...formData,
      ...(Object.keys(cleanedOptional).length > 0
        ? { optionalInformation: cleanedOptional }
        : {}),
    };

    return {
      documentType,
      title: docTitle,
      writingStyle: writingStyleLabel,
      styleTemplate,
      structuredInputs,
      referencedDocumentIds: selectedDocIds,
    };
  };

  const handleCancelAndRunInBackground = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsPolling(false);
    setIsGenerating(false);
    setShowModal(false);
    toast.info(
      "Generation continues in the background. Check your documents shortly."
    );
    // Do NOT clear sessionStorage on abort
  };

  const handleGenerate = async () => {
    const payload = buildPayload();
    const requestKey =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Save requestKey, payload, and templateId to sessionStorage BEFORE the first POST
    const pendingState = {
      requestKey,
      payload,
      templateId,
    };
    sessionStorage.setItem(
      "ahiia_pending_generation",
      JSON.stringify(pendingState)
    );

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setShowModal(false);
    setIsGenerating(true);
    setIsPolling(true);
    setPollingStatus("Queued");

    try {
      let job;
      try {
        job = await startDocumentGeneration(
          payload,
          requestKey,
          controller.signal
        );
      } catch (startErr) {
        // Fallback to synchronous POST /api/v1/documents if endpoint returns 404
        if (startErr.response?.status === 404) {
          console.warn(
            "/api/v1/document-generations returned 404. Falling back to synchronous creation."
          );
          sessionStorage.removeItem("ahiia_pending_generation");
          setIsPolling(false);

          const result = await createDocument(payload);
          const createdId =
            result?.id ||
            result?.data?.id ||
            result?.document?.id ||
            result?.documentId;

          if (!createdId) {
            throw new Error(
              "Document created, but no valid document ID was returned by the server."
            );
          }

          toast.success(
            `"${payload.title}" created successfully! Generating document...`
          );

          navigate(`/dashboard/documents/${createdId}`, {
            state: {
              document: result,
              newlyCreated: true,
              newlyCreatedId: createdId,
              docTitle: payload.title,
              docType: payload.documentType,
              styleTemplate: payload.styleTemplate,
              structuredInputs: payload.structuredInputs,
            },
          });
          return;
        }
        throw startErr;
      }

      // Initial POST succeeded! Store job so refresh can resume polling.
      pendingState.job = job;
      sessionStorage.setItem(
        "ahiia_pending_generation",
        JSON.stringify(pendingState)
      );

      setPollingStatus(job.status || "Queued");

      // Wait for async document generation to complete
      const document = await waitForDocumentGeneration(job, {
        signal: controller.signal,
        onStatus: (statusObj) => {
          if (isMountedRef.current) {
            setPollingStatus(statusObj.status || "Generating");
          }
        },
      });

      // Extract document.id (NEVER the job's id)
      const docId =
        document?.id || document?.documentId || document?.data?.id;
      if (!docId) {
        throw new Error(
          "Generation completed, but returned document is missing a valid ID."
        );
      }

      sessionStorage.removeItem("ahiia_pending_generation");
      if (isMountedRef.current) {
        setIsPolling(false);
        setIsGenerating(false);
      }
      toast.success(`"${payload.title}" generated successfully!`);

      navigate(`/dashboard/documents/${docId}`, {
        state: {
          document,
          newlyCreated: true,
          newlyCreatedId: docId,
          docTitle: payload.title,
          docType: payload.documentType,
          styleTemplate: payload.styleTemplate,
          structuredInputs: payload.structuredInputs,
        },
      });
    } catch (err) {
      // If aborted by user ("Cancel & Run in Background"), do NOT clear sessionStorage or show error toast
      if (
        err.name === "AbortError" ||
        controller.signal.aborted ||
        err.message?.includes("Polling stopped")
      ) {
        console.log("Polling stopped by user; server generation continues.");
        if (isMountedRef.current) {
          setIsPolling(false);
          setIsGenerating(false);
        }
        return;
      }

      console.error("Failed to generate document:", err);
      sessionStorage.removeItem("ahiia_pending_generation");
      if (isMountedRef.current) {
        setIsPolling(false);
        setIsGenerating(false);
        const errMsg = extractApiErrorMessage(
          err,
          "Failed to generate document. Please check your inputs and try again."
        );
        toast.error(errMsg);
      }
    } finally {
      if (isMountedRef.current) {
        setIsGenerating(false);
      }
    }
  };

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    const payload = buildPayload();

    try {
      await createDocumentDraft({
        documentType: payload.documentType,
        title: payload.title,
        writingStyle: payload.writingStyle,
        styleTemplate: payload.styleTemplate,
        structuredInputs: payload.structuredInputs,
      });
      toast.success("Draft saved successfully!");
    } catch (err) {
      console.error("API draft save failed:", err);
      const errMsg = extractApiErrorMessage(
        err,
        "Failed to save draft to workspace."
      );
      toast.error(errMsg);
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Polling Queue UI: Replaces the setup form during background polling
  if (isPolling) {
    return (
      <div className="max-w-4xl mx-auto py-8 sm:py-12 px-4 animate-in fade-in duration-300">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-6">
          <Link
            to="/dashboard/create-document"
            className="hover:text-slate-600 transition-colors"
          >
            Create Document
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span>{template.title}</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-700 font-bold">Generating</span>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-8 sm:p-12 text-center max-w-2xl mx-auto">
          {/* Animated Generation Icon Badge */}
          <div className="relative w-16 h-16 rounded-2xl bg-[#131B4D] text-white flex items-center justify-center mx-auto mb-6 shadow-md shadow-[#131B4D]/15">
            <Sparkles className="w-8 h-8 text-blue-300 animate-pulse" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center shadow-xs">
              <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
            </div>
          </div>

          {/* Status Badge - exact string from backend */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/70 mb-4 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
            <span className="text-xs font-bold text-blue-700 tracking-wide uppercase">
              {pollingStatus || "Queued"}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
            Generating {title ? `"${title}"` : template.title}
          </h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">
            Ahiia is applying your company profile, brand styling, and structuring a comprehensive first draft.
          </p>

          {/* Indeterminate loader bar (No invented percentage) */}
          <div className="w-full max-w-md mx-auto mb-8">
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden relative shadow-inner">
              <div className="h-full bg-gradient-to-r from-blue-600 to-[#131B4D] rounded-full w-2/5 animate-indeterminate" />
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-400 mt-2.5 px-1 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Live Status: <strong className="text-slate-700">{pollingStatus || "Queued"}</strong>
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <Clock className="w-3 h-3 text-slate-400" /> Auto-polling
              </span>
            </div>
          </div>

          {/* Cancel & Run in Background action */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleCancelAndRunInBackground}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] transition-all cursor-pointer shadow-xs"
            >
              <Clock className="w-4 h-4 text-slate-500" />
              <span>Cancel &amp; Run in Background</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-400 mt-4 leading-normal">
            You can safely leave this tab or cancel polling. Server generation continues uninterrupted and your completed document will appear in your Documents workspace.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-3">
        <Link
          to="/dashboard/create-document"
          className="hover:text-slate-600 transition-colors"
        >
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
          {/* Header banner */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-blue-600 mb-1">
                Ahiia AI Document Generator
              </p>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Set up your {template.title}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Provide your core details. Ahiia will apply your company profile
                and brand kit to generate a polished document draft.
              </p>
            </div>
          </div>

          {/* Document type summary card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <template.icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">
                  {template.title}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {template.desc}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate("/dashboard/create-document")}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shrink-0 cursor-pointer"
            >
              Change document
            </button>
          </div>

          {/* Document Title Input */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="document-title"
                className="text-sm font-bold text-slate-900"
              >
                Document Title
              </label>
              <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                Required
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Give your document a clear name to organize your workspace and
              exports.
            </p>
            <input
              id="document-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setIsTitleManual(true);
              }}
              placeholder={`e.g. ${template.title} for ${
                formData.clientName || "Client"
              }`}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 text-sm px-3.5 py-2.5 font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#131B4D]/15 focus:border-[#131B4D] transition-all"
            />
          </div>

          {/* Form instructions */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
            <h3 className="text-sm font-bold text-slate-900">
              Tell us about your document
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Fill in the required sections below. Progress is tracked
              automatically in the sidebar.
            </p>
          </div>

          {/* Dynamic Form Sections */}
          <Form data={formData} onField={handleField} />

          {/* Optional Information */}
          <OptionalInformation
            sections={template.optionalSections}
            values={optionalValues}
            onChange={handleOptionalChange}
          />

          {/* Referenced Documents (Optional Context) */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
            <button
              type="button"
              onClick={() => setShowRefDocs((v) => !v)}
              className="w-full flex items-center justify-between text-left cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    Referenced Documents{" "}
                    <span className="text-xs font-normal text-slate-400">
                      (Optional)
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {selectedDocIds.length > 0
                      ? `${selectedDocIds.length} document${
                          selectedDocIds.length > 1 ? "s" : ""
                        } selected for reference context`
                      : "Attach prior proposals, contracts or notes to guide AI tone and facts."}
                  </p>
                </div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                  showRefDocs ? "rotate-180" : ""
                }`}
              />
            </button>

            {showRefDocs && (
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                {availableDocs.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">
                    No previous documents available to reference yet. Generated
                    documents in your account will appear here.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {availableDocs.map((doc) => {
                      const isSelected = selectedDocIds.includes(doc.id);
                      return (
                        <button
                          key={doc.id}
                          type="button"
                          onClick={() => toggleReferencedDoc(doc.id)}
                          className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? "border-[#131B4D] bg-[#131B4D]/5 ring-1 ring-[#131B4D]"
                              : "border-slate-200 bg-slate-50/50 hover:bg-white"
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                              isSelected
                                ? "bg-[#131B4D] border-[#131B4D] text-white"
                                : "border-slate-300 bg-white"
                            }`}
                          >
                            {isSelected && (
                              <Check className="w-3 h-3" strokeWidth={3} />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">
                              {doc.title || doc.name || "Untitled Document"}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {doc.documentType || doc.type || "Document"}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer actions */}
          <SetupFooter
            completedCount={completedKeys.length}
            totalRequired={totalRequired}
            onBack={() => navigate("/dashboard/create-document")}
            onSaveDraft={handleSaveDraft}
            onReviewAndGenerate={handleReviewAndGenerate}
            isSavingDraft={isSavingDraft}
          />
        </div>

        {/* Sidebar */}
        <SetupSidebar
          templateTitle={template.title}
          requiredSections={template.requiredSections}
          completedKeys={completedKeys}
          writingStyle={writingStyle}
          onWritingStyleChange={setWritingStyle}
          styleTemplate={styleTemplate}
          onStyleTemplateChange={setStyleTemplate}
        />
      </div>

      {/* Confirmation & Generation Modal */}
      {showModal && (
        <GenerateModal
          documentTitle={title.trim() || template.title}
          templateTitle={template.title}
          styleTemplate={styleTemplate}
          optionalAddedCount={optionalAddedCount}
          optionalTotalCount={template.optionalSections.length}
          referencedCount={selectedDocIds.length}
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

