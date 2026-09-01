export const ENDPOINTS = {
  // Auth
  REGISTER: "/api/v1/auth/register",
  VERIFY_OTP: "/api/v1/auth/verify-email",
  RESEND_OTP: "/api/v1/auth/resend-verification",
  LOGIN: "/api/v1/auth/login",
  LOGOUT: "/api/v1/auth/logout",
  REFRESH_TOKEN: "/api/v1/auth/refresh",
  FORGOT_PASSWORD: "/api/v1/auth/forgot-password",
  RESET_PASSWORD: "/api/v1/auth/reset-password",
  ADMIN_REGISTER: "/api/v1/admin/register",

  //Profile
  CREATE_USER_PROFILE: "/api/v1/profile",
  GET_USER_PROFILE: "/api/v1/profile",
  UPDATE_USER_PROFILE: "/api/v1/profile",
  CREATE_AI_PROFILE: "/api/v1/profile/ai-complete",

  //Brand-kit
  GET_BRAND_KIT: "/api/v1/brand-kit",
  UPDATE_BRAND_KIT: "/api/v1/brand-kit",
};
