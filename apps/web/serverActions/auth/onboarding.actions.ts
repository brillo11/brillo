"use server";

import { auth } from "@/shared/lib/auth";
import { prisma } from "@repo/database";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { redirect } from "next/navigation";

const onboardingSchema = z.object({
  name: z.string().min(2, "이름은 2글자 이상이어야 합니다."),
  phoneNumber: z
    .string()
    .regex(/^010-\d{4}-\d{4}$/, "올바른 휴대폰 번호 형식이 아닙니다."),
  nickname: z.string().min(1, "별명이 생성되지 않았습니다."),
  // cohortId: z.string().optional(), // tubeinsight might not need this mandatory
  bizName: z.string().min(1, "사업자명을 입력해주세요."), // 사업자명 필수
});

export async function submitOnboarding(prevState: any, formData: FormData) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { error: "로그인이 필요합니다." };
    }

    const rawData = {
      name: formData.get("name"),
      phoneNumber: formData.get("phoneNumber"),
      nickname: formData.get("nickname"),
      // cohortId: formData.get("cohortId"),
      bizName: formData.get("bizName"), 
    };

    const validatedFields = onboardingSchema.safeParse(rawData);

    if (!validatedFields.success) {
      return {
        error: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { name, phoneNumber, nickname, bizName } = validatedFields.data;

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        phoneNumber,
        nickname,
        // cohortId: cohortId ? BigInt(cohortId) : undefined,
        bizName: bizName || "", 
        status: "PENDING", // 승인 대기 상태로 변경
      },
    });

    revalidatePath("/student");
    revalidatePath("/", "layout"); // 전체 레이아웃 갱신
  } catch (error: any) {
    console.error("Onboarding error:", error);
    if(error.code === 'P2002') {
         return { error: "이미 사용중인 닉네임이나 전화번호입니다." };
    }
    return { error: "저장 중 오류가 발생했습니다." };
  }

  redirect("/student");
}
