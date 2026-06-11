import apiClient from "./apiClient";

export async function getLinkAnalytics(slug) {
  const response = await apiClient.get(`/links/${slug}/analytics/`);
  return response.data;
}