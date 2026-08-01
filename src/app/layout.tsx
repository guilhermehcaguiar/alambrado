import type { Metadata } from "next";
import { Bebas_Neue, Oswald, Inter } from "next/font/google";
import { BRAND } from "@/config/brand";
import { Providers } from "@/app/providers";
import Header from "@/components/layout/Header";
import FooterPlaceholder from "@/components/layout/FooterPlaceholder";
import "@/styles/globals.css";

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas-neue",
  weight: "400",
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: BRAND.name,
    template: `%s | ${BRAND.name}`,
  },
  description:
    `${BRAND.name} — ${BRAND.slogan} Camisas de futebol tailandesas 1:1. Catálogo promocional versão Torcedor com checkout pelo WhatsApp.`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${bebasNeue.variable} ${oswald.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-ink text-paper">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <FooterPlaceholder />
        </Providers>
      </body>
    </html>
  );
}
