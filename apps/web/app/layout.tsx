import "@repo/ui/globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@repo/ui/components/sonner";
import { Metadata } from "next";
import { METADATA } from "@/consts/metadata";

export const metadata: Metadata = {
  title: `${METADATA.DEFAULT.title}`,
  description: `${METADATA.DEFAULT.description}`,
  // openGraph: {
  //   images: ["/thumbnail.png"],
  // },
  // icons: {
  //   icon: [
  //     { url: "/favicon.svg", type: "image/svg+xml" },
  //     { url: "/favicon.ico" },
  //   ],
  // },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`mx-auto select-none scroll-smooth font-sans antialiased shadow-sm`}
      >
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
