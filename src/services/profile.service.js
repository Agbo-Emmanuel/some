import { api } from "../api/api";
import { ENDPOINTS } from "../api/endpoints";

export const createUserProfile = async (payload) => {
  const response = await api.post(ENDPOINTS.CREATE_USER_PROFILE, payload);
  return response.data;
};
//create user profile req.body
// {
//   "companyName": "string",
//   "industry": "string",
//   "description": "string",
//   "logoUrl": "string"
// }
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

export const createAiProfile = async (payload) => {
  const response = await api.post(ENDPOINTS.CREATE_AI_PROFILE, payload);
  return response.data;
};
//create ai profile response
// {
//   "mission": "string",
//   "vision": "string",
//   "competitiveAdvantage": "string",
//   "targetAudience": "string"
// }
