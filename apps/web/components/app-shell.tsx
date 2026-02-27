"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./auth-provider";

const navItems = [
  { href: "/dashboard", label: "Owner Dashboard" },
  { href: "/my-calendar", label: "My Calendar" },
  { href: "/shopping", label: "Shopping" },
  { href: "/inbox", label: "Inbox" }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <header className="sticky top-0 z-20 border-b border-ink/10 bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-lg font-semibold tracking-tight">Studio Core</p>
            <p className="text-xs uppercase tracking-[0.2em] text-ink/60">{user?.role ?? "No role"}</p>
          </div>
          <nav className="flex gap-2">
            {navItems.map((item) => (
              <Link
                className={`rounded-full px-3 py-1 text-sm transition ${
                  pathname === item.href ? "bg-accent text-white" : "bg-ink/5 text-ink hover:bg-ink/10"
                }`}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <button
            className="rounded-full border border-ink/20 px-3 py-1 text-sm hover:bg-ink/5"
            onClick={() => {
              logout();
              router.push("/login");
            }}
            type="button"
          >
            Logout
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}

