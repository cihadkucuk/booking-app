import { useTranslations } from "next-intl";

export default function HomePage() {
  const t = useTranslations("dashboard");
  const tc = useTranslations("common");

  const cards = [
    { label: t("upcomingDeposits"), value: "CZK 24,000" },
    { label: t("revenueThisWeek"), value: "CZK 86,500" },
    { label: t("newConversations"), value: "18" }
  ];

  const todayItems = [
    t("todayItems.item1"),
    t("todayItems.item2"),
    t("todayItems.item3")
  ];

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-5xl font-display">{t("title")}</h1>
          <p className="text-black/60">{t("subtitle")}</p>
        </div>
        <div className="text-sm uppercase tracking-[0.2em] text-black/50">{tc("weekView")}</div>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div key={card.label} className="card-surface rounded-2xl p-6 shadow-sm">
            <div className="text-sm uppercase tracking-[0.2em] text-black/50">{card.label}</div>
            <div className="text-3xl font-semibold mt-4">{card.value}</div>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-surface rounded-2xl p-6">
          <div className="text-lg font-semibold">{t("todayAtAGlance")}</div>
          <ul className="mt-4 space-y-3 text-sm text-black/70">
            {todayItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="card-surface rounded-2xl p-6">
          <div className="text-lg font-semibold">{t("inboxPulse")}</div>
          <p className="mt-3 text-sm text-black/70">{t("inboxPulseDescription")}</p>
          <button className="mt-6 px-4 py-2 rounded-full bg-ember text-white text-sm">
            {t("openInbox")}
          </button>
        </div>
      </section>
    </div>
  );
}
