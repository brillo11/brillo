"use client";

import React, { useState, useRef, useEffect } from "react";
import { useBlogForm } from "./BlogFormContext";
import AccordionItem from "./AccordionItem";
import { Upload, X, Image as ImageIcon } from "lucide-react";

const StepPhoto: React.FC = () => {
  const { formData, updateFormData } = useBlogForm();

  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "completed" | "error"
  >("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 초기 로드 시 formData에서 상태 복원
  useEffect(() => {
    if (formData.photo.originalUrl && !previewUrl) {
      setPreviewUrl(formData.photo.originalUrl);
      setUploadStatus("completed");
    }
  }, [formData.photo.originalUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = async (file: File) => {
    // 1. UI Preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setUploadStatus("uploading");

    // 2. Upload to S3 via server (CORS 문제 우회)
    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch("/api/blog/photo/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => ({}));
        throw new Error(
          errorData.error || `업로드 실패: ${uploadResponse.status}`
        );
      }

      const uploadData = await uploadResponse.json();
      if (!uploadData.success) {
        throw new Error(uploadData.error || "업로드 실패");
      }

      console.log("✅ S3 업로드 성공:", uploadData.cloudFrontUrl);

      // 3. Update Form Context
      updateFormData("photo", {
        uploadedFile: file.name,
        originalUrl: uploadData.cloudFrontUrl,
        // editedUrl 및 instruction은 여기서 설정하지 않음 (생성 단계에서 자동 처리)
      });
      setUploadStatus("completed");
    } catch (error) {
      console.error("❌ Upload failed:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.";
      alert(`업로드 실패: ${errorMessage}`);
      setUploadStatus("error");
      setPreviewUrl("");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      processFile(file);
    }
  };

  const handleReset = () => {
    setPreviewUrl("");
    setUploadStatus("idle");
    updateFormData("photo", { uploadedFile: "", originalUrl: "" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <AccordionItem
      title="5단계: 프로필/인물 사진 업로드 (선택)"
      defaultOpen={false}
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-400 leading-relaxed">
          본인의 전문성이 드러나거나 신뢰감을 줄 수 있는 인물 사진을
          업로드해주세요.
          <br />
          블로그 글 생성 시, AI가 내용을 파악하여 가장 자연스러운 위치에 사진을
          배치해드립니다. (자동 보정 및 최적화 포함)
        </p>

        <div
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all relative group ${
            previewUrl
              ? "border-[#33DB98]/30 bg-[#33DB98]/5"
              : "border-white/10 hover:border-[#33DB98]/40 hover:bg-white/5"
          }`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {!previewUrl ? (
            <div
              className="cursor-pointer flex flex-col items-center py-6"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-14 h-14 bg-white/5 rounded-full shadow-inner flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Upload className="w-7 h-7 text-gray-500 group-hover:text-[#33DB98]" />
              </div>
              <p className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">
                클릭하여 사진 업로드
              </p>
              <p className="text-xs text-gray-500 mt-2 font-medium">
                최대 10MB 권장 (드래그 앤 드롭 지원)
              </p>
            </div>
          ) : (
            <div className="relative inline-block animate-in zoom-in-95 duration-300">
              <img
                src={previewUrl}
                alt="Preview"
                className="h-48 object-cover rounded-xl shadow-2xl border border-white/10"
              />
              <button
                onClick={handleReset}
                className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1.5 shadow-xl hover:bg-red-600 transition-colors border-2 border-[#0A0A0A]"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Status Indicator */}
              <div className="absolute bottom-3 right-3">
                {uploadStatus === "uploading" && (
                  <div className="bg-black/80 backdrop-blur-md text-white text-[10px] px-3 py-1.5 rounded-full animate-pulse border border-white/10 font-bold">
                    업로드 중...
                  </div>
                )}
                {uploadStatus === "completed" && (
                  <div className="bg-[#33DB98] text-black text-[10px] px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 font-bold border border-white/20">
                    <ImageIcon className="w-3 h-3" /> 완료
                  </div>
                )}
                {uploadStatus === "error" && (
                  <div className="bg-red-500 text-white text-[10px] px-3 py-1.5 rounded-full shadow-lg font-bold border border-white/20">
                    실패
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AccordionItem>
  );
};

export default StepPhoto;
