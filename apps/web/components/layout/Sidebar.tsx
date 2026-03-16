"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { routing } from "../../src/i18n/routing";

type Locale = (typeof routing.locales)[number];

export function Sidebar() {
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const tl = useTranslations("language");
  const pathname = usePathname();
  const router = useRouter();

  const currentLocale = (routing.locales.includes(pathname.split("/")[1] as Locale)
    ? pathname.split("/")[1]
    : routing.defaultLocale) as Locale;

  const navItems = [
    { href: "/", label: t("overview") },
    { href: "/calendar", label: t("calendar") },
    { href: "/inbox", label: t("inbox") },
    { href: "/clients", label: t("clients") },
    { href: "/finance", label: t("finance") },
    { href: "/analytics", label: t("analytics") },
    { href: "/settings", label: t("settings") }
  ];

  function handleLocaleChange(locale: Locale) {
    const segments = pathname.split("/");
    segments[1] = locale;
    router.push(segments.join("/") || `/${locale}`);
  }

  return (
    <aside className="w-72 p-6 border-r border-black/10 bg-white/70 backdrop-blur flex flex-col">
      <div className="mb-10">
        <div className="text-4xl font-display tracking-wide">{tc("appName")}</div>
        <div className="text-sm uppercase tracking-[0.2em] text-black/50">{tc("studioName")}</div>
      </div>

      <nav className="space-y-4 flex-1">
        {navItems.map((item) => {
          const href = `/${currentLocale}${item.href}`;
          const isActive =
            pathname === href ||
            (item.href === "/" && pathname === `/${currentLocale}`);
          return (
            <Link
              key={item.href}
              href={href}
              className={`block text-lg font-medium transition ${
                isActive ? "text-ember" : "text-black/80 hover:text-ember"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 p-4 rounded-xl card-surface">
        <div className="text-sm font-semibold">{tc("featureFlags")}</div>
        <div className="text-xs text-black/60">{tc("featureFlagsDisabled")}</div>
      </div>

      <div className="mt-4 p-4 rounded-xl card-surface">
        <div className="text-xs font-semibold text-black/50 uppercase tracking-wider mb-2">
          {tl("label")}
        </div>
        <div className="flex gap-2">
          {routing.locales.map((locale) => (
            <button
              key={locale}
              onClick={() => handleLocaleChange(locale)}
              className={`flex-1 py-1 rounded-lg text-xs font-medium transition ${
                currentLocale === locale
                  ? "bg-ember text-white"
                  : "bg-black/5 text-black/60 hover:bg-black/10"
              }`}
            >
              {locale.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
