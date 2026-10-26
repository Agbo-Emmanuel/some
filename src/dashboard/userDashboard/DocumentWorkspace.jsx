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
const BULLET_LINE_RE = /^\s*[-*\u2022\u2023\u25AA\u2013]\s+(.*)$/;
const STEP_LINE_RE = /^\s*\d{1,2}[.)]\s+(.*)$/;
const KEY_VALUE_LINE_RE = /^\s*([^:.!?]{1,48}):\s+(.+)$/;
const MD_HEADING_RE = /^\s*#{1,6}\s+/;

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
  const keyValueRows = [];

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

    const isKeyValueBlock =
      lines.length >= 2 &&
      lines.every(
        (l) =>
          KEY_VALUE_LINE_RE.test(l) &&
          !BULLET_LINE_RE.test(l) &&
          !STEP_LINE_RE.test(l)
      );

    if (isKeyValueBlock) {
      lines.forEach((l) => {
        const m = l.match(KEY_VALUE_LINE_RE);
        keyValueRows.push({
          key: stripInlineMarkdown(m[1]),
          value: stripInlineMarkdown(m[2]),
        });
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
      const step = line.match(STEP_LINE_RE);
      if (step) {
        flush();
        steps.push(stripInlineMarkdown(step[1]));
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
  if (keyValueRows.length > 0) body.keyValueRows = keyValueRows;

  if (Object.keys(body).length === 0 && String(text || "").trim()) {
    body.paragraphs = [String(text).trim()];
  }
  return body;
};

const buildSectionFromGenerated = (key, value) => {
  const text = normalizeSectionValue(value).trim();
  if (!text) return null;
  return {
    id: toSectionId(key),
    sectionKey: key,
    title: humanizeSectionKey(key),
    ...(/executive\s*summary/i.test(humanizeSectionKey(key))
      ? { isHighlighted: true }
      : {}),
    ...parseTextToSectionBody(text),
  };
};

// Converts the backend section map into UI sections, preserving backend order.
const parseSectionMapToSections = (map) => {
  if (!map || typeof map !== "object" || Array.isArray(map)) return null;
  return Object.entries(map)
    .map(([key, value]) => buildSectionFromGenerated(key, value))
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
                    docTypeVal
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
                        docTypeVal
                      );
                    }
                  } catch {
                    // ignore JSON parse error
                  }
                }
              } else if (Array.isArray(doc.sections)) {
                loadedSections = doc.sections;
              }

              // Only generated content is ever shown. If the backend has no
              // content yet, the workspace shows an empty state - never demo data.
              const resolvedSections = Array.isArray(loadedSections)
                ? loadedSections
                : [];
              setSections(resolvedSections);

              // Header metadata comes from the user's own structured inputs
              const inputs =
                doc.structuredInputs || navState.structuredInputs || {};
              setCompanyProfile((prev) => ({
                ...prev,
                preparedFor:
                  inputs.preparedFor ||
                  inputs.clientName ||
                  inputs.clientCompany ||
                  inputs.partyName ||
                  inputs.otherParty ||
                  prev.preparedFor,
                preparedBy:
                  inputs.preparedBy || inputs.companyName || prev.preparedBy,
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
              {docTitle || (loading ? "\u00A0" : "Untitled document")}
            </span>
          </div>

          {/* Title & Metadata Badges */}
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {docTitle || "\u00A0"}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              {isBusinessPlan ? (
                <span className="px-2 py-1 rounded text-[11px] font-black uppercase tracking-wider bg-slate-100 text-slate-700">
                  Business Plan
                </span>
              ) : isSop ? (
                <span className="px-2 py-1 rounded text-[11px] font-black uppercase tracking-wider bg-slate-100 text-slate-700">
                  SOP
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span
                  className={`font-semibold ${
                    docStatus === "Finalized"
                      ? "text-emerald-700"
                      : docStatus === "Exported"
                        ? "text-indigo-700"
                        : docStatus === "Saved" || saveStatus === "saved"
                          ? "text-emerald-700"
                          : "text-amber-700"
                  }`}
                >
                  {docStatus === "Finalized"
                    ? "Finalized"
                    : docStatus === "Exported"
                      ? "Exported"
                      : docStatus === "Saved" || saveStatus === "saved"
                        ? "Saved"
                        : "Draft"}
                </span>
                <span>
                  &middot; {revisionCount}{" "}
                  {revisionCount === 1 ? "revision" : "revisions"}
                </span>
              </span>
              {saveStatus === "saving" && (
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 animate-pulse"
                  title="Saving changes..."
                >
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving...
                </span>
              )}
              {saveStatus === "unsaved" && (
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600"
                  title="Unsaved changes detected. Autosaving shortly..."
                >
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  Unsaved changes
                </span>
              )}
              {saveStatus === "saved" && (
                <span
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600"
                  title={
                    lastSavedAt
                      ? `Saved at ${lastSavedAt.toLocaleTimeString()}`
                      : "All changes saved"
                  }
                >
                  <Check className="w-3.5 h-3.5" />
                  Saved
                </span>
              )}
              {saveStatus === "error" && (
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600"
                  title={saveError || "Failed to save"}
                >
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
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
              showAiAssistant
                ? "bg-[#131B4D] text-white ring-2 ring-[#131B4D]/20 shadow-sm"
                : "bg-[#131B4D] hover:bg-[#1C2666] text-white active:scale-[0.98]"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            <span>AI Assistant</span>
          </button>

          {/* Manual Save Button */}
          <button
            id="document-manual-save-btn"
            type="button"
            disabled={isSaving || (!isDirty && saveStatus === "saved")}
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
              <Check
                className={`w-3.5 h-3.5 ${isDirty ? "text-white" : "text-slate-400"}`}
              />
            )}
            <span>{isSaving ? "Saving..." : isDirty ? "Save Changes" : "Saved"}</span>
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
                      {docTitle || "\u00A0"}
                    </h1>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-100">
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
                      {docTitle || "\u00A0"}
                    </h1>
                  </div>

                  {/* Metadata Grid: Process owner / Issued by */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-white/10">
                    <div>
                      <p className="text-[11px] font-medium text-slate-400 mb-1">
                        Process owner
                      </p>
                      <p className="text-sm font-bold text-white">
                        {companyProfile.processOwner || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-slate-400 mb-1">
                        Issued by
                      </p>
                      <p className="text-sm font-bold text-white">
                        {companyProfile.issuedBy || companyProfile.companyName || "—"}
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

              {!loading && sections.map((section) => {
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
