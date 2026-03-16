import { useTranslations } from "next-intl";

export default function AnalyticsPage() {
  const t = useTranslations("analytics");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-4xl font-display">{t("title")}</h1>
        <p className="text-black/60">{t("subtitle")}</p>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card-surface rounded-2xl p-6">
          <h2 className="text-lg font-semibold">{t("metaInsights")}</h2>
          <p className="text-sm text-black/60 mt-2">{t("metaInsightsDescription")}</p>
          <button className="mt-4 px-4 py-2 rounded-full bg-ember text-white">
            {t("enableMeta")}
          </button>
        </div>
        <div className="card-surface rounded-2xl p-6">
          <h2 className="text-lg font-semibold">{t("googleAnalytics")}</h2>
          <p className="text-sm text-black/60 mt-2">{t("googleAnalyticsDescription")}</p>
          <button className="mt-4 px-4 py-2 rounded-full bg-ink text-white">
            {t("chooseAuth")}
          </button>
        </div>
        <div className="card-surface rounded-2xl p-6">
          <h2 className="text-lg font-semibold">{t("seoHealth")}</h2>
          <p className="text-sm text-black/60 mt-2">{t("seoHealthDescription")}</p>
          <button className="mt-4 px-4 py-2 rounded-full bg-ink text-white">
            {t("runCheck")}
          </button>
        </div>
      </section>
    </div>
  );
}
