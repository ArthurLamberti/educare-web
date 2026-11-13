import type { Metadata } from "next";
import { Atkinson_Hyperlegible, Geist_Mono, Literata } from "next/font/google";
import { Suspense } from "react";

import { AppHeader, AppHeaderFallback } from "@/components/app-header";
import "./globals.css";

const body = Atkinson_Hyperlegible({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const literata = Literata({
  variable: "--font-literata",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "Educare", template: "%s | Educare" },
  description: "Aulas, lição de casa e flashcards para o ensino individual.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${body.variable} ${literata.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <header className="bg-brand-800 text-brand-50 dark:bg-brand-950">
          <Suspense fallback={<AppHeaderFallback />}>
            <AppHeader />
          </Suspense>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">{children}</main>
      </body>
    </html>
  );
}
