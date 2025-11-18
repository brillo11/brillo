// import { prisma } from "@repo/database";
import { Button } from "@repo/ui/components/button";
import Link from "next/link";

export default async function Page() {
  // const users = await prisma.user.findMany();

  return (
    <div className="flex items-center justify-center min-h-svh">
      <div className="flex flex-col items-center justify-center gap-4">
        {/* <pre>{JSON.stringify(users, null, 2)}</pre> */}
        <h1 className="text-2xl font-bold">Hello World</h1>
        <Button size="sm" asChild>
          <Link href="/detail">상세 페이지 확인하기</Link>
        </Button>
      </div>
    </div>
  );
}
