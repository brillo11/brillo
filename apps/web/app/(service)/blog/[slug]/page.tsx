import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@repo/database";
import { kdayjs } from "@/shared/lib/utils/dayjs";
import { getAbsoluteUrl } from "@/shared/consts/metadata";

interface BlogDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getBlogPost(slug: string) {
  return prisma.post.findUnique({
    where: {
      slug,
    },
    include: {
      board: true,
      author: {
        select: {
          name: true,
        },
      },
    },
  });
}

function getDescription(content: string) {
  return content.replace(/\s+/g, " ").trim().slice(0, 150);
}

function getImageUrl(thumbnail: string) {
  return thumbnail.startsWith("http") ? thumbnail : getAbsoluteUrl(thumbnail);
}

export async function generateMetadata({
  params,
}: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post || post.board.slug !== "blog") {
    return {};
  }

  return {
    title: `${post.title} | 브릴로 비주얼 디렉팅`,
    description: getDescription(post.content),
    openGraph: {
      title: post.title,
      description: getDescription(post.content),
      images: post.thumbnail ? [{ url: getImageUrl(post.thumbnail) }] : [],
      type: "article",
    },
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post || post.board.slug !== "blog") {
    notFound();
  }

  await prisma.post.update({
    where: { id: post.id },
    data: { views: { increment: 1 } },
  });

  const paragraphs = post.content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <main className="min-h-screen bg-[#f7f3f0] pt-32 text-black">
      <article className="mx-auto max-w-[960px] px-4 pb-24">
        <Link
          href="/blog"
          className="font-suit text-xs font-bold uppercase tracking-[0.18em] text-black/45 transition-colors hover:text-black"
        >
          Back to Blog
        </Link>

        <header className="mt-10 border-b border-black/15 pb-10">
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="border border-black/20 px-3 py-1 font-suit text-xs text-black/55"
              >
                {tag}
              </span>
            ))}
          </div>

          <h1 className="mt-7 font-suit text-[34px] font-bold leading-tight tracking-normal md:text-[58px]">
            {post.title}
          </h1>

          <div className="mt-8 flex flex-wrap items-center gap-3 font-suit text-sm text-black/45">
            <span>{kdayjs(post.createdAt).format("YYYY.MM.DD")}</span>
            <span>/</span>
            <span>{post.author.name || "BRILLO"}</span>
            <span>/</span>
            <span>{post.views + 1} views</span>
          </div>
        </header>

        {post.thumbnail && (
          <div className="mt-12 aspect-[16/9] overflow-hidden bg-black">
            <img
              src={post.thumbnail}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <div className="mx-auto mt-14 max-w-[720px] font-suit text-[17px] leading-9 text-black/75">
          {paragraphs.map((paragraph) => (
            <p key={paragraph} className="mb-8 whitespace-pre-line">
              {paragraph}
            </p>
          ))}
        </div>
      </article>
    </main>
  );
}
