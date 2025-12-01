"use client";

import { useState, useEffect } from "react";
import { getCohortWeeklySubmissionRate } from "@/serverActions/admin/cohort";

interface ActiveCohort {
  id: number;
  title: string;
  slug: string;
  endDate: Date;
}

interface WeeklyData {
  week: number;
  totalMissions: number;
  completedUsers: number;
  submissionRate: number;
  status: "양호" | "독려필요";
}

interface CohortData {
  cohort: {
    id: number;
    title: string;
    totalWeek: number;
    totalUsers: number;
  };
  weeklyData: WeeklyData[];
}

interface AdminDashboardClientProps {
  activeCohorts: ActiveCohort[];
  activeCohortCount: number;
}

export default function AdminDashboardClient({
  activeCohorts,
  activeCohortCount,
}: AdminDashboardClientProps) {
  const [selectedCohortId, setSelectedCohortId] = useState<number | null>(
    activeCohorts.length > 0 && activeCohorts[0] ? activeCohorts[0].id : null
  );
  const [cohortData, setCohortData] = useState<CohortData | null>(null);
  const [loading, setLoading] = useState(false);

  // 선택된 기수에 따라 데이터 불러오기
  useEffect(() => {
    if (selectedCohortId) {
      setLoading(true);
      getCohortWeeklySubmissionRate(selectedCohortId)
        .then((data) => {
          setCohortData(data);
        })
        .catch((error) => {
          console.error("Failed to load cohort data:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [selectedCohortId]);

  const selectedCohort = activeCohorts.find((c) => c.id === selectedCohortId);

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50 p-4 lg:p-6">
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        {/* 헤더 섹션 */}
        <div className="relative overflow-hidden bg-gradient-to-br from-red-600 via-orange-600 to-amber-600 rounded-xl p-4 text-white shadow-lg">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">
                  관리자 대시보드
                </h1>
                <p className="text-slate-200 text-sm sm:text-base hidden sm:block mt-1">
                  진행 중인 기수들의 과제 달성률을 관리하세요
                </p>
              </div>
              <div className="text-right bg-white/10 backdrop-blur-sm rounded-lg px-2 sm:px-3 py-2">
                <div className="text-xs text-slate-200 hidden sm:block">
                  진행 중인 기수
                </div>
                <div className="text-xs text-slate-200 sm:hidden">기수</div>
                <div className="text-base sm:text-lg font-bold text-white">
                  {activeCohortCount}개
                </div>
              </div>
            </div>
            {activeCohorts.length > 0 && (
              <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3">
                <span className="text-xs sm:text-sm font-medium text-white hidden sm:block">
                  진행 기수 설정
                </span>
                <span className="text-xs font-medium text-white sm:hidden">
                  기수 설정
                </span>
                <div className="flex items-center space-x-1 sm:space-x-2">
                  {activeCohorts.map((cohort) => (
                    <button
                      key={cohort.id}
                      onClick={() => setSelectedCohortId(cohort.id)}
                      className={`flex items-center space-x-1 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        selectedCohortId === cohort.id
                          ? "bg-white text-slate-700 shadow-sm"
                          : "bg-white/20 text-white hover:bg-white/30"
                      }`}
                    >
                      <span className="text-xs">●</span>
                      <span className="hidden sm:inline">{cohort.title}</span>
                      <span className="sm:hidden">{cohort.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 통계 카드 그리드 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          {/* 완벽 수강생 */}
          <button className="inline-flex items-center font-medium focus:outline-none focus:ring-2 focus:ring-offset-1 shadow-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-500 text-sm group w-full justify-start h-auto p-2 sm:p-4 bg-gradient-to-r from-slate-50/50 to-white hover:from-slate-100/50 hover:to-slate-50 border border-slate-100 hover:border-slate-200 rounded-2xl transition-all duration-300 hover:shadow-md hover:shadow-slate-200/20">
            <div className="flex items-center gap-4 w-full">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-slate-400 to-slate-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-400/15 group-hover:shadow-xl group-hover:shadow-slate-400/25 transition-all duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                  data-slot="icon"
                  className="w-6 h-6 text-white"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0"
                  ></path>
                </svg>
              </div>
              <div className="flex flex-col items-start flex-1">
                <span className="text-[11px] sm:text-xs font-semibold text-slate-500 group-hover:text-slate-600 transition-colors uppercase tracking-wide">
                  완벽 수강생
                </span>
                <div className="hidden 2xl:block mt-1">
                  <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent leading-none">
                    0
                  </span>
                </div>
                <div className="2xl:hidden flex items-center justify-between w-full mt-1">
                  <div className="flex items-center gap-2"></div>
                  <span className="text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent leading-none">
                    0
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden 2xl:block w-5 h-5 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all duration-200">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </div>
              </div>
            </div>
          </button>

          {/* 이번주 미션 완료 */}
          <button className="inline-flex items-center font-medium focus:outline-none focus:ring-2 focus:ring-offset-1 shadow-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-500 text-sm group w-full justify-start h-auto p-2 sm:p-4 bg-gradient-to-r from-slate-50/50 to-white hover:from-slate-100/50 hover:to-slate-50 border border-slate-100 hover:border-slate-200 rounded-2xl transition-all duration-300 hover:shadow-md hover:shadow-slate-200/20">
            <div className="flex items-center gap-4 w-full">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/15 group-hover:shadow-xl group-hover:shadow-emerald-500/25 transition-all duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                  data-slot="icon"
                  className="w-6 h-6 text-white"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  ></path>
                </svg>
              </div>
              <div className="flex flex-col items-start flex-1">
                <span className="text-[11px] sm:text-xs font-semibold text-slate-500 group-hover:text-slate-600 transition-colors uppercase tracking-wide">
                  이번주 미션 완료
                </span>
                <div className="hidden 2xl:block mt-1">
                  <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent leading-none">
                    0
                  </span>
                </div>
                <div className="2xl:hidden flex items-center justify-between w-full mt-1">
                  <div className="flex items-center gap-2"></div>
                  <span className="text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent leading-none">
                    0
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden 2xl:block w-5 h-5 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all duration-200">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </div>
              </div>
            </div>
          </button>

          {/* 미답변 질문 */}
          <button className="inline-flex items-center font-medium focus:outline-none focus:ring-2 focus:ring-offset-1 shadow-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-500 text-sm group w-full justify-start h-auto p-2 sm:p-4 bg-gradient-to-r from-slate-50/50 to-white hover:from-slate-100/50 hover:to-slate-50 border border-slate-100 hover:border-slate-200 rounded-2xl transition-all duration-300 hover:shadow-md hover:shadow-slate-200/20">
            <div className="flex items-center gap-4 w-full">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-500/15 group-hover:shadow-xl group-hover:shadow-amber-500/25 transition-all duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                  data-slot="icon"
                  className="w-6 h-6 text-white"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
                  ></path>
                </svg>
              </div>
              <div className="flex flex-col items-start flex-1">
                <span className="text-[11px] sm:text-xs font-semibold text-slate-500 group-hover:text-slate-600 transition-colors uppercase tracking-wide">
                  미답변 질문
                </span>
                <div className="hidden 2xl:block mt-1">
                  <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent leading-none">
                    0
                  </span>
                </div>
                <div className="2xl:hidden flex items-center justify-between w-full mt-1">
                  <div className="flex items-center gap-2"></div>
                  <span className="text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent leading-none">
                    0
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden 2xl:block w-5 h-5 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all duration-200">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </div>
              </div>
            </div>
          </button>

          {/* 승인 대기 */}
          <button className="inline-flex items-center font-medium focus:outline-none focus:ring-2 focus:ring-offset-1 shadow-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-500 text-sm group w-full justify-start h-auto p-2 sm:p-4 bg-gradient-to-r from-slate-50/50 to-white hover:from-slate-100/50 hover:to-slate-50 border border-slate-100 hover:border-slate-200 rounded-2xl transition-all duration-300 hover:shadow-md hover:shadow-slate-200/20">
            <div className="flex items-center gap-4 w-full">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-400/15 group-hover:shadow-xl group-hover:shadow-red-400/25 transition-all duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                  data-slot="icon"
                  className="w-6 h-6 text-white"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  ></path>
                </svg>
              </div>
              <div className="flex flex-col items-start flex-1">
                <span className="text-[11px] sm:text-xs font-semibold text-slate-500 group-hover:text-slate-600 transition-colors uppercase tracking-wide">
                  승인 대기
                </span>
                <div className="hidden 2xl:block mt-1">
                  <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent leading-none">
                    0
                  </span>
                </div>
                <div className="2xl:hidden flex items-center justify-between w-full mt-1">
                  <div className="flex items-center gap-2"></div>
                  <span className="text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent leading-none">
                    0
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden 2xl:block w-5 h-5 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all duration-200">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* 주차별 제출률 테이블 */}
        {selectedCohort && (
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="p-4 border-b border-slate-200">
              <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                  {selectedCohort.title} 주차별 제출률
                </h2>
                <div className="flex items-center space-x-1 bg-slate-100 rounded-lg p-1">
                  <button className="px-3 py-1 text-xs font-medium rounded-md transition-colors bg-white text-slate-900 shadow-sm">
                    간편보기
                  </button>
                  <button className="px-3 py-1 text-xs font-medium rounded-md transition-colors text-slate-600 hover:text-slate-900">
                    상세보기
                  </button>
                </div>
              </div>
            </div>
            <div className="p-4">
              {loading ? (
                <div className="text-center py-8 text-slate-500">
                  데이터를 불러오는 중...
                </div>
              ) : cohortData ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-2 px-2 font-medium text-slate-700">
                          주차
                        </th>
                        <th className="text-center py-2 px-2 font-medium text-slate-700">
                          제출률
                        </th>
                        <th className="text-center py-2 px-2 font-medium text-slate-700">
                          제출인원
                        </th>
                        <th className="text-center py-2 px-2 font-medium text-slate-700">
                          상태
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {cohortData.weeklyData.map((data) => (
                        <tr
                          key={data.week}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="py-3 px-2">
                            <span className="font-medium text-slate-900">
                              {data.week}주차
                            </span>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <div className="w-12 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-1.5 rounded-full ${
                                    data.submissionRate >= 50
                                      ? "bg-red-600"
                                      : "bg-slate-500"
                                  }`}
                                  style={{ width: `${data.submissionRate}%` }}
                                ></div>
                              </div>
                              <span className="font-bold text-sm text-slate-700">
                                {data.submissionRate}%
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-center text-slate-600">
                            {data.completedUsers}/{cohortData.cohort.totalUsers}
                            명
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                data.status === "양호"
                                  ? "bg-red-600/10 text-red-600 border border-red-600/20"
                                  : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                              }`}
                            >
                              {data.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  데이터가 없습니다.
                </div>
              )}
            </div>
          </div>
        )}

        {/* 완벽 수강생 섹션 */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl flex items-center justify-center shadow-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                    data-slot="icon"
                    className="w-6 h-6 text-white"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0"
                    ></path>
                  </svg>
                </div>
                <div>
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-bold text-slate-900">
                      완벽 수강생
                    </h3>
                  </div>
                  <p className="text-sm:block hidden sm:block text-sm text-slate-600 mt-1">
                    100% 완료 유지 시 환불 보장 대상자
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-baseline space-x-2">
                  <div className="text-2xl font-bold text-slate-900">0</div>
                  <div className="text-base text-slate-600">명</div>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="text-sm font-medium text-red-600">0%</div>
                  <div className="text-xs text-slate-500">전체 대비</div>
                </div>
              </div>
            </div>
          </div>
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                aria-hidden="true"
                data-slot="icon"
                className="w-8 h-8 text-slate-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0"
                ></path>
              </svg>
            </div>
            <div className="text-sm text-slate-500 font-medium">
              완벽 수강생이 없습니다
            </div>
            <div className="text-xs text-slate-400 mt-1">
              모든 미션을 완료한 학생이 표시됩니다
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
