import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: "INEMA.AI MAP | Mapa de oportunidades de IA para empresas",
  description:
    "Diagnóstico interativo para empresários descobrirem oportunidades de automação, agentes de IA, prompts e planos de implementação em 7, 30 e 90 dias.",
  keywords: [
    "INEMA.AI MAP",
    "Inteligência Artificial para empresas",
    "diagnóstico de IA",
    "automação para negócios",
    "agentes de IA",
    "mapa de oportunidades",
  ],
  icons: {
    icon: "/brand/favicon-inema-placeholder.svg",
  },
  openGraph: {
    title: "INEMA.AI MAP",
    description:
      "Crie um mapa prático de automações, agentes e oportunidades de crescimento com IA.",
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
