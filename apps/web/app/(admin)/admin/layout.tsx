import "@repo/ui/globals.css";
import { Providers } from "@/app/(admin)/admin/components/providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`mx-auto scroll-smooth font-sans antialiased shadow-sm`}>
      <Providers>{children}</Providers>
    </div>
  );
}
