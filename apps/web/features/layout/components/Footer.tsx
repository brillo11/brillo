"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/utils";

export const Footer = () => {
  const pathname = usePathname();
  const isDarkFooter = pathname === "/" || pathname === "/about";

  return (
    <div
      className={cn(
        "px-4 py-16 flex flex-col gap-1 transition-colors duration-300",
        isDarkFooter ? "bg-black" : "bg-white border-t border-[#ededed]",
      )}
    >
      <div className="max-w-screen-xl mx-auto w-full">
        <div
          className={cn(
            "w-[42px] h-[29px] [font-family:'SUIT-Bold',Helvetica] font-bold text-base tracking-[0] leading-[28.8px] whitespace-nowrap transition-colors duration-300",
            isDarkFooter ? "text-white" : "text-[#c3c3c3]",
          )}
        >
          브릴로
        </div>
        <p
          className={cn(
            "h-24 [font-family:'SUIT-Regular',Helvetica] font-normal text-[13.1px] tracking-[0] leading-[23.6px] transition-colors duration-300",
            isDarkFooter ? "text-[#ffffff99]" : "text-[#c3c3c3]",
          )}
        >
          사업자등록번호: 182-47-01062&nbsp;&nbsp; 대표자: 안태욱 <br />
          통신판매업신고번호: 2025-서울강남-04764
          <br />
          소재지: 서울시 강남구 테헤란로 83길 19 4층
          <br />
          이메일: flannel@brillo.kr&nbsp;&nbsp; 전화번호: 070 8095 5688
        </p>
      </div>
    </div>
  );
};
