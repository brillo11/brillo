"use client";

import { useState } from "react";
import { toast } from "sonner";
import { loginWithEmail, loginWithSocial } from "@/shared/lib/auth-helpers";
import { Eye, EyeOff, X } from "lucide-react";
import { useAtom } from "jotai";
import { loginModalOpenAtom } from "@/features/auth/login-modal-atom";

export default function HomePage() {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useAtom(loginModalOpenAtom);
  const [isAdminFormOpen, setIsAdminFormOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSocialLogin = async (provider: "kakao") => {
    setIsSocialLoading(true);
    try {
      const result = await loginWithSocial(provider);
      if (!result.success) {
        toast.error(result.error || "카카오 로그인에 실패했습니다.");
      }
    } catch (error) {
      console.error("Social login error:", error);
      toast.error("카카오 로그인 중 오류가 발생했습니다.");
    } finally {
      setIsSocialLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await loginWithEmail(
        credentials.email,
        credentials.password,
      );

      if (!result.success) {
        toast.error(result.error || "로그인에 실패했습니다.");
        return;
      }

      toast.success("로그인 성공");
    } catch (error) {
      console.error("Login error:", error);
      toast.error("로그인 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white overflow-hidden w-full min-w-full lg:min-w-[1280px] min-h-[4585px] relative mx-auto max-w-[1280px]">
      {/* Background/Structure Lines */}
      <img
        className="top-[3166px] left-[459px] w-[821px] h-px absolute object-cover"
        alt="Line"
        src="https://c.animaapp.com/oAayiH1p/img/line-7.svg"
      />

      <img
        className="top-[3388px] left-0 w-[1238px] h-[7px] absolute object-cover"
        alt="Line"
        src="https://c.animaapp.com/oAayiH1p/img/line-8.svg"
      />

      {/* Decorative / Gradient Elements */}
      <div className="absolute top-20 left-[calc(50.00%_-_822px)] w-[1751px] h-[1217px]" />
      <div className="absolute top-14 left-[-7px] w-[1287px] h-[740px] bg-[#00000061]" />
      <div className="absolute top-[796px] left-[calc(50.00%_-_640px)] w-[1280px] h-[1414px] bg-black" />

      <img
        className="absolute top-[1393px] left-[calc(50.00%_-_24px)] w-12 h-3"
        alt="Frame"
        src="https://c.animaapp.com/oAayiH1p/img/frame-88.svg"
      />

      {/* Note: Top header black bars removed as they are in layout.tsx now */}

      <div className="absolute top-[1272px] left-[766px] w-[35px] h-[35px] bg-[#ffffff4a] rounded-[352.9px] border-0 border-none backdrop-blur-[2.32px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(2.32px)_brightness(100%)]" />
      <div className="absolute top-[2203px] left-0 w-[1280px] h-[204px] rotate-180 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,1)_100%)]" />

      {/* Before/After Images 1 */}
      <div className="absolute top-[1027px] left-[649px] w-[514px] h-[340px]">
        <img
          className="absolute top-0 left-px w-[255px] h-[340px] aspect-[0.75] object-cover"
          alt="F"
          src="https://c.animaapp.com/oAayiH1p/img/----f@2x.png"
        />
        <img
          className="absolute top-0 left-64 w-[253px] h-[340px] aspect-[0.74] object-cover"
          alt="F"
          src="https://c.animaapp.com/oAayiH1p/img/-----f-1@2x.png"
        />
        <div className="absolute top-[234px] left-0 w-[510px] h-[106px] bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.6)_100%)]" />
        <div className="absolute top-[301px] left-[98px] [font-family:'Playfair_Display',Helvetica] font-normal text-white text-xl text-center tracking-[0] leading-[normal]">
          Before
        </div>
        <div className="absolute top-[301px] left-[359px] [font-family:'Playfair_Display',Helvetica] font-normal text-white text-xl text-center tracking-[0] leading-[normal]">
          After
        </div>
      </div>

      {/* Before/After Images 2 */}
      <div className="absolute top-[1027px] left-[122px] w-[514px] h-[340px]">
        <img
          className="absolute top-0 left-0 w-[255px] h-[340px] aspect-[0.75] object-cover"
          alt="Element"
          src="https://c.animaapp.com/oAayiH1p/img/----4@2x.png"
        />
        <img
          className="absolute top-0 left-[255px] w-[255px] h-[340px] aspect-[0.75] object-cover"
          alt="Element"
          src="https://c.animaapp.com/oAayiH1p/img/------4@2x.png"
        />
        <div className="absolute top-[123px] left-[352px] w-[35px] h-[35px] bg-[#ffffff4a] rounded-[354.17px] border-0 border-none backdrop-blur-[2.33px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(2.33px)_brightness(100%)]" />
        <div className="absolute top-[234px] left-0 w-[510px] h-[106px] bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.6)_100%)]" />
        <div className="absolute top-[301px] left-[98px] [font-family:'Playfair_Display',Helvetica] font-normal text-white text-xl text-center tracking-[0] leading-[normal]">
          Before
        </div>
        <div className="absolute top-[301px] left-[359px] [font-family:'Playfair_Display',Helvetica] font-normal text-white text-xl text-center tracking-[0] leading-[normal]">
          After
        </div>
      </div>

      {/* Service Rectangles */}
      <img
        className="absolute top-[2458px] left-32 w-[246px] h-72 object-cover"
        alt="Rectangle"
        src="https://c.animaapp.com/oAayiH1p/img/rectangle-49@2x.png"
      />
      <img
        className="absolute top-[2458px] left-[655px] w-[246px] h-72 object-cover"
        alt="Rectangle"
        src="https://c.animaapp.com/oAayiH1p/img/rectangle-50@2x.png"
      />
      <img
        className="absolute top-[2458px] left-[392px] w-[246px] h-72 object-cover"
        alt="Rectangle"
        src="https://c.animaapp.com/oAayiH1p/img/rectangle-48@2x.png"
      />
      <img
        className="absolute top-[2458px] left-[919px] w-[246px] h-72 object-cover"
        alt="Rectangle"
        src="https://c.animaapp.com/oAayiH1p/img/rectangle-51@2x.png"
      />

      {/* Title: Visual Making Process */}
      <div className="absolute top-[2987px] left-32 [font-family:'Playfair_Display',Helvetica] font-normal text-black text-[28px] tracking-[0] leading-[normal]">
        Visual Making Process
      </div>

      {/* Footer Area Backgrounds */}
      <div className="absolute top-[4402px] left-[calc(50.00%_-_640px)] w-[1280px] h-[183px] bg-[#0c0c0c]" />
      <div className="absolute top-[3994px] left-0 w-[1280px] h-[408px] bg-black" />
      <div className="absolute top-[3622px] left-0 w-[1280px] h-[372px] bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,1)_100%)]" />

      {/* Reviews Section */}
      <p className="absolute top-[3822px] left-[calc(50.00%_-_209px)] [font-family:'SUIT-Medium',Helvetica] font-normal text-white text-[26.2px] text-center tracking-[0] leading-[39.3px]">
        <span className="font-medium">
          실제 고객의 변화, <br />
          그들의 이야기가{" "}
        </span>
        <span className="[font-family:'Playfair_Display',Helvetica] font-medium">
          BRILLO
        </span>
        <span className="font-medium">의 증거입니다.</span>
      </p>

      {/* Review Cards (Horizontal Scroll Simulation) */}
      <div className="inline-flex items-start gap-[33px] absolute top-[4061px] left-[calc(50.00%_-_801px)]">
        {/* Review 1 */}
        <div className="flex flex-col w-[294px] items-center gap-2 relative">
          <p className="relative self-stretch mt-[-1.00px] [font-family:'SUIT-Light',Helvetica] font-light text-white text-xl text-center tracking-[0] leading-[30px]">
            남 42세, 이○○, 노량진 1타 강사
          </p>
          <img
            className="relative w-[15px] h-[11.6px]"
            alt="Group"
            src="https://c.animaapp.com/oAayiH1p/img/group-17@2x.png"
          />
          <p className="relative self-stretch bg-[linear-gradient(90deg,rgba(255,255,255,1)_0%,rgba(255,255,255,0.5)_100%)] [-webkit-background-clip:text] bg-clip-text [-webkit-text-fill-color:transparent] [text-fill-color:transparent] [font-family:'SUIT-Light',Helvetica] font-light text-transparent text-sm text-center tracking-[0] leading-[21px]">
            “브릴로 서비스를 받고 나서 외모뿐 아니라 <br />
            라이프스타일까지 바뀌었습니다.
            <br />
            수강생들도, 동료 강사들도, 지인들도 <br />
            저를 대하는 태도가 달라졌거든요.
            <br />
            지금은 비주얼은 물론 인테리어, 리빙, 호텔 등 전부 <br />
            대표님의 감각을 믿고 매니지먼트를 맡깁니다.”
          </p>
        </div>

        {/* Review 2 */}
        <div className="flex flex-col w-[294px] items-center gap-2 relative">
          <p className="relative self-stretch mt-[-1.00px] [font-family:'SUIT-Light',Helvetica] font-light text-white text-xl text-center tracking-[0] leading-[30px]">
            여 30세, 정○○, 온라인 강사
          </p>
          <img
            className="relative w-[58px] h-[11.6px]"
            alt="Group"
            src="https://c.animaapp.com/oAayiH1p/img/group-17-3@2x.png"
          />
          <p className="relative self-stretch bg-[linear-gradient(90deg,rgba(255,255,255,1)_0%,rgba(255,255,255,0.5)_100%)] [-webkit-background-clip:text] bg-clip-text [-webkit-text-fill-color:transparent] [text-fill-color:transparent] [font-family:'SUIT-Light',Helvetica] font-light text-transparent text-sm text-center tracking-[0] leading-[21px]">
            “상담에서 제 니즈를 바로 캐치하는 순간 <br />
            프로임을 느꼈어요. 어느 것 하나 <br />
            대충 하지 않는게 신뢰가 확 생기더라고요.
            <br />그 덕에 제 매력을 극대화하는 비주얼을 <br />
            확실히 알았습니다.”
          </p>
        </div>

        {/* Review 3 */}
        <div className="flex flex-col w-[294px] items-center gap-2 relative">
          <p className="relative self-stretch mt-[-1.00px] [font-family:'SUIT-Light',Helvetica] font-light text-white text-xl text-center tracking-[0] leading-[30px]">
            남 24세, 이○, 인플루언서 지망
          </p>
          <img
            className="relative w-[58px] h-[11.6px]"
            alt="Group"
            src="https://c.animaapp.com/oAayiH1p/img/group-17-3@2x.png"
          />
          <p className="relative self-stretch bg-[linear-gradient(90deg,rgba(255,255,255,1)_0%,rgba(255,255,255,0.5)_100%)] [-webkit-background-clip:text] bg-clip-text [-webkit-text-fill-color:transparent] [text-fill-color:transparent] [font-family:'SUIT-Light',Helvetica] font-light text-transparent text-sm text-center tracking-[0] leading-[21px]">
            “컨설팅 받고 난 뒤 인생에서 제일 행복한 <br />
            생일을 보냈어요.외모 스트레스가 사라지고, <br />
            매일 변하는 제 모습이 보여요.
            <br />
            자신감도 엄청 올라서 꼭 주변에 추천하고 싶어요.”
          </p>
        </div>

        {/* Review 4 */}
        <div className="flex flex-col w-[294px] items-center gap-2 relative">
          <p className="relative self-stretch mt-[-1.00px] [font-family:'SUIT-Light',Helvetica] font-light text-white text-xl text-center tracking-[0] leading-[30px]">
            여 34세, 강○○, 개인 브랜드 대표
          </p>
          <img
            className="relative w-[58px] h-[11.6px]"
            alt="Group"
            src="https://c.animaapp.com/oAayiH1p/img/group-17-3@2x.png"
          />
          <p className="relative self-stretch bg-[linear-gradient(90deg,rgba(255,255,255,1)_0%,rgba(255,255,255,0.5)_100%)] [-webkit-background-clip:text] bg-clip-text [-webkit-text-fill-color:transparent] [text-fill-color:transparent] [font-family:'SUIT-Light',Helvetica] font-light text-transparent text-sm text-center tracking-[0] leading-[21px]">
            “이렇게 전체 상태를 정확하게 <br />
            정리해준 곳은처음이에요. 영업이 아닌 <br />
            솔직한 추천이라 신뢰도가 진짜 높아요.
            <br />
            앞으로 외모 고민은 무조건 여기로 올 거예요.”
          </p>
        </div>

        {/* Review 5 */}
        <div className="flex flex-col w-[294px] items-center gap-2 relative">
          <p className="relative self-stretch mt-[-1.00px] [font-family:'SUIT-Light',Helvetica] font-light text-white text-xl text-center tracking-[0] leading-[30px]">
            남 20세, 김○○, 아이돌 지망생
          </p>
          <img
            className="relative w-[15px] h-[11.6px]"
            alt="Group"
            src="https://c.animaapp.com/oAayiH1p/img/group-17-4@2x.png"
          />
          <p className="relative self-stretch bg-[linear-gradient(90deg,rgba(255,255,255,1)_0%,rgba(255,255,255,0.5)_100%)] [-webkit-background-clip:text] bg-clip-text [-webkit-text-fill-color:transparent] [text-fill-color:transparent] [font-family:'SUIT-Light',Helvetica] font-light text-transparent text-sm text-center tracking-[0] leading-[21px]">
            “연습생이라 외모가 중요한데 해야 할 걸 <br />딱 정리해줘서 큰 도움이
            됐어요.
            <br />
            우선순위가 잡히니까 불안이 사라지고 <br />
            자신감이 생기더라고요. 대형 엔터 출신 답게 ‘화면에 어떻게 보여야
            하는지’까지 정확히 알려줘요.”
          </p>
        </div>
      </div>

      <div className="absolute top-[4302px] left-[calc(50.00%_-_52px)] [font-family:'Pretendard-Medium',Helvetica] font-medium text-[#ffffff99] text-sm tracking-[-0.28px] leading-[normal] underline">
        더 많은 리뷰 보기→
      </div>

      {/* Decorative Lines/Elements */}
      <img
        className="absolute top-[4245px] left-[calc(50.00%_-_54px)] w-[108px] h-3"
        alt="Frame"
        src="https://c.animaapp.com/oAayiH1p/img/frame-79.svg"
      />

      {/* Main Hero Description Text */}
      <p className="absolute top-[1479px] left-[calc(50.00%_-_156px)] [font-family:'SUIT-Medium',Helvetica] font-normal text-white text-base text-center tracking-[0] leading-6">
        <span className="font-medium">전 </span>
        <span className="[font-family:'Playfair_Display',Helvetica] font-medium">
          SM Entertainment
        </span>
        <span className="font-medium">
          {" "}
          출신 비주얼 디렉터
          <br />
          수많은 아티스트와 브랜드의 변화를 이끌어온 경험
          <br />
        </span>
        <span className="[font-family:'SUIT-Bold',Helvetica] font-bold">
          이제, 그 노하우를 온전히 당신에게 선사합니다
        </span>
      </p>

      {/* All About Visual Title */}
      <div className="flex flex-col w-[354px] items-start gap-[19.65px] absolute top-[2012px] left-[calc(50.00%_-_179px)]">
        <div className="flex flex-col items-start gap-[10.92px] relative self-stretch w-full flex-[0_0_auto]">
          <div className="relative self-stretch mt-[-1.09px] [font-family:'DM_Serif_Display',Helvetica] font-normal text-white text-[32px] text-center tracking-[0] leading-[normal]">
            ALL About VISUAL
          </div>
          <p className="relative self-stretch [font-family:'SUIT-Medium',Helvetica] font-medium text-white text-2xl text-center tracking-[0] leading-9">
            당신의 비주얼을 새롭게 정의하는 <br />
            프리미엄 솔루션
          </p>
        </div>
      </div>

      <img
        className="top-[1644px] left-[calc(50.00%_-_2px)] w-px h-[275px] absolute object-cover"
        alt="Line"
        src="https://c.animaapp.com/oAayiH1p/img/line-1.svg"
      />

      {/* Hero Title Section */}
      <div className="flex flex-col w-[324px] items-start gap-[18px] absolute top-[477px] left-[150px]">
        <div className="flex flex-col items-start gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
          <div className="relative self-stretch mt-[-1.00px] [font-family:'SUIT-Bold',Helvetica] font-bold text-white text-[32px] tracking-[0] leading-[48px]">
            외모, 그 이상의 변화
          </div>
        </div>
        <div className="flex flex-col items-start gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
          <div className="relative self-stretch mt-[-1.00px] [font-family:'Pretendard-Medium',Helvetica] font-medium text-white text-xl tracking-[0] leading-[30px]">
            프리미엄 퍼스널 비주얼디렉팅
            <br />
            브릴로
          </div>
        </div>
      </div>

      {/* Rebirth Quote */}
      <p className="absolute top-[875px] left-[calc(50.00%_-_158px)] [font-family:'Playfair_Display',Helvetica] font-normal text-white text-xl text-center tracking-[0] leading-[normal]">
        <span className="[font-family:'Playfair_Display',Helvetica] font-normal text-white text-xl tracking-[0]">
          It’s not just a change, It’s a{" "}
        </span>
        <span className="font-bold">Rebirth</span>
        <span className="[font-family:'Playfair_Display',Helvetica] font-normal text-white text-xl tracking-[0]">
          .
        </span>
      </p>

      <p className="absolute top-[913px] left-[calc(50.00%_-_177px)] w-[354px] [font-family:'Pretendard-Medium',Helvetica] font-medium text-white text-2xl text-center tracking-[-1.44px] leading-9">
        단순한 변화가 아닌, 새로운 당신
      </p>

      {/* Service Descriptions (Visual Consulting, etc.) */}
      <div className="absolute top-[2766px] left-32 [font-family:'Playfair_Display',Helvetica] font-bold text-black text-[22px] tracking-[0] leading-[33px] whitespace-nowrap">
        Visual Consulting
      </div>
      <div className="absolute top-[2766px] left-[392px] [font-family:'Playfair_Display',Helvetica] font-bold text-black text-[22px] tracking-[0] leading-[33px] whitespace-nowrap">
        Signature Look Styling
      </div>
      <div className="absolute top-[2766px] left-[655px] [font-family:'Playfair_Display',Helvetica] font-bold text-black text-[22px] tracking-[0] leading-[33px] whitespace-nowrap">
        Total Visual Making
      </div>
      <div className="absolute top-[2766px] left-[919px] [font-family:'Playfair_Display',Helvetica] font-bold text-black text-[22px] tracking-[0] leading-[33px] whitespace-nowrap">
        VIP &amp; Celeb Directing
      </div>

      <p className="absolute top-[2810px] left-32 [font-family:'SUIT-Medium',Helvetica] font-medium text-black text-[13px] tracking-[0] leading-[19.5px]">
        당신의 모든 시각적 요소를 낱낱이 진단하고
        <br />
        이를 극대화·최적화 하기 위한
        <br />
        당신만의 비주얼 로드맵을 설계합니다.
      </p>
      <p className="absolute top-[2810px] left-[392px] [font-family:'SUIT-Medium',Helvetica] font-medium text-black text-[13px] tracking-[0] leading-[19.5px]">
        트렌드가 아닌, 아이덴티티에 집중합니다.
        <br />
        당신만의 무드와 라이프스타일을 반영한
        <br />
        시그니처 룩 스타일링.
      </p>
      <p className="absolute top-[2810px] left-[655px] [font-family:'SUIT-Medium',Helvetica] font-medium text-black text-[13px] tracking-[0] leading-[19.5px]">
        컨설팅-스타일링-헤어&amp;페이셜 메이크오버-
        <br />
        프로필 촬영까지. 머리부터 발끝까지 당신의 <br />
        비주얼에 차별화를 만듭니다.
      </p>
      <p className="absolute top-[2810px] left-[919px] [font-family:'SUIT-Medium',Helvetica] font-medium text-black text-[13px] tracking-[0] leading-[19.5px]">
        비즈니스, 촬영, 그리고 무대와 영상 등 특별한 <br />
        순간 가장 빛나는 당신을 위한 프라이빗 케어. <br />
        시술과 성형 메디컬 연계까지 확장, 드라마틱한 <br />
        변화를 지원합니다.
      </p>

      {/* Footer Info */}
      <div className="absolute top-[4423px] left-32 w-[309px] h-[129px] flex flex-col gap-1">
        <div className="w-[42px] h-[29px] [font-family:'SUIT-Bold',Helvetica] font-bold text-[#2e2e2e] text-base tracking-[0] leading-[28.8px] whitespace-nowrap">
          브릴로
        </div>
        <p className="w-[305px] h-24 [font-family:'SUIT-Regular',Helvetica] font-normal text-[#2e2e2e] text-[13.1px] tracking-[0] leading-[23.6px]">
          사업자등록번호: 182-47-01062&nbsp;&nbsp; 대표자: 안태욱 <br />
          통신판매업신고번호: 2025-서울강남-04764
          <br />
          소재지: 서울시 강남구 테헤란로 83길 18 4층
          <br />
          이메일: brillo11@naver.com&nbsp;&nbsp; 전화번호: 070 8095 5688
        </p>
      </div>

      {/* Step Cards 1-6 */}
      <div className="absolute top-[3075px] left-32 w-[330px] h-[180px] rounded-[30px] border-[none] bg-[linear-gradient(180deg,rgba(244,244,244,1)_0%,rgba(255,255,255,1)_100%)] before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-[30px] before:[background:linear-gradient(106deg,rgba(242,242,242,1)_0%,rgba(134,134,134,1)_50%,rgba(242,242,242,1)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none">
        <div className="absolute top-[25px] left-[23px] w-12 h-12 rounded-[30px] shadow-[0px_4px_8px_#00000026] bg-[linear-gradient(180deg,rgba(0,0,0,1)_0%,rgba(102,102,102,1)_100%)]" />
        <div className="flex flex-col w-64 items-start gap-2 absolute top-[87px] left-[23px]">
          <p className="relative w-fit mt-[-1.00px] [font-family:'SUIT-Medium',Helvetica] font-medium text-black text-2xl tracking-[0] leading-9 whitespace-nowrap">
            1. 사진 &amp; 체크리스트 준비
          </p>
          <p className="relative w-fit [font-family:'SUIT-Medium',Helvetica] font-medium text-black text-base tracking-[0] leading-6 whitespace-nowrap">
            정밀 진단을 위한 기초 단계
          </p>
        </div>
        <img
          className="absolute top-[37px] left-[35px] w-6 h-6"
          alt="File image fill"
          src="https://c.animaapp.com/oAayiH1p/img/file-image-fill.svg"
        />
      </div>

      <div className="absolute top-[3075px] left-[499px] w-[330px] h-[180px] rounded-[30px] border-[none] bg-[linear-gradient(180deg,rgba(244,244,244,1)_0%,rgba(255,255,255,1)_100%)] before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-[30px] before:[background:linear-gradient(106deg,rgba(242,242,242,1)_0%,rgba(134,134,134,1)_50%,rgba(242,242,242,1)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none">
        <div className="absolute top-[25px] left-[23px] w-12 h-12 rounded-[30px] shadow-[0px_4px_8px_#00000026] bg-[linear-gradient(180deg,rgba(0,0,0,1)_0%,rgba(102,102,102,1)_100%)]" />
        <div className="flex flex-col w-64 items-start gap-2 absolute top-[87px] left-[23px]">
          <div className="relative w-fit mt-[-1.00px] [font-family:'Noto_Sans',Helvetica] font-normal text-black text-2xl tracking-[0] leading-9 whitespace-nowrap">
            2. 심층 컨설팅
          </div>
          <p className="relative self-stretch [font-family:'Noto_Sans',Helvetica] font-normal text-black text-base tracking-[0] leading-6">
            데이터 기반 분석과 맞춤 전략 설계
          </p>
        </div>
        <img
          className="absolute top-[37px] left-[35px] w-6 h-6"
          alt="Macbook fill"
          src="https://c.animaapp.com/oAayiH1p/img/macbook-fill.svg"
        />
      </div>

      <div className="absolute top-[3075px] left-[870px] w-[330px] h-[180px] rounded-[30px] border-[none] bg-[linear-gradient(180deg,rgba(244,244,244,1)_0%,rgba(255,255,255,1)_100%)] before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-[30px] before:[background:linear-gradient(106deg,rgba(242,242,242,1)_0%,rgba(134,134,134,1)_50%,rgba(242,242,242,1)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none">
        <div className="absolute top-[25px] left-[23px] w-12 h-12 rounded-[30px] shadow-[0px_4px_8px_#00000026] bg-[linear-gradient(180deg,rgba(0,0,0,1)_0%,rgba(102,102,102,1)_100%)]" />
        <div className="flex flex-col w-64 items-start gap-2 absolute top-[87px] left-[23px]">
          <div className="relative w-fit mt-[-1.00px] [font-family:'SUIT-Medium',Helvetica] font-medium text-black text-2xl tracking-[0] leading-9 whitespace-nowrap">
            3. 퍼스널 스타일링
          </div>
          <p className="relative w-fit mr-[-16.00px] [font-family:'SUIT-Medium',Helvetica] font-medium text-black text-base tracking-[0] leading-6 whitespace-nowrap">
            목적· 예산· 체형을 반영한 실전 코디네이션
          </p>
        </div>
        <img
          className="absolute top-[37px] left-[35px] w-6 h-6"
          alt="Presentation fill"
          src="https://c.animaapp.com/oAayiH1p/img/presentation-fill.svg"
        />
      </div>

      <div className="absolute top-[3292px] left-32 w-[330px] h-[180px] rounded-[30px] border-[none] bg-[linear-gradient(180deg,rgba(244,244,244,1)_0%,rgba(255,255,255,1)_100%)] before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-[30px] before:[background:linear-gradient(106deg,rgba(242,242,242,1)_0%,rgba(134,134,134,1)_50%,rgba(242,242,242,1)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none">
        <div className="absolute top-[25px] left-[23px] w-12 h-12 rounded-[30px] shadow-[0px_4px_8px_#00000026] bg-[linear-gradient(180deg,rgba(0,0,0,1)_0%,rgba(102,102,102,1)_100%)]" />
        <div className="flex flex-col w-64 items-start gap-2 absolute top-[87px] left-[23px]">
          <div className="relative w-fit mt-[-1.00px] [font-family:'SUIT-Medium',Helvetica] font-medium text-black text-2xl tracking-[0] leading-9 whitespace-nowrap">
            4. 헤어 &amp; 메이크업
          </div>
          <p className="relative w-fit mr-[-1.00px] [font-family:'SUIT-Medium',Helvetica] font-medium text-black text-base tracking-[0] leading-6 whitespace-nowrap">
            전문 아티스트와 함께 나만의 비주얼 완성
          </p>
        </div>
        <img
          className="absolute top-[37px] left-[35px] w-6 h-6"
          alt="Brush fill"
          src="https://c.animaapp.com/oAayiH1p/img/brush-fill.svg"
        />
      </div>

      <div className="absolute top-[3292px] left-[499px] w-[330px] h-[180px] rounded-[30px] border-[none] bg-[linear-gradient(180deg,rgba(244,244,244,1)_0%,rgba(255,255,255,1)_100%)] before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-[30px] before:[background:linear-gradient(106deg,rgba(242,242,242,1)_0%,rgba(134,134,134,1)_50%,rgba(242,242,242,1)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none">
        <div className="absolute top-[25px] left-[23px] w-12 h-12 rounded-[30px] shadow-[0px_4px_8px_#00000026] bg-[linear-gradient(180deg,rgba(0,0,0,1)_0%,rgba(102,102,102,1)_100%)]" />
        <div className="flex flex-col w-64 items-start gap-2 absolute top-[87px] left-[23px]">
          <div className="relative w-fit mt-[-1.00px] [font-family:'SUIT-Medium',Helvetica] font-medium text-black text-2xl tracking-[0] leading-9 whitespace-nowrap">
            5. 프로필 스냅 촬영
          </div>
          <div className="relative self-stretch [font-family:'SUIT-Medium',Helvetica] font-medium text-black text-base tracking-[0] leading-6">
            완성된 나만의 비주얼을 기록
          </div>
        </div>
        <img
          className="absolute top-[37px] left-[35px] w-6 h-6"
          alt="Camera fill"
          src="https://c.animaapp.com/oAayiH1p/img/camera-2-fill.svg"
        />
      </div>

      <div className="absolute top-[3292px] left-[870px] w-[330px] h-[180px] rounded-[30px] border-[none] bg-[linear-gradient(180deg,rgba(244,244,244,1)_0%,rgba(255,255,255,1)_100%)] before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-[30px] before:[background:linear-gradient(106deg,rgba(242,242,242,1)_0%,rgba(134,134,134,1)_50%,rgba(242,242,242,1)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none">
        <div className="absolute top-[25px] left-[23px] w-12 h-12 rounded-[30px] shadow-[0px_4px_8px_#00000026] bg-[linear-gradient(180deg,rgba(0,0,0,1)_0%,rgba(102,102,102,1)_100%)]" />
        <div className="flex flex-col w-64 items-start gap-2 absolute top-[87px] left-[23px]">
          <div className="relative w-fit mt-[-1.00px] [font-family:'SUIT-Medium',Helvetica] font-medium text-black text-2xl tracking-[0] leading-9 whitespace-nowrap">
            6. 맞춤 리포트 제공
          </div>
          <div className="relative w-fit [font-family:'SUIT-Medium',Helvetica] font-medium text-black text-base tracking-[0] leading-6 whitespace-nowrap">
            지속가능한 자기 관리 가이드
          </div>
        </div>
        <img
          className="absolute top-[37px] left-[35px] w-6 h-6"
          alt="File chart fill"
          src="https://c.animaapp.com/oAayiH1p/img/file-chart-fill.svg"
        />
      </div>

      <div className="absolute top-[4100px] left-[-106px] w-[408px] h-[196px] rotate-90 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,1)_100%)]" />
      <div className="absolute top-[4093px] left-[978px] w-[408px] h-[196px] rotate-90 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,1)_100%)]" />

      <img
        className="fixed bottom-8 right-8 w-[84px] h-12 aspect-[1.74] object-cover z-50 cursor-pointer hover:scale-105 transition-transform"
        alt="Inquiry"
        src="https://c.animaapp.com/oAayiH1p/img/21091175afdf2-1@2x.png"
      />

      {/* Login Modal (Floating) */}
      {isLoginOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setIsLoginOpen(false)}
        >
          <div
            className="w-full max-w-md bg-[#111] border border-white/10 rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white tracking-widest">
                  LOGIN
                </h2>
                <button
                  onClick={() => setIsLoginOpen(false)}
                  className="text-gray-500 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* 카카오 로그인 */}
              <div className="space-y-4 mb-8">
                <button
                  onClick={() => handleSocialLogin("kakao")}
                  disabled={isSocialLoading}
                  type="button"
                  className="relative flex w-full items-center justify-center gap-3 rounded-xl bg-[#FFE812] px-4 py-4 font-medium text-black hover:bg-[#FFE812]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {/* Kakao Icon */}
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="absolute left-5"
                  >
                    <path
                      d="M12 3C6.477 3 2 6.477 2 11c0 2.558 1.523 4.85 3.889 6.262L5.5 21l3.889-1.889C10.5 19.5 11.2 19.6 12 19.6c5.523 0 10-3.477 10-8.6S17.523 3 12 3z"
                      fill="currentColor"
                    />
                  </svg>
                  {isSocialLoading ? "로그인 중..." : "카카오로 시작하기"}
                </button>
              </div>

              <div className="text-center pt-6 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAdminFormOpen(!isAdminFormOpen)}
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center justify-center gap-1 mx-auto"
                >
                  관리자 로그인
                </button>
              </div>

              {isAdminFormOpen && (
                <form
                  id="admin-form"
                  onSubmit={handleSubmit}
                  className="space-y-5 mt-6 animate-fade-in"
                >
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-400">
                      아이디
                    </label>
                    <input
                      name="email"
                      placeholder="admin@brillo.kr"
                      required={true}
                      value={credentials.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-[#1A1A1A] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-white/30 focus:bg-[#222] transition-colors"
                      type="email"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-400">
                      비밀번호
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        autoComplete="current-password"
                        required={true}
                        value={credentials.password}
                        onChange={handleChange}
                        className="w-full px-4 py-3 pr-12 bg-[#1A1A1A] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-white/30 focus:bg-[#222] transition-colors"
                        placeholder="••••••••"
                        type={showPassword ? "text" : "password"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-3 px-6 rounded-xl text-sm font-bold text-black bg-white hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isLoading ? "로그인 중..." : "관리자 로그인"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
