import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AntdProvider } from "@/components/providers/antd-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import IntlProvider from "@/components/providers/intl-provider";
import { getMessages } from 'next-intl/server';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SII AI Agentic Accounting System",
  description: "Intelligent accounting automation for Chilean businesses with SII and bank integration",
  keywords: ["chile", "sii", "accounting", "AI", "automation", "RUT", "facturas"],
  authors: [{ name: "SII Accounting Team" }],
  robots: "index, follow",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const messages = await getMessages({ locale: 'es' });
  
  return (
    <html lang="es-CL">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <IntlProvider locale="es" messages={messages}>
          <QueryProvider>
            <AntdProvider>
              {children}
            </AntdProvider>
          </QueryProvider>
        </IntlProvider>
      </body>
    </html>
  );
}
