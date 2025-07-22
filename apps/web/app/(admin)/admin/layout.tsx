import "@repo/ui/globals.css";
import { Providers } from "@/components/admin/providers";
import { Toaster } from "@repo/ui/components/sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={`mx-auto scroll-smooth font-sans antialiased shadow-sm select-none`}
    >
      <Providers>{children}</Providers>
      <Toaster />
    </div>
  );
}
