"use client";

import { Button } from "@repo/ui/components/button";
import { Plus, Settings, Star, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function UserHeader() {
  const router = useRouter();
  return (
    <div className="border-b bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
              <User className="h-6 w-6 text-[#E53935]" />
              유저 관리
            </h1>
            <p className="text-gray-600">
              유저 정보 수정, 삭제 등의 작업을 할 수 있습니다.
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* <Button variant="outline" onClick={() => router.push("/admin")}>
              <Settings className="mr-2 h-4 w-4" />
              관리자 대시보드
            </Button> */}
            {/* <Link href="/admin/user/new">
              <Button className="bg-[#E53935] hover:bg-[#d32f2f]">
                <Plus className="mr-2 h-4 w-4" />새 관리자 추가
              </Button>
            </Link> */}
          </div>
        </div>
      </div>
    </div>
  );
}
