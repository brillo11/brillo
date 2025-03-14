import "@workspace/ui/globals.css";
import { Providers } from "@/components/providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`max-w-screen-mobile mx-auto select-none scroll-smooth font-sans antialiased shadow-sm`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
