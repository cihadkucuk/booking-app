export default function ClientsPage() {
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display">Clients</h1>
          <p className="text-black/60">Manage client profiles and histories.</p>
        </div>
        <button className="px-4 py-2 rounded-full bg-ink text-white">Add Client</button>
      </header>

      <div className="card-surface rounded-2xl p-6">
        <div className="text-sm uppercase tracking-[0.2em] text-black/50">Recent clients</div>
        <ul className="mt-4 space-y-3 text-sm">
          <li>Petra V. - Last visit: 2 days ago</li>
          <li>Marek N. - Last visit: 1 week ago</li>
          <li>Klara S. - Last visit: 3 weeks ago</li>
        </ul>
      </div>
    </div>
  );
}
