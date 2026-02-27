"use client";

import { FormEvent, useMemo, useState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../components/auth-provider";

function readCookie(name: string): string | null {
  const escaped = name.replace(/[$()*+./?[\\\]^{|}-]/g, "\\$&");
  const match = document.cookie.match(new RegExp(`(?:^|; )${escaped}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export default function LoginPage() {
  const router = useRouter();
  const { login, ready, token } = useAuth();
  const [email, setEmail] = useState("owner@inkhouse.test");
  const [password, setPassword] = useState("owner123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const studioSlug = useMemo(() => {
    if (typeof window === "undefined") {
      return "inkhouse";
    }
    return readCookie("studio_slug") ?? "inkhouse";
  }, []);

  useEffect(() => {
    if (ready && token) {
      router.replace("/dashboard");
    }
  }, [ready, token, router]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login({
        email,
        password,
        studioSlug
      });
      router.push("/dashboard");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <form className="card w-full max-w-md space-y-4 p-7" onSubmit={onSubmit}>
        <p className="text-xs uppercase tracking-[0.25em] text-ink/60">Studio Access</p>
        <h1 className="text-2xl font-semibold">Login</h1>
        <p className="text-xs text-ink/70">Tenant slug: {studioSlug}</p>
        <label className="block text-sm">
          Email
          <input
            className="mt-1 w-full rounded-xl border border-ink/15 bg-white px-3 py-2"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
        </label>
        <label className="block text-sm">
          Password
          <input
            className="mt-1 w-full rounded-xl border border-ink/15 bg-white px-3 py-2"
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </label>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          className="w-full rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-70"
          disabled={loading}
          type="submit"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
