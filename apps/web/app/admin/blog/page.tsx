import Link from "next/link";
import { prisma } from "@repo/database";
import { kdayjs } from "@/shared/lib/utils/dayjs";
import { createBlogPostAction, deleteBlogPostAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const posts = await prisma.post.findMany({
    where: {
      board: {
        slug: "blog",
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      author: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
          Editorial
        </p>
        <h2 className="text-2xl font-bold text-gray-950">Blog 관리</h2>
        <p className="text-sm text-gray-500">
          브릴로의 비주얼 디렉팅 관점, 사례, 인사이트를 발행합니다.
        </p>
      </div>

      <form
        action={createBlogPostAction}
        className="bg-white border border-gray-200 shadow-sm"
      >
        <div className="grid gap-6 p-6">
          <div className="grid gap-2">
            <label
              htmlFor="title"
              className="text-sm font-semibold text-gray-900"
            >
              제목
            </label>
            <input
              id="title"
              name="title"
              required
              placeholder="예: 나에게 맞는 이미지는 어떻게 설계되는가"
              className="h-12 border border-gray-300 px-4 text-sm outline-none transition-colors focus:border-black"
            />
          </div>

          <div className="grid gap-2">
            <label
              htmlFor="thumbnail"
              className="text-sm font-semibold text-gray-900"
            >
              대표 이미지 URL
            </label>
            <input
              id="thumbnail"
              name="thumbnail"
              placeholder="https://... 또는 /images/..."
              className="h-12 border border-gray-300 px-4 text-sm outline-none transition-colors focus:border-black"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="tags" className="text-sm font-semibold text-gray-900">
              태그
            </label>
            <input
              id="tags"
              name="tags"
              placeholder="비주얼디렉팅, 스타일링, 메이크오버"
              className="h-12 border border-gray-300 px-4 text-sm outline-none transition-colors focus:border-black"
            />
          </div>

          <div className="grid gap-2">
            <label
              htmlFor="content"
              className="text-sm font-semibold text-gray-900"
            >
              본문
            </label>
            <textarea
              id="content"
              name="content"
              required
              rows={14}
              placeholder="문단 단위로 작성하면 Blog 상세 페이지에 그대로 반영됩니다."
              className="resize-y border border-gray-300 p-4 text-sm leading-7 outline-none transition-colors focus:border-black"
            />
          </div>

          <div className="flex justify-end border-t border-gray-100 pt-6">
            <button
              type="submit"
              className="h-11 bg-black px-7 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
            >
              글 발행하기
            </button>
          </div>
        </div>
      </form>

      <div className="bg-white border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h3 className="text-base font-bold text-gray-950">발행 글</h3>
          <span className="text-sm text-gray-500">총 {posts.length}건</span>
        </div>

        <div className="divide-y divide-gray-100">
          {posts.map((post) => (
            <div
              key={post.id.toString()}
              className="grid gap-4 px-6 py-5 md:grid-cols-[1fr_auto] md:items-center"
            >
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                  <span>{kdayjs(post.createdAt).format("YYYY.MM.DD HH:mm")}</span>
                  <span>/</span>
                  <span>{post.author.name || post.author.email || "관리자"}</span>
                </div>
                <Link
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  className="block truncate text-base font-semibold text-gray-950 hover:underline"
                >
                  {post.title}
                </Link>
                <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-6 text-gray-500">
                  {post.content}
                </p>
              </div>

              <form action={deleteBlogPostAction}>
                <input type="hidden" name="postId" value={post.id.toString()} />
                <button
                  type="submit"
                  className="h-9 border border-red-200 px-4 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
                >
                  삭제
                </button>
              </form>
            </div>
          ))}

          {posts.length === 0 && (
            <div className="px-6 py-14 text-center text-sm text-gray-500">
              아직 발행된 글이 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
