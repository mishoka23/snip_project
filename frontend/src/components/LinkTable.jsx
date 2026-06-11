function LinkTable({ links, isLoading, onDeleteLink }) {
  const copyToClipboard = async (value) => {
    await navigator.clipboard.writeText(value);
  };

  if (isLoading) {
    return <p className="text-sm text-gray-500">Loading links...</p>;
  }

  if (!links.length) {
    return (
      <div className="rounded-md border border-dashed p-6 text-center text-sm text-gray-500">
        You do not have any links yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b text-gray-500">
            <th className="py-3 pr-4 font-medium">Short URL</th>
            <th className="py-3 pr-4 font-medium">Original URL</th>
            <th className="py-3 pr-4 font-medium">Clicks</th>
            <th className="py-3 pr-4 font-medium">Created</th>
            <th className="py-3 pr-4 text-right font-medium">Actions</th>
          </tr>
        </thead>

        <tbody>
          {links.map((link) => (
            <tr key={link.slug} className="border-b last:border-b-0">
              <td className="py-3 pr-4">
                <a
                  href={link.short_url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-indigo-600 hover:underline"
                >
                  {link.short_url}
                </a>
              </td>

              <td className="max-w-md py-3 pr-4">
                <span
                  title={link.original_url}
                  className="block truncate text-gray-700"
                >
                  {link.original_url}
                </span>
              </td>

              <td className="py-3 pr-4">
                <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                  {link.click_count ?? 0}
                </span>
              </td>

              <td className="py-3 pr-4 text-gray-600">
                {new Date(link.created_at).toLocaleString()}
              </td>

              <td className="py-3 text-right">
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(link.short_url)}
                    className="rounded-md border px-3 py-1 text-xs hover:bg-gray-50"
                  >
                    Copy
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteLink(link.slug)}
                    className="rounded-md border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LinkTable;