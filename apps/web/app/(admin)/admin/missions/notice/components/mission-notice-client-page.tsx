"use client";

import React, { useState, useEffect } from "react";
import { kdayjs } from "@/shared/lib/utils/dayjs";
import { Button } from "@repo/ui/components/button";
import { Badge } from "@repo/ui/components/badge";
import { Input } from "@repo/ui/components/input";
import { Textarea } from "@repo/ui/components/textarea";
import { Eye, Edit, Trash2, RefreshCw, Plus, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { getCohortMissions } from "@/serverActions/admin/cohort";
import { createMission } from "@/serverActions/admin/mission.actions";
import { toast } from "sonner";

interface Mission {
  id: number;
  title: string;
  description: string;
  dueDate: Date;
  week: number;
  createdAt: Date;
  updatedAt: Date;
  misc: any;
}

interface MissionNoticeClientPageProps {
  initialMissions: Mission[];
  cohorts: {
    id: number;
    title: string;
    slug: string;
  }[];
  defaultCohortId: number | null;
}

export default function MissionNoticeClientPage({
  initialMissions,
  cohorts,
  defaultCohortId,
}: MissionNoticeClientPageProps) {
  const [missions, setMissions] = useState<Mission[]>(initialMissions);
  const [selectedCohortId, setSelectedCohortId] = useState<number | null>(
    defaultCohortId
  );
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 미션 작성 폼 상태
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formWeek, setFormWeek] = useState(1);
  const [formDueDate, setFormDueDate] = useState("");
  const [formCohortId, setFormCohortId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 선택된 기수에 따라 미션 불러오기
  useEffect(() => {
    if (selectedCohortId) {
      setLoading(true);
      getCohortMissions(selectedCohortId)
        .then((data) => {
          setMissions(data);
        })
        .catch((error) => {
          console.error("Failed to load missions:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setMissions([]);
    }
  }, [selectedCohortId]);

  const handleRefresh = () => {
    if (selectedCohortId) {
      setLoading(true);
      getCohortMissions(selectedCohortId)
        .then((data) => {
          setMissions(data);
        })
        .catch((error) => {
          console.error("Failed to refresh missions:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const handleCohortChange = (value: string) => {
    if (value === "all") {
      setSelectedCohortId(null);
    } else {
      setSelectedCohortId(Number(value));
    }
  };

  const selectedCohort = cohorts.find((c) => c.id === selectedCohortId);

  const handleView = (mission: any) => {
    // 상세보기 로직 (나중에 구현)
    console.log("View mission:", mission);
  };

  const handleEdit = (mission: any) => {
    // 수정 로직 (나중에 구현)
    console.log("Edit mission:", mission);
  };

  const handleDelete = (mission: any) => {
    // 삭제 로직 (나중에 구현)
    if (confirm("정말 삭제하시겠습니까?")) {
      console.log("Delete mission:", mission);
    }
  };

  const handleCreate = () => {
    // 미션 작성 모달 열기
    setIsModalOpen(true);
    // 폼 초기화
    setFormTitle("");
    setFormDescription("");
    setFormWeek(1);
    setFormDueDate("");
    setFormCohortId(selectedCohortId?.toString() || "");
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formCohortId || !formDueDate) {
      toast.error("필수 항목을 모두 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createMission({
        title: formTitle,
        description: formDescription,
        week: formWeek,
        dueDate: new Date(formDueDate),
        cohortId: Number(formCohortId),
      });

      toast.success("미션이 성공적으로 생성되었습니다.");

      // 성공 후 모달 닫기 및 목록 새로고침
      setIsModalOpen(false);

      // 폼 초기화
      setFormTitle("");
      setFormDescription("");
      setFormWeek(1);
      setFormDueDate("");
      setFormCohortId("");

      // 선택된 기수가 생성한 기수와 같으면 목록 새로고침
      if (selectedCohortId === Number(formCohortId)) {
        handleRefresh();
      }
    } catch (error) {
      console.error("미션 생성 실패:", error);
      toast.error(
        error instanceof Error ? error.message : "미션 생성에 실패했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50 p-4 lg:p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-6">
          <div className="pb-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                    data-slot="icon"
                    className="w-5 h-5 text-slate-700"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
                    ></path>
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                    미션 관리
                  </h1>
                  <p className="text-slate-600 text-sm mt-1 hidden sm:block">
                    선택된 기수의 미션을 관리합니다
                  </p>
                </div>
              </div>
              <Button
                onClick={handleCreate}
                className="flex items-center space-x-1.5 px-3 sm:px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden min-[380px]:inline">미션 작성</span>
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-3">
              <Select
                value={selectedCohortId?.toString() || "all"}
                onValueChange={handleCohortChange}
              >
                <SelectTrigger className="w-full transition-all px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:border-slate-300 transition-colors min-w-[150px]">
                  <SelectValue placeholder="기수를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 기수</SelectItem>
                  {cohorts.map((cohort) => (
                    <SelectItem key={cohort.id} value={cohort.id.toString()}>
                      {cohort.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                className="flex items-center justify-center space-x-1 bg-white border border-slate-300 text-slate-600 px-2 py-2 min-[375px]:px-3 rounded-lg hover:bg-slate-50 hover:border-slate-400 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors min-w-[44px] min-h-[44px]"
                title="새로고침"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="text-xs hidden min-[375px]:inline">
                  새로고침
                </span>
              </Button>
            </div>
          </div>
        </div>

        {/* Mission List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="divide-y divide-slate-200">
            {loading ? (
              <div className="p-8 text-center text-slate-500">
                미션을 불러오는 중...
              </div>
            ) : !selectedCohortId ? (
              <div className="p-8 text-center text-slate-500">
                기수를 선택해주세요.
              </div>
            ) : missions.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                등록된 미션이 없습니다.
              </div>
            ) : (
              missions.map((mission) => {
                return (
                  <div
                    key={mission.id}
                    className="p-4 sm:p-6 border-l-4 border-l-transparent transition-all duration-200 group cursor-pointer hover:bg-slate-50 hover:shadow-md hover:border-l-slate-400 active:bg-slate-100 active:scale-[0.99]"
                  >
                    <div className="flex flex-col space-y-1">
                      <div className="flex-1 min-w-0">
                        <div className="mb-2">
                          <div className="flex items-center space-x-3 mb-2">
                            {selectedCohort && (
                              <Badge
                                variant="outline"
                                className="inline-flex items-center font-medium rounded-sm bg-slate-100 text-slate-800 px-2 py-0.5 text-xs"
                              >
                                {selectedCohort.title}
                              </Badge>
                            )}
                            <Badge className="inline-flex items-center justify-center font-bold rounded-lg px-3 py-1 text-xs bg-gradient-to-r from-slate-500 to-slate-600 text-white shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200">
                              {mission.week}주차
                            </Badge>
                            <h3 className="text-base min-[375px]:text-lg font-semibold text-slate-900 line-clamp-2 break-words min-w-0 flex-1">
                              {mission.title}
                            </h3>
                          </div>
                        </div>
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs min-[375px]:text-sm text-slate-600 mb-3 line-clamp-2 sm:line-clamp-3 break-words">
                              {mission.description}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-slate-500">
                              <span>
                                마감일:{" "}
                                {kdayjs(mission.dueDate).format(
                                  "YYYY. M. D. HH:mm"
                                )}
                              </span>
                              <span>
                                생성일:{" "}
                                {kdayjs(mission.createdAt).format(
                                  "YYYY. M. D."
                                )}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-end space-x-1 sm:space-x-2 flex-shrink-0 ml-4">
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleView(mission);
                              }}
                              variant="ghost"
                              size="sm"
                              className="p-2 sm:p-3 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center"
                              title="상세보기"
                            >
                              <Eye className="w-5 h-5" />
                            </Button>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(mission);
                              }}
                              variant="ghost"
                              size="sm"
                              className="p-2 sm:p-3 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center"
                              title="수정"
                            >
                              <Edit className="w-5 h-5" />
                            </Button>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(mission);
                              }}
                              variant="ghost"
                              size="sm"
                              className="p-2 sm:p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center"
                              title="삭제"
                            >
                              <Trash2 className="w-5 h-5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 미션 작성 모달 */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden p-0">
          <DialogHeader className="flex items-center justify-between p-6 border-b border-slate-200">
            <DialogTitle className="text-xl font-semibold text-slate-800">
              새 미션 추가
            </DialogTitle>
            {/* <button
              onClick={handleCloseModal}
              className="p-1 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="모달 닫기"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button> */}
          </DialogHeader>
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* 미션 제목 */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    미션 제목<span className="text-red-500 ml-1">*</span>
                  </label>
                  <Input
                    placeholder="미션 제목을 입력하세요"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3 py-3 sm:px-4 text-base text-slate-900 border rounded-xl transition-all focus:ring-2 focus:border-transparent placeholder-slate-400 border-slate-300 focus:ring-blue-500"
                  />
                </div>

                {/* 미션 설명 */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    미션 설명
                  </label>
                  <div className="border border-slate-300 rounded-xl overflow-hidden min-h-[200px]">
                    <div className="bg-slate-50 border-b border-slate-200 p-3 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                          title="굵게 (Ctrl+B)"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="w-4 h-4"
                          >
                            <path
                              strokeLinejoin="round"
                              d="M6.75 3.744h-.753v8.25h7.125a4.125 4.125 0 0 0 0-8.25H6.75Zm0 0v.38m0 16.122h6.747a4.5 4.5 0 0 0 0-9.001h-7.5v9h.753Zm0 0v-.37m0-15.751h6a3.75 3.75 0 1 1 0 7.5h-6m0-7.5v7.5m0 0v8.25m0-8.25h6.375a4.125 4.125 0 0 1 0 8.25H6.75m.747-15.38h4.875a3.375 3.375 0 0 1 0 6.75H7.497v-6.75Zm0 7.5h5.25a3.75 3.75 0 0 1 0 7.5h-5.25v-7.5Z"
                            />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                          title="기울임 (Ctrl+I)"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="w-4 h-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5.248 20.246H9.05m0 0h3.696m-3.696 0 5.893-16.502m0 0h-3.697m3.697 0h3.803"
                            />
                          </svg>
                        </button>
                        <div className="w-px h-6 bg-slate-300 mx-2"></div>
                        <div className="flex items-center space-x-1">
                          <button
                            type="button"
                            className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg text-xs font-medium hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                            title="대제목 (# 제목)"
                          >
                            H1
                          </button>
                          <button
                            type="button"
                            className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-xs font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                            title="중제목 (## 제목)"
                          >
                            H2
                          </button>
                          <button
                            type="button"
                            className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg text-xs font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                            title="소제목 (### 제목)"
                          >
                            H3
                          </button>
                        </div>
                        <button
                          type="button"
                          className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                          title="리스트"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="w-4 h-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                            />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                          title="링크"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="w-4 h-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
                            />
                          </svg>
                        </button>
                      </div>
                      <button
                        type="button"
                        className="flex items-center space-x-2 px-3 py-1 rounded-lg transition-colors hover:bg-slate-200"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                          />
                        </svg>
                        <span className="text-sm">미리보기</span>
                      </button>
                    </div>
                    <div className="flex">
                      <div className="w-full transition-all">
                        <Textarea
                          className="w-full min-h-[300px] p-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset placeholder-slate-400 font-mono"
                          placeholder="마크다운으로 미션에 대한 자세한 설명을 입력하세요"
                          value={formDescription}
                          onChange={(e) => setFormDescription(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="bg-slate-50 border-t border-slate-200 px-4 py-2">
                      <p className="text-xs text-slate-500">
                        <strong>팁:</strong> **굵게**, *기울임*, # 대제목, ##
                        중제목, ### 소제목, * 리스트, [링크](URL) 형식으로
                        작성하세요. Ctrl+B(굵게), Ctrl+I(기울임) 단축키 사용
                        가능
                      </p>
                    </div>
                  </div>
                </div>

                {/* 주차 및 마감일 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      주차
                    </label>
                    <Input
                      type="number"
                      placeholder="1"
                      value={formWeek}
                      onChange={(e) => setFormWeek(Number(e.target.value))}
                      className="w-full px-3 py-3 sm:px-4 text-base text-slate-900 border rounded-xl transition-all focus:ring-2 focus:border-transparent placeholder-slate-400 border-slate-300 focus:ring-blue-500"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      마감일 및 시간
                    </label>
                    <Input
                      type="datetime-local"
                      value={formDueDate}
                      onChange={(e) => setFormDueDate(e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      오늘 날짜 이후로만 설정할 수 있습니다
                    </p>
                  </div>
                </div>

                {/* 대상 기수 */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    대상 기수
                  </label>
                  <Select
                    value={formCohortId}
                    onValueChange={setFormCohortId}
                    required
                  >
                    <SelectTrigger className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <SelectValue placeholder="기수를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {cohorts.map((cohort) => (
                        <SelectItem
                          key={cohort.id}
                          value={cohort.id.toString()}
                        >
                          {cohort.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 버튼 */}
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-slate-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                  className="px-4 py-1.5 text-sm"
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 text-sm bg-slate-600 text-white hover:bg-slate-700"
                >
                  {isSubmitting ? "추가 중..." : "미션 추가"}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
