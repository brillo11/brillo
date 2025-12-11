/**
 * Better Auth 헬퍼 함수들
 */

import {
  signIn as betterSignIn,
  signUp as betterSignUp,
  signOut as betterSignOut,
} from "./auth-client";
import { PATH } from "../consts/path";

/**
 * 이메일/비밀번호 회원가입
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  name?: string
) {
  try {
    const result = await betterSignUp.email({
      email,
      password,
      name: name || email.split("@")[0] || "", // 이름이 없으면 이메일의 앞부분 사용
      callbackURL: PATH.ADMIN_ROOT,
    });

    if (result?.error) {
      throw new Error(result.error.message || "회원가입에 실패했습니다.");
    }

    // 로컬스토리지에 최근 로그인 제공자 저장
    if (typeof window !== "undefined") {
      localStorage.setItem("RECENT_LOGIN_PROVIDER", "EMAIL");
    }

    return { success: true };
  } catch (error: any) {
    console.error("Email signup error:", error);
    return {
      success: false,
      error: error.message || "회원가입 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 이메일/비밀번호 로그인
 */
export async function loginWithEmail(email: string, password: string) {
  try {
    const result = await betterSignIn.email({
      email,
      password,
      callbackURL:
        email === "student.test@gmail.com"
          ? PATH.STUDENT_ROOT
          : PATH.ADMIN_ROOT,
    });

    if (result?.error) {
      throw new Error(result.error.message || "로그인에 실패했습니다.");
    }

    // 로컬스토리지에 최근 로그인 제공자 저장
    // if (typeof window !== "undefined") {
    //   localStorage.setItem("RECENT_LOGIN_PROVIDER", "EMAIL");
    // }

    return { success: true };
  } catch (error: any) {
    console.error("Email login error:", error);
    return {
      success: false,
      error: error.message || "로그인 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 소셜 로그인 (네이버, 카카오, 구글 등)
 */
export async function loginWithSocial(
  provider: "naver" | "kakao" | "google" | "apple"
) {
  try {
    console.log("loginWithSocial", provider);

    // 로컬스토리지에 최근 로그인 제공자 저장
    const providerUpperCase = provider.toUpperCase();
    if (typeof window !== "undefined") {
      localStorage.setItem("RECENT_LOGIN_PROVIDER", providerUpperCase);
    }

    await betterSignIn.social({
      provider,
      callbackURL: "/", // 미들웨어(middleware.ts)가 상태(UNKNOWN/PENDING)에 따라 적절한 페이지로 리다이렉트 처리함
    });
    return { success: true };
  } catch (error: any) {
    console.error("Social login error:", error);
    // 에러 발생 시 로컬스토리지에서 제거
    if (typeof window !== "undefined") {
      localStorage.removeItem("RECENT_LOGIN_PROVIDER");
    }
    return {
      success: false,
      error: error.message || "소셜 로그인에 실패했습니다.",
    };
  }
}

/**
 * 로그아웃
 * 참고: 다음 로그인 시 힌트로 사용하기 위해 RECENT_LOGIN_PROVIDER는 유지
 */
export async function logout() {
  try {
    await betterSignOut();
    return { success: true };
  } catch (error: any) {
    console.error("Logout error:", error);
    return {
      success: false,
      error: error.message || "로그아웃에 실패했습니다.",
    };
  }
}
