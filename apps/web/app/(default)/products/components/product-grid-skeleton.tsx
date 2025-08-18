import { Skeleton } from "@repo/ui/components/skeleton";
import { Card, CardContent } from "@repo/ui/components/card";

export function ProductGridSkeleton() {
  return (
    <div className="space-y-8">
      {/* 첫 번째 행: 4개 제품 스켈레톤 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="h-full">
            <CardContent className="p-0">
              <div className="aspect-square bg-gray-200 rounded-t-lg">
                <Skeleton className="w-full h-full" />
              </div>
              <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-6 w-2/3" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 flex-1" />
                  <Skeleton className="h-8 w-12" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 두 번째 행: 3개 제품 스켈레톤 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index + 4} className="h-full">
            <CardContent className="p-0">
              <div className="aspect-square bg-gray-200 rounded-t-lg">
                <Skeleton className="w-full h-full" />
              </div>
              <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-6 w-2/3" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 flex-1" />
                  <Skeleton className="h-8 w-12" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 세 번째 행: 4개 제품 스켈레톤 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index + 7} className="h-full">
            <CardContent className="p-0">
              <div className="aspect-square bg-gray-200 rounded-t-lg">
                <Skeleton className="w-full h-full" />
              </div>
              <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-6 w-2/3" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 flex-1" />
                  <Skeleton className="h-8 w-12" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 네 번째 행: 1개 제품 스켈레톤 */}
      <div className="flex justify-center">
        <div className="w-full max-w-md">
          <Card className="h-full">
            <CardContent className="p-0">
              <div className="aspect-square bg-gray-200 rounded-t-lg">
                <Skeleton className="w-full h-full" />
              </div>
              <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-6 w-2/3" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 flex-1" />
                  <Skeleton className="h-8 w-12" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
