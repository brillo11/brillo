import Link from "next/link";
import { prisma } from "@repo/database";
import { kdayjs } from "@/shared/lib/utils/dayjs";

export const dynamic = "force-dynamic";

function getExcerpt(content: string, length = 132) {
  const normalized = content.replace(/\s+/g, " ").trim();
  return normalized.length > length
    ? `${normalized.slice(0, length).trim()}...`
    : normalized;
}

export default async function BlogPage() {
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
        },
      },
    },
  });

  const [featuredPost, ...restPosts] = posts;

  return (
    <main className="min-h-screen bg-[#f7f3f0] pt-32 text-black">
      <section className="mx-auto max-w-screen-xl px-4 pb-20">
        <div className="grid gap-10 border-b border-black/20 pb-12 md:grid-cols-[0.8fr_1.2fr] md:items-end">
          <div>
            <p className="font-suit text-xs font-bold uppercase tracking-[0.24em] text-black/45">
              Visual Directing Journal
            </p>
            <h1 className="mt-5 font-playfair text-[42px] leading-none md:text-[76px]">
              Blog
            </h1>
          </div>
          <p className="max-w-2xl font-suit text-base leading-8 text-black/65 md:justify-self-end">
            외모를 감각이 아닌 전략으로 바라보는 기록. 브릴로의 비주얼
            디렉팅 관점과 데이터 기반 스타일링 인사이트를 전합니다.
          </p>
        </div>

        {featuredPost ? (
          <Link
            href={`/blog/${featuredPost.slug}`}
            className="group grid gap-8 border-b border-black/15 py-12 md:grid-cols-[1.15fr_0.85fr] md:items-stretch"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-black">
              {featuredPost.thumbnail ? (
                <img
                  src={featuredPost.thumbnail}
                  alt=""
                  className="h-full w-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-[1.03]"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-black px-10 text-center font-playfair text-4xl text-white md:text-6xl">
                  BRILLO
                </div>
              )}
            </div>

            <article className="flex flex-col justify-between">
              <div>
                <div className="mb-5 flex flex-wrap gap-2">
                  {featuredPost.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="border border-black/20 px-3 py-1 font-suit text-xs text-black/60"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h2 className="font-suit text-3xl font-bold leading-tight tracking-normal md:text-5xl">
                  {featuredPost.title}
                </h2>
                <p className="mt-6 font-suit text-base leading-8 text-black/60">
                  {getExcerpt(featuredPost.content, 190)}
                </p>
              </div>

              <div className="mt-10 flex items-center justify-between border-t border-black/15 pt-5 font-suit text-sm text-black/45">
                <span>{kdayjs(featuredPost.createdAt).format("YYYY.MM.DD")}</span>
                <span className="text-black transition-colors group-hover:text-black/55">
                  Read article
                </span>
              </div>
            </article>
          </Link>
        ) : (
          <div className="py-28 text-center font-suit text-sm text-black/50">
            아직 발행된 글이 없습니다.
          </div>
        )}

        {restPosts.length > 0 && (
          <div className="grid gap-0 md:grid-cols-3">
            {restPosts.map((post) => (
              <Link
                key={post.id.toString()}
                href={`/blog/${post.slug}`}
                className="group border-b border-black/15 py-8 md:border-r md:px-7 md:last:border-r-0"
              >
                <div className="mb-5 flex items-center justify-between font-suit text-xs text-black/40">
                  <span>{kdayjs(post.createdAt).format("YYYY.MM.DD")}</span>
                  <span>{String(post.id).padStart(2, "0")}</span>
                </div>
                <h2 className="font-suit text-xl font-bold leading-8 tracking-normal">
                  {post.title}
                </h2>
                <p className="mt-4 font-suit text-sm leading-7 text-black/55">
                  {getExcerpt(post.content)}
                </p>
                <div className="mt-8 font-suit text-xs font-bold uppercase tracking-[0.16em] text-black transition-opacity group-hover:opacity-55">
                  Read
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
