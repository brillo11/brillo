"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { kdayjs } from "@/shared/lib/utils/dayjs";
import {
  submitMission,
  MissionWithSubmissions,
} from "@/serverActions/mission.actions";
import { toast } from "sonner";
import { YouTubeCaptionExtractor } from "./YouTubeCaptionExtractor";

interface MissionSubmitButtonProps {
  mission: MissionWithSubmissions;
  className?: string;
  children?: React.ReactNode;
}

export default function MissionSubmitButton({
  mission,
  className,
  children,
}: MissionSubmitButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState(mission.submissions[0]?.content || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const isSubmitted = mission.submissions.length > 0;
  const isOverdue = new Date() > new Date(mission.dueDate);

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error("내용을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Convert BigInt to number for the server action if needed,
      // but Prisma usually handles BigInt serialization with some config or we need to be careful.
      // The server action expects number, but ID is BigInt.
      // We might need to cast or change server action to accept BigInt or string.
      // For now assuming Number() works if IDs are small enough, or pass as string and parse.
      // Let's try passing as number.
      await submitMission(Number(mission.id), content);
      toast.success("미션이 제출되었습니다.");
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("제출에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className={className}>
        {children || (isSubmitted ? "수정하기" : "제출하기")}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {mission.title}
                </h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-slate-500">
                    {mission.week}주차
                  </span>
                  <span
                    className={`inline-flex items-center font-medium rounded-full px-2.5 py-0.5 text-xs ${
                      isSubmitted
                        ? "bg-blue-100 text-blue-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {isSubmitted ? "제출 완료" : "미제출"}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-slate-900 mb-2">
                  미션 설명
                </h4>
                <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl">
                  {mission.description || "미션 설명이 없습니다."}
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-semibold text-slate-900 mb-1">
                  마감일
                </h4>
                <p className="text-sm text-slate-600">
                  {kdayjs(mission.dueDate).format("YYYY년 M월 D일 A h:mm")}
                </p>
              </div>

              {isOverdue ? (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-red-600 mb-2">
                    제출 마감됨
                  </h4>
                  <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-red-600 text-sm">
                    마감일이 지나 제출할 수 없습니다.
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* YouTube 자막 추출 */}
                  <YouTubeCaptionExtractor
                    onTranscriptExtracted={(transcript) => {
                      setContent((prev) => {
                        const newContent = prev
                          ? `${prev}\n\n=== YouTube 자막 ===\n${transcript}`
                          : `=== YouTube 자막 ===\n${transcript}`;
                        return newContent;
                      });
                    }}
                  />

                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 mb-2">
                      텍스트 제출 (링크 포함 가능)
                    </h4>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="링크나 텍스트 내용을 입력하세요. 위에서 YouTube 자막을 추출하면 자동으로 여기에 추가됩니다."
                      className="w-full h-48 p-4 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none text-sm placeholder:text-slate-400"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end space-x-3">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-200 transition-colors"
              >
                닫기
              </button>
              {!isOverdue ? (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  {isSubmitting ? "제출 중..." : "제출하기"}
                </button>
              ) : (
                <button
                  disabled
                  className="px-6 py-2 rounded-lg text-sm font-medium text-white bg-slate-400 cursor-not-allowed"
                >
                  제출 마감됨
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
