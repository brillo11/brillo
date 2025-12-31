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
      router.push(PATH.SERVICE_DASHBOARD);
    } else {
      setIsLoginOpen(true);
    }
  };

  return (
    <button onClick={handleClick} className="block group">
      <img
        className="w-5 h-5 opacity-90 group-hover:opacity-100 transition-opacity"
        alt="User login"
        src="https://c.animaapp.com/oAayiH1p/img/user-3-line.svg"
      />
    </button>
  );
}
