import { getPosts } from "@/serverActions/post.actions";
import { kdayjs } from "@/shared/lib/utils/dayjs";
import { Megaphone } from "lucide-react";
import { Badge } from "@repo/ui/components/badge";
import Link from "next/link";

export default async function AnnouncementsPage() {
  const { posts } = await getPosts("notice", 1, 20);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Megaphone className="h-8 w-8 text-[#E53935]" />
            <h1 className="text-3xl font-bold text-gray-900">공지사항</h1>
          </div>
          <p className="text-gray-600">중요한 공지사항을 확인하세요</p>
        </div>

        {/* 포스트 목록 */}
        <div className="space-y-6">
          {posts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              공지사항이 없습니다.
            </div>
          ) : (
            posts.map((post) => {
              // misc에서 기수 정보 추출 (예: { class: "1기" })
              const misc = (post.misc as any) || {};
              const classTitle = misc.class || misc.classTitle || "";

              // content에서 상품 리스트 파싱 (간단한 예시)
              // 실제로는 content가 마크다운이나 HTML일 수 있음
              const content = post.content || "";

              return (
                <Link
                  key={post.id.toString()}
                  href={`/student/community/announcements/${post.slug}`}
                  className="block"
                >
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    {/* 제목과 기수 배지 */}
                    <div className="flex items-start justify-between mb-4">
                      <h2 className="text-xl font-semibold text-gray-900 flex-1">
                        {post.title}
                      </h2>
                      {classTitle && (
                        <Badge
                          variant="outline"
                          className="ml-3 bg-gray-100 text-gray-700"
                        >
                          {classTitle}
                        </Badge>
                      )}
                    </div>

                    {/* 상품 리스트 미리보기 (content의 일부만 표시) */}
                    {content && (
                      <div className="mb-4 text-sm text-gray-600 line-clamp-3">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: content
                              .replace(/\n/g, "<br />")
                              .substring(0, 200),
                          }}
                        />
                        {content.length > 200 && "..."}
                      </div>
                    )}

                    {/* 작성자와 날짜 */}
                    <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {post.author?.nickname || post.author?.name || "작성자"}
                        </span>
                      </div>
                      <div>
                        {kdayjs(post.createdAt).format(
                          "YYYY년 M월 D일 A hh:mm"
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

