import { StudioCalendar } from "../../components/calendar/StudioCalendar";
import { BookingModal } from "../../components/calendar/BookingModal";

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display">Calendar</h1>
          <p className="text-black/60">Drag and drop to reschedule. Conflicts revert automatically.</p>
        </div>
        <button className="px-4 py-2 rounded-full bg-ember text-white">New Booking</button>
      </div>
      <div className="flex gap-3 text-sm">
        <button className="px-3 py-1 rounded-full border border-black/20">Artist Personal</button>
        <button className="px-3 py-1 rounded-full border border-black/10 text-black/40" disabled>
          Studio Grid (license needed)
        </button>
      </div>
      <StudioCalendar />
      <BookingModal />
    </div>
  );
}
