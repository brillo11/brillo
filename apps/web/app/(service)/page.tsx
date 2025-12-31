"use client";

import { useState } from "react";
import { toast } from "sonner";
import { loginWithEmail, loginWithSocial } from "@/shared/lib/auth-helpers";
import { Eye, EyeOff, X } from "lucide-react";
import { useAtom } from "jotai";
import { loginModalOpenAtom } from "@/features/auth/login-modal-atom";

const REVIEWS = [
  {
    age: "남 42세, 이○○, 노량진 1타 강사",
    stars: "group-17@2x.png",
    starsWidth: "15px",
    text: (
      <>
        “브릴로 서비스를 받고 나서 외모뿐 아니라 <br />
        라이프스타일까지 바뀌었습니다.
        <br />
        수강생들도, 동료 강사들도, 지인들도 <br />
        저를 대하는 태도가 달라졌거든요.
        <br />
        지금은 비주얼은 물론 인테리어, 리빙, 호텔 등 전부 <br />
        대표님의 감각을 믿고 매니지먼트를 맡깁니다.”
      </>
    ),
  },
  {
    age: "여 30세, 정○○, 온라인 강사",
    stars: "group-17-3@2x.png",
    starsWidth: "58px",
    text: (
      <>
        “상담에서 제 니즈를 바로 캐치하는 순간 <br />
        프로임을 느꼈어요. 어느 것 하나 <br />
        대충 하지 않는게 신뢰가 확 생기더라고요.
        <br />그 덕에 제 매력을 극대화하는 비주얼을 <br />
        확실히 알았습니다.”
      </>
    ),
  },
  {
    age: "남 24세, 이○, 인플루언서 지망",
    stars: "group-17-3@2x.png",
    starsWidth: "58px",
    text: (
      <>
        “컨설팅 받고 난 뒤 인생에서 제일 행복한 <br />
        생일을 보냈어요.외모 스트레스가 사라지고, <br />
        매일 변하는 제 모습이 보여요.
        <br />
        자신감도 엄청 올라서 꼭 주변에 추천하고 싶어요.”
      </>
    ),
  },
  {
    age: "여 34세, 강○○, 개인 브랜드 대표",
    stars: "group-17-3@2x.png",
    starsWidth: "58px",
    text: (
      <>
        “이렇게 전체 상태를 정확하게 <br />
        정리해준 곳은처음이에요. 영업이 아닌 <br />
        솔직한 추천이라 신뢰도가 진짜 높아요.
        <br />
        앞으로 외모 고민은 무조건 여기로 올 거예요.”
      </>
    ),
  },
  {
    age: "남 20세, 김○○, 아이돌 지망생",
    stars: "group-17-4@2x.png",
    starsWidth: "15px",
    text: (
      <>
        “연습생이라 외모가 중요한데 해야 할 걸 <br />딱 정리해줘서 큰 도움이
        됐어요.
        <br />
        우선순위가 잡히니까 불안이 사라지고 <br />
        자신감이 생기더라고요. 대형 엔터 출신 답게 ‘화면에 어떻게 보여야
        하는지’까지 정확히 알려줘요.”
      </>
    ),
  },
];

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
    <div className="bg-white overflow-hidden w-full min-w-full lg:min-w-[1280px] min-h-[4585px] relative mx-auto">
      {/* 히어로 섹션 */}
      <div className="relative w-full h-screen bg-[#00000061]">
        <div className="flex flex-col w-[324px] items-start gap-[18px] absolute bottom-40 left-8 md:left-[150px] max-w-screen-xl mx-auto">
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
      </div>

      {/* Rebirth Quote */}
      <div className="relative py-20 bg-black">
        <div className="max-w-screen-xl mx-auto">
          <p className="mx-auto font-normal text-white text-xl text-center tracking-[0] leading-[normal]">
            <span className="font-normal text-white text-xl tracking-[0]">
              It’s not just a change, It’s a{" "}
            </span>
            <span className="font-bold">Rebirth</span>
            <span className="font-normal text-white text-xl tracking-[0]">
              .
            </span>
          </p>

          <p className="mx-auto w-[354px] font-medium text-white text-2xl text-center tracking-[-1.44px] leading-9">
            단순한 변화가 아닌, 새로운 당신
          </p>
        </div>

        <div className="flex flex-col gap-4 items-center">
          <div className="w-full pb-20">
            <div className="w-full flex items-center justify-center gap-4 mt-20">
              {/* Before/After Images 1 */}
              <div className="relative w-[514px] h-[340px] flex">
                <img
                  className="top-0 left-0 w-[255px] h-[340px] aspect-[0.75] object-cover"
                  alt="Element"
                  src="https://c.animaapp.com/oAayiH1p/img/----4@2x.png"
                />
                <img
                  className="top-0 left-[255px] w-[255px] h-[340px] aspect-[0.75] object-cover"
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

              {/* Before/After Images 2 */}
              <div className="relative w-[514px] h-[340px] flex">
                <img
                  className="top-0 left-px w-[255px] h-[340px] aspect-[0.75] object-cover"
                  alt="F"
                  src="https://c.animaapp.com/oAayiH1p/img/----f@2x.png"
                />
                <img
                  className="top-0 left-64 w-[253px] h-[340px] aspect-[0.74] object-cover"
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
            </div>

            <img
              className="w-12 h-3 mx-auto mt-4"
              alt="Frame"
              src="https://c.animaapp.com/oAayiH1p/img/frame-88.svg"
            />
          </div>

          {/* Main Hero Description Text */}
          <p className="font-normal text-white text-base text-center tracking-[0] leading-6">
            <span className="font-medium">전 </span>
            <span className="[font-family:'Playfair_Display',Helvetica] font-medium">
              SM Entertainment
            </span>
            <span className="font-medium">
              출신 비주얼 디렉터
              <br />
              수많은 아티스트와 브랜드의 변화를 이끌어온 경험
              <br />
            </span>
            <span className="[font-family:'SUIT-Bold',Helvetica] font-bold">
              이제, 그 노하우를 온전히 당신에게 선사합니다
            </span>
          </p>
        </div>

        <img
          className="w-px h-[275px] object-cover mx-auto my-20"
          alt="Line"
          src="https://c.animaapp.com/oAayiH1p/img/line-1.svg"
        />

        {/* All About Visual Title */}
        <div className="flex flex-col w-[354px] items-start gap-[19.65px] mx-auto">
          <div className="flex flex-col items-start gap-[10.92px] relative self-stretch w-full flex-[0_0_auto]">
            <div className="relative self-stretch mt-[-1.09px] [font-family:'DM_Serif_Display',Helvetica] font-normal text-white text-[32px] text-center tracking-[0] leading-[normal]">
              ALL About VISUAL
            </div>
            <p className="relative self-stretch font-medium text-white text-2xl text-center tracking-[0] leading-9">
              당신의 비주얼을 새롭게 정의하는 <br />
              프리미엄 솔루션
            </p>
          </div>
        </div>
      </div>
      <div className="h-[204px] rotate-180 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,1)_100%)]" />

      {/* 4카드 섹션 */}
      <div className="py-20 mx-auto max-w-screen-xl px-4 xl:px-0">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Card 1 */}
          <div className="flex flex-col gap-6">
            <img
              className="w-full aspect-[246/288] object-cover"
              src="https://c.animaapp.com/oAayiH1p/img/rectangle-49@2x.png"
              alt="Visual Consulting"
            />
            <div className="space-y-4">
              <h3 className="[font-family:'Playfair_Display',Helvetica] font-bold text-black text-[22px] leading-[33px]">
                Visual Consulting
              </h3>
              <p className="[font-family:'SUIT-Medium',Helvetica] font-medium text-black text-[13px] leading-[19.5px]">
                당신의 모든 시각적 요소를 낱낱이 진단하고
                <br />
                이를 극대화·최적화 하기 위한
                <br />
                당신만의 비주얼 로드맵을 설계합니다.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="flex flex-col gap-6">
            <img
              className="w-full aspect-[246/288] object-cover"
              src="https://c.animaapp.com/oAayiH1p/img/rectangle-48@2x.png"
              alt="Signature Look Styling"
            />
            <div className="space-y-4">
              <h3 className="[font-family:'Playfair_Display',Helvetica] font-bold text-black text-[22px] leading-[33px]">
                Signature Look Styling
              </h3>
              <p className="[font-family:'SUIT-Medium',Helvetica] font-medium text-black text-[13px] leading-[19.5px]">
                트렌드가 아닌, 아이덴티티에 집중합니다.
                <br />
                당신만의 무드와 라이프스타일을 반영한
                <br />
                시그니처 룩 스타일링.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="flex flex-col gap-6">
            <img
              className="w-full aspect-[246/288] object-cover"
              src="https://c.animaapp.com/oAayiH1p/img/rectangle-50@2x.png"
              alt="Total Visual Making"
            />
            <div className="space-y-4">
              <h3 className="[font-family:'Playfair_Display',Helvetica] font-bold text-black text-[22px] leading-[33px]">
                Total Visual Making
              </h3>
              <p className="[font-family:'SUIT-Medium',Helvetica] font-medium text-black text-[13px] leading-[19.5px]">
                컨설팅-스타일링-헤어&페이셜 메이크오버-
                <br />
                프로필 촬영까지. 머리부터 발끝까지 당신의
                <br />
                비주얼에 차별화를 만듭니다.
              </p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="flex flex-col gap-6">
            <img
              className="w-full aspect-[246/288] object-cover"
              src="https://c.animaapp.com/oAayiH1p/img/rectangle-51@2x.png"
              alt="VIP & Celeb Directing"
            />
            <div className="space-y-4">
              <h3 className="[font-family:'Playfair_Display',Helvetica] font-bold text-black text-[22px] leading-[33px]">
                VIP & Celeb Directing
              </h3>
              <p className="[font-family:'SUIT-Medium',Helvetica] font-medium text-black text-[13px] leading-[19.5px]">
                비즈니스, 촬영, 그리고 무대와 영상 등 특별한
                <br />
                순간 가장 빛나는 당신을 위한 프라이빗 케어.
                <br />
                시술과 성형 메디컬 연계까지 확장, 드라마틱한
                <br />
                변화를 지원합니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Making Process */}
      {/* Visual Making Process */}
      <div className="mx-auto max-w-screen-xl px-4 xl:px-0 py-20 relative">
        <h2 className="[font-family:'Playfair_Display',Helvetica] font-normal text-black text-[28px] leading-[normal] mb-12">
          Visual Making Process
        </h2>
        {/* <div className="relative w-[330px] h-[180px]">
          <div className="top-0 left-32 w-[330px] h-[180px] rounded-[30px] border-[none] bg-[linear-gradient(180deg,rgba(244,244,244,1)_0%,rgba(255,255,255,1)_100%)] before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-[30px] before:[background:linear-gradient(106deg,rgba(242,242,242,1)_0%,rgba(134,134,134,1)_50%,rgba(242,242,242,1)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none" />
        </div> */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {[
            {
              step: "1. 사진 & 체크리스트 준비",
              desc: "정밀 진단을 위한 기초 단계",
              icon: "file-image-fill.svg",
              bg: "linear-gradient(180deg,rgba(0,0,0,1)_0%,rgba(102,102,102,1)_100%)",
            },
            {
              step: "2. 심층 컨설팅",
              desc: "데이터 기반 분석과 맞춤 전략 설계",
              icon: "macbook-fill.svg",
              bg: "linear-gradient(180deg,rgba(0,0,0,1)_0%,rgba(102,102,102,1)_100%)",
            },
            {
              step: "3. 퍼스널 스타일링",
              desc: "목적· 예산· 체형을 반영한 실전 코디네이션",
              icon: "presentation-fill.svg",
              bg: "linear-gradient(180deg,rgba(0,0,0,1)_0%,rgba(102,102,102,1)_100%)",
            },
            {
              step: "4. 헤어 & 메이크업",
              desc: "전문 아티스트와 함께 나만의 비주얼 완성",
              icon: "brush-fill.svg",
              bg: "linear-gradient(180deg,rgba(0,0,0,1)_0%,rgba(102,102,102,1)_100%)",
            },
            {
              step: "5. 프로필 스냅 촬영",
              desc: "완성된 나만의 비주얼을 기록",
              icon: "camera-2-fill.svg",
              bg: "linear-gradient(180deg,rgba(0,0,0,1)_0%,rgba(102,102,102,1)_100%)",
            },
            {
              step: "6. 맞춤 리포트 제공",
              desc: "지속가능한 자기 관리 가이드",
              icon: "file-chart-fill.svg",
              bg: "linear-gradient(180deg,rgba(0,0,0,1)_0%,rgba(102,102,102,1)_100%)",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="w-full h-[180px] rounded-[30px] relative bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] border border-gray-100 shadow-sm flex flex-col justify-end p-8 overflow-hidden group hover:shadow-md transition-shadow"
            >
              <div className="absolute top-[25px] left-[23px] w-12 h-12 rounded-full flex items-center justify-center shadow-md bg-zinc-900">
                <img
                  src={`https://c.animaapp.com/oAayiH1p/img/${item.icon}`}
                  alt="icon"
                  className="w-6 h-6 invert brightness-0 filter"
                />
              </div>
              <div className="flex flex-col items-start gap-2 relative z-10">
                <h3 className="[font-family:'SUIT-Medium',Helvetica] font-medium text-black text-2xl leading-9">
                  {item.step}
                </h3>
                <p className="[font-family:'SUIT-Medium',Helvetica] font-medium text-black text-base leading-6 text-gray-600">
                  {item.desc}
                </p>
              </div>
              {/* Gradient Border Effect Simulation if needed, using simple border for now for cleanliness */}
            </div>
          ))}
        </div>

        {/* Dashed Line (Optional: simplified as a border or hr behind) */}
        <div className="hidden lg:block absolute top-[calc(50%+40px)] left-0 w-full h-px border-t border-dashed border-gray-300 -z-0" />
      </div>

      {/* Footer Area Backgrounds */}
      <div className="block relative">
        <div className="left-0 w-full h-[372px] bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,1)_100%)] flex flex-col justify-center items-center">
          <p className="[font-family:'SUIT-Medium',Helvetica] font-normal text-white text-[26.2px] text-center tracking-[0] leading-[39.3px]">
            <span className="font-medium">
              실제 고객의 변화, <br />
              그들의 이야기가{" "}
            </span>
            <span className="[font-family:'Playfair_Display',Helvetica] font-medium">
              BRILLO
            </span>
            <span className="font-medium">의 증거입니다.</span>
          </p>
        </div>
        <div className="left-0 w-full  bg-black relative flex flex-col items-center justify-start py-20 overflow-hidden">
          {/* Side Gradients */}
          <div className="absolute top-1/2 -translate-y-1/2 left-[-106px] w-[408px] h-[196px] rotate-90 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,1)_100%)] z-20 pointer-events-none" />
          <div className="absolute top-1/2 -translate-y-1/2 right-[-106px] w-[408px] h-[196px] rotate-90 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,1)_100%)] z-20 pointer-events-none" />

          {/* Reviews Scroll Container */}
          <div className="w-full flex overflow-x-auto no-scrollbar relative z-10 px-4">
            <div className="flex gap-8 pb-8 min-w-max mx-auto px-20">
              {REVIEWS.map((review, i) => (
                <div
                  key={i}
                  className="flex flex-col w-[294px] items-center gap-2 relative flex-shrink-0"
                >
                  <p className="relative self-stretch mt-[-1.00px] [font-family:'SUIT-Light',Helvetica] font-light text-white text-xl text-center tracking-[0] leading-[30px]">
                    {review.age}
                  </p>
                  <img
                    className="relative h-[11.6px]"
                    style={{ width: review.starsWidth }}
                    alt="Stars"
                    src={`https://c.animaapp.com/oAayiH1p/img/${review.stars}`}
                  />
                  <p className="relative self-stretch bg-[linear-gradient(90deg,rgba(255,255,255,1)_0%,rgba(255,255,255,0.5)_100%)] [-webkit-background-clip:text] bg-clip-text [-webkit-text-fill-color:transparent] [text-fill-color:transparent] [font-family:'SUIT-Light',Helvetica] font-light text-transparent text-sm text-center tracking-[0] leading-[21px]">
                    {review.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <img
            className="w-[108px] h-3 my-6"
            alt="Frame"
            src="https://c.animaapp.com/oAayiH1p/img/frame-79.svg"
          />

          <div className="[font-family:'Pretendard-Medium',Helvetica] font-medium text-[#ffffff99] text-sm tracking-[-0.28px] leading-[normal] underline cursor-pointer hover:text-white transition-colors">
            더 많은 리뷰 보기→
          </div>
        </div>
        {/* <div className="w-full h-[183px] bg-[#0c0c0c]" /> */}
      </div>

      {/* Footer Info */}
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

      <div className="absolute top-[1272px] left-[766px] w-[35px] h-[35px] bg-[#ffffff4a] rounded-[352.9px] border-0 border-none backdrop-blur-[2.32px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(2.32px)_brightness(100%)]" />

      {/* Decorative / Gradient Elements */}
      <div className="absolute top-20 left-[calc(50.00%_-_822px)] w-[1751px] h-[1217px]" />

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
