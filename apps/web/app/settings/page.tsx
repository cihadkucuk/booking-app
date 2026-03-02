export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-display">Studio Settings</h1>
        <p className="text-black/60">Manage artists, services, stations, and feature flags.</p>
      </header>

      <section className="card-surface rounded-2xl p-6">
        <h2 className="text-xl font-semibold">Artists</h2>
        <p className="text-sm text-black/60 mt-2">Invite artists and assign roles.</p>
        <button className="mt-4 px-4 py-2 rounded-full bg-ink text-white">Add Artist</button>
      </section>

      <section className="card-surface rounded-2xl p-6">
        <h2 className="text-xl font-semibold">Services</h2>
        <p className="text-sm text-black/60 mt-2">Consultations are free, sessions require deposits.</p>
        <button className="mt-4 px-4 py-2 rounded-full bg-ink text-white">Add Service</button>
      </section>

      <section className="card-surface rounded-2xl p-6">
        <h2 className="text-xl font-semibold">Stations</h2>
        <p className="text-sm text-black/60 mt-2">Station assignment is optional for session bookings.</p>
        <button className="mt-4 px-4 py-2 rounded-full bg-ink text-white">Add Station</button>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-surface rounded-2xl p-6">
          <h2 className="text-xl font-semibold">Currencies</h2>
          <p className="text-sm text-black/60 mt-2">Supported currencies: CZK, EUR.</p>
        </div>
        <div className="card-surface rounded-2xl p-6">
          <h2 className="text-xl font-semibold">Feature Flags</h2>
          <p className="text-sm text-black/60 mt-2">Stripe, Meta, Notion, GA, SEO are disabled by default.</p>
          <button className="mt-4 px-4 py-2 rounded-full bg-ember text-white">Manage Flags</button>
        </div>
      </section>
    </div>
  );
}
