export const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export function extractStudioSlugFromHost(host: string | null | undefined): string {
  if (!host) {
    return "inkhouse";
  }
  const cleanHost = host.split(":")[0].toLowerCase();
  const parts = cleanHost.split(".");
  if (parts.length > 1 && cleanHost.endsWith("localhost")) {
    return parts[0];
  }
  return "inkhouse";
}

