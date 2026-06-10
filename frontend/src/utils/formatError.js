export function formatApiError(error) {
  const data = error.response?.data;

  if (!data) {
    return error.message || "Something went wrong. Please try again.";
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

  const fieldErrors = Object.entries(data)
    .map(([field, messages]) => {
      if (Array.isArray(messages)) {
        return `${field}: ${messages.join(" ")}`;
      }

      return `${field}: ${messages}`;
    })
    .join(" ");

  return fieldErrors || "Something went wrong. Please try again.";
}