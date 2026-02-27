import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <section className="card max-w-xl space-y-4 p-8">
        <p className="text-xs uppercase tracking-[0.25em] text-ink/60">White Label Platform</p>
        <h1 className="text-3xl font-semibold leading-tight">Single-core booking for beauty and body studios</h1>
        <p className="text-sm text-ink/70">
          Multi-staff calendar, inbox, deposits, and smart shopping suggestions with tenant-aware branding.
        </p>
        <div className="flex gap-3">
          <Link className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-white" href="/login">
            Login
          </Link>
          <Link className="rounded-full border border-ink/15 px-5 py-2 text-sm" href="/dashboard">
            Open App
          </Link>
        </div>
      </section>
    </main>
  );
}

