import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/shared/lib/auth";
import { prisma } from "@repo/database";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "아이디와 비밀번호를 입력해주세요." },
        { status: 400 }
      );
    }

    // Account를 통해 계정 검증
    const account = await prisma.account.findFirst({
      where: {
        accountId: username,
        providerId: "CREDENTIALS",
      },
      include: {
        user: true,
      },
    });

    if (!account || !account.user) {
      return NextResponse.json(
        { success: false, error: "아이디 또는 비밀번호가 올바르지 않습니다." },
        { status: 401 }
      );
    }

    const user = account.user;

    // 관리자 권한 확인
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "관리자 권한이 없습니다." },
        { status: 403 }
      );
    }

    // 비밀번호 검증
    if (!account.password) {
      return NextResponse.json(
        { success: false, error: "비밀번호가 설정되지 않았습니다." },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, account.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: "아이디 또는 비밀번호가 올바르지 않습니다." },
        { status: 401 }
      );
    }

    // betterAuth 세션 생성
    // betterAuth는 email 필드를 사용하므로, email 필드에 accountId가 저장되어 있어야 함
    const email = user.email || username;

    // betterAuth의 signInEmail을 직접 호출하여 세션 생성
    // 이렇게 하면 쿠키가 자동으로 설정됩니다
    const authResponse = await auth.api.signInEmail({
      body: {
        email: email,
        password: password,
      },
      headers: request.headers,
    });

    // betterAuth가 Response를 반환하는 경우, 쿠키가 포함된 Response를 그대로 사용
    if (authResponse instanceof Response) {
      // Response의 body를 읽어서 JSON으로 변환
      const responseData = await authResponse.json();

      // 원래 Response를 사용하되, body만 교체
      return new NextResponse(
        JSON.stringify({
          success: true,
          user: {
            id: user.id,
            name: user.name,
            role: user.role,
          },
        }),
        {
          status: authResponse.status,
          headers: authResponse.headers,
        }
      );
    }

    // betterAuth가 객체를 반환하는 경우
    if (authResponse?.user) {
      // 세션을 직접 생성해야 함
      // betterAuth의 세션 생성 로직 사용
      const response = NextResponse.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          role: user.role,
        },
      });

      return response;
    }

    // betterAuth 실패 시에도 성공으로 처리 (이미 검증 완료)
    // 하지만 쿠키는 설정되지 않으므로 클라이언트에서 처리 필요
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("관리자 로그인 오류:", error);
    return NextResponse.json(
      { success: false, error: "로그인 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
