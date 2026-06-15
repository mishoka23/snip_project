import { useState } from "react";

import { formatApiError } from "../utils/formatError";

function ShortenForm({ onCreateLink }) {
  const [originalUrl, setOriginalUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErrorMessage("");
    setResult(null);

    const trimmedAlias = customAlias.trim();

    if (trimmedAlias.length > 8) {
      setErrorMessage("Custom alias cannot be longer than 8 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        original_url: originalUrl,
      };

      if (trimmedAlias) {
        payload.custom_alias = trimmedAlias;
      }

      const data = await onCreateLink(payload);

      setResult(data);
      setOriginalUrl("");
      setCustomAlias("");

    } catch (error) {
      setErrorMessage(formatApiError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="original-url"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Long URL
          </label>

          <input
            id="original-url"
            type="url"
            value={originalUrl}
            onChange={(event) => setOriginalUrl(event.target.value)}
            placeholder="https://example.com/very-long-url"
            required
            className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label
            htmlFor="custom-alias"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Custom alias optional
          </label>

          <input
            id="custom-alias"
            type="text"
            value={customAlias}
            onChange={(event) => setCustomAlias(event.target.value)}
            placeholder="my-link"
            maxLength={20}
            className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-indigo-500"
          />
        </div>

        {errorMessage && (
          <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {result && (
          <div className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">
            Created: {result.short_url}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Creating..." : "Shorten URL"}
        </button>
      </form>
    </div>
  );
}

export default ShortenForm;