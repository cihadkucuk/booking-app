import Link from "next/link";

const navItems = [
  { href: "/", label: "Overview" },
  { href: "/calendar", label: "Calendar" },
  { href: "/inbox", label: "Inbox" },
  { href: "/clients", label: "Clients" },
  { href: "/finance", label: "Finance" },
  { href: "/analytics", label: "Growth Analytics" },
  { href: "/settings", label: "Studio Settings" }
];

export function Sidebar() {
  return (
    <aside className="w-72 p-6 border-r border-black/10 bg-white/70 backdrop-blur">
      <div className="mb-10">
        <div className="text-4xl font-display tracking-wide">StudioOS</div>
        <div className="text-sm uppercase tracking-[0.2em] text-black/50">Soul Tattoo Atelier</div>
      </div>
      <nav className="space-y-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block text-lg font-medium text-black/80 hover:text-ember transition"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="mt-12 p-4 rounded-xl card-surface">
        <div className="text-sm font-semibold">Feature Flags</div>
        <div className="text-xs text-black/60">Stripe, Meta, Notion disabled</div>
      </div>
    </aside>
  );
}
