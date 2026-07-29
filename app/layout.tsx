import type { Metadata } from "next";
import "./globals.css";
import { siteContent } from "@/data/site-content";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: siteContent.seo.title,
  description: siteContent.seo.description,
  keywords: [...siteContent.seo.keywords],
  icons: {
    icon: siteContent.brand.faviconPath,
  },
  openGraph: {
    title: siteContent.seo.title,
    description: siteContent.seo.description,
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: siteContent.media.heroImage.src,
        width: 1680,
        height: 944,
        alt: siteContent.media.heroImage.alt,
      },
    ],
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
