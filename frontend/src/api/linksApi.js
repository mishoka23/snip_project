import apiClient from "./client";

export async function createShortLink(payload) {
  const response = await apiClient.post("/links/", payload);
  return response.data;
}