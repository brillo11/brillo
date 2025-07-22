import { Card, CardContent } from "@repo/ui/components/card";
import {
  TrendingUp,
  Users,
  DollarSign,
  FileText,
  MessageSquare,
  CreditCard,
  UserCheck,
  AlertTriangle,
} from "lucide-react";

interface StatusCardListProps {
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

export default function StatusCardList({ stats }: StatusCardListProps) {
  return (
    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className="transition-shadow hover:shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">총 사용자</p>
              <h3 className="mt-1 text-2xl font-bold text-gray-900">
                {stats.totalUsers.toLocaleString()}
              </h3>
              <p className="mt-1 text-sm text-green-600">
                <TrendingUp className="mr-1 inline h-3 w-3" />+
                {stats.newSignups} 신규
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="transition-shadow hover:shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">총 매출</p>
              <h3 className="mt-1 text-2xl font-bold text-gray-900">
                {stats.totalRevenue.toLocaleString()}원
              </h3>
              <p className="mt-1 text-sm text-green-600">
                <TrendingUp className="mr-1 inline h-3 w-3" />+
                {stats.monthlyPayments}건 이번 달
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="transition-shadow hover:shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">게시글</p>
              <h3 className="mt-1 text-2xl font-bold text-gray-900">
                {stats.totalPosts.toLocaleString()}
              </h3>
              <p className="mt-1 text-sm text-blue-600">
                <MessageSquare className="mr-1 inline h-3 w-3" />
                {stats.totalComments.toLocaleString()} 댓글
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="transition-shadow hover:shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">환불 대기</p>
              <h3 className="mt-1 text-2xl font-bold text-gray-900">
                {stats.pendingRefunds}
              </h3>
              <p className="mt-1 text-sm text-orange-600">
                <UserCheck className="mr-1 inline h-3 w-3" />
                {stats.activeUsers.toLocaleString()} 활성 사용자
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
