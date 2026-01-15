"use client";

import { useState } from "react";

export default function WomanPage() {
  const [activeTab, setActiveTab] = useState("서비스 소개");
  return (
    <div className="bg-[#f7f3f0] w-full">
      <div
        className="max-w-screen-xl min-h-[2762px] relative mx-auto pt-40"
        data-model-id="1:1241"
      >
        <div className="flex justify-center gap-12">
          {/* // 좌측 인물 */}
          <div className="flex flex-col gap-8 items-center">
            <img
              className="w-[297px] h-[297px] object-cover"
              alt="Vip women"
              src="/page/woman/vip-women-1-1.png"
            />
            <div className="w-[158px] h-1 bg-[#d9d9d9] rounded-[300px]">
              <div className="left-[374px] w-8 h-1 bg-[#6f6f6f] rounded-[300px]" />
            </div>
          </div>

          {/* 우측 설명 */}
          <div className="flex flex-col gap-8">
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

            <p className="left-[641px] w-[324px] [font-family:'SUIT-Regular',Helvetica] font-normal text-black text-sm tracking-[0] leading-[21px]">
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

            <div className="relative border border-black px-4 py-2 mt-4">
              <p className="[font-family:'DM_Serif_Display',Helvetica] font-normal text-black text-sm tracking-[0] leading-[21px] whitespace-nowrap">
                <span className="[font-family:'DM_Serif_Display',Helvetica] font-normal text-black text-sm tracking-[0] leading-[21px]">
                  Visual Consulting
                </span>

                <span className="[font-family:'SUIT-Regular',Helvetica]">
                  {" "}
                  (90분)
                </span>
              </p>

              <div className="absolute top-1.5 right-2 w-6 h-6">
                <img
                  className="absolute w-[35.36%] h-[23.57%] top-[38.93%] left-[32.32%]"
                  alt="Vector"
                  src="/page/woman/vector-1.svg"
                />
              </div>
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
            <div className="min-h-[100px] text-sm text-gray-600">
              {activeTab === "서비스 소개" && (
                <div className="space-y-2">
                  <div className="space-y-2 text-sm leading-relaxed text-black">
                    <p className="font-bold">
                      • 데이터 기반 정밀 진단 + 극대화 전략 설계
                    </p>
                    <p>
                      • 피부시술과 성형 포함 맞춤형{" "}
                      <span className="font-serif font-bold">
                        Visual Roadmap
                      </span>{" "}
                      제공
                    </p>
                  </div>
                </div>
              )}
              {activeTab === "리뷰" && <p>등록된 리뷰가 없습니다.</p>}
              {activeTab === "서비스규정" && <p>서비스 규정 내용입니다.</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button className="h-[37px] flex items-center justify-center border border-black bg-transparent text-black text-sm hover:bg-gray-50 transition-colors">
                문의하기
              </button>
              <button className="h-[37px] flex items-center justify-center border border-black bg-black text-white text-sm hover:bg-gray-800 transition-colors">
                구매하기
              </button>
            </div>
          </div>
        </div>

        <div className="relative w-full max-w-4xl mx-auto mt-36">
          <img
            className="w-full h-auto object-cover"
            alt="Consultation"
            src="/page/woman/1.png"
          />
          <div className="absolute top-0 left-0 w-1/4 h-full bg-gradient-to-r from-[#f7f3f0] to-transparent" />
          <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-[#f7f3f0] to-transparent" />
        </div>

        <div className="absolute w-[1019px] h-[340px] top-[2180px] left-[131px]">
          <div className="absolute top-px left-[509px] w-[514px] h-[340px]">
            <img
              className="absolute top-0 left-px w-[255px] h-[340px] aspect-[0.75] object-cover"
              alt="F"
              src="/page/woman/f.png"
            />

            <img
              className="absolute top-0 left-64 w-[253px] h-[340px] aspect-[0.74] object-cover"
              alt="F"
              src="/page/woman/f-1.png"
            />

            <div className="absolute top-[234px] left-0 w-[510px] h-[106px] bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.6)_100%)]" />

            <div className="absolute top-[301px] left-[98px] [font-family:'Playfair_Display',Helvetica] font-normal text-white text-xl text-center tracking-[0] leading-[normal]">
              Before
            </div>

            <div className="absolute top-[301px] left-[359px] [font-family:'Playfair_Display',Helvetica] font-normal text-white text-xl text-center tracking-[0] leading-[normal]">
              After
            </div>
          </div>

          <div className="absolute top-0 left-0 w-[514px] h-[340px]">
            <img
              className="absolute top-0 left-0 w-[255px] h-[340px] aspect-[0.75] object-cover"
              alt="Element"
              src="/page/woman/4-2x.png"
            />

            <img
              className="top-0 left-[255px] w-[255px] h-[340px] absolute aspect-[0.75] object-cover"
              alt="Element"
              src="/page/woman/4.png"
            />

            <div className="absolute top-[234px] left-0 w-[510px] h-[106px] bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.6)_100%)]" />

            <div className="absolute top-[301px] left-[98px] [font-family:'Playfair_Display',Helvetica] font-normal text-white text-xl text-center tracking-[0] leading-[normal]">
              Before
            </div>

            <div className="absolute top-[301px] left-[359px] [font-family:'Playfair_Display',Helvetica] font-normal text-white text-xl text-center tracking-[0] leading-[normal]">
              After
            </div>
          </div>
        </div>

        <img
          className="top-[1400px] left-[386px] w-[483px] h-[644px] absolute aspect-[0.75] object-cover"
          alt="Element"
          src="/page/woman/4-1.png"
        />

        <img
          className="absolute top-[2082px] left-[calc(50.00%_-_26px)] w-[52px] h-[13px]"
          alt="Frame"
          src="/page/woman/frame-98.svg"
        />

        <div className="absolute top-[2180px] left-[1054px] w-24 h-[340px] bg-[linear-gradient(270deg,rgba(247,243,240,1)_0%,rgba(247,243,240,0)_100%)]" />

        <div className="absolute top-[2180px] left-[131px] w-24 h-[340px] rotate-180 bg-[linear-gradient(270deg,rgba(247,243,240,1)_0%,rgba(247,243,240,0)_100%)]" />
      </div>
    </div>
  );
}
