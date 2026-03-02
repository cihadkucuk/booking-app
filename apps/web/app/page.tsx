export default function HomePage() {
  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-5xl font-display">StudioOS Dashboard</h1>
          <p className="text-black/60">Live pulse of Soul Tattoo Atelier.</p>
        </div>
        <div className="text-sm uppercase tracking-[0.2em] text-black/50">Week View</div>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[
          { label: "Upcoming Deposits", value: "CZK 24,000" },
          { label: "Revenue This Week", value: "CZK 86,500" },
          { label: "New Conversations", value: "18" }
        ].map((card) => (
          <div key={card.label} className="card-surface rounded-2xl p-6 shadow-sm">
            <div className="text-sm uppercase tracking-[0.2em] text-black/50">{card.label}</div>
            <div className="text-3xl font-semibold mt-4">{card.value}</div>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-surface rounded-2xl p-6">
          <div className="text-lg font-semibold">Today at a glance</div>
          <ul className="mt-4 space-y-3 text-sm text-black/70">
            <li>10:00 - Marek Novak / Session / Station 2</li>
            <li>12:00 - Walk-in / Consultation / Station TBD</li>
            <li>15:00 - Klara V / Piercing / Station 1</li>
          </ul>
        </div>
        <div className="card-surface rounded-2xl p-6">
          <div className="text-lg font-semibold">Inbox pulse</div>
          <p className="mt-3 text-sm text-black/70">Instagram and web chat are ready. Meta permissions still pending.</p>
          <button className="mt-6 px-4 py-2 rounded-full bg-ember text-white text-sm">Open Inbox</button>
        </div>
      </section>
    </div>
  );
}
