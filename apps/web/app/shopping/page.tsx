"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { AppShell } from "../../components/app-shell";
import { RequireAuth } from "../../components/require-auth";
import { useAuth } from "../../components/auth-provider";
import { apiRequest } from "../../lib/api-client";
import { getStudioSlug } from "../../lib/studio";

type TemplateItem = {
  id: string;
  name: string;
  unit: string | null;
  category: string | null;
  avgUsagePerService: string | null;
  isActive: boolean;
};

type SuggestionItem = {
  id: string;
  name: string;
  unit: string | null;
  quantitySuggested: string;
  reason: string | null;
  status: string;
};

export default function ShoppingPage() {
  const { token, user } = useAuth();
  const studioSlug = useMemo(() => getStudioSlug(), []);
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", unit: "", category: "", avgUsagePerService: "" });

  const loadData = useCallback(async () => {
    if (!token) {
      return;
    }
    try {
      const [templatesRes, suggestionsRes] = await Promise.all([
        apiRequest<TemplateItem[]>("/shopping/templates", { token, studioSlug }),
        apiRequest<SuggestionItem[]>("/shopping/suggestions", { token, studioSlug })
      ]);
      setTemplates(templatesRes);
      setSuggestions(suggestionsRes);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load shopping data");
    }
  }, [studioSlug, token]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function onCreateTemplate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      return;
    }
    try {
      await apiRequest("/shopping/templates", {
        method: "POST",
        token,
        studioSlug,
        body: {
          name: form.name,
          unit: form.unit || undefined,
          category: form.category || undefined,
          avgUsagePerService: form.avgUsagePerService ? Number(form.avgUsagePerService) : undefined
        }
      });
      setForm({ name: "", unit: "", category: "", avgUsagePerService: "" });
      await loadData();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to create template");
    }
  }

  async function generateSuggestions() {
    if (!token || (user?.role !== "OWNER" && user?.role !== "MANAGER")) {
      return;
    }
    try {
      await apiRequest("/shopping/suggestions/generate", {
        method: "POST",
        token,
        studioSlug,
        body: {}
      });
      await new Promise((resolve) => setTimeout(resolve, 500));
      await loadData();
    } catch (jobError) {
      setError(jobError instanceof Error ? jobError.message : "Unable to generate suggestions");
    }
  }

  return (
    <RequireAuth>
      <AppShell>
        <section className="grid gap-4 lg:grid-cols-2">
          <article className="card p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-ink/60">Smart Shopping List</p>
            <h1 className="mt-1 text-2xl font-semibold">Templates</h1>
            {(user?.role === "OWNER" || user?.role === "MANAGER") && (
              <form className="mt-3 grid gap-2" onSubmit={onCreateTemplate}>
                <input
                  className="rounded-xl border border-ink/15 px-3 py-2"
                  onChange={(event) => setForm((previous) => ({ ...previous, name: event.target.value }))}
                  placeholder="Item name"
                  required
                  value={form.name}
                />
                <input
                  className="rounded-xl border border-ink/15 px-3 py-2"
                  onChange={(event) => setForm((previous) => ({ ...previous, unit: event.target.value }))}
                  placeholder="Unit (box, bottle, pack)"
                  value={form.unit}
                />
                <input
                  className="rounded-xl border border-ink/15 px-3 py-2"
                  onChange={(event) => setForm((previous) => ({ ...previous, category: event.target.value }))}
                  placeholder="Category"
                  value={form.category}
                />
                <input
                  className="rounded-xl border border-ink/15 px-3 py-2"
                  onChange={(event) =>
                    setForm((previous) => ({ ...previous, avgUsagePerService: event.target.value }))
                  }
                  placeholder="Avg usage per service (e.g. 0.2)"
                  type="number"
                  value={form.avgUsagePerService}
                />
                <button className="rounded-xl bg-accent px-4 py-2 text-white" type="submit">
                  Add Template Item
                </button>
              </form>
            )}
            <ul className="mt-4 space-y-2 text-sm">
              {templates.map((template) => (
                <li className="rounded-lg border border-ink/10 p-2" key={template.id}>
                  <p className="font-medium">{template.name}</p>
                  <p className="text-ink/70">
                    {template.category ?? "General"} | {template.unit ?? "-"} | avg/service:{" "}
                    {template.avgUsagePerService ?? "n/a"}
                  </p>
                </li>
              ))}
            </ul>
          </article>

          <article className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-ink/60">Upcoming Week</p>
                <h2 className="mt-1 text-2xl font-semibold">Suggested List</h2>
              </div>
              {(user?.role === "OWNER" || user?.role === "MANAGER") && (
                <button className="rounded-xl border border-ink/15 px-3 py-2 text-sm" onClick={generateSuggestions}>
                  Generate
                </button>
              )}
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              {suggestions.map((item) => (
                <li className="rounded-lg border border-ink/10 p-2" key={item.id}>
                  <p className="font-medium">
                    {item.name} - {item.quantitySuggested} {item.unit ?? ""}
                  </p>
                  <p className="text-ink/70">{item.reason}</p>
                </li>
              ))}
            </ul>
          </article>
        </section>
        {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
      </AppShell>
    </RequireAuth>
  );
}

