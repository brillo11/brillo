import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/database";

export async function POST(request: NextRequest) {
  try {
    const startTime = Date.now();

    // 1. 데이터베이스 연결 테스트
    const connectionTest = await prisma.$queryRaw`SELECT 1 as test`;
    const connectionTime = Date.now() - startTime;

    // 2. 관리자 계정 존재 확인
    const adminCheckStart = Date.now();
    const adminCount = await prisma.user.count({
      where: {
        role: "ADMIN",
        provider: "CREDENTIALS",
      },
    });
    const adminCheckTime = Date.now() - adminCheckStart;

    // 3. 샘플 쿼리 성능 테스트
    const sampleQueryStart = Date.now();
    const userCount = await prisma.user.count();
    const sampleQueryTime = Date.now() - sampleQueryStart;

    const totalTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: {
        connection: {
          status: "connected",
          responseTime: `${connectionTime}ms`,
          result: connectionTest,
        },
        adminAccounts: {
          count: adminCount,
          responseTime: `${adminCheckTime}ms`,
          status: adminCount > 0 ? "exists" : "missing",
        },
        performance: {
          totalUsers: userCount,
          queryTime: `${sampleQueryTime}ms`,
          totalTestTime: `${totalTime}ms`,
        },
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
      },
    });
  } catch (error) {
    console.error("🚨 Database test failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message:
            error instanceof Error ? error.message : "Unknown database error",
          type:
            error instanceof Error ? error.constructor.name : "UnknownError",
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}
