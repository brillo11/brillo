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
    <AccordionItem title="5단계: 원장님 사진 업로드 (선택)" defaultOpen={false}>
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          원장님 얼굴이 포함된 이미지를 업로드해주세요.
          <br />
          블로그 글 생성 시, AI가 내용을 파악하여 가장 자연스러운 위치에 사진을
          합성해드립니다. (자동 보정 포함)
        </p>

        <div
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors relative ${
            previewUrl
              ? "border-blue-200 bg-blue-50/30"
              : "border-slate-300 hover:border-blue-400"
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
              className="cursor-pointer flex flex-col items-center py-4"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3">
                <Upload className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-700">
                클릭하여 사진 업로드
              </p>
              <p className="text-xs text-slate-500 mt-1">최대 10MB 권장</p>
            </div>
          ) : (
            <div className="relative inline-block">
              <img
                src={previewUrl}
                alt="Preview"
                className="h-40 object-cover rounded-lg shadow-sm"
              />
              <button
                onClick={handleReset}
                className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md hover:bg-slate-100"
              >
                <X className="w-4 h-4 text-slate-600" />
              </button>

              {/* Status Indicator */}
              <div className="absolute bottom-2 right-2">
                {uploadStatus === "uploading" && (
                  <div className="bg-black/70 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                    업로드 중...
                  </div>
                )}
                {uploadStatus === "completed" && (
                  <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-sm flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" /> 완료
                  </div>
                )}
                {uploadStatus === "error" && (
                  <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full shadow-sm">
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
