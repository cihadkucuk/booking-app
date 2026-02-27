import type { Metadata } from "next";
import { headers } from "next/headers";
import { Manrope, Space_Grotesk } from "next/font/google";
import type { CSSProperties } from "react";
import { Providers } from "./providers";
import { apiBaseUrl, extractStudioSlugFromHost } from "../lib/config";
import "./globals.css";

const headingFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading"
});

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-body"
});

export const metadata: Metadata = {
  title: "Studio Core",
  description: "Multi-tenant booking white-label platform"
};

async function getStudioTheme() {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const slug = extractStudioSlugFromHost(host);
  const response = await fetch(`${apiBaseUrl}/studio/theme`, {
    headers: {
      "x-studio-slug": slug
    },
    cache: "no-store"
  });

  if (!response.ok) {
    return {
      name: "Studio Core",
      primaryColor: "#0F172A",
      secondaryColor: "#EA580C"
    };
  }

  return (await response.json()) as {
    name: string;
    primaryColor: string;
    secondaryColor: string;
  };
}

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = await getStudioTheme();
  return (
    <html lang="en">
      <body
        className={`${headingFont.variable} ${bodyFont.variable}`}
        style={
          {
            ["--color-ink" as string]: theme.primaryColor ?? "#0F172A",
            ["--color-accent" as string]: theme.secondaryColor ?? "#EA580C"
          } as CSSProperties
        }
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
