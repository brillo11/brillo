"use server";

import { prisma, PAYMENT_STATUS } from "@repo/database";
import { requireAdmin } from "@/shared/lib/auth-guards";

/**
 * 관리자 대시보드 통계 정보를 반환하는 서버 액션
 * ⚠️ 관리자 권한 필수 - 미들웨어 + 서버 액션 이중 검증
 */
export async function getAdminDashboardStats() {
  // 🛡️ 서버 사이드 권한 검증 (2차 방어선)
  await requireAdmin();
  // 전체 유저 수
  const totalUsers = await prisma.user.count();

  // 전체 게시글 수
  const totalPosts = await prisma.post.count();

  // 전체 댓글 수
  const totalComments = await prisma.comment.count();

  // 전체 결제 금액(원)
  const totalRevenueResult = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: {
      status: PAYMENT_STATUS.COMPLETED,
      isTest: false,
    },
  });
  const totalRevenue = totalRevenueResult._sum?.amount || 0;

  // 이번달/전달 신규 가입자 수
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    0,
    23,
    59,
    59,
    999
  );

  const newSignups = await prisma.user.count({
    where: { createdAt: { gte: startOfThisMonth } },
  });
  const lastMonthSignups = await prisma.user.count({
    where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
  });
  const monthlyGrowth =
    lastMonthSignups === 0
      ? 0
      : Math.round((newSignups / lastMonthSignups) * 1000) / 10; // %

  // 최근 30일 내 가입자 수
  const last30Days = new Date();
  last30Days.setDate(now.getDate() - 30);
  const activeUsers = await prisma.user.count({
    where: { createdAt: { gte: last30Days } },
  });

  // 이번달 결제 건수
  const monthlyPayments = await prisma.payment.count({
    where: {
      createdAt: { gte: startOfThisMonth },
      status: PAYMENT_STATUS.COMPLETED,
    },
  });

  // 환불 대기 건수
  const pendingRefunds = await prisma.refund.count({
    where: { status: "PENDING" },
  });

  return {
    totalUsers,
    totalPosts,
    totalComments,
    totalRevenue,
    monthlyGrowth,
    activeUsers,
    newSignups,
    monthlyPayments,
    pendingRefunds,
  };
}
