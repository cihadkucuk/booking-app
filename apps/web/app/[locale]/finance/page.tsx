import { useTranslations } from "next-intl";

export default function FinancePage() {
  const t = useTranslations("finance");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-4xl font-display">{t("title")}</h1>
        <p className="text-black/60">{t("subtitle")}</p>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-surface rounded-2xl p-6">
          <h2 className="text-lg font-semibold">{t("revenueByArtist")}</h2>
          <p className="text-sm text-black/60 mt-2">{t("revenueByArtistDescription")}</p>
        </div>
        <div className="card-surface rounded-2xl p-6">
          <h2 className="text-lg font-semibold">{t("upcomingDeposits")}</h2>
          <p className="text-sm text-black/60 mt-2">{t("upcomingDepositsDescription")}</p>
        </div>
      </section>

      <section className="card-surface rounded-2xl p-6">
        <h2 className="text-lg font-semibold">{t("expenses")}</h2>
        <button className="mt-4 px-4 py-2 rounded-full bg-ink text-white">
          {t("logExpense")}
        </button>
      </section>
    </div>
  );
}
