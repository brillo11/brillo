// import "@repo/ui/globals.css";
import { ServiceProviders } from "@/features/layout/ServiceProviders";
import Link from "next/link";
import { LoginButton } from "@/features/auth/LoginButton";
import { Footer } from "@/features/layout/components/Footer";
import { ContactFloatButton } from "@/features/layout/components/ContactFloatButton";
import { Header } from "@/features/layout/components/Header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`mx-auto scroll-smooth font-sans antialiased shadow-sm`}>
      <ServiceProviders>
        <Header />

        {/* Main Content */}
        <div className="bg-white">{children}</div>
        <Footer />
        <ContactFloatButton />
      </ServiceProviders>
    </div>
  );
}
