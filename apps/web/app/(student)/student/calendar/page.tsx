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
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/radio-group";
import { Checkbox } from "@repo/ui/components/checkbox";
import { Solar, Lunar, LunarUtil } from "lunar-javascript";

// 오행 색상 매핑 (배경색)
const WUXING_COLORS = {
  金: "bg-gray-500 text-white", // 금속 (회색)
  木: "bg-blue-600 text-white", // 나무 (푸른색)
  水: "bg-black text-white", // 물 (시꺼먼색)
  火: "bg-red-600 text-white", // 불 (붉은색)
  土: "bg-yellow-500 text-white", // 흙 (누런색)
};

// 오행 텍스트 색상 매핑
const WUXING_TEXT_COLORS = {
  金: "text-gray-600", // 금속
  木: "text-blue-600", // 나무
  수: "text-black", // 물
  화: "text-red-600", // 불
  토: "text-amber-600", // 흙
};

// 천간 한글 매핑
const GAN_KOREAN: { [key: string]: string } = {
  甲: "갑",
  乙: "을",
  丙: "병",
  丁: "정",
  戊: "무",
  己: "기",
  庚: "경",
  辛: "신",
  壬: "임",
  癸: "계",
};

// 지지 한글 매핑
const ZHI_KOREAN: { [key: string]: string } = {
  子: "자",
  丑: "축",
  寅: "인",
  卯: "묘",
  辰: "진",
  巳: "사",
  午: "오",
  未: "미",
  申: "신",
  酉: "유",
  戌: "술",
  亥: "해",
};

// 십성 한국어 매핑
const SHISHEN_KOREAN: { [key: string]: string } = {
  比肩: "비견",
  劫财: "겁재",
  食神: "식신",
  伤官: "상관",
  偏财: "편재",
  正财: "정재",
  七杀: "편관",
  正官: "정관",
  偏印: "편인",
  正印: "정인",
};

// 십이운성 한국어 매핑 (중국어 -> 한국어)
const CHANGSHENG_KOREAN: { [key: string]: string } = {
  长生: "장생",
  沐浴: "목욕",
  冠带: "관대",
  临官: "건록",
  帝旺: "제왕",
  衰: "쇠",
  病: "병",
  死: "사",
  墓: "묘",
  绝: "절",
  胎: "태",
  养: "양",
};

// 십이신살 매핑 (삼합 국 -> 신살)
// 기준: 인오술(화국), 사유축(금국), 신자진(수국), 해묘미(목국)
// 순서: 겁살, 재살, 천살, 지살, 년살, 월살, 망신살, 장성살, 반안살, 역마살, 육해살, 화개살
const SHENSHA_ORDER = [
  "겁살",
  "재살",
  "천살",
  "지살",
  "년살",
  "월살",
  "망신살",
  "장성살",
  "반안살",
  "역마살",
  "육해살",
  "화개살",
];

// 삼합 국 정의 (첫 글자가 기준)
const SAMHAP = {
  寅: "화",
  午: "화",
  戌: "화",
  巳: "금",
  酉: "금",
  丑: "금",
  申: "수",
  子: "수",
  辰: "수",
  亥: "목",
  卯: "목",
  未: "목",
};

// 각 국의 첫 글자 (지살) 인덱스
// 지지 순서: 자축인묘진사오미신유술해
// 자(0), 축(1), 인(2), 묘(3), 진(4), 사(5), 오(6), 미(7), 신(8), 유(9), 술(10), 해(11)
const JISAL_INDEX = {
  화: 2, // 인
  금: 5, // 사
  수: 8, // 신
  목: 11, // 해
};

// 천을귀인 매핑 (일간 -> 지지)
const NOBLEMAN = {
  甲: ["丑", "未"],
  戊: ["丑", "未"],
  庚: ["丑", "未"],
  乙: ["子", "申"],
  己: ["子", "申"],
  丙: ["亥", "酉"],
  丁: ["亥", "酉"],
  壬: ["巳", "卯"],
  癸: ["巳", "卯"],
  辛: ["午", "寅"],
};

// 문창귀인 매핑 (일간 -> 지지)
const MOONCHANG = {
  甲: "巳",
  乙: "午",
  丙: "申",
  丁: "酉",
  戊: "申",
  己: "酉",
  庚: "亥",
  辛: "子",
  壬: "寅",
  癸: "卯",
};

