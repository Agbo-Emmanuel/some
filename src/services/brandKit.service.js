import { api } from "../api/api";
import { ENDPOINTS } from "../api/endpoints";

export const getBrandKit = async () => {
  const response = await api.get(ENDPOINTS.GET_BRAND_KIT);
  return response.data;
};

export const updateBrandKit = async (payload) => {
  const response = await api.put(ENDPOINTS.UPDATE_BRAND_KIT, payload);
  return response.data;
};
//update brand kit req.body
// {
//   "primaryColor": "string",
//   "secondaryColor": "string",
//   "font": "string",
//   "tagline": "string",
//   "socialLinks": "string"
// }
