import { api } from "../api/api";
import { ENDPOINTS } from "../api/endpoints";

/**
 * Submit waitlist registration.
 * @param {Object} payload - { email, ... }
 */
export const joinWaitlist = async (payload) => {
  const response = await api.post(ENDPOINTS.PUBLIC_WAITLIST, payload);
  return response.data;
};

/**
 * Submit public contact form.
 * @param {Object} payload - { name, email, message, ... }
 */
export const submitContactForm = async (payload) => {
  const response = await api.post(ENDPOINTS.PUBLIC_CONTACT, payload);
  return response.data;
};

