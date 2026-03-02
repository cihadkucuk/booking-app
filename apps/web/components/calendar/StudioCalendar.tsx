"use client";

import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

const events = [
  { id: "1", title: "Consultation / Petra", start: "2030-01-01T10:00:00" },
  { id: "2", title: "Session / Marek", start: "2030-01-01T12:00:00" },
  { id: "3", title: "Piercing / Klara", start: "2030-01-01T15:30:00" }
];

export function StudioCalendar() {
  return (
    <div className="card-surface rounded-2xl p-4">
      <FullCalendar
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{ left: "prev,next", center: "title", right: "timeGridDay,timeGridWeek" }}
        editable
        selectable
        events={events}
        eventDrop={(info) => {
          alert(`Reschedule to ${info.event.start?.toISOString()}`);
          info.revert();
        }}
      />
    </div>
  );
}
