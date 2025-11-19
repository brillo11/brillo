import "@repo/ui/globals.css";
import { Providers } from "@/app/(admin)/admin/components/providers";
import { Toaster } from "@repo/ui/components/sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`mx-auto scroll-smooth font-sans antialiased shadow-sm`}>
      <Providers>{children}</Providers>
      <Toaster />
    </div>
  );
}
