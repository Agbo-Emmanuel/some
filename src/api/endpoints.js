export const ENDPOINTS = {
  // Auth
  REGISTER: "/api/v1/auth/register",
  LOGIN: "/api/v1/auth/login",
  LOGOUT: "/api/v1/auth/logout",
  VERIFY_EMAIL: "/api/v1/auth/verify-email",
  VERIFY_OTP: "/api/v1/auth/verify-email", // backwards-compatible alias
  RESEND_VERIFICATION: "/api/v1/auth/resend-verification",
  RESEND_OTP: "/api/v1/auth/resend-verification", // backwards-compatible alias
  FORGOT_PASSWORD: "/api/v1/auth/forgot-password",
  RESET_PASSWORD: "/api/v1/auth/reset-password",
  GOOGLE_AUTH: "/api/v1/auth/google",
  REFRESH_TOKEN: "/api/v1/auth/refresh",
  ADMIN_REGISTER: "/api/v1/admin/register",

  // User
  USER_ME: "/api/v1/user/me",
  USER_NOTIFICATION_PREFERENCES: "/api/v1/user/notification-preferences",

  // Profile
  PROFILE: "/api/v1/profile",
  CREATE_USER_PROFILE: "/api/v1/profile",
  GET_USER_PROFILE: "/api/v1/profile",
  UPDATE_USER_PROFILE: "/api/v1/profile",
  UPDATE_PROFILE_FIELD: (field) => `/api/v1/profile/${field}`,
  PROFILE_BUSINESS_CONTEXT: "/api/v1/profile/business-context",
  CREATE_AI_PROFILE: "/api/v1/profile/ai-complete",

  // Brand Kit
  BRAND_KIT: "/api/v1/brand-kit",
  GET_BRAND_KIT: "/api/v1/brand-kit",
  UPDATE_BRAND_KIT: "/api/v1/brand-kit",

  // Blueprints
  BLUEPRINTS: "/api/v1/blueprints",
  BLUEPRINT_BY_TYPE: (documentType) => `/api/v1/blueprints/${documentType}`,

  // Document Drafts
  DOCUMENT_DRAFTS: "/api/v1/document-drafts",
  DOCUMENT_DRAFT_BY_ID: (id) => `/api/v1/document-drafts/${id}`,
  GENERATE_DOCUMENT_DRAFT: (id) => `/api/v1/document-drafts/${id}/generate`,

  // Documents
  DOCUMENTS: "/api/v1/documents",
  GET_DOCUMENTS: "/api/v1/documents",
  CREATE_DOCUMENT: "/api/v1/documents",
  DOCUMENT_GENERATIONS: "/api/v1/document-generations",
  DOCUMENT_GENERATION_STATUS: (id) => `/api/v1/document-generations/${id}`,
  GET_ONE_DOCUMENT: (id) => `/api/v1/documents/${id}`,
  DOCUMENT_BY_ID: (id) => `/api/v1/documents/${id}`,
  DOCUMENT_STYLE: (id) => `/api/v1/documents/${id}/style`,
  DOCUMENT_STATUS: (id) => `/api/v1/documents/${id}/status`,
  DUPLICATE_DOCUMENT: (id) => `/api/v1/documents/${id}/duplicate`,
  DOCUMENT_GENERATION_CONTEXT: (documentType) =>
    `/api/v1/documents/generation-context/${documentType}`,
  DOCUMENT_CONTENT: (id) => `/api/v1/documents/${id}/content`,
  GET_DOCUMENT_GUIDANCE: (id) => `/api/v1/documents/${id}/guidance`,
  UPDATE_DOCUMENT_GUIDANCE: (id, flagId) =>
    `/api/v1/documents/${id}/guidance/${flagId}`,
  DOCUMENT_ASSISTANT_ACTION: (id) => `/api/v1/documents/${id}/assistant-action`,
  DOCUMENT_REVISIONS: (id) => `/api/v1/documents/${id}/revisions`,
  DOCUMENT_REVERT: (id) => `/api/v1/documents/${id}/revert`,
  DOCUMENT_REGENERATE_SECTION: (id) =>
    `/api/v1/documents/${id}/regenerate-section`,
  DOCUMENT_EXPORT: (id) => `/api/v1/documents/${id}/export`,

  // Insights / Analytics
  DASHBOARD: "/api/v1/dashboard",
  ANALYTICS_SUMMARY: "/api/v1/analytics/summary",

  // Public
  PUBLIC_WAITLIST: "/api/v1/public/waitlist",
  PUBLIC_CONTACT: "/api/v1/public/contact",

  // Admin
  ADMIN_OVERVIEW: "/api/v1/admin/overview",
  ADMIN_USERS: "/api/v1/admin/users",
  ADMIN_USER_BY_ID: (id) => `/api/v1/admin/users/${id}`,
  ADMIN_USER_STATUS: (id) => `/api/v1/admin/users/${id}/status`,
  ADMIN_DOCUMENTS: "/api/v1/admin/documents",
  ADMIN_GENERATIONS: "/api/v1/admin/generations",
  ADMIN_AI_USAGE: "/api/v1/admin/ai-usage",
  ADMIN_SYSTEM_HEALTH: "/api/v1/admin/system-health",
};
