import { useTranslations } from "next-intl";

export default function InboxPage() {
  const t = useTranslations("inbox");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-4xl font-display">{t("title")}</h1>
        <p className="text-black/60">{t("subtitle")}</p>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card-surface rounded-2xl p-6">
          <h2 className="text-lg font-semibold">{t("instagram")}</h2>
          <p className="text-sm text-black/60 mt-2">{t("instagramDescription")}</p>
          <button className="mt-4 px-4 py-2 rounded-full bg-ember text-white">
            {t("configureMeta")}
          </button>
        </div>
        <div className="card-surface rounded-2xl p-6">
          <h2 className="text-lg font-semibold">{t("websiteChat")}</h2>
          <p className="text-sm text-black/60 mt-2">{t("websiteChatDescription")}</p>
          <button className="mt-4 px-4 py-2 rounded-full bg-ink text-white">
            {t("copyWidget")}
          </button>
        </div>
        <div className="card-surface rounded-2xl p-6">
          <h2 className="text-lg font-semibold">{t("walkins")}</h2>
          <p className="text-sm text-black/60 mt-2">{t("walkinsDescription")}</p>
          <button className="mt-4 px-4 py-2 rounded-full bg-ink text-white">
            {t("newWalkin")}
          </button>
        </div>
      </section>
    </div>
  );
}
