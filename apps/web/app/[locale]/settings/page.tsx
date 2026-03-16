import { useTranslations } from "next-intl";

export default function SettingsPage() {
  const t = useTranslations("settings");

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-display">{t("title")}</h1>
        <p className="text-black/60">{t("subtitle")}</p>
      </header>

      <section className="card-surface rounded-2xl p-6">
        <h2 className="text-xl font-semibold">{t("artists")}</h2>
        <p className="text-sm text-black/60 mt-2">{t("artistsDescription")}</p>
        <button className="mt-4 px-4 py-2 rounded-full bg-ink text-white">
          {t("addArtist")}
        </button>
      </section>

      <section className="card-surface rounded-2xl p-6">
        <h2 className="text-xl font-semibold">{t("services")}</h2>
        <p className="text-sm text-black/60 mt-2">{t("servicesDescription")}</p>
        <button className="mt-4 px-4 py-2 rounded-full bg-ink text-white">
          {t("addService")}
        </button>
      </section>

      <section className="card-surface rounded-2xl p-6">
        <h2 className="text-xl font-semibold">{t("stations")}</h2>
        <p className="text-sm text-black/60 mt-2">{t("stationsDescription")}</p>
        <button className="mt-4 px-4 py-2 rounded-full bg-ink text-white">
          {t("addStation")}
        </button>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-surface rounded-2xl p-6">
          <h2 className="text-xl font-semibold">{t("currencies")}</h2>
          <p className="text-sm text-black/60 mt-2">{t("currenciesDescription")}</p>
        </div>
        <div className="card-surface rounded-2xl p-6">
          <h2 className="text-xl font-semibold">{t("featureFlags")}</h2>
          <p className="text-sm text-black/60 mt-2">{t("featureFlagsDescription")}</p>
          <button className="mt-4 px-4 py-2 rounded-full bg-ember text-white">
            {t("manageFlags")}
          </button>
        </div>
      </section>
    </div>
  );
}
