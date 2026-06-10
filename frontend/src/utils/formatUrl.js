export function truncateUrl(url, maxLength = 70) {
  if (!url) {
    return "";
  }

  if (url.length <= maxLength) {
    return url;
  }

  return `${url.slice(0, maxLength)}...`;
}