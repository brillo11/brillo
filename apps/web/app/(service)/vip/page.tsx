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
import { VipMainCarousel } from "@/features/vip/components/VipMainCarousel";
import { usePayment } from "@/features/payment/hooks/use-payment";
import { GuestPaymentModal } from "@/features/payment/components/GuestPaymentModal";

const SERVICE_PRICES = {
  project: 3000000,
  skin: 1000000,
  private: 2000000,
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
  project: {
    label: "프로젝트 단위 관리",
    title: "프로젝트 단위 관리 (1개월 / 3개월 / 6개월)",
    description: (
      <div className="text-sm leading-relaxed text-black font-suit">
        <div className="flex items-start gap-1">
          <span className="shrink-0">•</span>
          <span>지속적 업그레이드 + 풀케어 매니지먼트</span>
        </div>
        <div className="flex items-start gap-1">
          <span className="shrink-0">•</span>
          <span>
            고급 회원 전용 <span className="font-bold">연간 멤버십</span>{" "}
            프로그램 운영
          </span>
        </div>
      </div>
    ),
  },
  // skin: {
  //   label: "피부 & 성형 컨시어지",
  //   title: "피부 & 성형 컨시어지",
  //   description: (
  //     <div className="text-sm leading-relaxed text-black font-suit">
  //       <div className="flex items-start gap-1">
  //         <span className="shrink-0">•</span>
  //         <span>전문 피부과· 성형외과 협업</span>
  //       </div>
  //       <div className="flex items-start gap-1">
  //         <span className="shrink-0">•</span>
  //         <span>최적화된 시술 및 수술 플랜 제안 (회복 관리 포함)</span>
  //       </div>
  //       <div className="flex items-start gap-1">
  //         <span className="shrink-0">•</span>
  //         <span>
  //           불필요한 시술/수술은 배제, <br />꼭 필요한 업그레이드만 제안
  //         </span>
  //       </div>
  //     </div>
  //   ),
  // },
  private: {
    label: "프라이빗 컨설팅과 공간",
    title: "프라이빗 컨설팅과 공간",
    description: (
      <div className="text-sm leading-relaxed text-black font-suit">
        <div className="flex items-start gap-1">
          <span className="shrink-0">•</span>
          <span>호텔 라운지· 프라이빗 공간 진행</span>
        </div>
        <div className="flex items-start gap-1">
          <span className="shrink-0">•</span>
          <span>시간· 장소 맞춤형 예약</span>
        </div>
        <div className="flex items-start gap-1">
          <span className="shrink-0">•</span>
          <span>비밀 보장 시스템 (보안 계약, 촬영물 관리)</span>
        </div>
      </div>
    ),
  },
};

export default function VipPage() {
  const [activeTab, setActiveTab] = useState("서비스 소개");
  const [selectedService, setSelectedService] =
    useState<keyof typeof SERVICES>("project");
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
    const service = SERVICES[selectedService];

    requestPayment({
      amount,
      orderName: `VIP > ${service.label}`,
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
          <VipMainCarousel />

          {/* 우측 설명 */}
          <div className="flex flex-col gap-8 items-center md:items-start text-center md:text-left">
            <p className="[font-family:'SUIT-Bold',Helvetica] font-normal text-black text-sm tracking-[0] leading-[21px]">
              당신의 외모는 단순한 모습이 아니라
              <br />곧 <span className="font-bold">브랜드</span>이자{" "}
              <span className="font-bold">애티튜드</span>입니다.
            </p>
            <p className="w-[324px] [font-family:'SUIT-Regular',Helvetica] font-normal text-black text-sm tracking-[0] leading-[21px]">
              평범함으로는 더 이상 경쟁할 수 없습니다.
              <br />
              시선을 사로잡고, 기억에 남으며, 무대와 화면에서
              <br />
              빛나는 순간을 위해{" "}
              <span className="font-bold font-playfair">BRILLO</span>는
              <br />
              <span className="font-bold">
                프라이빗 퍼스널 비주얼 매니지먼트
              </span>
              를 제공합니다.
            </p>
            <p className="w-[324px] [font-family:'SUIT-Regular',Helvetica] font-normal text-black text-sm tracking-[0] leading-[21px]">
              단순히 ‘잘생기고 예뻐 보이는 것’은
              <br />
              충분하지 않습니다.{" "}
              <span className="font-bold">
                차별화된 시그니처 비주얼 <br />
                아이덴티티가
              </span>{" "}
              필요합니다.
            </p>
            <p className="w-[324px] [font-family:'SUIT-Regular',Helvetica] font-normal text-black text-sm tracking-[0] leading-[21px]">
              프로필 사진 한 장
              <br />
              오디션과 출사의 순간
              <br />
              무대와 카메라 앞의 짧은 클립
              <br />
              중요한 비즈니스 미팅
            </p>
            <p className="w-[324px] [font-family:'SUIT-Regular',Helvetica] font-normal text-black text-sm tracking-[0] leading-[21px]">
              그 모든 장면이 당신의 전부를 설명합니다.
              <br />
              <span className="font-bold font-playfair">BRILLO</span>는 그
              순간을 최고의 결과로 완성합니다.
            </p>
            <p className="w-[324px] [font-family:'SUIT-Regular',Helvetica] font-normal text-black text-sm tracking-[0] leading-[21px]">
              <span className="font-bold">존재 자체가 무대가 되는 순간.</span>
              <br />
              <span className="font-bold font-playfair">BRILLO</span>는 그
              순간을 위한 파트너입니다.
            </p>
            <div className="mt-4 w-[324px]">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger className="w-full h-auto border border-black rounded-none px-4 py-2 text-left focus:ring-0 relative flex items-center justify-between cursor-pointer data-[state=open]:bg-black/5">
                  <div className="font-suit text-black text-sm">
                    {SERVICES[selectedService].title}
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
                            className="cursor-pointer font-suit text-sm rounded-none! border-b border-black last:border-b-0 px-4 py-2 bg-[#f7f3f0] aria-selected:bg-black/5 aria-selected:text-black data-[selected=true]:bg-black/5 data-[selected=true]:text-black text-black"
                          >
                            <span className="font-suit">{service.title}</span>
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
              {activeTab === "리뷰" && (
                <div className="space-y-3">
                  <p>등록된 리뷰가 없습니다.</p>
                  <a
                    href="https://kmong.com/gig/534658#gig-rate-evaluation"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-sm text-black underline underline-offset-4 hover:text-gray-600"
                  >
                    더 많은 리뷰보기
                  </a>
                </div>
              )}
              {activeTab === "서비스규정" && (
                <div className="space-y-2">{SERVICE_REGULATION}</div>
              )}
            </div>

            <div className="w-[324px] flex justify-between items-center pt-2 pb-4 border-t border-[#d6d6d6]">
              <span className="font-suit font-medium text-black text-sm">
                결제 금액
              </span>
              <span className="font-suit font-bold text-black text-lg tracking-tight">
                별도문의
              </span>
            </div>

            <div className="w-full">
              <a
                href="http://pf.kakao.com/_xgatxbG"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-[37px] flex items-center justify-center border border-black bg-transparent text-black text-sm hover:bg-gray-50 transition-colors"
              >
                문의하기
              </a>
            </div>

            <GuestPaymentModal
              isOpen={isModalOpen}
              onClose={closeModal}
              onSubmit={handleGuestSubmit}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
