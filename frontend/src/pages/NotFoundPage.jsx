import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">
          Error 404
        </p>

        <h1 className="mt-3 text-4xl font-bold text-gray-900">
          Page not found
        </h1>

        <p className="mt-4 text-gray-500">
          The page you are looking for does not exist or may have been removed.
        </p>

        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Return to home
        </Link>
      </div>
    </main>
  );
}

export default NotFoundPage;