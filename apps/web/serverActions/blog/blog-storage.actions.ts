"use server";

import { prisma } from "@repo/database";
import { requireStudent } from "@/shared/lib/auth-guards";
import { BlogFormData } from "../../app/(service)/service/personal-branding/blog/__components/BlogFormContext";

/**
 * 블로그 템플릿 저장
 */
export async function saveBlogTemplate(name: string, formData: BlogFormData) {
  const session = await requireStudent();
  const userId = session.user.id;

  return await prisma.blogTemplate.create({
    data: {
      userId,
      name,
      formData: formData as any,
    },
  });
}

/**
 * 블로그 템플릿 목록 조회
 */
export async function getBlogTemplates() {
  const session = await requireStudent();
  const userId = session.user.id;

  return await prisma.blogTemplate.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

/**
 * 블로그 템플릿 삭제
 */
export async function deleteBlogTemplate(id: string) {
  const session = await requireStudent();
  const userId = session.user.id;

  return await prisma.blogTemplate.delete({
    where: {
      id,
      userId,
    },
  });
}

/**
 * 블로그 포스트 히스토리 저장
 */
export async function saveBlogPostHistory(title: string, content: string, formData: BlogFormData) {
  const session = await requireStudent();
  const userId = session.user.id;

  return await prisma.blogPostHistory.create({
    data: {
      userId,
      title,
      content,
      formData: formData as any,
    },
  });
}

/**
 * 블로그 포스트 히스토리 목록 조회
 */
export async function getBlogPostHistories() {
  const session = await requireStudent();
  const userId = session.user.id;

  return await prisma.blogPostHistory.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

/**
 * 블로그 포스트 히스토리 삭제
 */
export async function deleteBlogPostHistory(id: string) {
  const session = await requireStudent();
  const userId = session.user.id;

  return await prisma.blogPostHistory.delete({
    where: {
      id,
      userId,
    },
  });
}

