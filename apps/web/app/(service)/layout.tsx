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
        <header className="fixed top-0 left-0 right-0 z-[100] h-[84px] bg-black">
          {/* Top black bars from design */}
          <div className="absolute top-7 left-0 w-full h-14 bg-black" />

          <div className="relative max-w-[1280px] mx-auto h-full px-4 xl:px-0">
            {/* Logo */}
            <Link href="/" className="absolute top-[39px] left-[18px]">
              <img
                className="w-[93px] h-[35px] object-contain"
                alt="Brillo Logo"
                src="https://c.animaapp.com/oAayiH1p/img/group-2@2x.png"
              />
            </Link>

            {/* Navigation */}
            <div className="hidden md:inline-flex items-center gap-[33px] absolute top-[49px] left-1/2 -translate-x-1/2">
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
            <div className="absolute top-[46px] right-4 lg:right-0">
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
