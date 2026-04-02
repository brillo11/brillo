import "@repo/ui/globals.css";
import { Providers } from "./providers";
import { Toaster } from "@repo/ui/components/sonner";
import { Metadata } from "next";
import { METADATA } from "@/shared/consts/metadata";

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
  title: `${METADATA.TITLE}`,
  description: `${METADATA.DESCRIPTION}`,
  openGraph: {
    title: `${METADATA.TITLE}`,
    description: `${METADATA.DESCRIPTION}`,
    images: [METADATA.getThumbnailUrl()],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="shortcut icon" href="https://brillo.kr/favicon.ico" type="image/x-icon" />
        <link rel="icon" href="https://brillo.kr/favicon.ico" type="image/x-icon" />
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
