import { getPopularPosts, getBoards } from "@/serverActions/post.actions";
import Link from "next/link";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import { Separator } from "@repo/ui/components/separator";
import {
  BookOpen,
  Users,
  MessageCircle,
  TrendingUp,
  Eye,
  Heart,
  ArrowRight,
  PlusCircle,
  Sparkles,
  Globe,
  Clock,
  Star,
  Home,
  Search,
} from "lucide-react";
import CTA from "./components/CTA";

// SSG 적용 - 정적 생성으로 최적화
export const dynamic = "force-static";
export const revalidate = 3600; // 1시간마다 재생성

export default async function DetailLandingPage() {
  // 서버에서 데이터 페칭
  const [popularPosts, boards] = await Promise.all([
    getPopularPosts(6),
    getBoards(),
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* 🎯 Hero 랜딩 섹션 */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700">
        {/* 배경 패턴 */}
        <div className="absolute inset-0 bg-black/10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:py-24 lg:py-32">
          <div className="text-center space-y-8">
            {/* 메인 헤드라인 */}
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white/90 text-sm font-medium">
                  <Sparkles className="h-4 w-4" />
                  새로운 커뮤니티 경험
                </div>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                함께 만들어가는
                <br />
                <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  지식의 공간
                </span>
              </h1>

              <p className="text-xl sm:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
                다양한 주제로 소통하고, 경험을 나누며, 함께 성장하는 커뮤니티에
                참여해보세요.
              </p>
            </div>

            {/* CTA 버튼들 */}
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all duration-300 text-lg px-8 py-4"
                asChild
              >
                <Link href="/board/general/write">
                  <PlusCircle className="h-5 w-5 mr-2" />
                  지금 글쓰기 시작
                </Link>
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 transition-all duration-300 text-lg px-8 py-4"
                asChild
              >
                <Link href="#explore">
                  <Search className="h-5 w-5 mr-2" />
                  커뮤니티 둘러보기
                </Link>
              </Button>
            </div>

            {/* 통계 정보 */}
            <div className="pt-12">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-white">
                    {popularPosts.length}+
                  </div>
                  <div className="text-blue-200 mt-1">활발한 게시글</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-white">
                    {boards.length}
                  </div>
                  <div className="text-blue-200 mt-1">다양한 주제</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-white">
                    24/7
                  </div>
                  <div className="text-blue-200 mt-1">언제나 열린 공간</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🔥 인기 게시글 섹션 */}
      <div id="explore" className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <div className="flex items-center gap-2 bg-orange-100 text-orange-800 rounded-full px-4 py-2 text-sm font-medium">
                <TrendingUp className="h-4 w-4" />
                HOT 게시글
              </div>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              지금 가장 인기있는 이야기
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              커뮤니티에서 가장 많은 관심을 받고 있는 게시글들을 만나보세요
            </p>
          </div>

          {popularPosts.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {popularPosts.map((post, index) => (
                <Card
                  key={post.id.toString()}
                  className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden"
                >
                  {/* 인기 순위 배지 */}
                  {index < 3 && (
                    <div className="absolute top-4 left-4 z-10">
                      <div
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
                          index === 0
                            ? "bg-yellow-500 text-white"
                            : index === 1
                              ? "bg-gray-400 text-white"
                              : "bg-orange-500 text-white"
                        }`}
                      >
                        <Star className="h-3 w-3" />
                        {index + 1}위
                      </div>
                    </div>
                  )}

                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {post.board.title}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        <Users className="h-3 w-3 mr-1" />
                        {post.author.nickname || post.author.name}
                      </Badge>
                    </div>
                    <CardTitle className="line-clamp-2 group-hover:text-blue-600 transition-colors">
                      <Link href={`/board/${post.board.slug}/${post.slug}`}>
                        {post.title}
                      </Link>
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-center gap-6 text-sm text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{post.views}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        <span>{post._count.comments}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        <span>{post._count.likes}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Clock className="h-3 w-3" />
                      <span>
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 text-lg">아직 게시글이 없습니다.</p>
            </div>
          )}
        </div>
      </div>

      {/* 🎯 게시판 탐색 섹션 */}
      <div className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <div className="flex items-center gap-2 bg-blue-100 text-blue-800 rounded-full px-4 py-2 text-sm font-medium">
                <Globe className="h-4 w-4" />
                다양한 주제
              </div>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              원하는 주제를 찾아보세요
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              관심있는 분야에서 사람들과 소통하고 지식을 나눠보세요
            </p>
          </div>

          {boards.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {boards.map((board) => (
                <Card
                  key={board.id}
                  className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg"
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <Link
                            href={`/board/${board.slug}`}
                            className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors"
                          >
                            {board.title}
                          </Link>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        <span>{board._count.posts}개 게시글</span>
                      </div>
                      <Link
                        href={`/board/${board.slug}/write`}
                        className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                      >
                        글쓰기
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Globe className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 text-lg">게시판을 준비 중입니다.</p>
            </div>
          )}
        </div>
      </div>

      {/* 🚀 메인 CTA 섹션 */}
      <CTA />
    </div>
  );
}
