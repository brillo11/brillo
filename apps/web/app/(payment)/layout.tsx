import "@repo/ui/globals.css";
import "../globals.css";
import { Suspense } from "react";

export default function PaymentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
    </div>
  );
}
