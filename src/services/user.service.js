import { api } from "../api/api";
import { ENDPOINTS } from "../api/endpoints";

/**
 * Fetch profile information for the currently authenticated user.
 */
export const getCurrentUser = async () => {
  const response = await api.get(ENDPOINTS.USER_ME);
  return response.data;
};

/**
 * Update authenticated user details.
 * @param {Object} payload
 */
export const updateCurrentUser = async (payload) => {
  const response = await api.patch(ENDPOINTS.USER_ME, payload);
  return response.data;
};

/**
 * Fetch notification preferences.
 */
export const getNotificationPreferences = async () => {
  const response = await api.get(ENDPOINTS.USER_NOTIFICATION_PREFERENCES);
  return response.data;
};

/**
 * Update notification preferences.
 * @param {Object} payload
 */
export const updateNotificationPreferences = async (payload) => {
  const response = await api.put(
    ENDPOINTS.USER_NOTIFICATION_PREFERENCES,
    payload,
  );
  return response.data;
};

