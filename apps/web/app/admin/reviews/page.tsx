import { format } from "date-fns";
import { prisma } from "@repo/database";
import { TogglePublishButton } from "./TogglePublishButton";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: true,
    },
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">리뷰 관리</h2>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                사용자
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                별점
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                리뷰 내용
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                작성일시
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                노출 여부
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reviews.map((review) => (
              <tr key={review.id.toString()}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {review.id.toString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {review.user?.name || "알 수 없음"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {review.user?.email || "이메일 없음"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-500 font-bold">
                  ★ {review.rating}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="max-w-md break-words whitespace-pre-wrap line-clamp-2">
                    {review.content || (
                      <span className="text-gray-400 italic">내용 없음</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(review.createdAt), "yyyy-MM-dd HH:mm")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <TogglePublishButton
                    reviewId={review.id}
                    isPublished={review.isPublished}
                  />
                </td>
              </tr>
            ))}
            {reviews.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  작성된 리뷰가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