interface Pillar {
  gan: string;
  zhi: string;
  wuxing: string; // 간지 오행 색상용
  ganWuxing: string; // 천간 오행 상세 (예: 양목)
  zhiWuxing: string; // 지지 오행 상세 (예: 음화)
  tenGod: string; // 십성
  twelveYun: string; // 십이운성
  shenSha: string; // 십이신살
  nobleman: string[]; // 귀인
}

interface SajuResult {
  name: string;
  gender: string;
  solarDate: string;
  lunarDate: string;
  yearPillar: Pillar;
  monthPillar: Pillar;
  dayPillar: Pillar;
  hourPillar: Pillar;
  dayGan: string; // 일간 (기준)
  dayZhi: string; // 일지 (기준)
}

// 오행 상세 정보 가져오기 (예: 甲 -> 양목)
const getWuxingDetail = (char: string, isGan: boolean): string => {
  const wuxing = isGan
    ? LunarUtil.WU_XING_GAN[char]
    : LunarUtil.WU_XING_ZHI[char];

  // 음양 계산
  // 천간: 갑병무경임(양), 을정기신계(음)
  // 지지: 자인진오신술(양), 축묘사미유해(음)
  const yangGan = ["甲", "丙", "戊", "庚", "壬"];
  const yangZhi = ["子", "寅", "辰", "午", "申", "戌"];

  const isYang = isGan ? yangGan.includes(char) : yangZhi.includes(char);

  return `${isYang ? "양" : "음"}${wuxing}`;
};

// 십이운성 계산
const getTwelveYun = (dayGan: string, zhi: string): string => {
  // LunarUtil.CHANG_SHENG는 '장생'부터 시작하는 순서
  // 일간별 장생지(Long Life) 인덱스 찾기
  // 양간: 갑(해), 병(인), 무(인), 경(사), 임(신) -> 순행
  // 음간: 을(오), 정(유), 기(유), 신(자), 계(묘) -> 역행

  const zhiIndex = LunarUtil.ZHI.indexOf(zhi);
  let yunIndex = 0;

  // 일간별 장생지 인덱스와 순행/역행 여부
  // 지지 인덱스: 자0 축1 인2 묘3 진4 사5 오6 미7 신8 유9 술10 해11
  switch (dayGan) {
    case "甲":
      yunIndex = (zhiIndex - 11 + 12) % 12;
      break; // 해(11)에서 장생
    case "丙":
    case "戊":
      yunIndex = (zhiIndex - 2 + 12) % 12;
      break; // 인(2)에서 장생
    case "庚":
      yunIndex = (zhiIndex - 5 + 12) % 12;
      break; // 사(5)에서 장생
    case "壬":
      yunIndex = (zhiIndex - 8 + 12) % 12;
      break; // 신(8)에서 장생

    // 음간은 역행 (장생 -> 목욕 -> 관대...)
    // 하지만 LunarUtil.CHANG_SHENG 배열은 순서대로 되어있으므로 인덱스 계산을 조정해야 함
    // 음간의 12운성 순서는 양간과 반대? -> 아님, 운성의 순서는 같으나 지지를 거꾸로 셈
    // 예: 을목은 오(6)에서 장생, 사(5)에서 목욕...
    case "乙":
      yunIndex = (6 - zhiIndex + 12) % 12;
      break; // 오(6)에서 장생
    case "丁":
    case "己":
      yunIndex = (9 - zhiIndex + 12) % 12;
      break; // 유(9)에서 장생
    case "辛":
      yunIndex = (0 - zhiIndex + 12) % 12;
      break; // 자(0)에서 장생
    case "癸":
      yunIndex = (3 - zhiIndex + 12) % 12;
      break; // 묘(3)에서 장생
  }

  return CHANGSHENG_KOREAN[LunarUtil.CHANG_SHENG[yunIndex] || ""] || "";
};

