import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GoWorld.Digital — Atlas Sales Workforce",
  description: "Sales Workforce & Affiliate Platform da AtlasHub.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
