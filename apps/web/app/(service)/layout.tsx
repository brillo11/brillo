// import "@repo/ui/globals.css";
import { ServiceProviders } from "@/features/layout/ServiceProviders";
import Link from "next/link";
import { LoginButton } from "@/features/auth/LoginButton";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`mx-auto scroll-smooth font-sans antialiased shadow-sm`}>
      <ServiceProviders>
        <header className="fixed top-0 left-0 right-0 z-[100] h-14 bg-black">
          <div className="relative max-w-screen-xl mx-auto top-0 h-full px-4 xl:px-0 flex items-center">
            {/* Logo */}
            <Link href="/">
              <img
                className="w-[93px] h-[35px] object-contain"
                alt="Brillo Logo"
                src="https://c.animaapp.com/oAayiH1p/img/group-2@2x.png"
              />
            </Link>

            {/* Navigation */}
            <div className="hidden md:inline-flex items-center gap-[33px] absolute left-1/2 -translate-x-1/2">
              {["About", "Woman", "Man", "VIP/Celeb", "FAQ"].map((item) => (
                <Link
                  key={item}
                  href="#"
                  className="relative w-fit [font-family:'Playfair_Display',Helvetica] font-medium text-white text-xs tracking-[-0.24px] leading-[normal] hover:text-gray-300 transition-colors"
                >
                  {item}
                </Link>
              ))}
            </div>

            {/* User Icon / Login */}
            <div className="absolute right-4 lg:right-0">
              <LoginButton />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="bg-white">{children}</div>
      </ServiceProviders>
    </div>
  );
}