// 십이신살 계산 (일지 기준)
const getShenSha = (dayZhi: string, targetZhi: string): string => {
  // 1. 일지의 삼합 국 찾기
  const gook = SAMHAP[dayZhi as keyof typeof SAMHAP];
  if (!gook) return "";

  // 2. 해당 국의 지살(첫 글자) 인덱스
  const jisalIdx = JISAL_INDEX[gook as keyof typeof JISAL_INDEX];

  // 3. 대상 지지의 인덱스
  const targetIdx = LunarUtil.ZHI.indexOf(targetZhi);

  // 4. 차이 계산 (지살이 4번째인 '지살'에 해당하므로 오프셋 조정)
  // 신살 순서: 겁살(0)... 지살(3)...
  // 지살 인덱스에서 targetIdx까지의 거리

  // 지살(3)을 기준으로 계산
  // targetIdx - jisalIdx
  // 예: 인오술(화국) -> 인(2)이 지살.
  // 해(11)는 겁살.
  // 인(2) - 해(11) = -9 -> +12 = 3.
  // 로직 수정:
  // 겁살은 삼합의 마지막 글자 다음 글자.
  // 인오술(화) -> 술 다음 해(겁살).
  // 사유축(금) -> 축 다음 인(겁살).
  // 신자진(수) -> 진 다음 사(겁살).
  // 해묘미(목) -> 미 다음 신(겁살).

  let gubSalIndex = 0;
  if (gook === "화")
    gubSalIndex = 11; // 해
  else if (gook === "금")
    gubSalIndex = 2; // 인
  else if (gook === "수")
    gubSalIndex = 5; // 사
  else if (gook === "목") gubSalIndex = 8; // 신

  // 겁살 인덱스로부터의 거리
  const offset = (targetIdx - gubSalIndex + 12) % 12;
  return SHENSHA_ORDER[offset] || "";
};

// 귀인 계산
const getNobleman = (dayGan: string, zhi: string): string[] => {
  const result: string[] = [];

  // 천을귀인
  if (NOBLEMAN[dayGan as keyof typeof NOBLEMAN]?.includes(zhi)) {
    result.push("천을귀인");
  }

  // 문창귀인
  if (MOONCHANG[dayGan as keyof typeof MOONCHANG] === zhi) {
    result.push("문창귀인");
  }

  return result;
};

