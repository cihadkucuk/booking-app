import { useTranslations } from "next-intl";

export default function ClientsPage() {
  const t = useTranslations("clients");

  const clientList = t.raw("clients") as string[];

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display">{t("title")}</h1>
          <p className="text-black/60">{t("subtitle")}</p>
        </div>
        <button className="px-4 py-2 rounded-full bg-ink text-white">
          {t("addClient")}
        </button>
      </header>

      <div className="card-surface rounded-2xl p-6">
        <div className="text-sm uppercase tracking-[0.2em] text-black/50">{t("recentClients")}</div>
        <ul className="mt-4 space-y-3 text-sm">
          {clientList.map((client) => (
            <li key={client}>{client}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
