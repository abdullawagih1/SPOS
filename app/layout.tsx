import type { Metadata } from "next";
import { DM_Sans, DM_Mono, Syne } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["300", "400", "500"],
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  variable: "--font-dm-mono",
  weight: ["300", "400", "500"],
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "SPOS — Startup Prompt Operating System",
  description:
    "Transform raw startup ideas into world-class assets using AI. Research, architecture, MVP plans, investor narratives — generated in minutes.",
  keywords: ["startup", "AI", "prompt engineering", "investor deck", "MVP", "founder tools"],
  openGraph: {
    title: "SPOS — Startup Prompt Operating System",
    description: "Transform raw startup ideas into world-class assets using AI.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${dmSans.variable} ${dmMono.variable} ${syne.variable} font-sans antialiased bg-paper text-ink`}
      >
        {children}
      </body>
    </html>
  );
}
