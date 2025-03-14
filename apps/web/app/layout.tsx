import "@repo/ui/globals.css";
import { Providers } from "@/components/providers";

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
      </body>
    </html>
  );
}
