import axios from "axios";
import { BASE_URL } from "../config/apiConfig";
import { toast } from "react-toastify";
import { refreshSessionToken, normalizeTokens } from "./tokenRefresh";
import { Cookies } from "react-cookie";

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // 60s to handle Render cold starts
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const cookies = new Cookies();
  const token = cookies.get("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.data?.detail === "Invalid or expired token" &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true; // prevent infinite retry loops

      const cookies = new Cookies();
      const storedRefreshToken = cookies.get("refreshToken");

      try {
        const rawResponse = await refreshSessionToken(storedRefreshToken);
        const normalized = normalizeTokens(rawResponse);
        const newAccessToken = normalized.accessToken;
        const newRefreshToken = normalized.refreshToken;

        if (!newAccessToken) {
          throw new Error(
            "Token refresh succeeded, but no accessToken was returned."
          );
        }

        // Save the new accessToken (and rotated refreshToken if present) to cookies
        cookies.set("accessToken", newAccessToken, { path: "/" });
        if (newRefreshToken) {
          cookies.set("refreshToken", newRefreshToken, { path: "/" });
        }

        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.log(refreshError.response?.data?.message);
        toast.error(
          refreshError.response?.data?.message ||
            "Session expired. Please log in again.",
        );
        // Optionally clear cookies and redirect
        cookies.remove("accessToken", { path: "/" });
        cookies.remove("refreshToken", { path: "/" });
        cookies.remove("userData", { path: "/" });
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
