"use client";

import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/popover";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@repo/ui/components/command";
import { WomanMainCarousel } from "@/features/woman/components/WomanMainCarousel";
import { WomanStyleCarousel } from "@/features/woman/components/WomanStyleCarousel";
import { WomanGalleryCarousel } from "@/features/woman/components/WomanGalleryCarousel";
import { usePayment } from "@/features/payment/hooks/use-payment";
import { GuestPaymentModal } from "@/features/payment/components/GuestPaymentModal";

const SERVICE_PRICES = {
  "90min": 330000,
  "240min": 880000,
  "420min": 1100000,
};

const SERVICE_REGULATION = (
  <div className="text-sm leading-relaxed text-black">
    <div className="flex items-start gap-1">
      <span className="shrink-0">•</span>
      <span>오프라인 서비스 입니다.</span>
    </div>
    <div className="flex items-start gap-1">
      <span className="shrink-0">•</span>
      <span>결제완료 후 일정이 픽스됩니다.</span>
    </div>
    <div className="flex items-start gap-1">
      <span className="shrink-0">•</span>
      <span>지각 및 노쇼에 대한 책임은 본인에게 있습니다.</span>
    </div>
    <div className="flex items-start gap-1">
      <span className="shrink-0">•</span>
      <span>
        서비스~4일 전 취소 위약금 30%, ~1일 전 50%, <br />
        당일 취소는 불가합니다.
      </span>
    </div>
    <div className="flex items-start gap-1 font-bold">
      <span className="shrink-0">•</span>
      <span>
        리포트는 리뷰 작성을 조건으로 발송 드리며 일주일 <br />
        정도 소요됩니다.
      </span>
    </div>
    <br />
    <div className="flex items-start gap-1 font-bold">
      <span className="shrink-0">•</span>
      <span>
        동행 서비스시 발생하는 쇼핑, 헤어&메이크업 등의 <br />
        비용은 별도입니다.
      </span>
    </div>
    <div className="flex items-start gap-1 font-bold">
      <span className="shrink-0">•</span>
      <span>
        리뷰 및 사진은 마케팅적으로 활용될 수 있으며 <br />
        동의하지 않을 권리가 있습니다.
      </span>
    </div>
  </div>
);

const SERVICES = {
  "90min": {
    label: "Visual Consulting (90분)",
    title: "Visual Consulting",
    duration: "90분",
    description: (
      <div className="text-sm leading-relaxed text-black">
        <div className="flex items-start gap-1 font-bold">
          <span className="shrink-0">•</span>
          <span>데이터 기반 정밀 진단 + 극대화 전략 설계</span>
        </div>
        {/* <div className="flex items-start gap-1">
          <span className="shrink-0">•</span>
          <span>
            피부시술과 성형 포함 맞춤형{" "}
            <span className="font-bold font-playfair">Visual Roadmap</span> 제공
          </span>
        </div> */}
      </div>
    ),
  },
  "240min": {
    label: "Fashion Styling (240분)",
    title: "Fashion Styling",
    duration: "240분",
    description: (
      <div className="text-sm leading-relaxed text-black">
        <div className="flex items-start gap-1 font-bold">
          <span className="shrink-0">•</span>
          <span>나만의 시각적인 매력을 차별화 하는 동행 퍼스널 쇼핑</span>
        </div>
        <div className="flex items-start gap-1">
          <span className="shrink-0">•</span>
          <p className="font-bold font-playfair">
            Signature Look Styling
            <span className="font-normal">
              {" "}
              - 아이덴티티와 라이프스타일 반영
            </span>
          </p>
        </div>
      </div>
    ),
  },
  "420min": {
    label: "Total Visual Making (420분)",
    title: "Total Visual Making",
    duration: "420분",
    description: (
      <div className="text-sm leading-relaxed text-black">
        <div className="flex items-start gap-1">
          <span className="shrink-0">•</span>
          <p>
            <span className="font-bold font-playfair">Full Package</span> -
            컨설팅· 동행 쇼핑· 헤어 & 메이크업· 프로필 촬영
          </p>
        </div>
        <div className="flex items-start gap-1">
          <span className="shrink-0">•</span>
          <span>
            필요 시 메디컬 연계 →
            <span className="font-bold">드라마틱한 변화 지원</span>
          </span>
        </div>
      </div>
    ),
  },
};

