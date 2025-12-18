// import "@repo/ui/globals.css";
import { ServiceProviders } from "@/features/layout/ServiceProviders";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`mx-auto scroll-smooth font-sans antialiased shadow-sm`}>
      <ServiceProviders>{children}</ServiceProviders>
    </div>
  );
}
