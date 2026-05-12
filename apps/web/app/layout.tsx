import "@repo/ui/globals.css";
import { Providers } from "./providers";
import { Toaster } from "@repo/ui/components/sonner";
import { Metadata } from "next";
import { getAbsoluteUrl, getSiteUrl, METADATA } from "@/shared/consts/metadata";

import { Playfair_Display, DM_Serif_Display } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-dm-serif",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: METADATA.TITLE,
  description: METADATA.DESCRIPTION,
  applicationName: METADATA.COMPANY_NAME,
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "any" }],
    shortcut: ["/favicon.ico"],
  },
  openGraph: {
    title: METADATA.TITLE,
    description: METADATA.DESCRIPTION,
    url: "/",
    siteName: METADATA.COMPANY_NAME,
    locale: "ko_KR",
    images: [
      {
        url: METADATA.getThumbnailUrl(),
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: METADATA.TITLE,
    description: METADATA.DESCRIPTION,
    images: [getAbsoluteUrl(METADATA.THUMBNAIL)],
  },
  verification: {
    other: {
      "naver-site-verification": "af692bab7fa2f69735a7a041a4d81597",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const websiteStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: METADATA.COMPANY_NAME,
    alternateName: METADATA.ALTERNATE_NAME,
    url: getSiteUrl(),
  };

  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteStructuredData),
          }}
        />
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-dynamic-subset.css"
        />
        <link
          href="https://cdn.jsdelivr.net/gh/sunn-us/SUIT/fonts/static/woff2/SUIT.css"
          rel="stylesheet"
        />
      </head>
      <body
        className={`mx-auto scroll-smooth font-sans antialiased shadow-sm ${playfair.variable} ${dmSerif.variable}`}
      >
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
