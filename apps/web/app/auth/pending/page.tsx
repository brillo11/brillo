import { Card, CardContent } from "@repo/ui/components/card";
import { headers } from "next/headers";
import { auth } from "@/shared/lib/auth";
import { redirect } from "next/navigation";

export default async function PendingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  // 만약 PENDING 상태가 아니라면 (예: 승인됨) 메인으로 이동
  if ((session.user as any).status !== "PENDING") {
     // Optional: Redirect to dashboard if approved
     // redirect("/"); 
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* 배경 장식 요소 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200/30 rounded-full animate-bounce"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-purple-200/30 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 left-32 w-12 h-12 bg-indigo-200/30 rounded-full animate-bounce delay-300"></div>
        <div className="absolute bottom-32 right-16 w-24 h-24 bg-blue-100/30 rounded-full animate-pulse delay-500"></div>
      </div>

      <div className="max-w-md w-full space-y-6 relative z-10">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            가입 신청 완료
          </h1>
          <p className="text-slate-600 text-sm">관리자 승인 대기 중입니다</p>
        </div>

        <Card className="w-full border-none shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center animate-pulse">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-yellow-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-slate-800">
                관리자의 승인을 기다리는 중입니다.
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                승인이 완료되면 서비스를 이용하실 수 있습니다.
                <br />
                조금만 기다려 주세요!
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-400 mb-4">
                혹시 정보를 잘못 입력하셨나요? 관리자에게 문의해주세요.
              </p>
              <form
                action={async () => {
                  "use server";
                  const { auth } = await import("@/shared/lib/auth");
                  const { headers } = await import("next/headers");
                  await auth.api.signOut({
                    headers: await headers(),
                  });
                  redirect("/");
                }}
              >
                <button
                  type="submit"
                  className="text-sm text-slate-500 hover:text-slate-800 underline transition-colors"
                >
                  로그아웃
                </button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
