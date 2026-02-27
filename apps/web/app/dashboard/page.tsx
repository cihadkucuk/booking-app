"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { AppShell } from "../../components/app-shell";
import { RequireAuth } from "../../components/require-auth";
import { useAuth } from "../../components/auth-provider";
import { apiRequest } from "../../lib/api-client";
import { apiBaseUrl } from "../../lib/config";
import { getStudioSlug } from "../../lib/studio";

type SummaryResponse = {
  totals: {
    total: number;
    deposit: number;
    expectedRevenue: number;
  };
};

type Staff = { id: string; displayName: string; color: string | null };
type Service = { id: string; name: string; durationMin: number };
type Client = { id: string; fullName: string };
type Appointment = {
  id: string;
  staffId: string;
  startAt: string;
  endAt: string;
  status: string;
  client: { fullName: string };
  service: { name: string };
};

type CalendarResponse = {
  staff: Staff[];
  appointments: Appointment[];
};

export default function DashboardPage() {
  const { token, user } = useAuth();
  const studioSlug = useMemo(() => getStudioSlug(), []);
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [calendar, setCalendar] = useState<CalendarResponse | null>(null);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    staffId: "",
    clientId: "",
    serviceId: "",
    startAt: "",
    notes: ""
  });

  const loadData = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      setError(null);
      const now = new Date();
      const from = new Date(now);
      from.setHours(0, 0, 0, 0);
      const to = new Date(from);
      to.setDate(to.getDate() + 7);

      const [summaryRes, calendarRes, staffRes, clientsRes, servicesRes] = await Promise.all([
        apiRequest<SummaryResponse>("/dashboard/today", { token, studioSlug }),
        apiRequest<CalendarResponse>(
          `/appointments/calendar?from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}`,
          { token, studioSlug }
        ),
        apiRequest<Staff[]>("/catalog/staff", { token, studioSlug }),
        apiRequest<Client[]>("/catalog/clients", { token, studioSlug }),
        apiRequest<Service[]>("/catalog/services", { token, studioSlug })
      ]);
      setSummary(summaryRes);
      setCalendar(calendarRes);
      setStaff(staffRes);
      setClients(clientsRes);
      setServices(servicesRes);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load dashboard");
    }
  }, [studioSlug, token]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

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
      void loadData();
    });

    return () => {
      socket.disconnect();
    };
  }, [loadData, user?.studioId]);

  async function onCreateAppointment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await apiRequest("/appointments", {
        method: "POST",
        token,
        studioSlug,
        body: {
          staffId: form.staffId,
          clientId: form.clientId,
          serviceId: form.serviceId,
          startAt: new Date(form.startAt).toISOString(),
          notes: form.notes
        }
      });
      setForm((previous) => ({ ...previous, notes: "" }));
      await loadData();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to create appointment");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <RequireAuth>
      <AppShell>
        <section className="grid gap-4 lg:grid-cols-3">
          <article className="card p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-ink/60">Today</p>
            <p className="mt-2 text-2xl font-semibold">{summary?.totals.total ?? 0} appointments</p>
            <p className="text-sm text-ink/70">Expected revenue ${(summary?.totals.expectedRevenue ?? 0) / 100}</p>
            <p className="text-sm text-ink/70">Deposits ${(summary?.totals.deposit ?? 0) / 100}</p>
          </article>

          <article className="card p-4 lg:col-span-2">
            <p className="text-xs uppercase tracking-[0.2em] text-ink/60">Create Appointment</p>
            <form className="mt-3 grid gap-3 md:grid-cols-2" onSubmit={onCreateAppointment}>
              <select
                className="rounded-xl border border-ink/15 px-3 py-2"
                onChange={(event) => setForm((previous) => ({ ...previous, staffId: event.target.value }))}
                required
                value={form.staffId}
              >
                <option value="">Select staff</option>
                {staff.map((staffMember) => (
                  <option key={staffMember.id} value={staffMember.id}>
                    {staffMember.displayName}
                  </option>
                ))}
              </select>
              <select
                className="rounded-xl border border-ink/15 px-3 py-2"
                onChange={(event) => setForm((previous) => ({ ...previous, clientId: event.target.value }))}
                required
                value={form.clientId}
              >
                <option value="">Select client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.fullName}
                  </option>
                ))}
              </select>
              <select
                className="rounded-xl border border-ink/15 px-3 py-2"
                onChange={(event) => setForm((previous) => ({ ...previous, serviceId: event.target.value }))}
                required
                value={form.serviceId}
              >
                <option value="">Select service</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} ({service.durationMin}m)
                  </option>
                ))}
              </select>
              <input
                className="rounded-xl border border-ink/15 px-3 py-2"
                onChange={(event) => setForm((previous) => ({ ...previous, startAt: event.target.value }))}
                required
                type="datetime-local"
                value={form.startAt}
              />
              <input
                className="rounded-xl border border-ink/15 px-3 py-2 md:col-span-2"
                onChange={(event) => setForm((previous) => ({ ...previous, notes: event.target.value }))}
                placeholder="Optional notes"
                type="text"
                value={form.notes}
              />
              <button
                className="rounded-xl bg-accent px-4 py-2 text-white md:col-span-2"
                disabled={submitting}
                type="submit"
              >
                {submitting ? "Creating..." : "Create Appointment"}
              </button>
            </form>
          </article>
        </section>

        {error ? (
          <p className="mt-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        ) : null}

        <section className="card mt-4 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-ink/60">Studio Calendar (7 days)</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {(calendar?.staff ?? []).map((staffMember) => (
              <div className="rounded-xl border border-ink/10 p-3" key={staffMember.id}>
                <p className="font-medium">{staffMember.displayName}</p>
                <ul className="mt-2 space-y-2 text-sm">
                  {(calendar?.appointments ?? [])
                    .filter((appointment) => appointment.staffId === staffMember.id)
                    .map((appointment) => (
                      <li className="rounded-lg bg-ink/5 p-2" key={appointment.id}>
                        <p>{new Date(appointment.startAt).toLocaleString()}</p>
                        <p className="text-ink/70">
                          {appointment.client.fullName} - {appointment.service.name}
                        </p>
                        <p className="text-xs uppercase tracking-[0.15em] text-ink/50">{appointment.status}</p>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </AppShell>
    </RequireAuth>
  );
}

