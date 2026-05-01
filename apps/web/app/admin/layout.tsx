import { PropsWithChildren } from "react";
import { requireAdmin } from "@/shared/lib/auth-guards";
import { AdminShell } from "./AdminShell";

export default async function AdminLayout({ children }: PropsWithChildren) {
  await requireAdmin();

  return <AdminShell>{children}</AdminShell>;
}
