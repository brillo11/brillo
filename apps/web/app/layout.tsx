import "@repo/ui/globals.css";
import { Providers } from "./providers";
import { Toaster } from "@repo/ui/components/sonner";
import { Metadata } from "next";
import { METADATA } from "@/shared/consts/metadata";

export const metadata: Metadata = {
  title: `${METADATA.TITLE}`,
  description: `${METADATA.DESCRIPTION}`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`mx-auto scroll-smooth font-sans antialiased shadow-sm`}>
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
