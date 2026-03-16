import { useTranslations } from "next-intl";
import { StudioCalendar } from "../../../components/calendar/StudioCalendar";
import { BookingModal } from "../../../components/calendar/BookingModal";

export default function CalendarPage() {
  const t = useTranslations("calendar");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display">{t("title")}</h1>
          <p className="text-black/60">{t("subtitle")}</p>
        </div>
        <button className="px-4 py-2 rounded-full bg-ember text-white">
          {t("newBooking")}
        </button>
      </div>
      <div className="flex gap-3 text-sm">
        <button className="px-3 py-1 rounded-full border border-black/20">
          {t("artistPersonal")}
        </button>
        <button
          className="px-3 py-1 rounded-full border border-black/10 text-black/40"
          disabled
        >
          {t("studioGrid")}
        </button>
      </div>
      <StudioCalendar />
      <BookingModal />
    </div>
  );
}
