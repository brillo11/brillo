"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Button } from "@repo/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Solar, LunarUtil } from "lunar-javascript";

// 오행 색상 매핑
const WUXING_COLORS = {
  금: "bg-slate-500 text-white", // 금속
  목: "bg-teal-600 text-white", // 나무
  수: "bg-slate-700 text-white", // 물
  화: "bg-rose-400 text-white", // 불
  토: "bg-amber-600 text-white", // 흙
};

interface SajuResult {
  name: string;
  gender: string;
  solarDate: string;
  lunarDate: string;
  yearPillar: { gan: string; zhi: string; wuxing: string };
  monthPillar: { gan: string; zhi: string; wuxing: string };
  dayPillar: { gan: string; zhi: string; wuxing: string };
  hourPillar: { gan: string; zhi: string; wuxing: string };
}

export default function CalendarPage() {
  const [formData, setFormData] = useState({
    name: "",
    year: "",
    month: "",
    day: "",
    hour: "",
    minute: "",
    gender: "male",
  });
  const [sajuResult, setSajuResult] = useState<SajuResult | null>(null);

  const calculateSaju = () => {
    try {
      const { year, month, day, hour, minute, name, gender } = formData;

      // Solar 객체 생성 (양력 날짜)
      const solar = Solar.fromYmdHms(
        parseInt(year),
        parseInt(month),
        parseInt(day),
        parseInt(hour),
        parseInt(minute || "0"),
        0
      );

      // 음력 변환
      const lunar = solar.getLunar();
      const eightChar = lunar.getEightChar();

      // 사주팔자 추출
      const result: SajuResult = {
        name,
        gender,
        solarDate: `${year}.${month}.${day} ${hour}:${minute || "00"}`,
        lunarDate: `${lunar.getYear()}.${lunar.getMonth()}.${lunar.getDay()}`,
        yearPillar: {
          gan: eightChar.getYearGan(),
          zhi: eightChar.getYearZhi(),
          wuxing: LunarUtil.WU_XING_ZHI[eightChar.getYearZhi()] || "",
        },
        monthPillar: {
          gan: eightChar.getMonthGan(),
          zhi: eightChar.getMonthZhi(),
          wuxing: LunarUtil.WU_XING_ZHI[eightChar.getMonthZhi()] || "",
        },
        dayPillar: {
          gan: eightChar.getDayGan(),
          zhi: eightChar.getDayZhi(),
          wuxing: LunarUtil.WU_XING_ZHI[eightChar.getDayZhi()] || "",
        },
        hourPillar: {
          gan: eightChar.getTimeGan(),
          zhi: eightChar.getTimeZhi(),
          wuxing: LunarUtil.WU_XING_ZHI[eightChar.getTimeZhi()] || "",
        },
      };

      setSajuResult(result);
    } catch (error) {
      console.error("사주 계산 오류:", error);
      alert("사주 계산 중 오류가 발생했습니다. 입력 정보를 확인해주세요.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    calculateSaju();
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    setSajuResult(null);
  };

  // 시간 옵션 (자시~해시)
  const hourOptions = [
    { value: "23", label: "자시(子時) 23:00-01:00" },
    { value: "1", label: "축시(丑時) 01:00-03:00" },
    { value: "3", label: "인시(寅時) 03:00-05:00" },
    { value: "5", label: "묘시(卯時) 05:00-07:00" },
    { value: "7", label: "진시(辰時) 07:00-09:00" },
    { value: "9", label: "사시(巳時) 09:00-11:00" },
    { value: "11", label: "오시(午時) 11:00-13:00" },
    { value: "13", label: "미시(未時) 13:00-15:00" },
    { value: "15", label: "신시(申時) 15:00-17:00" },
    { value: "17", label: "유시(酉時) 17:00-19:00" },
    { value: "19", label: "술시(戌時) 19:00-21:00" },
    { value: "21", label: "해시(亥時) 21:00-23:00" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            만세력 계산기
          </h1>
          <p className="text-muted-foreground">
            생년월일과 생시를 입력하시면 사주팔자를 확인하실 수 있습니다
          </p>
        </div>

        {!sajuResult ? (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>정보 입력</CardTitle>
              <CardDescription>
                정확한 사주 분석을 위해 생년월일과 생시를 입력해주세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 이름 */}
                <div className="space-y-2">
                  <Label htmlFor="name">이름</Label>
                  <Input
                    id="name"
                    placeholder="홍길동"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    required
                  />
                </div>

                {/* 생년월일 */}
                <div className="space-y-2">
                  <Label>생년월일 (양력 기준)</Label>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Input
                        type="number"
                        placeholder="년 (YYYY)"
                        min="1900"
                        max="2100"
                        value={formData.year}
                        onChange={(e) => handleChange("year", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Input
                        type="number"
                        placeholder="월 (MM)"
                        min="1"
                        max="12"
                        value={formData.month}
                        onChange={(e) => handleChange("month", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Input
                        type="number"
                        placeholder="일 (DD)"
                        min="1"
                        max="31"
                        value={formData.day}
                        onChange={(e) => handleChange("day", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* 생시 */}
                <div className="space-y-2">
                  <Label htmlFor="hour">생시 (태어난 시간)</Label>
                  <Select
                    value={formData.hour}
                    onValueChange={(value) => handleChange("hour", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="시간을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {hourOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 생분 */}
                <div className="space-y-2">
                  <Label htmlFor="minute">생분 (태어난 분)</Label>
                  <Input
                    id="minute"
                    type="number"
                    placeholder="분 (0-59)"
                    min="0"
                    max="59"
                    value={formData.minute}
                    onChange={(e) => handleChange("minute", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    모르시는 경우 0을 입력하세요
                  </p>
                </div>

                {/* 성별 */}
                <div className="space-y-2">
                  <Label htmlFor="gender">성별</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => handleChange("gender", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">남성</SelectItem>
                      <SelectItem value="female">여성</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 제출 버튼 */}
                <Button type="submit" className="w-full" size="lg">
                  사주팔자 확인하기
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* 헤더 정보 */}
            <Card className="shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-3xl mb-2">
                      {sajuResult.name}(
                      {sajuResult.gender === "male" ? "남성" : "여성"})
                    </CardTitle>
                    <div className="space-y-1 text-muted-foreground">
                      <p className="text-lg">{sajuResult.solarDate} (양력)</p>
                      <p>음력: {sajuResult.lunarDate}</p>
                    </div>
                  </div>
                  <Button onClick={handleReset} variant="outline">
                    다시 입력하기
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* 사주팔자 표 */}
            <Card className="shadow-lg overflow-hidden">
              <CardContent className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-800">
                        <th className="border border-slate-300 dark:border-slate-600 p-3 text-center font-semibold">
                          &nbsp;
                        </th>
                        <th className="border border-slate-300 dark:border-slate-600 p-3 text-center font-semibold text-lg">
                          시주
                        </th>
                        <th className="border border-slate-300 dark:border-slate-600 p-3 text-center font-semibold text-lg">
                          일주
                        </th>
                        <th className="border border-slate-300 dark:border-slate-600 p-3 text-center font-semibold text-lg">
                          월주
                        </th>
                        <th className="border border-slate-300 dark:border-slate-600 p-3 text-center font-semibold text-lg">
                          연주
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* 천간 행 */}
                      <tr>
                        <td className="border border-slate-300 dark:border-slate-600 p-3 font-semibold bg-slate-50 dark:bg-slate-800/50">
                          천간
                        </td>
                        <td className="border border-slate-300 dark:border-slate-600 p-2">
                          <div
                            className={`${
                              WUXING_COLORS[
                                sajuResult.hourPillar
                                  .wuxing as keyof typeof WUXING_COLORS
                              ] || "bg-gray-500 text-white"
                            } rounded-lg p-8 text-center`}
                          >
                            <span className="text-5xl font-bold">
                              {sajuResult.hourPillar.gan}
                            </span>
                          </div>
                        </td>
                        <td className="border border-slate-300 dark:border-slate-600 p-2">
                          <div
                            className={`${
                              WUXING_COLORS[
                                sajuResult.dayPillar
                                  .wuxing as keyof typeof WUXING_COLORS
                              ] || "bg-gray-500 text-white"
                            } rounded-lg p-8 text-center`}
                          >
                            <span className="text-5xl font-bold">
                              {sajuResult.dayPillar.gan}
                            </span>
                          </div>
                        </td>
                        <td className="border border-slate-300 dark:border-slate-600 p-2">
                          <div
                            className={`${
                              WUXING_COLORS[
                                sajuResult.monthPillar
                                  .wuxing as keyof typeof WUXING_COLORS
                              ] || "bg-gray-500 text-white"
                            } rounded-lg p-8 text-center`}
                          >
                            <span className="text-5xl font-bold">
                              {sajuResult.monthPillar.gan}
                            </span>
                          </div>
                        </td>
                        <td className="border border-slate-300 dark:border-slate-600 p-2">
                          <div
                            className={`${
                              WUXING_COLORS[
                                sajuResult.yearPillar
                                  .wuxing as keyof typeof WUXING_COLORS
                              ] || "bg-gray-500 text-white"
                            } rounded-lg p-8 text-center`}
                          >
                            <span className="text-5xl font-bold">
                              {sajuResult.yearPillar.gan}
                            </span>
                          </div>
                        </td>
                      </tr>

                      {/* 지지 행 */}
                      <tr>
                        <td className="border border-slate-300 dark:border-slate-600 p-3 font-semibold bg-slate-50 dark:bg-slate-800/50">
                          지지
                        </td>
                        <td className="border border-slate-300 dark:border-slate-600 p-2">
                          <div
                            className={`${
                              WUXING_COLORS[
                                sajuResult.hourPillar
                                  .wuxing as keyof typeof WUXING_COLORS
                              ] || "bg-gray-500 text-white"
                            } rounded-lg p-8 text-center`}
                          >
                            <span className="text-5xl font-bold">
                              {sajuResult.hourPillar.zhi}
                            </span>
                          </div>
                        </td>
                        <td className="border border-slate-300 dark:border-slate-600 p-2">
                          <div
                            className={`${
                              WUXING_COLORS[
                                sajuResult.dayPillar
                                  .wuxing as keyof typeof WUXING_COLORS
                              ] || "bg-gray-500 text-white"
                            } rounded-lg p-8 text-center`}
                          >
                            <span className="text-5xl font-bold">
                              {sajuResult.dayPillar.zhi}
                            </span>
                          </div>
                        </td>
                        <td className="border border-slate-300 dark:border-slate-600 p-2">
                          <div
                            className={`${
                              WUXING_COLORS[
                                sajuResult.monthPillar
                                  .wuxing as keyof typeof WUXING_COLORS
                              ] || "bg-gray-500 text-white"
                            } rounded-lg p-8 text-center`}
                          >
                            <span className="text-5xl font-bold">
                              {sajuResult.monthPillar.zhi}
                            </span>
                          </div>
                        </td>
                        <td className="border border-slate-300 dark:border-slate-600 p-2">
                          <div
                            className={`${
                              WUXING_COLORS[
                                sajuResult.yearPillar
                                  .wuxing as keyof typeof WUXING_COLORS
                              ] || "bg-gray-500 text-white"
                            } rounded-lg p-8 text-center`}
                          >
                            <span className="text-5xl font-bold">
                              {sajuResult.yearPillar.zhi}
                            </span>
                          </div>
                        </td>
                      </tr>

                      {/* 음양오행 행 */}
                      <tr>
                        <td className="border border-slate-300 dark:border-slate-600 p-3 font-semibold bg-slate-50 dark:bg-slate-800/50">
                          음양오행
                        </td>
                        <td className="border border-slate-300 dark:border-slate-600 p-3 text-center">
                          {sajuResult.hourPillar.wuxing}
                        </td>
                        <td className="border border-slate-300 dark:border-slate-600 p-3 text-center">
                          {sajuResult.dayPillar.wuxing}
                        </td>
                        <td className="border border-slate-300 dark:border-slate-600 p-3 text-center">
                          {sajuResult.monthPillar.wuxing}
                        </td>
                        <td className="border border-slate-300 dark:border-slate-600 p-3 text-center">
                          {sajuResult.yearPillar.wuxing}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* 추가 정보 안내 */}
            <Card className="shadow-lg bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground text-center">
                  💡 사주팔자가 성공적으로 계산되었습니다. 천간과 지지의 색상은
                  해당 오행을 나타냅니다.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
