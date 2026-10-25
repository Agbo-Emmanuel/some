import { api } from "../api/api";
import { ENDPOINTS } from "../api/endpoints";
import { refreshSessionToken } from "../api/tokenRefresh";

export const register = async (payload) => {
  const response = await api.post(ENDPOINTS.REGISTER, payload);
  return response.data;
};

export const verifyOtp = async (payload) => {
  const response = await api.post(ENDPOINTS.VERIFY_OTP, payload);
  return response.data;
};

export const resendOtp = async (payload) => {
  const response = await api.post(ENDPOINTS.RESEND_OTP, payload);
  return response.data;
};

export const login = async (payload) => {
  const response = await api.post(ENDPOINTS.LOGIN, payload);
  return response.data;
};

export const googleAuth = async (payloadOrToken) => {
  const token =
    typeof payloadOrToken === "string"
      ? payloadOrToken
      : payloadOrToken?.idToken ||
        payloadOrToken?.id_token ||
        payloadOrToken?.credential ||
        payloadOrToken?.token;

  const payload = {
    idToken: token,
    id_token: token,
    credential: token,
    ...(typeof payloadOrToken === "object" ? payloadOrToken : {}),
  };

  const response = await api.post(ENDPOINTS.GOOGLE_AUTH, payload);
  return response.data;
};

export const logout = async (clearCookies) => {
  try {
    await api.post(ENDPOINTS.LOGOUT);
  } finally {
    if (typeof clearCookies === "function") clearCookies();
    window.location.href = "/login";
  }
};

export const refreshToken = async (payload) => {
  return refreshSessionToken(payload);
};

export const forgotPassword = async (payload) => {
  const response = await api.post(ENDPOINTS.FORGOT_PASSWORD, payload);
  return response.data;
};

export const resetPassword = async (payload) => {
  const response = await api.post(ENDPOINTS.RESET_PASSWORD, payload);
  return response.data;
};

export const adminRegister = async (payload, adminSecret) => {
  const response = await api.post(ENDPOINTS.ADMIN_REGISTER, payload, {
    headers: {
      "x-admin-secret": adminSecret,
    },
  });
  return response.data;
};
