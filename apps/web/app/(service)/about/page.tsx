export default function AboutPage() {
  const bulletPoints = Array(6).fill("/img/group-26.png");

  const representativeInfo = [
    "프리미엄 퍼스널 비주얼디렉팅 BRILLO 대표",
    "국내 최대 전문가 플랫폼 크* 뷰티· 패션 분야 1위",
    "네이버 지식iN 뷰티· 성형 분야 엑스퍼트",
    "",
    "前 SM Entertainment",
    "前 뷰티· 패션· 라이프스타일 메거진 뷰티 테스터",
    "경희대학교 졸업",
  ];

  return (
    <div className="bg-black w-full relative" data-model-id="1:1179">
      {/* Header and Nav removed as per request */}

      <main className="relative">
        <div className="relative block">
          <div className="absolute w-full h-full bg-[linear-gradient(158deg,rgba(255,240,216,1)_0%,rgba(255,255,255,1)_62%)]" />
          <div className="relative pt-48 pb-32 px-4">
            <section className="w-full" aria-labelledby="hero-title">
              <h1
                id="hero-title"
                className="text-center w-full text-[30.6px] leading-[normal] [font-family:'DM_Serif_Display',Helvetica] font-normal text-black tracking-[0]"
              >
                BRILLO ;
              </h1>

              <p className="text-center mt-4 w-full [font-family:'SUIT-Medium',Helvetica] font-medium text-[#242424] text-2xl text-center tracking-[11.76px] leading-9 whitespace-nowrap">
                빛·광채·찬란함
              </p>

              {/* <img
            className="absolute top-[119px] left-[647px] w-2.5 h-[13px]"
            alt="Decorative element"
            src="/img/group-19.png"
            aria-hidden="true"
          />

          <img
            className="absolute top-[119px] left-[558px] w-2.5 h-[13px]"
            alt="Decorative element"
            src="/img/group-19.png"
            aria-hidden="true"
          /> */}
            </section>

            <section
              className="relative pt-32 mx-auto"
              aria-labelledby="about-section"
            >
              <div className="flex flex-col md:flex-row gap-14 justify-center">
                <img
                  className="w-full md:w-[300px] aspect-[0.96] object-cover"
                  alt="VIP woman portrait showcasing premium styling"
                  src="/img/vip-women-1-1.png"
                />

                <article className="w-full md:w-[305px] flex flex-col items-start gap-10">
                  <h2 className="relative md:text-left text-center w-full md:w-[219px] mt-[-1.00px] [font-family:'SUIT-Bold',Helvetica] font-bold text-black text-sm tracking-[0] leading-[21px]">
                    당신의 외모가
                    <br />
                    당신에 대해 많은 것을 말해주는 시대
                  </h2>

                  <p className="relative md:text-left text-center w-full md:w-[282px] mr-[-25.00px] [font-family:'DM_Serif_Display',Helvetica] font-normal text-black text-sm tracking-[0] leading-[21px]">
                    <span className="[font-family:'DM_Serif_Display',Helvetica] font-normal text-black text-sm tracking-[0] leading-[21px]">
                      BRILLO
                    </span>
                    <span className="[font-family:'SUIT-Regular',Helvetica]">
                      는 단순 외모의 변화를 넘어,
                      <br />
                    </span>
                    <span className="[font-family:'SUIT-Bold',Helvetica] font-bold">
                      자기 자신이 빛나는 존재가 되는 경험을 선사
                    </span>
                    <span className="[font-family:'SUIT-Regular',Helvetica]">
                      합니다.
                    </span>
                  </p>

                  <p className="relative md:text-left text-center w-full md:w-[278px] mr-[-21.00px] [font-family:'SUIT-Regular',Helvetica] font-normal text-black text-sm tracking-[0] leading-[21px]">
                    <span className="[font-family:'SUIT-Regular',Helvetica] font-normal text-black text-sm tracking-[0] leading-[21px]">
                      당신의 외모와 스타일은 곧 당신의 언어입니다.
                      <br />
                      집을 나서는 순간부터 이미,
                      <br />
                      우리는{" "}
                    </span>
                    <span className="[font-family:'SUIT-Bold',Helvetica] font-bold">
                      나 자신에 대해 말하고{" "}
                    </span>
                    <span className="[font-family:'SUIT-Regular',Helvetica] font-normal text-black text-sm tracking-[0] leading-[21px]">
                      있습니다.
                    </span>
                  </p>

                  <p className="relative md:text-left text-center w-full md:w-[279px] mr-[-22.00px] [font-family:'SUIT-Regular',Helvetica] font-normal text-black text-sm tracking-[0] leading-[21px]">
                    <span className="[font-family:'SUIT-Regular',Helvetica] font-normal text-black text-sm tracking-[0] leading-[21px]">
                      그{" "}
                    </span>
                    <span className="[font-family:'SUIT-Bold',Helvetica] font-bold">
                      말이
                    </span>
                    <span className="[font-family:'SUIT-Regular',Helvetica] font-normal text-black text-sm tracking-[0] leading-[21px]">
                      {" "}
                      설득력을 갖도록 만드는 일,
                      <br />
                    </span>
                    <span className="[font-family:'SUIT-Bold',Helvetica] font-bold">
                      그것이 바로{" "}
                    </span>
                    <span className="[font-family:'DM_Serif_Display',Helvetica]">
                      BRILLO
                    </span>
                    <span className="[font-family:'SUIT-Bold',Helvetica] font-bold">
                      가 가장 잘하는 일입니다.
                    </span>
                  </p>
                </article>
              </div>
            </section>

            <section
              className="pt-32 relative mx-auto"
              aria-labelledby="philosophy-section"
            >
              <div className="flex flex-col-reverse md:flex-row gap-14 mx-auto justify-center">
                <article className="w-full md:text-left text-center  md:w-[305px] top-0 left-0 flex flex-col items-start gap-10">
                  <p className="relative w-full md:w-[305px] mt-[-1.00px] mr-[-17.00px] [font-family:'SUIT-Regular',Helvetica] font-normal text-black text-sm tracking-[0] leading-[21px]">
                    <span className="[font-family:'SUIT-Regular',Helvetica] font-normal text-black text-sm tracking-[0] leading-[21px]">
                      누구나 본능적으로 멋지고 아름다워지길 원합니다.
                      <br />
                      하지만 그것을 현실로 구현하기 위해서는
                      <br />
                      반드시{" "}
                    </span>
                    <span className="[font-family:'SUIT-Bold',Helvetica] font-bold">
                      의도적 메이킹
                    </span>
                    <span className="[font-family:'SUIT-Regular',Helvetica] font-normal text-black text-sm tracking-[0] leading-[21px]">
                      이 필요합니다.
                    </span>
                  </p>

                  <p className="relative md:text-left text-center  w-full md:w-[321px] mr-[-33.00px] [font-family:'SUIT-Regular',Helvetica] font-normal text-black text-sm tracking-[0] leading-[21px]">
                    <span className="[font-family:'SUIT-Regular',Helvetica] font-normal text-black text-sm tracking-[0] leading-[21px]">
                      외모는 더 이상 타고나는 것이 아닙니다.
                      <br />
                    </span>
                    <span className="[font-family:'SUIT-Bold',Helvetica] font-bold">
                      기획하고, 설계할 수 있는 자산
                    </span>
                    <span className="[font-family:'SUIT-Regular',Helvetica] font-normal text-black text-sm tracking-[0] leading-[21px]">
                      입니다.
                    </span>
                  </p>

                  <p className="relative md:text-left text-center  w-full md:w-[321px] mr-[-33.00px] [font-family:'SUIT-Regular',Helvetica] font-normal text-black text-sm tracking-[0] leading-[21px]">
                    <span className="[font-family:'SUIT-Regular',Helvetica] font-normal text-black text-sm tracking-[0] leading-[21px]">
                      아직 알지 못할 뿐,
                      <br />
                    </span>
                    <span className="[font-family:'SUIT-Bold',Helvetica] font-bold">
                      당신에게는 당신만의 최상의 비주얼이 잠재되어 있습니다.
                      <br />
                    </span>
                    <span className="[font-family:'SUIT-Regular',Helvetica] font-normal text-black text-sm tracking-[0] leading-[21px]">
                      그리고 그 변화는 삶의 모든 순간을 바꿉니다.
                    </span>
                  </p>

                  <p className="relative md:text-left text-center  w-full md:w-[179px] text-sm leading-[21px] [font-family:'DM_Serif_Display',Helvetica] font-normal text-black tracking-[0]">
                    <span className="[font-family:'DM_Serif_Display',Helvetica] font-normal text-black text-sm tracking-[0] leading-[21px]">
                      BRILLO
                    </span>
                    <span className="[font-family:'SUIT-Regular',Helvetica]">
                      에서
                      <br />
                      지금 바로 변화를 시작하세요.
                    </span>
                  </p>
                </article>

                <img
                  className="w-full md:w-[300px] aspect-[0.96] object-cover"
                  alt="VIP woman portrait demonstrating visual transformation"
                  src="/img/vip-women-1-1-1.png"
                />
              </div>
            </section>
          </div>
        </div>

        <section className="block bg-black">
          <div className="mx-auto pt-14 pb-32 flex flex-col md:flex-row gap-14 flex justify-center px-4">
            <img
              className="w-full md:w-72 w-[300px] object-cover"
              alt="Representative profile portrait"
              src="/img/rectangle-17.png"
            />

            <article className="w-full md:w-[305px]">
              <h2
                id="representative-section"
                className="w-[286px] [font-family:'SUIT-Medium',Helvetica] font-medium text-white text-2xl tracking-[0] leading-9"
              >
                대표소개
              </h2>

              <div className="w-[331px]">
                {representativeInfo.map((info, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-[11px] mb-[10px]"
                  >
                    {info && (
                      <img
                        className="w-2.5 h-[13px] mt-[3px] flex-shrink-0"
                        alt=""
                        src="/img/group-26.png"
                        aria-hidden="true"
                      />
                    )}
                    <p className="[font-family:'SUIT-Medium',Helvetica] font-normal text-white text-base tracking-[0] leading-6">
                      {info.includes("BRILLO") ? (
                        <>
                          <span className="font-medium">
                            프리미엄 퍼스널 비주얼디렉팅{" "}
                          </span>
                          <span className="[font-family:'DM_Serif_Display',Helvetica]">
                            BRILLO
                          </span>
                          <span className="font-medium"> 대표</span>
                        </>
                      ) : info.includes("SM Entertainment") ? (
                        <span className="[font-family:'DM_Serif_Display',Helvetica]">
                          {info}
                        </span>
                      ) : (
                        <span className="font-medium">{info}</span>
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>

        <section
          className="mx-auto"
          aria-labelledby="representative-section"
        ></section>
      </main>

      {/* <a
        href="#contact"
        className="fixed top-[731px] left-[1174px] w-[84px] h-12"
        aria-label="Contact us"
      >
        <img
          className="w-full h-full aspect-[1.74] object-cover"
          alt="Contact button"
          src="/img/21091175afdf2-1.png"
        />
      </a> */}
    </div>
  );
}
