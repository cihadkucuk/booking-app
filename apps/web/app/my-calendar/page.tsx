"use client";

import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { AppShell } from "../../components/app-shell";
import { RequireAuth } from "../../components/require-auth";
import { useAuth } from "../../components/auth-provider";
import { apiRequest } from "../../lib/api-client";
import { apiBaseUrl } from "../../lib/config";
import { getStudioSlug } from "../../lib/studio";

type Appointment = {
  id: string;
  startAt: string;
  endAt: string;
  status: string;
  client: { fullName: string; phone: string | null; email: string | null };
  service: { name: string };
};

export default function MyCalendarPage() {
  const { token, user } = useAuth();
  const studioSlug = useMemo(() => getStudioSlug(), []);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      return;
    }

    const from = new Date();
    from.setHours(0, 0, 0, 0);
    const to = new Date(from);
    to.setDate(to.getDate() + 7);

    void apiRequest<Appointment[]>(
      `/appointments?from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}`,
      { token, studioSlug }
    )
      .then(setAppointments)
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Unable to load calendar"));
  }, [studioSlug, token]);

  useEffect(() => {
    if (!user?.studioId) {
      return;
    }

    const socket = io(`${apiBaseUrl}/ws`, {
      query: {
        studioId: user.studioId
      }
    });

    socket.on("appointment.updated", () => {
      if (!token) {
        return;
      }
      const from = new Date();
      from.setHours(0, 0, 0, 0);
      const to = new Date(from);
      to.setDate(to.getDate() + 7);
      void apiRequest<Appointment[]>(
        `/appointments?from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}`,
        { token, studioSlug }
      ).then(setAppointments);
    });

    return () => {
      socket.disconnect();
    };
  }, [studioSlug, token, user?.studioId]);

  return (
    <RequireAuth>
      <AppShell>
        <section className="card p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-ink/60">Staff View</p>
          <h1 className="mt-1 text-2xl font-semibold">My Calendar</h1>
          {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
          <ul className="mt-4 space-y-3">
            {appointments.map((appointment) => (
              <li className="rounded-xl border border-ink/10 p-3" key={appointment.id}>
                <p className="font-medium">{new Date(appointment.startAt).toLocaleString()}</p>
                <p className="text-sm text-ink/70">
                  {appointment.client.fullName} - {appointment.service.name}
                </p>
                <p className="text-sm text-ink/70">
                  Phone: {appointment.client.phone ?? "Hidden"} | Email: {appointment.client.email ?? "Hidden"}
                </p>
                <p className="text-xs uppercase tracking-[0.18em] text-ink/60">{appointment.status}</p>
              </li>
            ))}
          </ul>
        </section>
      </AppShell>
    </RequireAuth>
  );
}

