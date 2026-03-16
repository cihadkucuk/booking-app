import { useTranslations } from "next-intl";

export default function LoginPage() {
  const t = useTranslations("login");

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="card-surface rounded-3xl p-10 w-full max-w-md">
        <h1 className="text-4xl font-display">{t("title")}</h1>
        <p className="text-sm text-black/60 mt-2">{t("subtitle")}</p>
        <form className="mt-6 space-y-4">
          <input
            className="w-full p-3 rounded-xl border border-black/10"
            placeholder={t("email")}
            type="email"
            autoComplete="email"
          />
          <input
            className="w-full p-3 rounded-xl border border-black/10"
            placeholder={t("password")}
            type="password"
            autoComplete="current-password"
          />
          <input
            className="w-full p-3 rounded-xl border border-black/10"
            placeholder={t("tenantId")}
          />
          <input
            className="w-full p-3 rounded-xl border border-black/10"
            placeholder={t("studioId")}
          />
          <button type="submit" className="w-full py-3 rounded-xl bg-ink text-white">
            {t("signIn")}
          </button>
        </form>
      </div>
    </div>
  );
}
