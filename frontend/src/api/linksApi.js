import apiClient from "./apiClient";

export async function createLink(payload) {
  const response = await apiClient.post("/links/", payload);
  return response.data;
}

export async function getLinks(page = 1) {
  const response = await apiClient.get(`/links/?page=${page}`);
  return response.data;
}

export async function getLink(slug) {
  const response = await apiClient.get(`/links/${slug}/`);
  return response.data;
}

export async function deleteLink(slug) {
  const response = await apiClient.delete(`/links/${slug}/`);
  return response.data;
}