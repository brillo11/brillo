export const Footer = () => {
  return (
    <div className="bg-black px-4 py-16 flex flex-col gap-1">
      <div className="max-w-screen-xl mx-auto w-full">
        <div className="w-[42px] h-[29px] [font-family:'SUIT-Bold',Helvetica] font-bold text-[#2e2e2e] text-base tracking-[0] leading-[28.8px] whitespace-nowrap">
          브릴로
        </div>
        <p className=" h-24 [font-family:'SUIT-Regular',Helvetica] font-normal text-[#2e2e2e] text-[13.1px] tracking-[0] leading-[23.6px]">
          사업자등록번호: 182-47-01062&nbsp;&nbsp; 대표자: 안태욱 <br />
          통신판매업신고번호: 2025-서울강남-04764
          <br />
          소재지: 서울시 강남구 테헤란로 83길 18 4층
          <br />
          이메일: brillo11@naver.com&nbsp;&nbsp; 전화번호: 070 8095 5688
        </p>
      </div>
    </div>
  );
};