export default function CalendarPage() {
  const [formData, setFormData] = useState<{
    name: string;
    year: string;
    month: string;
    day: string;
    hour: string;
    minute: string;
    gender: string;
    calendarType: "solar" | "lunar";
    isLeapMonth: boolean;
  }>({
    name: "",
    year: "",
    month: "",
    day: "",
    hour: "",
    minute: "0",
    gender: "",
    calendarType: "solar",
    isLeapMonth: false,
  });

  const [sajuResult, setSajuResult] = useState<SajuResult | null>(null);

  // 오행 색상 가져오기 헬퍼
  const getWuxingColor = (wuxing: string) => {
    // "양목", "음화" 등에서 마지막 글자(오행) 추출
    const element = wuxing.slice(-1);
    return WUXING_TEXT_COLORS[element as keyof typeof WUXING_TEXT_COLORS] || "";
  };

  const calculateSaju = () => {
    try {
      const { year, month, day, hour, minute, name, gender } = formData;

      // Solar 객체 생성 (양력 날짜)
      // Solar 객체 생성 (양력/음력 구분)
      let solar;
      if (formData.calendarType === "lunar") {
        // @ts-ignore
        const lunar = Lunar.fromYmdHms(
          parseInt(year),
          parseInt(month),
          parseInt(day),
          parseInt(hour),
          parseInt(minute || "0"),
          0,
          formData.isLeapMonth
        );
        solar = lunar.getSolar();
      } else {
        solar = Solar.fromYmdHms(
          parseInt(year),
          parseInt(month),
          parseInt(day),
          parseInt(hour),
          parseInt(minute || "0"),
          0
        );
      }

      // 음력 변환
      const lunar = solar.getLunar();
      const eightChar = lunar.getEightChar();

      // 사주팔자 추출
      const dayGan = eightChar.getDayGan();
      const dayZhi = eightChar.getDayZhi();

      // 각 주별 정보 생성 헬퍼 함수
      const createPillar = (gan: string, zhi: string): Pillar => {
        const wuxing = LunarUtil.WU_XING_ZHI[zhi] || "";

        // 십성 계산 (일간 기준)
        // LunarUtil.SHI_SHEN 키는 "일간+대상천간"
        // 지지의 경우 지장간의 본기를 기준으로 십성을 정하는 것이 일반적이나,
        // 여기서는 지지 자체의 오행을 기준으로 십성을 정하는 약식 방법을 사용하거나
        // 지지->천간 변환(본기) 후 십성을 구해야 함.
        // lunar-javascript의 SHI_SHEN은 천간 간의 관계만 정의되어 있음.
        // 따라서 지지의 십성을 구하려면 지지의 지장간(본기)을 알아야 함.
        // LunarUtil.ZHI_HIDE_GAN (지장간) 활용 가능

        // 지지의 본기(Main Qi) 찾기
        // LunarUtil.ZHI_HIDE_GAN은 { "子": ["癸"], "丑": ["己", "癸", "辛"], ... } 형태일 것으로 추정
        // 하지만 타입 정의가 없으므로 안전하게 오행 상생상극으로 십성을 구하는 것이 나을 수 있음.
        // 또는 단순히 천간의 십성만 표시하고 지지는 비워두거나, 지지의 정기를 기준으로 계산.

        // 여기서는 천간에 대해서만 십성을 계산하고, 지지는 십이운성/신살로 대체하는 것이 일반적이지만
        // 사용자 요청 이미지에는 지지 위에도 십성이 표시되어 있지 않음 (천간 위에만 있음)
        // 아, 이미지에는 "십성" 행이 맨 위에 있고, 천간에 대한 십성임.
        // 지지에 대한 십성은 "지장간"을 통해 보는데, 이미지 하단 "십성" 행은 지지에 대한 십성으로 보임.

        // 천간 십성
        const ganTenGodKey = dayGan + gan;
        const ganTenGod =
          SHISHEN_KOREAN[LunarUtil.SHI_SHEN[ganTenGodKey] || ""] || "";

        // 지지 십성 (지지의 정기를 기준으로 계산)
        // 지지별 정기(본기): 자(계), 축(기), 인(갑), 묘(을), 진(무), 사(병), 오(정), 미(기), 신(경), 유(신), 술(무), 해(임)
        const zhiMainGanMap: { [key: string]: string } = {
          子: "癸",
          丑: "己",
          寅: "甲",
          卯: "乙",
          辰: "戊",
          巳: "丙",
          午: "丁",
          未: "己",
          申: "庚",
          酉: "辛",
          戌: "戊",
          亥: "壬",
        };
        const zhiTenGodKey = dayGan + (zhiMainGanMap[zhi] || "");
        const zhiTenGod =
          SHISHEN_KOREAN[LunarUtil.SHI_SHEN[zhiTenGodKey] || ""] || "";

        return {
          gan,
          zhi,
          wuxing,
          ganWuxing: getWuxingDetail(gan, true),
          zhiWuxing: getWuxingDetail(zhi, false),
          tenGod: ganTenGod, // 천간 십성 (상단 표시용)
          // 지지 십성은 별도 필드로 저장하거나 UI에서 처리
          // Pillar 인터페이스에 zhiTenGod 추가 필요하지만 일단 tenGod은 천간용으로 사용
          // 하단 십성 표시를 위해 zhiTenGod도 반환해야 함.
          // Pillar 인터페이스 수정 없이 tenGod을 천간용으로 쓰고, 지지용은 별도 계산하거나 필드 추가.
          // 여기서는 tenGod을 천간용으로 함.
          twelveYun: getTwelveYun(dayGan, zhi),
          shenSha: getShenSha(dayZhi, zhi),
          nobleman: getNobleman(dayGan, zhi),
        };
      };

      // 지지 십성을 위해 createPillar 내부 로직을 밖으로 빼거나 Pillar 인터페이스 확장
      // Pillar 인터페이스에 zhiTenGod 추가

      const result: SajuResult = {
        name,
        gender,
        solarDate: `${solar.getYear()}.${solar.getMonth()}.${solar.getDay()} ${hour}:${
          minute || "00"
        }`,
        lunarDate: `${lunar.getYear()}.${lunar.getMonth()}.${lunar.getDay()}`,
        yearPillar: createPillar(
          eightChar.getYearGan(),
          eightChar.getYearZhi()
        ),
        monthPillar: createPillar(
          eightChar.getMonthGan(),
          eightChar.getMonthZhi()
        ),
        dayPillar: createPillar(eightChar.getDayGan(), eightChar.getDayZhi()),
        hourPillar: createPillar(
          eightChar.getTimeGan(),
          eightChar.getTimeZhi()
        ),
        dayGan,
        dayZhi,
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

  // 지지 십성 계산 헬퍼 (렌더링 시 사용)
  const getZhiTenGod = (dayGan: string, zhi: string) => {
    const zhiMainGanMap: { [key: string]: string } = {
      子: "癸",
      丑: "己",
      寅: "甲",
      卯: "乙",
      辰: "戊",
      巳: "丙",
      午: "丁",
      未: "己",
      申: "庚",
      酉: "辛",
      戌: "戊",
      亥: "壬",
    };
    const zhiTenGodKey = dayGan + (zhiMainGanMap[zhi] || "");
    return SHISHEN_KOREAN[LunarUtil.SHI_SHEN[zhiTenGodKey] || ""] || "";
  };

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

                {/* 양력/음력 선택 */}
                <div className="space-y-3">
                  <Label>달력 종류</Label>
                  <RadioGroup
                    defaultValue="solar"
                    value={formData.calendarType}
                    onValueChange={(value) =>
                      handleChange("calendarType", value as "solar" | "lunar")
                    }
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="solar" id="solar" />
                      <Label htmlFor="solar">양력</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="lunar" id="lunar" />
                      <Label htmlFor="lunar">음력</Label>
                    </div>
                  </RadioGroup>

                  {/* 윤달 체크박스 (음력일 때만 표시) */}
                  {formData.calendarType === "lunar" && (
                    <div className="flex items-center space-x-2 mt-2">
                      <Checkbox
                        id="isLeapMonth"
                        checked={formData.isLeapMonth}
                        onCheckedChange={(checked) =>
                          handleChange("isLeapMonth", checked === true)
                        }
                      />
                      <Label
                        htmlFor="isLeapMonth"
                        className="text-sm font-normal cursor-pointer"
                      >
                        윤달
                      </Label>
                    </div>
                  )}
                </div>

                {/* 생년월일 */}
                <div className="space-y-2">
                  <Label>
                    생년월일 (
                    {formData.calendarType === "solar" ? "양력" : "음력"} 기준)
                  </Label>
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
                      <p className="font-semibold text-primary">
                        일주 동물:{" "}
                        {(LunarUtil.ANIMAL &&
                          LunarUtil.ANIMAL[
                            LunarUtil.ZHI.indexOf(sajuResult.dayPillar.zhi)
                          ]) ||
                          ""}
                      </p>
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
                  <table className="w-full border-collapse text-center">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-800">
                        <th className="border border-slate-300 dark:border-slate-600 p-3 font-semibold w-24">
                          &nbsp;
                        </th>
                        <th className="border border-slate-300 dark:border-slate-600 p-3 font-semibold text-lg">
                          시주
                        </th>
                        <th className="border border-slate-300 dark:border-slate-600 p-3 font-semibold text-lg">
                          일주
                        </th>
                        <th className="border border-slate-300 dark:border-slate-600 p-3 font-semibold text-lg">
                          월주
                        </th>
                        <th className="border border-slate-300 dark:border-slate-600 p-3 font-semibold text-lg">
                          연주
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* 십성 (천간) */}
                      <tr>
                        <td className="border border-slate-300 dark:border-slate-600 p-3 font-semibold bg-slate-50 dark:bg-slate-800/50">
                          십성
                        </td>
                        <td className="border border-slate-300 dark:border-slate-600 p-3 font-medium">
                          {sajuResult.hourPillar.tenGod}
                        </td>
                        <td
                          className={`border border-slate-300 dark:border-slate-600 p-3 font-bold text-primary`}
                        >
                          {sajuResult.dayPillar.tenGod}
                        </td>
                        <td className="border border-slate-300 dark:border-slate-600 p-3 font-medium">
                          {sajuResult.monthPillar.tenGod}
                        </td>
                        <td className="border border-slate-300 dark:border-slate-600 p-3 font-medium">
                          {sajuResult.yearPillar.tenGod}
                        </td>
                      </tr>

                      {/* 음양오행 (천간) */}
                      <tr>
                        <td className="border border-slate-300 dark:border-slate-600 p-3 font-semibold bg-slate-50 dark:bg-slate-800/50">
                          음양오행
                        </td>
                        <td className="border border-slate-300 dark:border-slate-600 p-3 text-sm">
                          {GAN_KOREAN[sajuResult.hourPillar.gan] ||
                            sajuResult.hourPillar.gan}
                          (
                          <span
                            className={getWuxingColor(
                              sajuResult.hourPillar.ganWuxing
                            )}
                          >
                            {sajuResult.hourPillar.ganWuxing}
                          </span>
                          )
                        </td>
                        <td className="border border-slate-300 dark:border-slate-600 p-3 text-sm font-bold">
                          {GAN_KOREAN[sajuResult.dayPillar.gan] ||
                            sajuResult.dayPillar.gan}
                          (
                          <span
                            className={getWuxingColor(
                              sajuResult.dayPillar.ganWuxing
                            )}
                          >
                            {sajuResult.dayPillar.ganWuxing}
                          </span>
                          )
                        </td>
                        <td className="border border-slate-300 dark:border-slate-600 p-3 text-sm">
                          {GAN_KOREAN[sajuResult.monthPillar.gan] ||
                            sajuResult.monthPillar.gan}
                          (
                          <span
                            className={getWuxingColor(
                              sajuResult.monthPillar.ganWuxing
                            )}
                          >
                            {sajuResult.monthPillar.ganWuxing}
                          </span>
                          )
                        </td>
                        <td className="border border-slate-300 dark:border-slate-600 p-3 text-sm">
                          {GAN_KOREAN[sajuResult.yearPillar.gan] ||
                            sajuResult.yearPillar.gan}
                          (
                          <span
                            className={getWuxingColor(
                              sajuResult.yearPillar.ganWuxing
                            )}
                          >
                            {sajuResult.yearPillar.ganWuxing}
                          </span>
                          )
                        </td>
                      </tr>

                      {/* 천간 행 */}
                      <tr>
                        <td className="border border-slate-300 dark:border-slate-600 p-3 font-semibold bg-slate-50 dark:bg-slate-800/50">
                          천간
                        </td>
                        <td className="border border-slate-300 dark:border-slate-600 p-2">
                          <div
                            className={`${
                              WUXING_COLORS[
                                sajuResult.hourPillar.ganWuxing.slice(
                                  -1
                                ) as keyof typeof WUXING_COLORS
                              ] || "bg-gray-500 text-white"
                            } rounded-lg p-8 text-center aspect-square flex items-center justify-center`}
                          >
                            <span className="text-5xl font-bold">
                              {GAN_KOREAN[sajuResult.hourPillar.gan] ||
                                sajuResult.hourPillar.gan}
                            </span>
                          </div>
                        </td>
                        <td className="border border-slate-300 dark:border-slate-600 p-2">
                          <div
                            className={`${
                              WUXING_COLORS[
                                sajuResult.dayPillar.ganWuxing.slice(
                                  -1
                                ) as keyof typeof WUXING_COLORS
                              ] || "bg-gray-500 text-white"
                            } rounded-lg p-8 text-center aspect-square flex items-center justify-center`}
                          >
                            <span className="text-5xl font-bold">
                              {GAN_KOREAN[sajuResult.dayPillar.gan] ||
                                sajuResult.dayPillar.gan}
                            </span>
                          </div>
                        </td>
                        <td className="border border-slate-300 dark:border-slate-600 p-2">
                          <div
                            className={`${
                              WUXING_COLORS[
                                sajuResult.monthPillar.ganWuxing.slice(
                                  -1
                                ) as keyof typeof WUXING_COLORS
                              ] || "bg-gray-500 text-white"
                            } rounded-lg p-8 text-center aspect-square flex items-center justify-center`}
                          >
                            <span className="text-5xl font-bold">
                              {GAN_KOREAN[sajuResult.monthPillar.gan] ||
                                sajuResult.monthPillar.gan}
                            </span>
                          </div>
                        </td>
                        <td className="border border-slate-300 dark:border-slate-600 p-2">
                          <div
                            className={`${
                              WUXING_COLORS[
                                sajuResult.yearPillar.ganWuxing.slice(
                                  -1
                                ) as keyof typeof WUXING_COLORS
                              ] || "bg-gray-500 text-white"
                            } rounded-lg p-8 text-center aspect-square flex items-center justify-center`}
                          >
                            <span className="text-5xl font-bold">
                              {GAN_KOREAN[sajuResult.yearPillar.gan] ||
                                sajuResult.yearPillar.gan}
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
                                sajuResult.hourPillar.zhiWuxing.slice(
                                  -1
                                ) as keyof typeof WUXING_COLORS
                              ] || "bg-gray-500 text-white"
                            } rounded-lg p-8 text-center aspect-square flex items-center justify-center`}
                          >
                            <span className="text-5xl font-bold">
                              {ZHI_KOREAN[sajuResult.hourPillar.zhi] ||
                                sajuResult.hourPillar.zhi}
                            </span>
                          </div>
                        </td>
                        <td className="border border-slate-300 dark:border-slate-600 p-2">
                          <div
                            className={`${
                              WUXING_COLORS[
                                sajuResult.dayPillar.zhiWuxing.slice(
                                  -1
                                ) as keyof typeof WUXING_COLORS
                              ] || "bg-gray-500 text-white"
                            } rounded-lg p-8 text-center aspect-square flex items-center justify-center`}
                          >
                            <span className="text-5xl font-bold">
                              {ZHI_KOREAN[sajuResult.dayPillar.zhi] ||
                                sajuResult.dayPillar.zhi}
                            </span>
                          </div>
                        </td>
                        <td className="border border-slate-300 dark:border-slate-600 p-2">
                          <div
                            className={`${
                              WUXING_COLORS[
                                sajuResult.monthPillar.zhiWuxing.slice(
                                  -1
                                ) as keyof typeof WUXING_COLORS
                              ] || "bg-gray-500 text-white"
                            } rounded-lg p-8 text-center aspect-square flex items-center justify-center`}
                          >
                            <span className="text-5xl font-bold">
                              {ZHI_KOREAN[sajuResult.monthPillar.zhi] ||
                                sajuResult.monthPillar.zhi}
                            </span>
                          </div>
                        </td>
                        <td className="border border-slate-300 dark:border-slate-600 p-2">
                          <div
                            className={`${
                              WUXING_COLORS[
                                sajuResult.yearPillar.zhiWuxing.slice(
                                  -1
                                ) as keyof typeof WUXING_COLORS
                              ] || "bg-gray-500 text-white"
                            } rounded-lg p-8 text-center aspect-square flex items-center justify-center`}
                          >
                            <span className="text-5xl font-bold">
                              {ZHI_KOREAN[sajuResult.yearPillar.zhi] ||
                                sajuResult.yearPillar.zhi}
                            </span>
                          </div>
                        </td>
                      </tr>

                      {/* 음양오행 (지지) */}
                      <tr>
                        <td className="border border-slate-300 dark:border-slate-600 p-3 font-semibold bg-slate-50 dark:bg-slate-800/50">
                          음양오행
                        </td>
                        <td className="border border-slate-300 dark:border-slate-600 p-3 text-sm">
                          {ZHI_KOREAN[sajuResult.hourPillar.zhi] ||
                            sajuResult.hourPillar.zhi}
                          (
                          <span
                            className={getWuxingColor(
                              sajuResult.hourPillar.zhiWuxing
                            )}
                          >
                            {sajuResult.hourPillar.zhiWuxing}
                          </span>
                          )
                        </td>
                        <td className="border border-slate-300 dark:border-slate-600 p-3 text-sm">
                          {ZHI_KOREAN[sajuResult.dayPillar.zhi] ||
                            sajuResult.dayPillar.zhi}
                          (
                          <span
                            className={getWuxingColor(
                              sajuResult.dayPillar.zhiWuxing
                            )}
                          >
                            {sajuResult.dayPillar.zhiWuxing}
                          </span>
                          )
                        </td>
                        <td className="border border-slate-300 dark:border-slate-600 p-3 text-sm">
                          {ZHI_KOREAN[sajuResult.monthPillar.zhi] ||
                            sajuResult.monthPillar.zhi}
                          (
                          <span
                            className={getWuxingColor(
                              sajuResult.monthPillar.zhiWuxing
                            )}
                          >
                            {sajuResult.monthPillar.zhiWuxing}
                          </span>
                          )
                        </td>
                        <td className="border border-slate-300 dark:border-slate-600 p-3 text-sm">
                          {ZHI_KOREAN[sajuResult.yearPillar.zhi] ||
                            sajuResult.yearPillar.zhi}
                          (
                          <span
                            className={getWuxingColor(
                              sajuResult.yearPillar.zhiWuxing
                            )}
                          >
                            {sajuResult.yearPillar.zhiWuxing}
                          </span>
                          )
                        </td>
                      </tr>

                      {/* 십성 (지지) */}
                      <tr>
                        <td className="border border-slate-300 dark:border-slate-600 p-3 font-semibold bg-slate-50 dark:bg-slate-800/50">
                          십성
                        </td>
                        <td className="border border-slate-300 dark:border-slate-600 p-3 font-medium">
                          {getZhiTenGod(
                            sajuResult.dayGan,
                            sajuResult.hourPillar.zhi
                          )}
                        </td>
                        <td className="border border-slate-300 dark:border-slate-600 p-3 font-medium">
                          {getZhiTenGod(
                            sajuResult.dayGan,
                            sajuResult.dayPillar.zhi
                          )}
                        </td>
                        <td className="border border-slate-300 dark:border-slate-600 p-3 font-medium">
                          {getZhiTenGod(
                            sajuResult.dayGan,
                            sajuResult.monthPillar.zhi
                          )}
                        </td>
                        <td className="border border-slate-300 dark:border-slate-600 p-3 font-medium">
                          {getZhiTenGod(
                            sajuResult.dayGan,
                            sajuResult.yearPillar.zhi
                          )}
                        </td>
                      </tr>

                      {/* 십이운성 */}
                      <tr>
                        <td className="border border-slate-300 dark:border-slate-600 p-3 font-semibold bg-slate-50 dark:bg-slate-800/50">
                          십이운성
                        </td>
                        <td className="border border-slate-300 dark:border-slate-600 p-3">
                          {sajuResult.hourPillar.twelveYun}
                        </td>
                        <td className="border border-slate-300 dark:border-slate-600 p-3">
                          {sajuResult.dayPillar.twelveYun}
                        </td>
                        <td className="border border-slate-300 dark:border-slate-600 p-3">
                          {sajuResult.monthPillar.twelveYun}
                        </td>
                        <td className="border border-slate-300 dark:border-slate-600 p-3">
                          {sajuResult.yearPillar.twelveYun}
                        </td>
                      </tr>

                      {/* 십이신살 */}
                      <tr>
                        <td className="border border-slate-300 dark:border-slate-600 p-3 font-semibold bg-slate-50 dark:bg-slate-800/50">
                          십이신살
                        </td>
                        <td className="border border-slate-300 dark:border-slate-600 p-3">
                          {sajuResult.hourPillar.shenSha}
                        </td>
                        <td className="border border-slate-300 dark:border-slate-600 p-3">
                          {sajuResult.dayPillar.shenSha}
                        </td>
                        <td className="border border-slate-300 dark:border-slate-600 p-3">
                          {sajuResult.monthPillar.shenSha}
                        </td>
                        <td className="border border-slate-300 dark:border-slate-600 p-3">
                          {sajuResult.yearPillar.shenSha}
                        </td>
                      </tr>

                      {/* 귀인 */}
                      <tr>
                        <td className="border border-slate-300 dark:border-slate-600 p-3 font-semibold bg-slate-50 dark:bg-slate-800/50">
                          귀인
                        </td>
                        <td className="border border-slate-300 dark:border-slate-600 p-3 text-sm">
                          {sajuResult.hourPillar.nobleman.join(", ")}
                        </td>
                        <td className="border border-slate-300 dark:border-slate-600 p-3 text-sm">
                          {sajuResult.dayPillar.nobleman.join(", ")}
                        </td>
                        <td className="border border-slate-300 dark:border-slate-600 p-3 text-sm">
                          {sajuResult.monthPillar.nobleman.join(", ")}
                        </td>
                        <td className="border border-slate-300 dark:border-slate-600 p-3 text-sm">
                          {sajuResult.yearPillar.nobleman.join(", ")}
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
