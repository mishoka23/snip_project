export function formatApiError(error) {
  const data = error.response?.data;

  if (!data) {
    return "Network error. Check if the backend server is running.";
  }

  if (typeof data === "string") {
    return data;
  }

  if (data.message) {
    return data.message;
  }

  if (data.detail) {
    return data.detail;
  }

  if (typeof data === "object") {
    const firstError = Object.values(data)[0];

    if (Array.isArray(firstError)) {
      return firstError[0];
    }

    if (typeof firstError === "string") {
      return firstError;
    }
  }

  return "Something went wrong. Please try again.";
}