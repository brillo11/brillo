"use client";

import React, { useState } from "react";
import { kdayjs } from "@/shared/lib/utils/dayjs";
import Link from "next/link";
import { PATH } from "@/shared/consts/path";
import AnnouncementModal from "./announcement-modal";

interface AnnouncementsClientPageProps {
  initialPosts: any[];
  cohorts: {
    id: number;
    title: string;
    slug: string;
  }[];
}

export default function AnnouncementsClientPage({
  initialPosts,
  cohorts,
}: AnnouncementsClientPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // HTML 태그 제거 함수
  const removeHtmlTags = (html: string) => {
    return html.replace(/<[^>]*>?/gm, "");
  };

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50 p-4 lg:p-6">
      <div className="space-y-6">
        <div className="mb-6">
          <div className="pb-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                  <span className="w-5 h-5 text-slate-700">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      aria-hidden="true"
                      data-slot="icon"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 1-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 0 1 8.835 2.535M10.34 6.66a23.847 23.847 0 0 0 8.835-2.535m0 0A23.74 23.74 0 0 0 18.795 3m.38 1.125a23.91 23.91 0 0 1 1.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 0 0 1.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 0 1 0 3.46"
                      ></path>
                    </svg>
                  </span>
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                    공지사항
                  </h1>
                  <p className="text-slate-600 text-sm mt-1 hidden sm:block">
                    중요한 공지사항을 작성하고 관리하세요
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center space-x-1.5 px-3 sm:px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                  data-slot="icon"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  ></path>
                </svg>
                <span className="hidden min-[380px]:inline">새 공지 작성</span>
              </button>
            </div>
          </div>
        </div>
        <div className="space-y-6 w-full overflow-hidden">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm w-full overflow-hidden">
            <div className="divide-y divide-slate-200">
              {initialPosts.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  등록된 공지사항이 없습니다.
                </div>
              ) : (
                initialPosts.map((post: any) => (
                  <div
                    key={post.id}
                    className="p-4 sm:p-6 border-l-4 border-l-transparent transition-all duration-200 group cursor-pointer hover:bg-slate-50 hover:shadow-md hover:border-l-slate-400 active:bg-slate-100 active:scale-[0.99]"
                  >
                    <div className="flex flex-col space-y-1">
                      <div className="flex-1 min-w-0">
                        <div className="mb-2">
                          <div className="flex items-center space-x-3 mb-2">
                            {post.tags && post.tags.length > 0 && (
                              <span>
                                <span className="inline-flex items-center font-medium rounded-sm bg-slate-100 text-slate-800 px-2 py-0.5 text-xs">
                                  {post.tags[0]}
                                </span>
                              </span>
                            )}
                            <h3
                              className="text-sm min-[375px]:text-base sm:text-lg font-semibold text-slate-900 line-clamp-1 break-all word-break-keep-all sm:word-break-normal overflow-hidden min-w-0 flex-1"
                              style={{
                                wordBreak: "break-all",
                                overflowWrap: "break-word",
                              }}
                            >
                              {post.title}
                            </h3>
                          </div>
                        </div>
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-xs min-[375px]:text-sm text-slate-600 mb-3 line-clamp-2 break-all overflow-hidden"
                              style={{
                                wordBreak: "break-all",
                                overflowWrap: "break-word",
                              }}
                            >
                              {removeHtmlTags(post.content)}
                            </p>
                            <div className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm text-slate-500">
                              <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0 flex-shrink">
                                <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    stroke="currentColor"
                                    aria-hidden="true"
                                    data-slot="icon"
                                    className="w-4 h-4 text-slate-500"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                                    ></path>
                                  </svg>
                                </div>
                                <span className="truncate max-w-20 sm:max-w-24">
                                  {post.author?.nickname || post.author?.name || "관리자"}
                                </span>
                              </div>
                              <span className="block sm:hidden flex-shrink-0 text-xs">
                                {kdayjs(post.createdAt).format(
                                  "YYYY년 M월 D일"
                                )}
                              </span>
                              <span className="hidden sm:block flex-shrink-0">
                                {kdayjs(post.createdAt).format(
                                  "YYYY년 M월 D일 A h:mm"
                                )}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-start space-x-1 sm:space-x-2 flex-shrink-0 ml-4">
                            <Link
                              href={`${PATH.ADMIN_COMMUNITY_ANNOUNCEMENTS}/${post.slug}`}
                              className="p-2 sm:p-3 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center"
                              title="상세보기"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="1.5"
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                ></path>
                              </svg>
                            </Link>
                            <button
                              className="p-2 sm:p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center"
                              title="삭제"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="1.5"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                ></path>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        <AnnouncementModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          cohorts={cohorts}
        />
      </div>
    </main>
  );
}
