import { useParams } from "react-router-dom";

function AnalyticsPage() {
  const { slug } = useParams();

  return (
    <main>
      <h1>Analytics</h1>
      <p>Analytics for link: {slug}</p>
    </main>
  );
}

export default AnalyticsPage;