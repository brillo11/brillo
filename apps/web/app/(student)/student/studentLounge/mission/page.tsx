import { requireStudent } from "@/shared/lib/auth-guards";

export default async function MissionPage() {
  await requireStudent();

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50 p-4 lg:p-6">
      <div className="space-y-4 sm:space-y-6">
        {/* 헤더 카드 */}
        <div className="mb-8">
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-7 text-white">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-4 right-4 w-16 h-16 bg-white/10 rounded-full animate-pulse"></div>
              <div className="absolute bottom-4 left-4 w-12 h-12 bg-white/10 rounded-full animate-pulse delay-300"></div>
              <div className="absolute top-1/2 left-1/3 w-8 h-8 bg-white/10 rounded-full animate-bounce delay-500"></div>
            </div>
            <div className="relative z-10">
              <div className="flex flex-col space-y-4 min-[375px]:flex-row min-[375px]:items-center min-[375px]:justify-between min-[375px]:space-y-0">
                <div className="flex items-start flex-1 min-w-0 ">
                  <div className="min-w-0 flex-1">
                    <h1 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 sm:mb-2 tracking-tight">
                      나의 미션
                    </h1>
                    <p className="text-slate-100 text-sm sm:text-sm lg:text-base leading-relaxed">
                      꿈을 현실로 만드는 여정이 시작됩니다!
                    </p>
                  </div>
                </div>
                <div className="flex flex-col space-y-2 min-[375px]:flex-row min-[375px]:items-center min-[375px]:space-y-0 min-[375px]:space-x-4">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <label className="text-slate-100 font-medium text-sm hidden sm:block">
                      주차 선택
                    </label>
                    <div className="">
                      <select className="w-full transition-all px-2 py-1.5 bg-white/20 border border-white/30 rounded-lg text-white backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/30 duration-200 text-xs min-w-[80px] max-w-[100px]">
                        <option value="">선택하세요</option>
                        <option value="">전체 보기</option>
                        <option value="1">1주차</option>
                        <option value="2">2주차</option>
                        <option value="3">3주차</option>
                        <option value="4">4주차</option>
                        <option value="5">5주차</option>
                        <option value="6">6주차</option>
                        <option value="7">7주차</option>
                        <option value="8">8주차</option>
                        <option value="9">9주차</option>
                        <option value="10">10주차</option>
                        <option value="11">11주차</option>
                        <option value="12">12주차</option>
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
                    8%
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
                  style={{ width: "8%" }}
                >
                  <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 flex items-center space-x-1">
                <span>목표까지 92% 남았어요!</span>
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
                    6/75
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
                    style={{ width: "8%" }}
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
                    1기
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
                  활동 중인 기수
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 미션 로드맵 섹션 */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200">
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
            <div className="">
              <div className="absolute top-10 left-16 right-16 h-1 flex">
                <div className="flex-1 h-1 bg-slate-300 rounded-full"></div>
                <div className="flex-1 h-1 bg-slate-300 rounded-full"></div>
                <div className="flex-1 h-1 bg-slate-300 rounded-full"></div>
                <div className="flex-1 h-1 bg-slate-300 rounded-full"></div>
                <div className="flex-1 h-1 bg-slate-300 rounded-full"></div>
                <div className="flex-1 h-1 bg-slate-300 rounded-full"></div>
              </div>
              <div className="flex justify-between px-8">
                {[...Array(7)].map((_, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center relative z-10"
                    style={{ flex: "1 1 0%" }}
                  >
                    <button className="relative w-16 h-16 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 text-slate-600 border-2 border-slate-200 shadow-md hover:shadow-lg transition-all duration-200 flex flex-col items-center justify-center cursor-pointer group mb-3 sm:mb-4 ">
                      <span className="text-sm font-bold">12w</span>
                    </button>
                    <div className="text-center max-w-24">
                      <p className="text-xs text-gray-500 mb-1">
                        2025년 11월 {17 + i}일 오후 11:59
                      </p>
                      <h4 className="text-xs font-medium text-gray-700 leading-tight break-words line-clamp-2">
                        11월 {17 + i}일 인스타 / 틱톡 / 유튜브 영상 업로드 후 링크
                        제출
                      </h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 현재 미션 상세 카드 */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border transition-all duration-300 border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="inline-flex items-center font-medium rounded-sm bg-slate-100 text-slate-800 px-2 py-0.5 text-xs">
                  미제출
                </span>
                <span className="text-sm text-slate-500">2w 미션</span>
              </div>
              <span className="text-xs text-slate-500">
                마감: 2025년 09월 09일 오후 11:59
              </span>
            </div>
            <div className="mb-4">
              <h4 className="text-lg font-semibold text-slate-900 mb-2">
                1번째 영상 업로드
              </h4>
              <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                📌 이번 2주차 챌린지 과제 안내
                <br />• 과제는 영상 총 2개 제작입니다
                <br />• 각 영상을 만든 후 Google 드라이브에 업로드해 주세요
                <br />• 업로드한 뒤 공유 링크 복사 → 제출하시면 됩니다
                <br />• 이때 꼭 “모든 사용자 보기 허용” 으로 설정해야 합니다
                비공개 상태면 코치진이 확인할 수 없어 피드백이 불가능합니다
                <br />• 여기서는 첫 번째 영상 링크만 제출해 주시면 됩니다
              </div>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <button className="flex-1 py-2 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl font-medium text-sm sm:text-base text-white bg-slate-600 hover:bg-slate-700">
                제출하기
              </button>
            </div>
          </div>
        </div>

        {/* 12주차 미션 목록 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-3 sm:mb-4">
            12주차 미션
          </h2>
          <div className="space-y-4 sm:space-y-5">
            {[17, 18, 19, 20, 21, 22, 23].map((day, i) => (
              <div
                key={day}
                className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-200 hover:border-slate-300"
              >
                <div className="block sm:flex sm:items-start sm:justify-between">
                  <div className="flex-1 sm:mr-6">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-3">
                      <div className="flex items-center justify-between sm:justify-start">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg sm:text-2xl font-bold text-slate-400">
                            12w
                          </span>
                          <div className="h-4 sm:h-6 w-px bg-slate-200"></div>
                        </div>
                        <div className="sm:hidden">
                          <span className="inline-flex items-center font-medium rounded-sm bg-red-100 text-red-700 px-2 py-0.5 text-xs">
                            제출 대기
                          </span>
                        </div>
                      </div>
                      <h3 className="text-base sm:text-xl font-semibold text-slate-900 leading-tight flex-1">
                        11월 {day}일 인스타 / 틱톡 / 유튜브 영상 업로드 후 링크
                        제출
                      </h3>
                      <div className="hidden sm:block">
                        <span className="inline-flex items-center font-medium rounded-sm bg-red-100 text-red-700 px-2 py-0.5 text-xs">
                          제출 대기
                        </span>
                      </div>
                    </div>
                    <div className="text-xs sm:text-sm mb-3 sm:mb-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:flex-wrap gap-1 sm:gap-2">
                        <div className="flex items-center text-slate-500">
                          <span className="font-medium">마감일: </span>
                          <span className="text-slate-700 ml-1">
                            2025년 11월 {day}일 오후 11:59
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex sm:flex-col space-x-2 sm:space-x-0 sm:space-y-2 flex-shrink-0 mt-3 sm:mt-0">
                    <button className="inline-flex items-center font-medium rounded-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 shadow-sm hover:shadow-md bg-slate-600 text-white hover:bg-slate-700 focus:ring-slate-500 active:bg-slate-800 flex-1 sm:flex-initial sm:min-w-[80px] justify-center text-xs px-2 sm:px-3 py-1.5 sm:py-2">
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
                            d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"
                          ></path>
                        </svg>
                      </span>
                      상세보기
                    </button>
                    <button className="inline-flex items-center font-medium rounded-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 shadow-sm hover:shadow-md bg-slate-600 text-white hover:bg-slate-700 focus:ring-slate-500 active:bg-slate-800 flex-1 sm:flex-initial sm:min-w-[80px] justify-center text-xs px-2 sm:px-3 py-1.5 sm:py-2">
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
                      제출하기
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

