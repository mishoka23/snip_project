export function formatApiError(error) {
  const data = error.response?.data;
  const status = error.response?.status;

  if (!data) {
    return "Network error. Check if the backend server is running.";
  }

  if (status === 429) {
    const retryAfter = Number(
      error.response?.headers?.["retry-after"],
    );  

    if (Number.isFinite(retryAfter) && retryAfter > 0) {
      if (retryAfter >= 3600) {
        const hours = Math.ceil(retryAfter / 3600);

        return `You have reached the anonymous link limit. Please try again in about ${hours} hour${
          hours === 1 ? "" : "s"
        }, or sign in to continue.`;
      }

      const minutes = Math.ceil(retryAfter / 60);

      return `You have reached the anonymous link limit. Please try again in about ${minutes} minute${
        minutes === 1 ? "" : "s"
      }, or sign in to continue.`;
    }

    return "You have reached the anonymous link limit. Please try again later or sign in to continue.";
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