import { api } from "../api/api";
import { ENDPOINTS } from "../api/endpoints";

export const createUserProfile = async (payload) => {
  const response = await api.post(ENDPOINTS.CREATE_USER_PROFILE, payload);
  return response.data;
};

export const getUserProfile = async () => {
  const response = await api.get(ENDPOINTS.GET_USER_PROFILE);
  return response.data;
};

/**
 * Update a single profile field.
 * @param {string} field  - path param, e.g. "mission", "vision", "competitiveAdvantage", "targetAudience"
 * @param {string} action - e.g. "update"
 * @param {string} value  - the new content
 */
export const updateUserProfile = async (field, action, value) => {
  const response = await api.patch(
    `${ENDPOINTS.UPDATE_USER_PROFILE}/${field}`,
    { action, value },
  );
  return response.data;
};

/**
 * Update general business context in the company profile.
 * @param {Object} payload
 */
export const updateBusinessContext = async (payload) => {
  const response = await api.patch(
    ENDPOINTS.PROFILE_BUSINESS_CONTEXT,
    payload,
  );
  return response.data;
};

export const patchUserProfile = async (payload) => {
  const response = await api.patch(ENDPOINTS.UPDATE_USER_PROFILE, payload);
  return response.data;
};

export const createAiProfile = async (payload) => {
  const response = await api.post(ENDPOINTS.CREATE_AI_PROFILE, payload);
  return response.data;
};
