"use client";

import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { usePathname } from "next/navigation";
import { routing } from "../../src/i18n/routing";

// FullCalendar locale codes
const fcLocaleMap: Record<string, string> = {
  en: "en",
  tr: "tr",
  cs: "cs"
};

const events = [
  { id: "1", title: "Consultation / Petra", start: "2030-01-01T10:00:00" },
  { id: "2", title: "Session / Marek", start: "2030-01-01T12:00:00" },
  { id: "3", title: "Piercing / Klara", start: "2030-01-01T15:30:00" }
];

export function StudioCalendar() {
  const pathname = usePathname();
  const pathLocale = pathname.split("/")[1];
  const locale = routing.locales.includes(pathLocale as (typeof routing.locales)[number])
    ? pathLocale
    : routing.defaultLocale;

  return (
    <div className="card-surface rounded-2xl p-4">
      <FullCalendar
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{ left: "prev,next", center: "title", right: "timeGridDay,timeGridWeek" }}
        locale={fcLocaleMap[locale] ?? "en"}
        editable
        selectable
        events={events}
        eventDrop={(info) => {
          info.revert();
        }}
      />
    </div>
  );
}
