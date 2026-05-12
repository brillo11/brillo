"use server";

import { prisma } from "@repo/database";
import { requireAdmin } from "@/shared/lib/auth-guards";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const BLOG_BOARD_SLUG = "blog";

function createSlug(title: string) {
  const normalized = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);

  return `${normalized || "blog"}-${Date.now()}`;
}

async function getOrCreateBlogBoard() {
  return prisma.board.upsert({
    where: { slug: BLOG_BOARD_SLUG },
    update: {},
    create: {
      title: "Blog",
      slug: BLOG_BOARD_SLUG,
    },
  });
}

export async function createBlogPostAction(formData: FormData) {
  const session = await requireAdmin();

  const title = formData.get("title")?.toString().trim() || "";
  const content = formData.get("content")?.toString().trim() || "";
  const thumbnail = formData.get("thumbnail")?.toString().trim() || "";
  const tags =
    formData
      .get("tags")
      ?.toString()
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean) || [];

  if (!title || !content) {
    throw new Error("제목과 본문을 입력해주세요.");
  }

  const board = await getOrCreateBlogBoard();
  const slug = createSlug(title);

  await prisma.post.create({
    data: {
      title,
      content,
      thumbnail,
      slug,
      tags,
      authorId: session.user.id,
      boardId: board.id,
    },
  });

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  redirect("/admin/blog");
}

export async function deleteBlogPostAction(formData: FormData) {
  await requireAdmin();

  const postId = formData.get("postId")?.toString();
  if (!postId) {
    throw new Error("게시글 ID가 없습니다.");
  }

  const post = await prisma.post.findUnique({
    where: { id: BigInt(postId) },
    include: { board: true },
  });

  if (!post || post.board.slug !== BLOG_BOARD_SLUG) {
    throw new Error("삭제할 블로그 글을 찾을 수 없습니다.");
  }

  await prisma.post.delete({
    where: { id: post.id },
  });

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}
