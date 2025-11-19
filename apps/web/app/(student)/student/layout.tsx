import "@repo/ui/globals.css";
import { Toaster } from "@repo/ui/components/sonner";
import { StudentProviders } from "@/app/(student)/student/components/student-providers-server";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`mx-auto scroll-smooth font-sans antialiased shadow-sm`}>
      <StudentProviders>{children}</StudentProviders>
      <Toaster />
    </div>
  );
}
