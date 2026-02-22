"use client";

import { useSession } from "@/shared/lib/auth-client";
import { useRouter } from "next/navigation";
import { PATH } from "@/shared/consts/path";
import { useSetAtom } from "jotai";
import { loginModalOpenAtom } from "@/features/auth/login-modal-atom";

export function LoginButton() {
  const { data: session } = useSession();
  const router = useRouter();
  const setIsLoginOpen = useSetAtom(loginModalOpenAtom);

  const handleClick = () => {
    if (session?.user) {
      router.push("/mypage/me");
    } else {
      setIsLoginOpen(true);
    }
  };

  return (
    <button onClick={handleClick} className="block group">
      {session?.user ? (
        <img
          className="w-5 h-5 opacity-90 group-hover:opacity-100 transition-opacity"
          alt="User login"
          src="/images/auth/user-login-icon.svg"
        />
      ) : (
        <span className="text-sm font-medium text-white">로그인</span>
      )}
    </button>
  );
}
