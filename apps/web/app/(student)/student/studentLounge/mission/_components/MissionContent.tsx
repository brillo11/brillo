"use client";

import { useState, useEffect } from "react";
import { kdayjs } from "@/shared/lib/utils/dayjs";
import MissionSubmitButton from "./MissionSubmitButton";
import { Prisma } from "@repo/database";
import { MissionWithSubmissions } from "@/serverActions/mission.actions";

interface MissionContentProps {
  cohort: Prisma.CohortGetPayload<{ include: { missions: true } }> | null;
  missions: MissionWithSubmissions[];
}

export default function MissionContent({ cohort, missions }: MissionContentProps) {
  const [selectedWeek, setSelectedWeek] = useState<number | "ALL">("ALL");

  useEffect(() => {
    if (cohort) {
      const now = kdayjs();
      const startDate = kdayjs(cohort.startDate);
      const currentWeek = now.diff(startDate, "week") + 1;
      
      // Clamp current week between 1 and totalWeek
      const clampedWeek = Math.max(1, Math.min(currentWeek, cohort.totalWeek));
      setSelectedWeek(clampedWeek);
    }
  }, [cohort]);

  // Calculate progress (based on ALL missions)
  const totalMissions = missions.length;
  const completedMissions = missions.filter(
    (m) => m.submissions.length > 0
  ).length;
  const progressPercentage =
    totalMissions > 0
      ? Math.round((completedMissions / totalMissions) * 100)
      : 0;

  // Filter missions based on selected week
  const filteredMissions =
    selectedWeek === "ALL"
      ? missions
      : missions.filter((m) => m.week === selectedWeek);

  return (
    <main className="flex-1 overflow-y-auto bg-[#fbf4ec]">
      <div className="w-full max-w-7xl mx-auto px-6 py-6">
        <div className="space-y-4 sm:space-y-6">
          {/* 헤더 카드 */}
          <div className="mb-8">
            <div className="relative overflow-hidden bg-gradient-to-br from-orange-400 via-amber-500 to-amber-600 rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-7 text-white shadow-lg shadow-orange-200/50">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-4 right-4 w-16 h-16 bg-white/10 rounded-full animate-pulse"></div>
                <div className="absolute bottom-4 left-4 w-12 h-12 bg-white/10 rounded-full animate-pulse delay-300"></div>
                <div className="absolute top-1/2 left-1/3 w-8 h-8 bg-white/10 rounded-full animate-bounce delay-500"></div>
              </div>
              <div className="relative z-10">
                <div className="flex flex-col space-y-4 min-[375px]:flex-row min-[375px]:items-center min-[375px]:justify-between min-[375px]:space-y-0">
                  <div className="flex items-start flex-1 min-w-0 ">
                    <div className="min-w-0 flex-1">
                      <h1 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 sm:mb-2 tracking-tight text-white">
                        나의 미션
                      </h1>
                      <p className="text-orange-50 text-sm sm:text-sm lg:text-base leading-relaxed font-medium">
                        {cohort
                          ? `${cohort.title} 과정을 진행중입니다!`
                          : "진행 중인 과정이 없습니다."}
                      </p>
                    </div>
                  </div>
                  {/* 주차 선택 드롭다운 */}
                  <div className="flex flex-col space-y-2 min-[375px]:flex-row min-[375px]:items-center min-[375px]:space-y-0 min-[375px]:space-x-4">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <label className="text-orange-50 font-medium text-sm hidden sm:block">
                        주차 선택
                      </label>
                      <div className="">
                        <select
                          value={selectedWeek}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSelectedWeek(val === "ALL" ? "ALL" : Number(val));
                          }}
                          className="w-full transition-all px-2 py-1.5 bg-white/20 border border-white/40 rounded-lg text-white backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/30 duration-200 text-xs min-w-[80px] max-w-[100px] placeholder-white"
                        >
                          <option value="ALL" className="text-slate-800">
                            전체 보기
                          </option>
                          {cohort &&
                            Array.from({ length: cohort.totalWeek }, (_, i) => i + 1).map(
                              (week) => (
                                <option
                                  key={week}
                                  value={week}
                                  className="text-slate-800"
                                >
                                  {week}주차
                                </option>
                              )
                            )}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 통계 카드 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* 전체 진행도 */}
            <div className="group relative overflow-hidden bg-white rounded-2xl border border-slate-200 p-4 sm:p-6">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full -translate-y-8 translate-x-8 opacity-10"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      aria-hidden="true"
                      data-slot="icon"
                      className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
                      ></path>
                    </svg>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {progressPercentage}%
                    </div>
                    <div className="text-xs text-slate-500">달성률</div>
                  </div>
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-slate-900 mb-2 sm:mb-3">
                  전체 진행도
                </h3>
                <div className="w-full bg-slate-200 rounded-full h-2 mb-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                    style={{ width: `${progressPercentage}%` }}
                  >
                    <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 flex items-center space-x-1">
                  <span>
                    목표까지 {Math.max(0, 100 - progressPercentage)}% 남았어요!
                  </span>
                </p>
              </div>
            </div>

            {/* 완료한 미션 */}
            <div className="group relative overflow-hidden bg-white rounded-2xl border border-slate-200 p-4 sm:p-6">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full -translate-y-8 translate-x-8 opacity-10"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      aria-hidden="true"
                      data-slot="icon"
                      className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                      ></path>
                    </svg>
                  </div>
                  <div className="text-right">
                    <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      {completedMissions}/{totalMissions}
                    </div>
                    <div className="text-xs text-slate-500">완료</div>
                  </div>
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-slate-900 mb-2 sm:mb-3">
                  완료한 미션
                </h3>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                      style={{ width: `${progressPercentage}%` }}
                    >
                      <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                    </div>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 flex items-center space-x-1">
                  <span>계속 도전하세요!</span>
                </p>
              </div>
            </div>

            {/* 현재 과정 */}
            <div className="group relative overflow-hidden bg-white rounded-2xl border border-slate-200 p-4 sm:p-6">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full -translate-y-8 translate-x-8 opacity-10"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      aria-hidden="true"
                      data-slot="icon"
                      className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"
                      ></path>
                    </svg>
                  </div>
                  <div className="text-right">
                    <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                      {cohort ? cohort.title : "-"}
                    </div>
                    <div className="text-xs text-slate-500">참여중</div>
                  </div>
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-slate-900 mb-2 sm:mb-3">
                  현재 과정
                </h3>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-xs sm:text-sm text-slate-600">
                    {cohort ? "활동 중인 기수" : "배정된 기수가 없습니다"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 미션 로드맵 섹션 */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-stone-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
              <h3 className="text-lg sm:text-2xl font-bold text-slate-900 flex items-center">
                미션 로드맵
              </h3>
              <div className="flex items-center justify-between sm:justify-end">
                <div className="flex items-center space-x-2 text-xs sm:text-sm text-slate-600">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full"></div>
                  <span>완료</span>
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-slate-400 rounded-full ml-3 sm:ml-4"></div>
                  <span>미제출</span>
                </div>
              </div>
            </div>
            
            <div className="relative mb-6 sm:mb-8">
              {filteredMissions.length === 0 ? (
                <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <p className="text-lg font-medium text-slate-600">
                    {selectedWeek === "ALL" ? "등록된 미션이 없습니다." : `${selectedWeek}주차에는 미션이 없습니다!`}
                  </p>
                </div>
              ) : (
                <div className="">
                  <div className="absolute top-10 left-16 right-16 h-1 flex">
                    {/* 로드맵 라인 */}
                    {Array.from({ length: Math.max(filteredMissions.length - 1, 0) }).map((_, i) => (
                      <div key={i} className="flex-1 h-1 bg-stone-200 rounded-full"></div>
                    ))}
                  </div>
                  <div className="flex justify-between px-8 overflow-x-auto gap-4">
                    {filteredMissions.map((mission) => (
                      <div
                        key={mission.id.toString()}
                        className="flex flex-col items-center relative z-10 min-w-[80px]"
                        style={{ flex: "1 1 0%" }}
                      >
                        <button
                          className={`relative w-16 h-16 rounded-full border-2 shadow-md hover:shadow-lg transition-all duration-200 flex flex-col items-center justify-center cursor-pointer group mb-3 sm:mb-4 ${
                            mission.submissions.length > 0
                              ? "bg-blue-100 border-blue-300 text-blue-700"
                              : "bg-gradient-to-br from-stone-100 to-stone-200 text-stone-600 border-stone-200"
                          }`}
                        >
                          <span className="text-sm font-bold">
                            {mission.week}w
                          </span>
                        </button>
                        <div className="text-center max-w-24">
                          <p className="text-xs text-gray-500 mb-1">
                            {kdayjs(mission.dueDate).format("M월 D일")}
                          </p>
                          <h4 className="text-xs font-medium text-gray-700 leading-tight break-words line-clamp-2">
                            {mission.title}
                          </h4>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 현재 미션 상세 카드 */}
          {(() => {
            const now = new Date();
            const upcomingMissions = missions.filter(
              (m) => new Date(m.dueDate) > now
            );
            const currentMission =
              upcomingMissions.length > 0
                ? upcomingMissions.sort(
                    (a, b) =>
                      new Date(a.dueDate).getTime() -
                      new Date(b.dueDate).getTime()
                  )[0]
                : missions[missions.length - 1]; // Fallback to last mission if all passed

            if (!currentMission) return null;

            const isSubmitted = currentMission.submissions.length > 0;

            return (
              <div className="bg-white rounded-2xl p-5 shadow-sm border transition-all duration-300 border-stone-200 mb-6 sm:mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span
                      className={`inline-flex items-center font-medium rounded-sm px-2 py-0.5 text-xs ${
                        isSubmitted
                          ? "bg-blue-100 text-blue-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {isSubmitted ? "제출 완료" : "미제출"}
                    </span>
                    <span className="text-sm text-stone-500">
                      {currentMission.week}w 미션
                    </span>
                  </div>
                  <span className="text-xs text-stone-500">
                    마감:{" "}
                    {kdayjs(currentMission.dueDate).format(
                      "YYYY년 MM월 DD일 A h:mm"
                    )}
                  </span>
                </div>
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-stone-900 mb-2">
                    {currentMission.title}
                  </h4>
                  <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-line">
                    {currentMission.description || "미션 설명이 없습니다."}
                  </p>
                </div>
                <div className="flex gap-2 sm:gap-3">
                  <MissionSubmitButton
                    mission={currentMission}
                    className={`flex-1 py-2 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl font-medium text-sm sm:text-base text-white shadow-md hover:shadow-lg transition-all ${
                      isSubmitted
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-stone-700 hover:bg-stone-800"
                    }`}
                  />
                </div>
              </div>
            );
          })()}

          {/* 미션 목록 */}
          {filteredMissions.length > 0 && (
            <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-stone-800 mb-3 sm:mb-4">
                {selectedWeek === "ALL"
                  ? "전체 미션"
                  : `${selectedWeek}주차 미션`}
              </h2>
              <div className="space-y-4 sm:space-y-5">
                {filteredMissions.map((mission) => {
                  const isSubmitted = mission.submissions.length > 0;
                  return (
                    <div
                      key={mission.id.toString()}
                      className={`bg-white border rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200 group ${
                        isSubmitted
                          ? "border-blue-200 hover:border-blue-300"
                          : "border-stone-200 hover:border-orange-300"
                      }`}
                    >
                      <div className="block sm:flex sm:items-start sm:justify-between">
                        <div className="flex-1 sm:mr-6">
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-3">
                            <div className="flex items-center justify-between sm:justify-start">
                              <div className="flex items-center space-x-2">
                                <span
                                  className={`text-lg sm:text-2xl font-bold transition-colors ${
                                    isSubmitted
                                      ? "text-blue-400"
                                      : "text-stone-300 group-hover:text-orange-300"
                                  }`}
                                >
                                  {mission.week}w
                                </span>
                                <div
                                  className={`h-4 sm:h-6 w-px ${
                                    isSubmitted
                                      ? "bg-blue-200"
                                      : "bg-stone-200"
                                  }`}
                                ></div>
                              </div>
                              <div className="sm:hidden">
                                <span
                                  className={`inline-flex items-center font-medium rounded-sm px-2 py-0.5 text-xs ${
                                    isSubmitted
                                      ? "bg-blue-100 text-blue-700"
                                      : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {isSubmitted ? "제출 완료" : "미제출"}
                                </span>
                              </div>
                            </div>
                            <h3 className="text-base sm:text-xl font-semibold text-stone-800 leading-tight flex-1">
                              {mission.title}
                            </h3>
                            <div className="text-xs sm:text-sm mb-3 sm:mb-0">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:flex-wrap gap-1 sm:gap-2">
                                <div className="flex items-center text-slate-500">
                                  <span className="font-medium">마감일: </span>
                                  <span className="text-slate-700 ml-1">
                                    {kdayjs(mission.dueDate).format(
                                      "YYYY년 M월 D일 A h:mm"
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="hidden sm:block">
                            <span
                              className={`inline-flex items-center font-medium rounded-sm px-2 py-0.5 text-xs ${
                                isSubmitted
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {isSubmitted ? "제출 완료" : "미제출"}
                            </span>
                          </div>
                        </div>
                        <div className="flex sm:flex-col space-x-2 sm:space-x-0 sm:space-y-2 flex-shrink-0 mt-3 sm:mt-0">
                          <MissionSubmitButton
                            mission={mission}
                            className={`inline-flex items-center font-medium rounded-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 shadow-sm hover:shadow-md text-white flex-1 sm:flex-initial sm:min-w-[80px] justify-center text-xs px-2 sm:px-3 py-1.5 sm:py-2 ${
                              isSubmitted
                                ? "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
                                : "bg-stone-700 hover:bg-stone-800 focus:ring-stone-500"
                            }`}
                          >
                            <span className="mr-2">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                aria-hidden="true"
                                data-slot="icon"
                                className="w-3 h-3"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12-3-3m0 0-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                                ></path>
                              </svg>
                            </span>
                            {isSubmitted ? "수정하기" : "제출하기"}
                          </MissionSubmitButton>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
