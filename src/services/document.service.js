import { api } from "../api/api";
import { ENDPOINTS } from "../api/endpoints";

/**
 * Fetch documents with optional filtering and pagination.
 * @param {Object} [params] - { search, type, status, sort, page, pageSize }
 */
export const getDocuments = async (params = {}) => {
  const response = await api.get(ENDPOINTS.DOCUMENTS, { params });
  return response.data;
};

/**
 * Create a new document.
 * @param {Object} payload - CreateDocumentRequest
 */
export const createDocument = async (payload) => {
  const response = await api.post(ENDPOINTS.DOCUMENTS, payload);
  return response.data;
};

/**
 * Retrieve a single document by ID.
 * @param {string} id
 */
export const getDocumentById = async (id) => {
  const response = await api.get(ENDPOINTS.DOCUMENT_BY_ID(id));
  return response.data;
};

/**
 * Update document metadata.
 * @param {string} id
 * @param {Object} payload
 */
export const updateDocument = async (id, payload) => {
  const response = await api.patch(ENDPOINTS.DOCUMENT_BY_ID(id), payload);
  return response.data;
};

/**
 * Delete a document by ID.
 * @param {string} id
 */
export const deleteDocument = async (id) => {
  const response = await api.delete(ENDPOINTS.DOCUMENT_BY_ID(id));
  return response.data;
};

/**
 * Update styling settings for a document.
 * @param {string} id
 * @param {Object} payload
 */
export const updateDocumentStyle = async (id, payload) => {
  const response = await api.patch(ENDPOINTS.DOCUMENT_STYLE(id), payload);
  return response.data;
};

/**
 * Update document status (e.g. Draft, Finalized).
 * @param {string} id
 * @param {Object} payload - { status }
 */
export const updateDocumentStatus = async (id, payload) => {
  const response = await api.patch(ENDPOINTS.DOCUMENT_STATUS(id), payload);
  return response.data;
};

/**
 * Duplicate an existing document.
 * @param {string} id
 */
export const duplicateDocument = async (id) => {
  const response = await api.post(ENDPOINTS.DUPLICATE_DOCUMENT(id));
  return response.data;
};

/**
 * Fetch generation context for a document type.
 * @param {string} documentType
 */
export const getGenerationContext = async (documentType) => {
  const response = await api.get(
    ENDPOINTS.DOCUMENT_GENERATION_CONTEXT(documentType),
  );
  return response.data;
};

/**
 * Update the full content of a document.
 * @param {string} id
 * @param {Object} payload
 */
export const updateDocumentContent = async (id, payload) => {
  const response = await api.put(ENDPOINTS.DOCUMENT_CONTENT(id), payload);
  return response.data;
};

/**
 * Fetch AI guidance and review flags for a document.
 * @param {string} id
 */
export const getDocumentGuidance = async (id) => {
  const response = await api.get(ENDPOINTS.GET_DOCUMENT_GUIDANCE(id));
  return response.data;
};

/**
 * Resolve or update a specific guidance flag.
 * @param {string} id
 * @param {string} flagId
 * @param {Object} payload
 */
export const updateDocumentGuidance = async (id, flagId, payload) => {
  const response = await api.patch(
    ENDPOINTS.UPDATE_DOCUMENT_GUIDANCE(id, flagId),
    payload,
  );
  return response.data;
};

/**
 * Trigger an AI assistant action on a document.
 * @param {string} id
 * @param {Object} payload
 */
export const documentAssistantAction = async (id, payload) => {
  const response = await api.post(
    ENDPOINTS.DOCUMENT_ASSISTANT_ACTION(id),
    payload,
  );
  return response.data;
};

/**
 * Fetch revision history for a document.
 * @param {string} id
 */
export const getDocumentRevisions = async (id) => {
  const response = await api.get(ENDPOINTS.DOCUMENT_REVISIONS(id));
  return response.data;
};

/**
 * Revert a document to a specific revision.
 * @param {string} id
 * @param {Object} payload - { revisionId }
 */
export const revertDocument = async (id, payload) => {
  const response = await api.post(ENDPOINTS.DOCUMENT_REVERT(id), payload);
  return response.data;
};

/**
 * Regenerate a specific section of a document.
 * @param {string} id
 * @param {Object} payload
 */
export const regenerateDocumentSection = async (id, payload) => {
  const response = await api.post(
    ENDPOINTS.DOCUMENT_REGENERATE_SECTION(id),
    payload,
  );
  return response.data;
};

/**
 * Export document to PDF/Word/etc.
 * @param {string} id
 * @param {Object} payload - { format, options }
 */
export const exportDocument = async (id, payload) => {
  const response = await api.post(ENDPOINTS.DOCUMENT_EXPORT(id), payload);
  return response.data;
};

// ================= Document Drafts =================

export const getDocumentDrafts = async () => {
  const response = await api.get(ENDPOINTS.DOCUMENT_DRAFTS);
  return response.data;
};

export const createDocumentDraft = async (payload) => {
  const response = await api.post(ENDPOINTS.DOCUMENT_DRAFTS, payload);
  return response.data;
};

export const getDocumentDraftById = async (id) => {
  const response = await api.get(ENDPOINTS.DOCUMENT_DRAFT_BY_ID(id));
  return response.data;
};

export const updateDocumentDraft = async (id, payload) => {
  const response = await api.put(ENDPOINTS.DOCUMENT_DRAFT_BY_ID(id), payload);
  return response.data;
};

export const deleteDocumentDraft = async (id) => {
  const response = await api.delete(ENDPOINTS.DOCUMENT_DRAFT_BY_ID(id));
  return response.data;
};

export const generateDocumentDraft = async (id, payload) => {
  const response = await api.post(
    ENDPOINTS.GENERATE_DOCUMENT_DRAFT(id),
    payload,
  );
  return response.data;
};

// ================= Blueprints =================

export const getBlueprints = async () => {
  const response = await api.get(ENDPOINTS.BLUEPRINTS);
  return response.data;
};

export const getBlueprintByType = async (documentType) => {
  const response = await api.get(ENDPOINTS.BLUEPRINT_BY_TYPE(documentType));
  return response.data;
};

