import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./index.css";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ThemeConfigProvider } from "@/components/ThemeProvider";
import { IntlProvider } from "@/intl/IntlProvider";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dispatch - Unified Logistics Platform",
  description:
    "Dispatch connects merchants and courier providers in Addis Ababa with a unified logistics platform.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeConfigProvider>
          <IntlProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </IntlProvider>
        </ThemeConfigProvider>
        <Toaster />
        <Sonner />
      </body>
    </html>
  );
}
