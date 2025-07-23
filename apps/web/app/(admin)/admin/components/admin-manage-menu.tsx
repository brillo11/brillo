"use client";
import { Card, CardContent } from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import {
  FileText,
  Users,
  MessageSquare,
  CreditCard,
  Bell,
  Settings,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface AdminManageMenuProps {
  stats: {
    totalUsers: number;
    totalPosts: number;
    totalComments: number;
    totalRevenue: number;
    monthlyGrowth: number;
    activeUsers: number;
    newSignups: number;
    monthlyPayments: number;
    pendingRefunds: number;
  };
}

export default function AdminManageMenu({ stats }: AdminManageMenuProps) {
  const router = useRouter();

  return (
    <div className="mt-12">
      <h2 className="mb-6 text-2xl font-bold text-gray-900">관리 메뉴</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card
          className="cursor-pointer transition-all duration-300 hover:shadow-lg"
          onClick={() => router.push("/admin/posts")}
        >
          <CardContent className="p-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              게시글 관리
            </h3>
            <p className="mb-4 text-sm text-gray-600">
              모든 게시글 관리 및 모니터링
            </p>
            <Badge className="bg-blue-100 text-blue-700">
              {stats.totalPosts}개 게시글
            </Badge>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-all duration-300 hover:shadow-lg"
          onClick={() => router.push("/admin/user")}
        >
          <CardContent className="p-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100">
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              사용자 관리
            </h3>
            <p className="mb-4 text-sm text-gray-600">회원 정보 및 권한 관리</p>
            <Badge className="bg-green-100 text-green-700">
              {stats.totalUsers.toLocaleString()}명
            </Badge>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-all duration-300 hover:shadow-lg"
          onClick={() => router.push("/admin/payment")}
        >
          <CardContent className="p-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100">
              <CreditCard className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              결제 관리
            </h3>
            <p className="mb-4 text-sm text-gray-600">결제 내역 및 환불 처리</p>
            <Badge className="bg-purple-100 text-purple-700">
              {stats.pendingRefunds}건 대기
            </Badge>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-all duration-300 hover:shadow-lg"
          onClick={() => router.push("#")}
        >
          <CardContent className="p-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-100">
              <MessageSquare className="h-8 w-8 text-yellow-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              댓글 관리
            </h3>
            <p className="mb-4 text-sm text-gray-600">댓글 검토 및 관리</p>
            <Badge className="bg-yellow-100 text-yellow-700">
              {stats.totalComments}개 댓글
            </Badge>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-all duration-300 hover:shadow-lg"
          onClick={() => router.push("#")}
        >
          <CardContent className="p-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100">
              <Bell className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              시스템 알림
            </h3>
            <p className="mb-4 text-sm text-gray-600">
              시스템 상태 및 알림 관리
            </p>
            <Badge className="bg-red-100 text-red-700">
              {stats.monthlyPayments}건 이번달
            </Badge>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-all duration-300 hover:shadow-lg"
          onClick={() => router.push("/admin/create-admin")}
        >
          <CardContent className="p-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
              <Settings className="h-8 w-8 text-gray-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              관리자 설정
            </h3>
            <p className="mb-4 text-sm text-gray-600">
              관리자 계정 및 시스템 설정
            </p>
            <Badge className="bg-gray-100 text-gray-700">설정</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
