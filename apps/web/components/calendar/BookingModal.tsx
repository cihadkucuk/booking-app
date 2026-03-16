"use client";

import { useTranslations } from "next-intl";

export function BookingModal() {
  const t = useTranslations("booking");

  return (
    <div className="card-surface rounded-2xl p-6">
      <h3 className="text-lg font-semibold">{t("title")}</h3>
      <p className="text-sm text-black/60 mt-2">{t("description")}</p>
      <button className="mt-4 px-4 py-2 rounded-full bg-ink text-white">
        {t("createBooking")}
      </button>
    </div>
  );
}
