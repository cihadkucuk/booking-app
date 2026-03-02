export default function InboxPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-4xl font-display">Unified Inbox</h1>
        <p className="text-black/60">Instagram DMs, website chat, and walk-ins in one place.</p>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card-surface rounded-2xl p-6">
          <h2 className="text-lg font-semibold">Instagram</h2>
          <p className="text-sm text-black/60 mt-2">Meta app exists, permissions pending.</p>
          <button className="mt-4 px-4 py-2 rounded-full bg-ember text-white">Configure Meta</button>
        </div>
        <div className="card-surface rounded-2xl p-6">
          <h2 className="text-lg font-semibold">Website Chat</h2>
          <p className="text-sm text-black/60 mt-2">Chat widget ready for embedding.</p>
          <button className="mt-4 px-4 py-2 rounded-full bg-ink text-white">Copy Widget</button>
        </div>
        <div className="card-surface rounded-2xl p-6">
          <h2 className="text-lg font-semibold">Walk-ins</h2>
          <p className="text-sm text-black/60 mt-2">Log quick walk-ins that become real appointments.</p>
          <button className="mt-4 px-4 py-2 rounded-full bg-ink text-white">New Walk-in</button>
        </div>
      </section>
    </div>
  );
}
