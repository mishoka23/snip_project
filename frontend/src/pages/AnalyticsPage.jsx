import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { getLinkAnalytics } from "../api/linksApi";

import NotFoundPage from "./NotFoundPage";

function AnalyticsPage() {
  const { slug } = useParams();

  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function loadAnalytics() {
      if (!slug) {
        setErrorMessage("Link slug is missing.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage("");

        const data = await getLinkAnalytics(slug);

        setAnalytics(data);
      } catch (error) {
    if (error.response?.status === 404) {
      setNotFound(true);
      return;
    }

    setErrorMessage(
      error.response?.data?.message ||
        error.response?.data?.detail ||
        error.message ||
        "Unable to load analytics.",
    );
  } finally {
        setIsLoading(false);
      }
    }

    loadAnalytics();
  }, [slug]);

  if (isLoading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8">
        <p className="text-sm text-gray-500">Loading analytics...</p>
      </main>
    );
  }

  if (notFound) {
    return <NotFoundPage />;
  }

  if (errorMessage) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Breadcrumb slug={slug} />

        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {errorMessage}
        </div>
      </main>
    );
  }

  if (!analytics) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Breadcrumb slug={slug} />

        <EmptyState message="No analytics data is available." />
      </main>
    );
  }

  const linkData = analytics.link ?? {};

  const totalClicks = analytics.summary?.total_clicks ?? 0;

  const clicksByDay = normalizeDailyClicks(
    analytics.clicks_per_day ?? [],
  );

  const topReferrers = analytics.top_referrers ?? [];

  const topLocations = analytics.top_countries ?? [];



  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <Breadcrumb slug={slug} />

      <header className="mt-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Analytics
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Link: {linkData.slug ?? slug}
        </p>

        {linkData.original_url && (
          <p
            title={linkData.original_url}
            className="mt-2 max-w-3xl truncate text-sm text-gray-600"
          >
            {linkData.original_url}
          </p>
        )}
      </header>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total clicks"
          value={totalClicks}
        />

        <StatCard
          label="Unique visitors"
          value={"Not implemented"}
          // value={
          //   analytics.unique_visitors === null ||
          //   analytics.unique_visitors === undefined
          //     ? "Not available"
          //     : analytics.unique_visitors
          // }
        />

        <StatCard
          label="Created"
          value={formatDate(linkData.created_at)}
        />
      </section>

      <section className="mt-8 rounded-xl border bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Clicks in the last 30 days
        </h2>

        {clicksByDay.length === 0 ? (
          <EmptyState message="No click data is available for this link yet." />
        ) : (
          <div className="mt-6 overflow-x-auto">
            <div className="h-80 min-w-[650px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={clicksByDay}
                  margin={{
                    top: 10,
                    right: 20,
                    left: 0,
                    bottom: 10,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis
                    dataKey="displayDate"
                    tick={{ fontSize: 12 }}
                  />

                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12 }}
                  />

                  <Tooltip
                    labelFormatter={(label) => `Date: ${label}`}
                    formatter={(value) => [value, "Clicks"]}
                  />

                  <Line
                    type="monotone"
                    dataKey="clicks"
                    stroke="currentColor"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <AnalyticsList
          title="Top referrers"
          items={topReferrers.map((item) => ({
            label: item.referrer || "Direct",
            value: item.clicks ?? item.count ?? 0,
          }))}
          emptyMessage="No referrer data is available."
        />

        <AnalyticsList
          title="Top locations"
          items={topLocations.map((item) => ({
            label:
              item.country ||
              item.country_code ||
              "Unknown location",
            value: item.clicks ?? item.count ?? 0,
          }))}
          emptyMessage="No location data is available."
        />
      </section>
    </main>
  );
}

function Breadcrumb({ slug }) {
  return (
    <nav className="text-sm text-gray-500">
      <Link
        to="/dashboard"
        className="font-medium text-indigo-600 hover:underline"
      >
        Dashboard
      </Link>

      <span className="mx-2">/</span>
      <span>{slug ?? "Analytics"}</span>
    </nav>
  );
}

function StatCard({ label, value }) {
  return (
    <article className="rounded-xl border bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-gray-900">
        {value}
      </p>
    </article>
  );
}

function AnalyticsList({
  title,
  items,
  emptyMessage,
}) {
  return (
    <article className="rounded-xl border bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">
        {title}
      </h2>

      {items.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <ul className="mt-4 divide-y">
          {items.slice(0, 5).map((item, index) => (
            <li
              key={`${item.label}-${index}`}
              className="flex items-center justify-between gap-4 py-3"
            >
              <span
                title={item.label}
                className="truncate text-sm text-gray-700"
              >
                {item.label}
              </span>

              <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                {item.value}
              </span>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

function EmptyState({ message }) {
  return (
    <div className="mt-4 rounded-lg border border-dashed bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
      {message}
    </div>
  );
}

function normalizeDailyClicks(items) {
  return items.map((item) => ({
    date: item.date,
    displayDate: formatChartDate(item.date),
    clicks: item.clicks ?? item.count ?? 0,
  }));
}

function formatDate(value) {
  if (!value) {
    return "Unknown";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatChartDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

export default AnalyticsPage;