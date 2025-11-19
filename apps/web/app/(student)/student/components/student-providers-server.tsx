import { requireStudent } from "@/shared/lib/auth-guards";
import { prisma } from "@repo/database";
import { StudentHeader } from "@/app/(student)/student/components/student-header";
import { StudentClientProviders } from "@/app/(admin)/admin/components/studentProviders";

export async function StudentProviders({ children }: { children: React.ReactNode }) {
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
      <StudentHeader points={points} />
      <main className="flex-1">{children}</main>
    </StudentClientProviders>
  );
}
