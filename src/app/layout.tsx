import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { PrefsApplier, themeBootScript } from "@/components/layout/prefs-applier";
import { ReadingRuler } from "@/components/layout/reading-ruler";
import { RewardLayer } from "@/components/layout/reward-layer";
import { ProgressBootstrap } from "@/components/layout/progress-bootstrap";
import { TOPIC_INDEX } from "@/content";

export const metadata: Metadata = {
  title: { default: "GeoMzansi – Grade 12 Geography (CAPS) for Northwood Boys' High", template: "%s · GeoMzansi" },
  description:
    "Interactive Grade 12 CAPS Geography: climate & weather, geomorphology, settlement, economic geography, mapwork and GIS – with quizzes, flashcards, exam practice and hands-on tools. ADHD-friendly and accessible.",
  applicationName: "GeoMzansi",
  keywords: ["Geography", "CAPS", "Grade 12", "NSC", "matric", "mapwork", "GIS", "Northwood", "Durban", "South Africa"],
  openGraph: { title: "GeoMzansi", description: "Grade 12 Geography, the interactive way.", type: "website" },
};

export const viewport: Viewport = {
  themeColor: [{ media: "(prefers-color-scheme: dark)", color: "#08110e" }, { media: "(prefers-color-scheme: light)", color: "#f6f8f7" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-ZA" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body className="min-h-screen">
        <PrefsApplier />
        <ProgressBootstrap topicIndex={TOPIC_INDEX} />
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
        <ReadingRuler />
        <RewardLayer />
      </body>
    </html>
  );
}
