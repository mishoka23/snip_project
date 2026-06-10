import { useState } from "react";

import { createShortLink } from "../api/linksApi";
import { formatApiError } from "../utils/formatError";
import { truncateUrl } from "../utils/formatUrl";
import QRModal from "./QRModal";

function ShortenForm() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [copyMessage, setCopyMessage] = useState("");

  const validateUrl = (value) => {
    if (!value.trim()) {
      return "Please enter a URL.";
    }

    try {
      const parsedUrl = new URL(value);

      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        return "Only HTTP and HTTPS URLs are allowed.";
      }

      return "";
    } catch {
      return "Please enter a valid URL.";
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErrorMessage("");
    setCopyMessage("");

    const validationError = validateUrl(originalUrl);

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    try {
      setIsSubmitting(true);

      const data = await createShortLink({
        original_url: originalUrl.trim(),
      });

      setResult(data);
      setOriginalUrl("");
    } catch (error) {
      setErrorMessage(formatApiError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = async () => {
    if (!result?.short_url) {
      return;
    }

    await navigator.clipboard.writeText(result.short_url);
    setCopyMessage("Copied.");
  };

  return (
    <div className="mx-auto w-full max-w-3xl">
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="url"
            value={originalUrl}
            onChange={(event) => setOriginalUrl(event.target.value)}
            placeholder="Paste your long URL here..."
            className="min-h-11 flex-1 rounded border border-gray-300 px-4 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="min-h-11 rounded bg-indigo-600 px-6 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
          >
            {isSubmitting ? "Shortening..." : "Shorten"}
          </button>
        </div>

        {errorMessage && (
          <p className="mt-3 text-sm text-red-600">{errorMessage}</p>
        )}
      </form>

      {result && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Your short link</p>

          <a
            href={result.short_url}
            target="_blank"
            rel="noreferrer"
            className="mt-2 block break-all text-xl font-semibold text-indigo-600 hover:underline"
          >
            {result.short_url}
          </a>

          <p
            title={result.original_url}
            className="mt-2 text-sm text-gray-600"
          >
            Original: {truncateUrl(result.original_url)}
          </p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleCopy}
              className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Copy
            </button>

            <button
              type="button"
              onClick={() => setIsQrOpen(true)}
              className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              QR Code
            </button>
          </div>

          {copyMessage && (
            <p className="mt-3 text-sm text-green-600">{copyMessage}</p>
          )}
        </div>
      )}

      {isQrOpen && (
        <QRModal
          shortUrl={result?.short_url}
          onClose={() => setIsQrOpen(false)}
        />
      )}
    </div>
  );
}

export default ShortenForm;