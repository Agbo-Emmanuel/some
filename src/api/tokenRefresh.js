import axios from "axios";
import { BASE_URL } from "../config/apiConfig";
import { ENDPOINTS } from "./endpoints";

export function normalizeTokens(data = {}) {
  const raw =
    data?.data &&
    (data.data.accessToken !== undefined ||
      data.data.access_token !== undefined ||
      data.data.refreshToken !== undefined ||
      data.data.refresh_token !== undefined)
      ? data.data
      : data;

  const out = {
    accessToken: raw?.accessToken ?? raw?.access_token ?? null,
    refreshToken: raw?.refreshToken ?? raw?.refresh_token ?? null,
    accessTokenExpiresAt:
      raw?.accessTokenExpiresAt ?? raw?.access_token_expires_at ?? null,
    refreshTokenExpiresAt:
      raw?.refreshTokenExpiresAt ?? raw?.refresh_token_expires_at ?? null,
    user: raw?.user ?? raw?.userData ?? null,
  };

  if (raw?.accessToken && raw?.access_token && raw.accessToken !== raw.access_token) {
    console.warn("[token] camelCase/snake_case disagreement", {
      camel: !!raw.accessToken,
      snake: !!raw.access_token,
    });
  }

  return out;
}

export async function refreshSessionToken(refreshTokenOrPayload) {
  const token =
    typeof refreshTokenOrPayload === "object" && refreshTokenOrPayload !== null
      ? refreshTokenOrPayload.refreshToken || refreshTokenOrPayload.refresh_token
      : refreshTokenOrPayload;

  const res = await axios.post(`${BASE_URL}${ENDPOINTS.REFRESH_TOKEN}`, {
    refreshToken: token,
  });

  console.debug("[token] raw refresh response:", res.data);
  return res.data;
}
