import ShortenForm from "../components/ShortenForm";
import { createLink } from "../api/linksApi";

function HomePage() {
  const handleCreateLink = async (payload) => {
    const data = await createLink(payload);
    return data;
  };

  return (
    <main className="min-h-[calc(100vh-73px)] bg-gray-50 px-4 py-16">
      <section className="mx-auto max-w-5xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Shorten your links, share anything
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600">
          Create short URLs in seconds and share them anywhere.
        </p>

        <div className="mt-10">
          <ShortenForm onCreateLink={handleCreateLink} />
        </div>
      </section>
    </main>
  );
}

export default HomePage;