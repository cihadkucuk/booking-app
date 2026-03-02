import "./globals.css";
import type { Metadata } from "next";
import { Sidebar } from "../components/layout/Sidebar";

export const metadata: Metadata = {
  title: "StudioOS",
  description: "White-label OS for tattoo and piercing studios"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-body">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
