"use client";

import { useState } from "react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Textarea } from "@repo/ui/components/textarea";
import { Label } from "@repo/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { updateStudentProfile } from "@/serverActions/student/profile.actions";
import { toast } from "sonner";
import { GraduationCap, Target, Save } from "lucide-react";

interface StudentProfile {
  id: string;
  name: string;
  email: string | null;
  nickname: string;
  phoneNumber: string | null;
  image: string | null;
  learningLevel: string | null;
  learningGoals: string | null;
  learningHistory: any;
}

interface StudentProfileClientProps {
  initialProfile: StudentProfile;
}

export function StudentProfileClient({
  initialProfile,
}: StudentProfileClientProps) {
  const [learningLevel, setLearningLevel] = useState(
    initialProfile.learningLevel || ""
  );
  const [learningGoals, setLearningGoals] = useState(
    initialProfile.learningGoals || ""
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateStudentProfile({
        learningLevel: learningLevel || undefined,
        learningGoals: learningGoals || undefined,
      });
      toast.success("프로필이 성공적으로 업데이트되었습니다.");
    } catch (error) {
      console.error("프로필 업데이트 오류:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "프로필 업데이트에 실패했습니다."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">프로필 설정</h1>
        <p className="text-slate-600">
          학습 수준과 목표를 설정하면 개인화된 학습 자료를 받을 수 있습니다.
        </p>
      </div>

      <div className="space-y-6">
        {/* 기본 정보 카드 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              기본 정보
            </CardTitle>
            <CardDescription>계정 기본 정보입니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">이름</Label>
              <Input
                id="name"
                value={initialProfile.name}
                disabled
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                value={initialProfile.email || ""}
                disabled
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="nickname">닉네임</Label>
              <Input
                id="nickname"
                value={initialProfile.nickname}
                disabled
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* 학습 프로필 카드 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              학습 프로필
            </CardTitle>
            <CardDescription>
              학습 수준과 목표를 설정하면 YouTube 영상 기반 개인화된 학습 자료를
              받을 수 있습니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="learningLevel">
                학습 수준 <span className="text-red-500">*</span>
              </Label>
              <Select value={learningLevel} onValueChange={setLearningLevel}>
                <SelectTrigger id="learningLevel" className="mt-1">
                  <SelectValue placeholder="학습 수준을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">초급</SelectItem>
                  <SelectItem value="intermediate">중급</SelectItem>
                  <SelectItem value="advanced">고급</SelectItem>
                  <SelectItem value="expert">전문가</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500 mt-1">
                현재 학습 수준을 선택해주세요. 이 정보는 개인화된 학습 자료
                생성에 사용됩니다.
              </p>
            </div>

            <div>
              <Label htmlFor="learningGoals">학습 목표</Label>
              <Textarea
                id="learningGoals"
                value={learningGoals}
                onChange={(e) => setLearningGoals(e.target.value)}
                placeholder="예: YouTube 마케팅 전략을 배우고 싶습니다. 콘텐츠 기획과 분석 방법을 익히고 싶습니다."
                className="mt-1 min-h-[120px]"
              />
              <p className="text-xs text-slate-500 mt-1">
                학습 목표를 자세히 입력해주세요. 구체적일수록 더 정확한 개인화된
                학습 자료를 받을 수 있습니다.
              </p>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button
                onClick={handleSave}
                disabled={isSaving || !learningLevel}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "저장 중..." : "저장하기"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 안내 카드 */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Target className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">
                  개인화된 학습 자료란?
                </h3>
                <p className="text-sm text-slate-700">
                  YouTube 영상의 대본을 기반으로 AI가 여러분의 학습 수준과
                  목표에 맞춰 학습 자료를 자동으로 생성합니다. 미션에 YouTube
                  영상이 연결되어 있고 자동 개인화 옵션이 활성화되어 있으면,
                  미션 조회 시 자동으로 개인화된 대본을 받을 수 있습니다.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
