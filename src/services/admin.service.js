import { api } from "../api/api";
import { ENDPOINTS } from "../api/endpoints";

export const getAdminOverview = async () => {
  const response = await api.get(ENDPOINTS.ADMIN_OVERVIEW);
  return response.data;
};

export const getAdminUsers = async (params = {}) => {
  const response = await api.get(ENDPOINTS.ADMIN_USERS, { params });
  return response.data;
};

export const getAdminUserById = async (id) => {
  const response = await api.get(ENDPOINTS.ADMIN_USER_BY_ID(id));
  return response.data;
};

export const deleteAdminUser = async (id) => {
  const response = await api.delete(ENDPOINTS.ADMIN_USER_BY_ID(id));
  return response.data;
};

export const updateAdminUserStatus = async (id, payload) => {
  const response = await api.patch(ENDPOINTS.ADMIN_USER_STATUS(id), payload);
  return response.data;
};

export const getAdminDocuments = async (params = {}) => {
  const response = await api.get(ENDPOINTS.ADMIN_DOCUMENTS, { params });
  return response.data;
};

export const getAdminGenerations = async (params = {}) => {
  const response = await api.get(ENDPOINTS.ADMIN_GENERATIONS, { params });
  return response.data;
};

export const getAdminAiUsage = async (params = {}) => {
  const response = await api.get(ENDPOINTS.ADMIN_AI_USAGE, { params });
  return response.data;
};

export const getAdminSystemHealth = async () => {
  const response = await api.get(ENDPOINTS.ADMIN_SYSTEM_HEALTH);
  return response.data;
};

