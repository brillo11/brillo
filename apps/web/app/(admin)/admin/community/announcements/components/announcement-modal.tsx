import React, { useEffect, useState, useActionState } from "react";
import { X, Bold, Italic, List, Link as LinkIcon, Eye } from "lucide-react";
import { createPost } from "@/serverActions/post.actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useFormStatus } from "react-dom";

interface AnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  cohorts?: {
    id: number;
    title: string;
    slug: string;
  }[];
}

const initialState = {
  success: false,
  message: "",
  post: null,
};

export default function AnnouncementModal({
  isOpen,
  onClose,
  cohorts = [],
}: AnnouncementModalProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [content, setContent] = useState("");
  const [state, formAction] = useActionState<any, FormData>(
    createPost,
    initialState
  );
  const router = useRouter();

  // 텍스트 삽입 함수
  const insertText = (before: string, after: string = "") => {
    const textarea = document.querySelector("textarea");
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    const newText =
      text.substring(0, start) +
      before +
      selectedText +
      after +
      text.substring(end);
    setContent(newText);

    // 커서 위치 재조정은 React 상태 업데이트 후 실행되어야 함
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    if (state?.success) {
      toast.success("공지사항이 성공적으로 등록되었습니다.");
      onClose();
      setContent("");
      // 필요한 경우 목록 새로고침 또는 리다이렉션
    } else if (state?.error) {
      toast.error(state.error || "공지사항 등록에 실패했습니다.");
    }
  }, [state, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center transition-all duration-200 opacity-100">
      <div
        className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm transition-all duration-200 opacity-100"
        onClick={onClose}
      ></div>
      <div
        className="relative bg-white rounded-xl shadow-xl max-h-[90vh] overflow-hidden w-full mx-4 transition-all duration-200 transform opacity-100 scale-100 translate-y-0 max-w-6xl "
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-200 ">
          <h2 id="modal-title" className="text-xl font-semibold text-slate-800">
            새 공지사항 작성
          </h2>
          <button
            className="p-1 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="모달 닫기"
            onClick={onClose}
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] ">
          <div className="mb-6">
            <p className="text-slate-600">
              마크다운을 사용하여 풍부한 내용의 공지사항을 작성할 수 있습니다
            </p>
          </div>
          <form action={formAction}>
            <input type="hidden" name="boardSlug" value="notice" />
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  대상 기수<span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  required
                  name="tags"
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all border-slate-300"
                >
                  <option value="전체">전체</option>
                  {cohorts.map((cohort) => (
                    <option key={cohort.id} value={cohort.title}>
                      {cohort.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  제목<span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <input
                    name="title"
                    placeholder="공지사항 제목을 입력하세요"
                    required
                    maxLength={200}
                    className="w-full px-3 py-3 sm:px-4 text-base text-slate-900 border rounded-xl transition-all focus:ring-2 focus:border-transparent touch-manipulation placeholder-slate-400 border-slate-300 focus:ring-blue-500"
                    type="text"
                  />
                </div>
                <div className="flex justify-end mt-1">
                  <span className="text-xs text-slate-500">0/200자</span>
                </div>
              </div>
              <div className="min-h-[300px]">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  내용<span className="text-red-500 ml-1">*</span>
                </label>
                <div className="border border-slate-300 rounded-xl overflow-hidden min-h-[200px]">
                  <div className="bg-slate-50 border-b border-slate-200 p-3 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => insertText("**", "**")}
                        className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                        title="굵게 (Ctrl+B)"
                      >
                        <Bold className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertText("*", "*")}
                        className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                        title="기울임 (Ctrl+I)"
                      >
                        <Italic className="w-4 h-4" />
                      </button>
                      <div className="w-px h-6 bg-slate-300 mx-2"></div>
                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => insertText("# ")}
                          className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg text-xs font-medium hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                          title="대제목 (# 제목)"
                        >
                          H1
                        </button>
                        <button
                          type="button"
                          onClick={() => insertText("## ")}
                          className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-xs font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                          title="중제목 (## 제목)"
                        >
                          H2
                        </button>
                        <button
                          type="button"
                          onClick={() => insertText("### ")}
                          className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg text-xs font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                          title="소제목 (### 제목)"
                        >
                          H3
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => insertText("- ")}
                        className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                        title="리스트"
                      >
                        <List className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertText("[", "](url)")}
                        className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                        title="링크"
                      >
                        <LinkIcon className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPreview(!showPreview)}
                      className={`flex items-center space-x-2 px-3 py-1 rounded-lg transition-colors ${
                        showPreview
                          ? "bg-blue-100 text-blue-700"
                          : "hover:bg-slate-200"
                      }`}
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">미리보기</span>
                    </button>
                  </div>
                  <div className="flex">
                    <div
                      className={`w-full transition-all ${showPreview ? "hidden" : "block"}`}
                    >
                      <textarea
                        name="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full min-h-[300px] p-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset placeholder-slate-400"
                        placeholder={`마크다운으로 공지사항 내용을 작성하세요!

예시:
## 📢 중요 공지
안녕하세요, 수강생 여러분!

### 주요 내용
- 첫 번째 안내사항
- 두 번째 안내사항

**문의사항이 있으시면 언제든 연락주세요!**`}
                        style={{
                          fontFamily:
                            'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                        }}
                      ></textarea>
                    </div>
                    {showPreview && (
                      <div className="w-full min-h-[300px] p-4 prose prose-slate max-w-none overflow-y-auto bg-white">
                        {/* 실제 마크다운 렌더링을 위해서는 react-markdown 같은 라이브러리가 필요하지만, 
                            여기서는 간단히 줄바꿈만 처리해서 보여주거나, 원본을 보여줍니다. 
                            추후 react-markdown 도입 권장 */}
                        <pre className="whitespace-pre-wrap font-sans">
                          {content}
                        </pre>
                      </div>
                    )}
                  </div>
                  <div className="bg-slate-50 border-t border-slate-200 px-4 py-2">
                    <p className="text-xs text-slate-500">
                      <strong>팁:</strong> **굵게**, *기울임*, # 대제목, ##
                      중제목, ### 소제목, * 리스트, [링크](URL) 형식으로
                      작성하세요. Ctrl+B(굵게), Ctrl+I(기울임) 단축키 사용 가능
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <input
                  id="isPublished"
                  name="isPublished" // 실제 DB 스키마에는 없는 필드일 수 있음, 확인 필요. misc에 저장하거나 로직 수정 필요
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  type="checkbox"
                  defaultChecked
                />
                <label
                  htmlFor="isPublished"
                  className="text-sm font-medium text-slate-700"
                >
                  즉시 발행 (체크 해제시 임시저장됩니다)
                </label>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                <input
                  id="isPinned"
                  name="isPinned" // 실제 DB 스키마에는 없는 필드일 수 있음. misc에 저장하거나 로직 수정 필요
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  type="checkbox"
                />
                <label
                  htmlFor="isPinned"
                  className="text-sm font-medium text-slate-700"
                >
                  상단 고정 (중요한 공지를 맨 위에 고정합니다)
                </label>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-slate-200">
              <button
                className="inline-flex items-center justify-center font-medium rounded-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 shadow-sm hover:shadow-md border border-slate-300 text-slate-700 hover:bg-slate-50 focus:ring-slate-500 px-4 py-1.5 text-sm"
                type="button"
                onClick={onClose}
              >
                취소
              </button>
              <SubmitButton />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="inline-flex items-center justify-center font-medium rounded-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 shadow-sm hover:shadow-md bg-slate-600 text-white hover:bg-slate-700 focus:ring-slate-500 active:bg-slate-800 px-4 py-1.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      type="submit"
      disabled={pending}
    >
      {pending ? "작성 중..." : "작성 완료"}
    </button>
  );
}
