import { prisma, ORDER_STATUS } from "@repo/database";
import { kdayjs } from "@/shared/lib/utils/dayjs";
import { requireAdmin } from "@/shared/lib/auth-guards";

export const dynamic = "force-dynamic";

function parseReservationInfo(description: string | null) {
  if (!description) return null;
  try {
    const parsed = JSON.parse(description);
    return parsed?.reservationInfo || null;
  } catch {
    return null;
  }
}

export default async function AdminOrdersPage() {
  await requireAdmin();

  const orders = await prisma.order.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: true,
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">결제내역 관리</h2>
        <span className="text-sm text-gray-500">
          총 {orders.length}건
        </span>
      </div>

      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                주문명
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                회원정보
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                예약자 정보
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                결제 금액
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                상태
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment Key
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                결제일시
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => {
              const info = parseReservationInfo(order.description);
              const statusStr = order.status as string;
              const isPaid = statusStr === "결제완료" || statusStr === "PAID";

              return (
                <tr key={order.id.toString()} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    {order.id.toString()}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {order.orderName || "서비스 이용료"}
                    </div>
                    {order.isTest && (
                      <span className="inline-block mt-1 px-1.5 py-0.5 text-[10px] font-medium bg-yellow-100 text-yellow-700 rounded">
                        TEST
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {order.user?.name || "알 수 없음"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {order.user?.email || "이메일 없음"}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {info ? (
                      <div className="text-xs text-gray-700 space-y-0.5 min-w-[140px]">
                        <div className="font-medium">
                          {info.name}
                          {info.gender === "male"
                            ? " (남)"
                            : info.gender === "female"
                              ? " (여)"
                              : ""}
                          {info.age ? ` · ${info.age}세` : ""}
                        </div>
                        {info.phone && (
                          <div className="text-gray-500">{info.phone}</div>
                        )}
                        {info.email && (
                          <div className="text-gray-500 truncate max-w-[160px]" title={info.email}>
                            {info.email}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                    {order.amount.toLocaleString()}원
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        isPaid
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {isPaid ? "결제완료" : order.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-500 font-mono">
                    {order.paymentKey ? (
                      <span
                        className="truncate w-28 inline-block"
                        title={order.paymentKey}
                      >
                        {order.paymentKey}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {kdayjs(order.createdAt).format("YYYY-MM-DD HH:mm")}
                  </td>
                </tr>
              );
            })}
            {orders.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                  결제 내역이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
