import { requireStudent } from "@/shared/lib/auth-guards";
import { prisma } from "@repo/database";
import { ServiceSidebar } from "@/features/layout/ServiceSidebar";
import { ServiceHeader } from "@/features/layout/ServiceHeader";
import { ServiceClientProviders } from "@/features/layout/ServiceClientProviders";

export async function ServiceProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get user session
  const session = await requireStudent();

  // Fetch user points
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { points: true },
  });

  const points = user?.points ?? 0;

  return (
    <ServiceClientProviders>
      <ServiceSidebar points={points} />
      <div className="flex flex-col flex-1 w-full min-h-screen">
        <ServiceHeader />
        <div className="flex-1 bg-vzx-bg/80">{children}</div>
      </div>
    </ServiceClientProviders>
  );
}
