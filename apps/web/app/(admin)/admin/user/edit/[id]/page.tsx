import { getAdminUserDetail } from "@/serverActions/admin/user.sa";
import { UserEditView } from "./view";

export interface AdminEnrollment {
  id: bigint;
  isActive: boolean;
  feedbacks: Array<{
    feedbackType: string;
  }>;
  feedbackExpiresAt?: Date | null;
  expiresAt?: Date | null;
  isEvent?: boolean;
  eventText?: string | null;
  watchMinutes: number;
}

export interface AdminUser {
  id: bigint;
  nickname: string;
  accountId: string;
  role: "USER" | "ADMIN";
  status: "ACTIVE" | "INACTIVE";
  isNewUser: boolean;
  createdAt: Date;
  enrollments: Array<AdminEnrollment>;
}

export default async function AdminUserEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // 서버에서 데이터 fetch
  // userId는 params에서 추출
  const { id } = await params;

  // 유저 상세
  const user = await getAdminUserDetail(id);

  return <UserEditView user={user} />;
}
