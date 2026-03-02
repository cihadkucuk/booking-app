export default function FinancePage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-4xl font-display">Finance Overview</h1>
        <p className="text-black/60">Revenue by artist and upcoming deposits grouped by currency.</p>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-surface rounded-2xl p-6">
          <h2 className="text-lg font-semibold">Revenue by artist</h2>
          <p className="text-sm text-black/60 mt-2">CZK and EUR totals separated without conversion.</p>
        </div>
        <div className="card-surface rounded-2xl p-6">
          <h2 className="text-lg font-semibold">Upcoming deposits</h2>
          <p className="text-sm text-black/60 mt-2">Session bookings waiting for payment.</p>
        </div>
      </section>

      <section className="card-surface rounded-2xl p-6">
        <h2 className="text-lg font-semibold">Expenses</h2>
        <button className="mt-4 px-4 py-2 rounded-full bg-ink text-white">Log Expense</button>
      </section>
    </div>
  );
}
