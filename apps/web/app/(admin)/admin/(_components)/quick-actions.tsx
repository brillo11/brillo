"use client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import Link from "next/link";
import { Activity, Calendar, FileText, Users, CreditCard } from "lucide-react";

interface QuickActionsProps {
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

export default function QuickActions({ stats }: QuickActionsProps) {
  return (
    <div className="mb-8">
      <h2 className="mb-6 text-2xl font-bold text-gray-900">빠른 액션</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <FileText className="mr-2 h-5 w-5" />
              게시글 관리
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-gray-600">
              새 공지사항 작성 또는 기존 게시글 관리
            </p>
            <div className="flex space-x-2">
              <Link href="/admin/notice/write">
                <Button size="sm" className="flex-1">
                  새 공지 작성
                </Button>
              </Link>
              <Link href="/admin/notice">
                <Button size="sm" variant="outline" className="flex-1">
                  게시글 관리
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Users className="mr-2 h-5 w-5" />
              사용자 현황
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-gray-600">
              활성 사용자 {stats.activeUsers}명, 신규 가입 {stats.newSignups}명
            </p>
            <Link href="/admin/user">
              <Button size="sm" variant="outline" className="w-full">
                사용자 관리
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <CreditCard className="mr-2 h-5 w-5" />
              결제/환불 관리
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-gray-600">
              환불 대기 {stats.pendingRefunds}건, 이번달 결제{" "}
              {stats.monthlyPayments}건
            </p>
            <Link href="/admin/payment">
              <Button size="sm" variant="outline" className="w-full">
                결제 관리
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
