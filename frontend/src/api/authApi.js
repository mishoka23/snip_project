import Client, { TOKEN_STORAGE_KEYS } from "./client";

export async function registerUser(formData) {
  const response = await apiClient.post("/auth/register/", formData);
  return response.data;
}

export async function loginUser(credentials) {
  const response = await apiClient.post("/auth/token/", credentials);

  localStorage.setItem(TOKEN_STORAGE_KEYS.access, response.data.access);
  localStorage.setItem(TOKEN_STORAGE_KEYS.refresh, response.data.refresh);

  return response.data;
}

export function logoutUser() {
  localStorage.removeItem(TOKEN_STORAGE_KEYS.access);
  localStorage.removeItem(TOKEN_STORAGE_KEYS.refresh);
}