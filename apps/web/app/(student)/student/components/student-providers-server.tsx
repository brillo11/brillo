import { requireStudent } from "@/shared/lib/auth-guards";
import { prisma } from "@repo/database";
import { StudentSidebar } from "@/app/(student)/student/components/student-sidebar";
import { StudentClientProviders } from "@/app/(admin)/admin/components/studentProviders";
import { UserHeader } from "@/shared/components/header/user-header";

export async function StudentProviders({
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
    <StudentClientProviders>
      <StudentSidebar points={points} />
      <div className="flex flex-col flex-1 w-full min-h-screen">
        <UserHeader />
        <div className="flex-1">{children}</div>
      </div>
    </StudentClientProviders>
  );
}
