"use server";

import { prisma } from "@repo/database";
import { requireAuth, requireAdmin } from "@/shared/lib/auth-guards";
import { revalidatePath } from "next/cache";

// 댓글 목록 조회 (CSR용)
export async function getComments(
  postId: string,
  page = 1,
  limit = 20
): Promise<{
  comments: any[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}> {
  const offset = (page - 1) * limit;

  const [comments, totalCount] = await Promise.all([
    prisma.comment.findMany({
      where: {
        postId: BigInt(postId),
        parentId: null, // 최상위 댓글만
        deleted: false,
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
        replies: {
          where: {
            deleted: false,
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
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: offset,
      take: limit,
    }),
    prisma.comment.count({
      where: {
        postId: BigInt(postId),
        parentId: null,
        deleted: false,
      },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return {
    comments,
    pagination: {
      currentPage: page,
      totalPages,
      totalCount,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

// 댓글 작성
export async function createComment(formData: FormData): Promise<void> {
  const session = await requireAuth();

  const postId = formData.get("postId") as string;
  const content = formData.get("content") as string;
  const parentId = formData.get("parentId") as string;

  if (!content.trim()) {
    throw new Error("댓글 내용을 입력해주세요.");
  }

  const post = await prisma.post.findUnique({
    where: { id: BigInt(postId) },
    include: { board: true },
  });

  if (!post) {
    throw new Error("존재하지 않는 게시글입니다.");
  }

  await prisma.comment.create({
    data: {
      content: content.trim(),
      authorId: BigInt(session.user.id),
      postId: BigInt(postId),
      parentId: parentId ? BigInt(parentId) : null,
    },
  });

  revalidatePath(`/board/${post.board.slug}/${post.slug}`);
}

// 댓글 수정
export async function updateComment(
  commentId: string,
  content: string
): Promise<void> {
  const session = await requireAuth();

  if (!content.trim()) {
    throw new Error("댓글 내용을 입력해주세요.");
  }

  const comment = await prisma.comment.findUnique({
    where: { id: BigInt(commentId) },
    include: {
      post: {
        include: {
          board: true,
        },
      },
    },
  });

  if (!comment) {
    throw new Error("댓글을 찾을 수 없습니다.");
  }

  // 작성자 또는 관리자만 수정 가능
  if (
    comment.authorId !== BigInt(session.user.id) &&
    session.user.role !== "ADMIN"
  ) {
    throw new Error("댓글을 수정할 권한이 없습니다.");
  }

  await prisma.comment.update({
    where: { id: BigInt(commentId) },
    data: {
      content: content.trim(),
      updatedAt: new Date(),
    },
  });

  revalidatePath(`/board/${comment.post.board.slug}/${comment.post.slug}`);
}

// 댓글 삭제 (소프트 삭제)
export async function deleteComment(commentId: string): Promise<void> {
  const session = await requireAuth();

  const comment = await prisma.comment.findUnique({
    where: { id: BigInt(commentId) },
    include: {
      post: {
        include: {
          board: true,
        },
      },
    },
  });

  if (!comment) {
    throw new Error("댓글을 찾을 수 없습니다.");
  }

  // 작성자 또는 관리자만 삭제 가능
  if (
    comment.authorId !== BigInt(session.user.id) &&
    session.user.role !== "ADMIN"
  ) {
    throw new Error("댓글을 삭제할 권한이 없습니다.");
  }

  // 소프트 삭제
  await prisma.comment.update({
    where: { id: BigInt(commentId) },
    data: {
      deleted: true,
      deletedContent: "삭제된 댓글입니다.",
      updatedAt: new Date(),
    },
  });

  revalidatePath(`/board/${comment.post.board.slug}/${comment.post.slug}`);
}
