import { api } from "../api/api";
import { ENDPOINTS } from "../api/endpoints";

/**
 * Fetch top-level dashboard insights and overview stats.
 */
export const getDashboardInsights = async () => {
  const response = await api.get(ENDPOINTS.DASHBOARD);
  return response.data;
};

/**
 * Fetch analytics summary data.
 */
export const getAnalyticsSummary = async () => {
  const response = await api.get(ENDPOINTS.ANALYTICS_SUMMARY);
  return response.data;
};

