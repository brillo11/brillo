"use client";

import { useState } from "react";
import { cn } from "@/shared/lib/utils";

const FAQS = [
  {
    question: "온라인인가요 오프라인인가요?",
    answer: (
      <>
        브릴로 퍼스널 비주얼디렉팅은 누구나 <br />
        온라인 상담으로 접근할 수 있는 시대에 <br />
        여전히 오프라인 1:1 디렉팅을 고수합니다.
        <br />
        <br />
        비주얼이라는 것은 단순 화면이나 사진 속 정보가 아닌, <br />
        실제 당신만이 가진 고유한 분위기와 맥락에서만 <br />
        정밀하게 진단될 수 있기 때문입니다.
        <br />
        <br />
        그래서 브릴로는 개개인의 존재감을 온전히 담아내는 <br />
        차별화된 맞춤형 솔루션을 제공합니다.
        <br />
        <br />※ 온라인 베이직 서비스도 고려중에 있습니다.
      </>
    ),
  },
  {
    question: "결제 후 서비스가 어떻게 진행되나요?",
    answer: (
      <>
        결제 후 일정을 먼저 픽스합니다. <br />
        곧바로 체크리스트 파일과 사진 요청사항을 정리해 <br />
        보내드리면, 의뢰인께서는 정해진 기한 내에 <br />
        저에게 파일과 사진을 회신하시고, 정해진 일시에 <br />
        안내받은 장소로 오시면 됩니다.
      </>
    ),
  },
  {
    question: "일정을 변경하고 싶은데 가능한가요?",
    answer: (
      <>
        일정 변경은 기존 예정된 서비스일 기준 3일 전까지 <br />
        말씀해주셔야 합니다.
        <br />
        <br />
        1회에 한해 가능하며, 그 외의 경우 취소위약금 발생 후 <br />
        취소를 진행한 다음 다시 결제하여 일정을 새로 <br />
        잡아주셔야 합니다.
      </>
    ),
  },
  {
    question: "환불 규정이 궁금해요.",
    answer: (
      <>
        서비스 당일 기준 3일, 4일 전 : 위약금 30%
        <br />
        서비스 당일 기준 1일, 2일 전 : 위약금 50%
        <br />
        서비스 당일 : 환불 불가
      </>
    ),
  },
  {
    question: (
      <>
        동행 일정 진행 시 쇼핑 및 헤어&메이크업 <br className="md:hidden" />
        비용은 별도인가요?
      </>
    ),
    answer: (
      <>
        그렇습니다.
        <br />
        <br />
        의류 쇼핑, 헤어&메이크업, 교통(자차 이용시 해당 없음), <br />
        식음료 비용은 의뢰인 부담입니다.
        <br />
        <br />
        최대한 예산에 맞춰서 진행하는 것을 원칙으로 하지만, <br />
        너무 부족하다고 여겨지는 경우 따로 제안을 <br />
        드릴 수 있습니다.
      </>
    ),
  },
  {
    question: (
      <>
        피부과 시술이나 성형 수술, <br className="md:hidden" />
        뷰티 제품 관련해서도 다루나요?
      </>
    ),
    answer: (
      <>
        내가 원하는 수준의 아름다움과 멋을 위해서 <br />
        어느정도의 수술이나 시술이 꼭 필요한 사람도 많습니다.
        <br />
        <br />
        브릴로는 당신의 모든 시각적 요소를 극대화 · 최적화 하기 <br />
        위한 모든 플랜과 솔루션을 설계합니다.
        <br />
        <br />
        따라서 메디컬적인 부분도 전부 다루고 있으며, <br />
        평소 기초 스킨케어 루틴을 위한 뷰티 제품도 맞춤 <br />
        제공합니다.
        <br />
        <br />
        참고로 추천은 광고나 협찬이 아닌 <br />
        연예계 재직시절 부터 쌓아온 경험과 데이터베이스를 <br />
        기반으로 각 부위별 최상의 메디컬 정보를 제공합니다.
      </>
    ),
  },
  {
    question: "피드백 리포트는 뭔가요?",
    answer: (
      <>
        브릴로는 단순 외모의 변화만을 추구하는 것이 아닌, <br />
        이를 통해 인생의 변화를 경험하길 바랍니다.
        <br />
        <br />
        때문에 모든 서비스는 1회성 체험으로 끝나지 않도록 <br />
        서비스 종료 후 피드백 리포트를 제공하고 있습니다.
        <br />
        <br />
        리포트는 리뷰를 작성해주시는 분에 한해 보내드리고 <br />
        있으며, 일주일정도 소요됩니다.
      </>
    ),
  },
  {
    question: (
      <>
        인플루언서, 연예인, 배우를 <br className="md:hidden" />
        지망하는데 특화서비스가 있나요?
      </>
    ),
    answer: (
      <>
        실물뿐만 아니라 화면과 영상에 나오는 나의 비주얼 <br />
        극대화를 위해 더욱 치밀하고 체계적인 솔루션이 필요한 <br />
        케이스입니다.
        <br />
        <br />
        VIP & Celeb 카테고리에서 신청하시면 되고 <br />
        신청 전 반드시 문의를 주시기 바랍니다.
      </>
    ),
  },
];

export default function FAQPage() {
  const [openIndices, setOpenIndices] = useState<number[]>([]);

  const toggleFAQ = (index: number) => {
    setOpenIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  return (
    <div className="bg-[#f7f3f0] w-full min-h-screen pt-40 pb-20 px-4">
      <div className="max-w-[1000px] w-full mx-auto flex flex-col md:flex-row gap-12 md:gap-24">
        {/* Left: Title */}
        <div className="w-full md:w-[1/2]">
          <h1 className="font-suit text-[24px] leading-[32px] text-black">
            자주 묻는 질문
          </h1>
        </div>

        {/* Right: Accordion */}
        <div className="w-full md:w-[1/2] flex flex-col gap-6 mt-6 md:mt-9">
          {FAQS.map((faq, index) => {
            const isOpen = openIndices.includes(index);
            return (
              <div
                key={index}
                className="w-full border-b border-[#d4d4d4] pb-6 last:border-b-0"
              >
                <div
                  className="flex justify-between items-start cursor-pointer group text-[14px]"
                  onClick={() => toggleFAQ(index)}
                >
                  <h3 className="font-suit leading-relaxed text-black max-w-[90%] font-bold flex items-start gap-1">
                    <span className="font-playfair shrink-0 -mt-0.5">Q.</span>
                    <span className="whitespace-pre-wrap">{faq.question}</span>
                  </h3>
                  <button className="shrink-0 w-6 h-6 flex items-center justify-center relative">
                    <div
                      className={cn(
                        "transition-transform duration-300 absolute bg-black w-[14px] h-[2px] rounded-[1px]",
                        isOpen ? "rotate-45" : "rotate-0",
                      )}
                    />
                    <div
                      className={cn(
                        "transition-transform duration-300 absolute bg-black w-[14px] h-[2px] rounded-[1px]",
                        isOpen ? "-rotate-45" : "rotate-90",
                      )}
                    />
                  </button>
                </div>
                <div
                  className={cn(
                    "overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out",
                    isOpen
                      ? "max-h-[1000px] opacity-100 mt-4"
                      : "max-h-0 opacity-0 mt-0",
                  )}
                >
                  <p className="font-suit text-[14px] leading-[21px] text-[#000000]/50 whitespace-pre-line font-suit">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
