"use server";

import { prisma } from "@repo/database";
import { requireAuth, requireAdmin } from "@/lib/auth-guards";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import type { Post, Board, User } from "@repo/database";

// 게시글 목록 조회 (ISR용)
export async function getPosts(
  boardSlug: string,
  page = 1,
  limit = 10
): Promise<{
  posts: any[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}> {
  const offset = (page - 1) * limit;

  const [posts, totalCount] = await Promise.all([
    prisma.post.findMany({
      where: {
        board: {
          slug: boardSlug,
        },
      },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
            name: true,
          },
        },
        board: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: offset,
      take: limit,
    }),
    prisma.post.count({
      where: {
        board: {
          slug: boardSlug,
        },
      },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return {
    posts,
    pagination: {
      currentPage: page,
      totalPages,
      totalCount,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

// 게시글 상세 조회 (ISR용)
export async function getPost(slug: string): Promise<any> {
  const post = await prisma.post.findUnique({
    where: {
      slug: slug,
    },
    include: {
      author: {
        select: {
          id: true,
          nickname: true,
          name: true,
          role: true,
        },
      },
      board: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
      _count: {
        select: {
          comments: true,
          likes: true,
        },
      },
    },
  });

  if (!post) {
    throw new Error("게시글을 찾을 수 없습니다.");
  }

  // 조회수 증가
  await prisma.post.update({
    where: { slug },
    data: { views: { increment: 1 } },
  });

  return post;
}

// 게시글 작성
export async function createPost(formData: FormData) {
  const session = await requireAuth();

  const boardSlug = formData.get("boardSlug") as string;
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const tags =
    (formData.get("tags") as string)?.split(",").map((tag) => tag.trim()) || [];

  if (!title.trim() || !content.trim()) {
    throw new Error("제목과 내용을 입력해주세요.");
  }

  const board = await prisma.board.findUnique({
    where: { slug: boardSlug },
  });

  if (!board) {
    throw new Error("존재하지 않는 게시판입니다.");
  }

  // slug 생성 (제목 기반 + timestamp)
  const slug = `${title.slice(0, 50).replace(/[^a-zA-Z0-9가-힣]/g, "-")}-${Date.now()}`;

  const post = await prisma.post.create({
    data: {
      title: title.trim(),
      content: content.trim(),
      slug,
      tags,
      authorId: BigInt(session.user.id),
      boardId: board.id,
    },
    include: {
      board: true,
    },
  });

  revalidateTag("posts");
  revalidatePath(`/board/${boardSlug}`);

  redirect(`/board/${boardSlug}/${post.slug}`);
}

// 게시글 수정
export async function updatePost(slug: string, formData: FormData) {
  const session = await requireAuth();

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const tags =
    (formData.get("tags") as string)?.split(",").map((tag) => tag.trim()) || [];

  if (!title.trim() || !content.trim()) {
    throw new Error("제목과 내용을 입력해주세요.");
  }

  const post = await prisma.post.findUnique({
    where: { slug },
    include: { author: true, board: true },
  });

  if (!post) {
    throw new Error("게시글을 찾을 수 없습니다.");
  }

  // 작성자 또는 관리자만 수정 가능
  if (
    post.authorId !== BigInt(session.user.id) &&
    session.user.role !== "ADMIN"
  ) {
    throw new Error("게시글을 수정할 권한이 없습니다.");
  }

  const updatedPost = await prisma.post.update({
    where: { slug },
    data: {
      title: title.trim(),
      content: content.trim(),
      tags,
      updatedAt: new Date(),
    },
    include: {
      board: true,
    },
  });

  revalidateTag("posts");
  revalidatePath(`/board/${updatedPost.board.slug}`);
  revalidatePath(`/board/${updatedPost.board.slug}/${slug}`);

  redirect(`/board/${updatedPost.board.slug}/${slug}`);
}

// 게시글 삭제
export async function deletePost(slug: string) {
  const session = await requireAuth();

  const post = await prisma.post.findUnique({
    where: { slug },
    include: { author: true, board: true },
  });

  if (!post) {
    throw new Error("게시글을 찾을 수 없습니다.");
  }

  // 작성자 또는 관리자만 삭제 가능
  if (
    post.authorId !== BigInt(session.user.id) &&
    session.user.role !== "ADMIN"
  ) {
    throw new Error("게시글을 삭제할 권한이 없습니다.");
  }

  await prisma.post.delete({
    where: { slug },
  });

  revalidateTag("posts");
  revalidatePath(`/board/${post.board.slug}`);

  redirect(`/board/${post.board.slug}`);
}

// 게시판 목록 조회
export async function getBoards(): Promise<any[]> {
  return await prisma.board.findMany({
    orderBy: {
      createdAt: "asc",
    },
    include: {
      _count: {
        select: {
          posts: true,
        },
      },
    },
  });
}

// 관리자용 게시글 목록 조회
export async function getAdminPosts(
  page = 1,
  limit = 20
): Promise<{
  posts: any[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}> {
  await requireAdmin();

  const offset = (page - 1) * limit;

  const [posts, totalCount] = await Promise.all([
    prisma.post.findMany({
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
            name: true,
            role: true,
          },
        },
        board: {
          select: {
            title: true,
            slug: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: offset,
      take: limit,
    }),
    prisma.post.count(),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return {
    posts,
    pagination: {
      currentPage: page,
      totalPages,
      totalCount,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

// 관련 게시글 조회 (같은 게시판의 다른 게시글)
export async function getRelatedPosts(
  boardSlug: string,
  currentPostId: string,
  limit = 3
): Promise<any[]> {
  try {
    const posts = await prisma.post.findMany({
      where: {
        board: {
          slug: boardSlug,
        },
        id: {
          not: parseInt(currentPostId),
        },
      },
      take: limit,
      orderBy: [{ views: "desc" }, { createdAt: "desc" }],
      include: {
        author: {
          select: {
            id: true,
            name: true,
            nickname: true,
            role: true,
          },
        },
        board: {
          select: {
            title: true,
            slug: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    return posts;
  } catch (error) {
    console.error("관련 게시글 조회 실패:", error);
    return [];
  }
}

// 인기 게시글 조회 (전체 게시판)
export async function getPopularPosts(limit = 6): Promise<any[]> {
  try {
    const posts = await prisma.post.findMany({
      take: limit,
      orderBy: [{ views: "desc" }, { createdAt: "desc" }],
      include: {
        author: {
          select: {
            id: true,
            name: true,
            nickname: true,
            role: true,
          },
        },
        board: {
          select: {
            title: true,
            slug: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    return posts;
  } catch (error) {
    console.error("인기 게시글 조회 실패:", error);
    return [];
  }
}
