export function getStudioSlug(): string {
  if (typeof document === "undefined") {
    return "inkhouse";
  }

  const match = document.cookie.match(/(?:^|; )studio_slug=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : "inkhouse";
}

