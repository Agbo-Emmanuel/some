import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { toast } from "react-toastify";
import { googleAuth } from "../../services/auth.service";
import { normalizeTokens } from "../../api/tokenRefresh";
import { HiExclamationTriangle, HiXMark } from "react-icons/hi2";

/**
 * Safely parse a JWT without requiring external libraries.
 */
function parseJwt(token) {
  try {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.warn("[GoogleAuth] Failed to parse JWT payload:", err);
    return null;
  }
}

/**
 * Native, resilient Google authentication button component.
 * Integrates with @react-oauth/google and sends ID token to /api/v1/auth/google.
 *
 * @param {Object} props
 * @param {"signin" | "signup"} [props.mode="signin"] - Context for Google prompt
 * @param {boolean} [props.useOneTap=false] - Optional One Tap login activation
 * @param {() => void} [props.onSuccessCallback] - Optional callback on success
 */
const GoogleAuthButton = ({
  mode = "signin",
  useOneTap = false,
  onSuccessCallback,
}) => {
  const navigate = useNavigate();
  const [, setCookie] = useCookies(["accessToken", "refreshToken", "userData"]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const configuredClientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    "1097872418993-1ki83r398ukrccj70g3hglcdj73q5o08.apps.googleusercontent.com";

  const handleGoogleSuccess = async (credentialResponse) => {
    const rawToken = credentialResponse?.credential;

    if (!rawToken) {
      const msg =
        "Google authentication did not return a valid credential token.";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    // Pre-flight token inspection
    const decodedToken = parseJwt(rawToken);
    if (import.meta.env.DEV) {
      console.log("[GoogleAuth] Received Google credential response:", {
        currentOrigin: window.location.origin,
        configuredClientId,
        tokenAudience: decodedToken?.aud,
        tokenIssuer: decodedToken?.iss,
        email: decodedToken?.email,
        expiresAt: decodedToken?.exp
          ? new Date(decodedToken.exp * 1000).toLocaleTimeString()
          : "unknown",
      });
    }

    // Client-side audience verification check
    if (decodedToken?.aud && configuredClientId) {
      if (decodedToken.aud !== configuredClientId) {
        console.warn(
          `[GoogleAuth] Audience mismatch! Token aud: ${decodedToken.aud}, Configured: ${configuredClientId}`
        );
      }
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      // Send the Google ID token (JWT) to the backend endpoint
      const response = await googleAuth({
        idToken: rawToken,
        credential: rawToken,
      });

      if (import.meta.env.DEV) {
        console.log("[GoogleAuth] Backend auth response:", response);
      }

      // Extract access and refresh tokens from backend response
      const normalized = normalizeTokens(response);
      const accessToken = normalized.accessToken;
      const refreshToken = normalized.refreshToken;
      const user = normalized.user;

      const isNewUser =
        response?.isNewUser ||
        response?.data?.isNewUser ||
        response?.isNewProfile ||
        false;

      if (!accessToken) {
        throw new Error(
          "Authentication succeeded, but no session token was returned by the server."
        );
      }

      // Store tokens using application session cookie strategy
      const cookieOptions = {
        path: "/",
        sameSite: "lax",
        secure: window.location.protocol === "https:",
      };

      setCookie("accessToken", accessToken, cookieOptions);
      if (refreshToken) {
        setCookie("refreshToken", refreshToken, cookieOptions);
      }
      if (user) {
        setCookie("userData", user, cookieOptions);
      }

      toast.success(
        mode === "signup"
          ? "Account created and signed in with Google!"
          : "Signed in with Google successfully!"
      );

      if (onSuccessCallback) {
        onSuccessCallback(response);
      } else if (isNewUser) {
        navigate("/onboarding");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("[GoogleAuth] Backend verification error:", error);

      let friendlyError = "Failed to sign in with Google. Please try again.";

      if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
        friendlyError =
          "Unable to reach the Ahiia authentication server. Please check your internet connection.";
      } else if (error.response?.data) {
        const data = error.response.data;

        // If backend returns INVALID_GOOGLE_TOKEN
        if (data.code === "INVALID_GOOGLE_TOKEN") {
          friendlyError =
            "Google sign-in could not be verified by the backend. Ensure your Google token audience matches the server's configured client ID.";
        } else if (typeof data === "string") {
          friendlyError = data;
        } else if (data.message) {
          friendlyError = data.message;
        } else if (data.error) {
          friendlyError =
            typeof data.error === "string"
              ? data.error
              : data.error.message || friendlyError;
        } else if (data.detail) {
          friendlyError = data.detail;
        }
      } else if (error.response?.status === 401) {
        friendlyError =
          "Google authentication was rejected by the server (401 Unauthorized).";
      } else if (error.response?.status >= 500) {
        friendlyError =
          "An unexpected server error occurred during Google verification. Please try again later.";
      } else if (error.message) {
        friendlyError = error.message;
      }

      setErrorMessage(friendlyError);
      toast.error(friendlyError);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    const currentOrigin = window.location.origin;
    console.warn(
      `[GoogleAuth] Google login failed or popup was closed. Current origin: ${currentOrigin}`
    );

    const msg =
      "Google authentication was not completed. If you see 'The given origin is not allowed' in the console, add " +
      currentOrigin +
      " to Authorized JavaScript origins in Google Cloud Console.";

    setErrorMessage(msg);
    toast.error(
      "Google sign-in was cancelled or origin was rejected. Check console for details."
    );
  };

  return (
    <div className="w-full space-y-3">
      {/* Inline Form-Level Error State */}
      {errorMessage && (
        <div
          role="alert"
          className="flex items-start justify-between gap-2.5 rounded-xl border border-red-200 bg-red-50/90 p-3 text-xs text-red-800 transition-all animate-in fade-in"
        >
          <div className="flex items-start gap-2">
            <HiExclamationTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
            <span className="font-medium leading-relaxed">{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-red-500 hover:text-red-700 p-0.5 rounded transition-colors cursor-pointer"
            aria-label="Dismiss error"
          >
            <HiXMark className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Google Login Control Container */}
      <div className="relative w-full">
        <div
          className={`w-full flex justify-center items-center rounded-xl overflow-hidden transition-opacity ${
            loading ? "opacity-50 pointer-events-none" : "opacity-100"
          } [&>div]:w-full [&>div>iframe]:!w-full [&>div>iframe]:!min-w-full`}
        >
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="outline"
            size="large"
            shape="rectangular"
            text={mode === "signup" ? "signup_with" : "continue_with"}
            width="100%"
            useOneTap={useOneTap}
            context={mode === "signup" ? "signup" : "signin"}
          />
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-xl bg-white/90 backdrop-blur-xs border border-slate-200 text-xs font-semibold text-slate-700 shadow-xs">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
            <span>Verifying Google account...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleAuthButton;
