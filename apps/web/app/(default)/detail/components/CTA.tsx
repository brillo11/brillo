import { Button } from "@repo/ui/components/button";
import Link from "next/link";
import { Home, Users, MessageCircle, Sparkles, PlusCircle } from "lucide-react";

export default function CTA() {
  return (
    <div className="py-16 lg:py-24">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 lg:p-12 text-white shadow-2xl">
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl font-bold">
                지금 바로 시작하세요!
              </h2>
              <p className="text-lg sm:text-xl text-indigo-100 max-w-2xl mx-auto">
                여러분의 이야기가 누군가에게는 큰 도움이 될 수 있습니다. 지금
                바로 커뮤니티에 참여해보세요.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                size="lg"
                className="bg-white text-purple-600 hover:bg-purple-50 shadow-lg hover:shadow-xl transition-all duration-300 text-lg px-8 py-4"
                asChild
              >
                <Link href="/board/general/write">
                  <PlusCircle className="h-5 w-5 mr-2" />첫 번째 글 작성하기
                </Link>
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-purple-600 transition-all duration-300 text-lg px-8 py-4"
                asChild
              >
                <Link href="/">
                  <Home className="h-5 w-5 mr-2" />
                  홈으로 돌아가기
                </Link>
              </Button>
            </div>
          </div>

          {/* 추가 인센티브 */}
          <div className="mt-8 pt-8 border-t border-white/20">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
              <div className="flex items-center justify-center gap-2">
                <Users className="h-4 w-4" />
                <span>따뜻한 커뮤니티</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <MessageCircle className="h-4 w-4" />
                <span>활발한 소통</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span>새로운 경험</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
