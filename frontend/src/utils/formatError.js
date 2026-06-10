export function formatApiError(error) {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.response?.data?.original_url) {
    return error.response.data.original_url[0];
  }

  if (error.response?.data?.detail) {
    return error.response.data.detail;
  }

  if (error.message) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}