export default function WomanPage() {
  const [activeTab, setActiveTab] = useState("서비스 소개");
  const [selectedService, setSelectedService] =
    useState<keyof typeof SERVICES>("90min");
  const [open, setOpen] = useState(false);

  const {
    requestPayment,
    isModalOpen,
    closeModal,
    handleGuestSubmit,
    isLoading,
  } = usePayment();

  const handlePurchase = () => {
    const amount = SERVICE_PRICES[selectedService];
    const serviceTitle = SERVICES[selectedService].title;

    requestPayment({
      amount,
      orderName: serviceTitle,
    });
  };

  return (
    <div className="bg-[#f7f3f0] w-full min-h-screen flex flex-col items-center pb-20">
      <div
        className="max-w-screen-xl w-full mx-auto pt-40 px-4"
        data-model-id="1:1241"
      >
        <div className="flex flex-col md:flex-row justify-center items-center md:items-start gap-8 md:gap-12">
          {/* // 좌측 인물 */}
          <WomanMainCarousel />

          {/* 우측 설명 */}
          <div className="flex flex-col gap-8 items-center md:items-start text-center md:text-left">
            <p className="[font-family:'SUIT-Bold',Helvetica] font-normal text-black text-sm tracking-[0] leading-[21px]">
              <span className="font-bold">
                당신의 매력은 이미 존재합니다.
                <br />
              </span>

              <span className="[font-family:'DM_Serif_Display',Helvetica]">
                BRILLO
              </span>

              <span className="font-bold">
                는 당신의 아름다움이
                <br />
                자연스럽게 피어나는 순간을 만들어갑니다.
              </span>
            </p>

            <p className="w-[324px] [font-family:'SUIT-Regular',Helvetica] font-normal text-black text-sm tracking-[0] leading-[21px]">
              <span className="[font-family:'SUIT-Regular',Helvetica] font-normal text-black text-sm tracking-[0] leading-[21px]">
                여성의 비주얼은 단순한 외모를 넘어,
                <br />
              </span>

              <span className="[font-family:'SUIT-Bold',Helvetica] font-bold">
                매력과 자신감을 전하는 언어
              </span>

              <span className="[font-family:'SUIT-Regular',Helvetica] font-normal text-black text-sm tracking-[0] leading-[21px]">
                가 됩니다.
                <br />한 번의 스타일 전환이 일상과 커리어, 관계의 무대에서
                <br />
                전혀 다른 결과를 이끌어낼 수 있습니다.
              </span>
            </p>

            <div className="mt-4 w-[324px]">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger className="w-full h-auto border border-black rounded-none px-4 py-2 text-left focus:ring-0 relative flex items-center justify-between cursor-pointer data-[state=open]:bg-black/5">
                  <div className="font-serif text-black text-sm">
                    {SERVICES[selectedService].title}
                    <span className="font-suit">
                      {" "}
                      ({SERVICES[selectedService].duration})
                    </span>
                  </div>
                  <div className="absolute top-1.5 right-2 w-6 h-6 pointer-events-none">
                    <img
                      className="absolute w-[35.36%] h-[23.57%] top-[38.93%] left-[32.32%]"
                      alt="Vector"
                      src="/page/woman/vector-1.svg"
                    />
                  </div>
                </PopoverTrigger>
                <PopoverContent
                  side="bottom"
                  align="start"
                  sideOffset={0}
                  className="w-[324px] p-0 border border-black border-t-0 rounded-none bg-[#f7f3f0] shadow-none z-50"
                >
                  <Command
                    shouldFilter={false}
                    className="bg-[#f7f3f0] rounded-none! p-0"
                  >
                    <CommandList className="max-h-none overflow-y-visible py-0">
                      <CommandGroup className="p-0">
                        {Object.entries(SERVICES).map(([key, service]) => (
                          <CommandItem
                            key={key}
                            value={key}
                            onSelect={(currentValue) => {
                              setSelectedService(
                                currentValue as keyof typeof SERVICES,
                              );
                              setOpen(false);
                            }}
                            className="cursor-pointer font-serif text-sm rounded-none! border-b border-black last:border-b-0 px-4 py-2 bg-[#f7f3f0] aria-selected:bg-black/5 aria-selected:text-black data-[selected=true]:bg-black/5 data-[selected=true]:text-black text-black"
                          >
                            <span className="font-serif">{service.title}</span>
                            <span className="font-suit">
                              {" "}
                              ({service.duration})
                            </span>
                            {/* Hide Default Check Icon */}{" "}
                            <span className="hidden" />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Tabs */}
            <div className="flex w-full border-b border-[#d6d6d6]">
              {["서비스 소개", "리뷰", "서비스규정"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 pb-3 text-center text-sm transition-colors relative ${
                    activeTab === tab
                      ? "text-black border-b border-black -mb-[1px]"
                      : "text-black hover:text-black"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content Placeholder */}
            <div className="min-h-[100px] text-sm text-gray-600 w-[324px] break-keep text-start">
              {activeTab === "서비스 소개" && (
                <div className="space-y-2">
                  {SERVICES[selectedService].description}
                </div>
              )}
              {activeTab === "리뷰" && <p>등록된 리뷰가 없습니다.</p>}
              {activeTab === "서비스규정" && (
                <div className="space-y-2">{SERVICE_REGULATION}</div>
              )}
            </div>

            <div className="w-[324px] flex justify-between items-center pt-2 pb-4 border-t border-[#d6d6d6]">
              <span className="font-suit font-medium text-black text-sm">
                결제 금액
              </span>
              <span className="font-suit font-bold text-black text-lg tracking-tight">
                {SERVICE_PRICES[selectedService].toLocaleString()}원
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full">
              <a
                href="http://pf.kakao.com/_xgatxbG"
                target="_blank"
                rel="noopener noreferrer"
                className="h-[37px] flex items-center justify-center border border-black bg-transparent text-black text-sm hover:bg-gray-50 transition-colors"
              >
                문의하기
              </a>
              <button
                onClick={handlePurchase}
                className="h-[37px] flex items-center justify-center border border-black bg-black text-white text-sm hover:bg-gray-800 transition-colors"
              >
                구매하기
              </button>
            </div>
          </div>
        </div>

        <GuestPaymentModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSubmit={handleGuestSubmit}
          isLoading={isLoading}
        />

        {/* Consultation Image */}
        <div className="relative w-full max-w-4xl mx-auto mt-36">
          <img
            className="w-full h-auto object-cover"
            alt="Consultation"
            src="/page/woman/1.png"
          />
          <div className="absolute top-0 left-0 w-1/4 h-full bg-gradient-to-r from-[#f7f3f0] to-transparent" />
          <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-[#f7f3f0] to-transparent" />
        </div>

        {/* Style Carousel */}
        <WomanStyleCarousel />

        {/* Before/After Gallery */}
        <WomanGalleryCarousel />
      </div>
    </div>
  );
}
