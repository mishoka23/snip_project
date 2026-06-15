import { useEffect, useState } from "react";

import ShortenForm from "../components/ShortenForm";
import LinkTable from "../components/LinkTable";
import { createLink, deleteLink, getLinks } from "../api/linksApi";
import { formatApiError } from "../utils/formatError";

function DashboardPage() {
  const [linksData, setLinksData] = useState({
    count: 0,
    next: null,
    previous: null,
    results: [],
  });

  const [page, setPage] = useState(1);
  const [isLoadingLinks, setIsLoadingLinks] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadLinks = async (targetPage = page) => {
    setIsLoadingLinks(true);
    setErrorMessage("");

    try {
      const data = await getLinks(targetPage);
      setLinksData(data);
      setPage(targetPage);
    } catch (error) {
      setErrorMessage(formatApiError(error));
    } finally {
      setIsLoadingLinks(false);
    }
  };

  useEffect(() => {
    loadLinks(1);
  }, []);

  const handleCreateLink = async (payload) => {
  const data = await createLink(payload);
  await loadLinks(1);
  return data;
  };

  const handleDeleteLink = async (slug) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${slug}" ?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteLink(slug);
      await loadLinks(page);
    } catch (error) {
      setErrorMessage(formatApiError(error));
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h1 className="mb-2 text-2xl font-semibold text-gray-900">
            Dashboard
          </h1>

          <p className="mb-6 text-sm text-gray-500">
            Create and manage your shortened links.
          </p>

          <ShortenForm onCreateLink={handleCreateLink} />
        </section>

        <section className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Your Links
              </h2>

              <p className="text-sm text-gray-500">
                {linksData.count} saved links
              </p>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          <LinkTable
            links={linksData.results}
            isLoading={isLoadingLinks}
            onDeleteLink={handleDeleteLink}
          />

          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              disabled={!linksData.previous || isLoadingLinks}
              onClick={() => loadLinks(page - 1)}
              className="rounded-md border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>

            <span className="text-sm text-gray-500">Page {page}</span>

            <button
              type="button"
              disabled={!linksData.next || isLoadingLinks}
              onClick={() => loadLinks(page + 1)}
              className="rounded-md border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

export default DashboardPage;