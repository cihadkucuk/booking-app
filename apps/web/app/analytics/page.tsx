export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-4xl font-display">Growth Analytics (Beta)</h1>
        <p className="text-black/60">Meta insights, GA4, and SEO health scoring.</p>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card-surface rounded-2xl p-6">
          <h2 className="text-lg font-semibold">Meta Insights</h2>
          <p className="text-sm text-black/60 mt-2">Feature flag off. Provide Meta credentials to enable.</p>
          <button className="mt-4 px-4 py-2 rounded-full bg-ember text-white">Enable Meta</button>
        </div>
        <div className="card-surface rounded-2xl p-6">
          <h2 className="text-lg font-semibold">Google Analytics</h2>
          <p className="text-sm text-black/60 mt-2">Auth method undecided (Service Account vs OAuth).</p>
          <button className="mt-4 px-4 py-2 rounded-full bg-ink text-white">Choose Auth</button>
        </div>
        <div className="card-surface rounded-2xl p-6">
          <h2 className="text-lg font-semibold">SEO Health Score</h2>
          <p className="text-sm text-black/60 mt-2">Crawler-based checklist with optional Search Console stub.</p>
          <button className="mt-4 px-4 py-2 rounded-full bg-ink text-white">Run Check</button>
        </div>
      </section>
    </div>
  );
}
