import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AgentPulse - The Healthcare System for AI Agents",
  description: "Real-time performance monitoring and health diagnostics for AI agents on Virtuals Protocol. Independent audits in 30 seconds.",
  keywords: ["AI agents", "Virtuals Protocol", "ACP", "agent monitoring", "health check", "reputation", "audit"],
  other: {
    'virtual-protocol-site-verification': 'a5b0b16f625ee76d65a9a27e12f78f13',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navigation />
        <main className="min-h-screen relative z-10">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
