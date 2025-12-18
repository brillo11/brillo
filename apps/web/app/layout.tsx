import "@repo/ui/globals.css";
import { Providers } from "./providers";
import { Toaster } from "@repo/ui/components/sonner";
import { Metadata } from "next";
import { METADATA } from "@/shared/consts/metadata";

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
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-dynamic-subset.css"
        />
      </head>
      <body className={`mx-auto scroll-smooth font-sans antialiased shadow-sm`}>
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
