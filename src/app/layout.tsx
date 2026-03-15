import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "College Baseball Analytics",
  description:
    "Player evaluation, team comparison, and predictive performance modeling for college baseball",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a1628] text-white min-h-screen`}
      >
        <Providers>
          <Sidebar />
          <div className="pl-60">
            <Header />
            <main className="p-6">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
