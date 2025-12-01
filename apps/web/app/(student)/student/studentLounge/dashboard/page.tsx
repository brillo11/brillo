import { requireStudent } from "@/shared/lib/auth-guards";
import { StatCard } from "@/shared/components/ui/stat-card";

// SSR + Dynamic - 항상 최신 데이터, 캐시 없음
export const dynamic = "force-dynamic";

export default async function StudentDashboard() {
  // 🛡️ 서버에서 권한 검증 (미들웨어 통과 후 2차 검증)
  await requireStudent();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* <DashboardHeader /> */}

      <div className="w-full max-w-7xl mx-auto px-6 py-6">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
            학습 대시보드
          </h1>
          <p className="text-sm sm:text-base text-slate-500">
            오늘까지 6개의 미션을 완료했습니다
          </p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-8">
          {/* 진행률 카드 */}
          <StatCard
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-4 h-4 sm:w-5 sm:h-5 text-red-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
                />
              </svg>
            }
            iconBgColor="bg-red-50"
            label="진행률"
            value="8%"
            progressBar={{ percentage: 8, color: "bg-red-600" }}
          />

          {/* 완료 카드 */}
          <StatCard
            icon={
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
            iconBgColor="bg-emerald-50"
            label="완료"
            value={6}
            description="미션 완료"
          />

          {/* 진행중 카드 */}
          <StatCard
            icon={
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
            iconBgColor="bg-slate-50"
            label="진행중"
            value={69}
            description="남은 미션"
          />

          {/* 마감 카드 */}
          <StatCard
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-4 h-4 sm:w-5 sm:h-5 text-amber-700"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
            }
            iconBgColor="bg-amber-50"
            label="마감"
            value="D-3"
            description="이번주 마감"
          />
        </div>

        {/* 메인 콘텐츠 그리드 */}
        <div className="grid grid-cols-1 lg:grid-cols-13 gap-8">
          {/* 왼쪽: 전체 학습 진행도 */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 lg:p-8 h-full flex flex-col">
              {/* 전체 학습 진행도 헤더 */}
              <div className="flex items-center justify-between mb-4 sm:mb-6 lg:mb-8">
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
                    전체 학습 진행도
                  </h2>
                  <p className="text-xs sm:text-sm font-normal text-slate-700 mt-1 sm:mt-2">
                    목표 달성률 8%
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs sm:text-sm font-medium text-slate-500">
                    총 미션
                  </div>
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">
                    6/75
                  </div>
                </div>
              </div>

              {/* 진행도 바 */}
              <div className="bg-slate-100 rounded-2xl p-6">
                <div className="w-full bg-white rounded-xl h-8 overflow-hidden shadow-inner">
                  <div
                    className="bg-red-600 h-8 rounded-xl transition-all duration-1000 ease-out flex items-center justify-end pr-3"
                    style={{ width: "8%" }}
                  />
                </div>
                <div className="flex justify-between mt-6">
                  <div>
                    <p className="text-base font-medium text-slate-700"></p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-medium text-slate-700">목표</p>
                    <p className="text-xs font-normal text-slate-500">
                      75개 완료
                    </p>
                  </div>
                </div>
              </div>

              {/* 주차별 진행 현황 */}
              <div className="mt-8 flex-1">
                <h3 className="text-base sm:text-lg font-medium text-slate-900 mb-4">
                  주차별 진행 현황
                </h3>
                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-1 sm:gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((week) => (
                    <div
                      key={week}
                      className="text-center py-1.5 px-2 sm:py-2 sm:px-3 rounded-lg text-xs sm:text-sm font-semibold bg-red-50 text-red-800"
                    >
                      {week}
                    </div>
                  ))}
                  <div className="text-center py-1.5 px-2 sm:py-2 sm:px-3 rounded-lg text-xs sm:text-sm font-semibold bg-red-600 text-white">
                    12
                  </div>
                  {[13, 14, 15, 16, 17].map((week) => (
                    <div
                      key={week}
                      className="text-center py-1.5 px-2 sm:py-2 sm:px-3 rounded-lg text-xs sm:text-sm font-semibold bg-slate-50 text-slate-400"
                    >
                      {week}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 오른쪽: 이번주 미션 */}
          <div className="lg:col-span-5">
            <div className="relative bg-white rounded-xl shadow-sm hover:shadow-md overflow-hidden cursor-pointer transition-all duration-300 group h-full flex flex-col">
              {/* 헤더 */}
              <div className="relative px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <div>
                        <h3 className="text-xl font-semibold text-slate-900">
                          이번주 미션
                        </h3>
                        <p className="text-sm font-normal text-slate-500">
                          12주차
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-slate-900">
                          0
                        </div>
                        <div className="text-xs font-medium text-slate-500">
                          완료
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-slate-900">
                          7
                        </div>
                        <div className="text-xs font-medium text-slate-500">
                          남은 미션
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-slate-900">
                          0%
                        </div>
                        <div className="text-xs font-medium text-slate-500">
                          진행률
                        </div>
                      </div>
                    </div>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-6 h-6 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all duration-200"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m8.25 4.5 7.5 7.5-7.5 7.5"
                    />
                  </svg>
                </div>
              </div>

              {/* 진행률 바 */}
              <div className="relative px-6 py-3 bg-slate-50/30">
                <div className="w-full bg-slate-200/60 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-slate-600 h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: "0%" }}
                  />
                </div>
              </div>

              {/* 미션 리스트 */}
              <div className="relative px-6 py-4 flex-1 flex flex-col">
                <div className="flex flex-col h-full">
                  <div className="grid grid-cols-2 gap-3 flex-1 content-start">
                    {[
                      "11월 20일 인스타 / 틱톡 / 유...",
                      "11월 18일 인스타 / 틱톡 / 유...",
                      "11월 21일 인스타 / 틱톡 / 유...",
                      "11월 23일 인스타 / 틱톡 / 유...",
                      "11월 17일 인스타 / 틱톡 / 유...",
                      "11월 22일 인스타 / 틱톡 / 유...",
                    ].map((mission, index) => (
                      <div
                        key={index}
                        className="relative p-3 rounded-lg border transition-all duration-200 min-h-[80px] flex flex-col justify-between cursor-pointer hover:scale-105 bg-orange-50/30 border-orange-200/50 hover:border-orange-300/70 hover:shadow-md"
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-2 h-2 rounded-full bg-orange-500" />
                          <span className="text-xs font-semibold text-orange-600">
                            미제출
                          </span>
                        </div>
                        <p className="text-sm font-medium leading-tight text-orange-700">
                          {mission}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-end justify-center mt-auto pt-4">
                    <div className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-50 rounded-lg text-xs text-slate-600">
                      <span>+1개 미션 더</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-3 h-3"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m8.25 4.5 7.5 7.5-7.5 7.5"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* 푸터 */}
              <div className="relative px-6 py-3 bg-slate-50/20 border-t border-slate-100/50">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-medium">미션 관리</span>
                  <span className="flex items-center space-x-1">
                    <span className="text-xs font-medium text-slate-500">
                      자세히 보기
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="w-3 h-3"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m8.25 4.5 7.5 7.5-7.5 7.5"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
