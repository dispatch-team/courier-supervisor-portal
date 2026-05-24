import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./index.css";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ThemeConfigProvider } from "@/components/ThemeProvider";
import { IntlProvider } from "@/intl/IntlProvider";
import { AuthProvider } from "@/context/AuthContext";
import { QueryProvider } from "@/context/QueryProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dispatch - Courier Supervisor Portal",
  description:
    "Dispatch connects merchants and courier providers in Addis Ababa with a unified logistics platform.",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeConfigProvider>
          <IntlProvider>
            <AuthProvider>
              <QueryProvider>
                {children}
              </QueryProvider>
            </AuthProvider>
          </IntlProvider>
        </ThemeConfigProvider>
        <Toaster />
        <Sonner />
      </body>
    </html>
  );
}
