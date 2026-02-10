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
            <section
              className="w-full flex flex-col items-center"
              aria-labelledby="hero-title"
            >
              <h1
                id="hero-title"
                className="text-center w-full text-[30.6px] leading-[normal] font-serif font-normal text-black tracking-[0]"
              >
                BRILLO ;
              </h1>

              <p className="text-center mt-4 w-full font-suit font-medium text-[#242424] text-2xl tracking-[11.76px] leading-9 whitespace-nowrap">
                빛·광채·찬란함
              </p>
            </section>

            <section
              className="relative pt-32 mx-auto max-w-screen-lg"
              aria-labelledby="about-section"
            >
              <div className="flex flex-col md:flex-row gap-14 justify-center items-center md:items-start">
                <img
                  className="w-full max-w-[300px] aspect-[0.96] object-cover"
                  alt="VIP woman portrait showcasing premium styling"
                  src="/img/vip-women-1-1.png"
                />

                <article className="w-full md:w-auto flex flex-col items-center md:items-start gap-10">
                  <h2 className="text-center md:text-left font-suit font-bold text-black text-sm leading-[21px]">
                    당신의 외모가
                    <br />
                    당신에 대해 많은 것을 말해주는 시대
                  </h2>

                  <p className="text-center md:text-left font-serif font-normal text-black text-sm leading-[21px]">
                    <span className="font-serif font-bold">BRILLO</span>
                    <span className="font-suit">
                      는 단순 외모의 변화를 넘어,
                      <br />
                    </span>
                    <span className="font-suit font-bold">
                      자기 자신이 빛나는 존재가 되는 경험을 선사
                    </span>
                    <span className="font-suit">합니다.</span>
                  </p>

                  <p className="text-center md:text-left font-suit font-normal text-black text-sm leading-[21px]">
                    <span className="font-suit">
                      당신의 외모와 스타일은 곧 당신의 언어입니다.
                      <br />
                      집을 나서는 순간부터 이미,
                      <br />
                      우리는{" "}
                    </span>
                    <span className="font-suit font-bold">
                      나 자신에 대해 말하고{" "}
                    </span>
                    <span className="font-suit">있습니다.</span>
                  </p>

                  <p className="text-center md:text-left font-suit font-normal text-black text-sm leading-[21px]">
                    <span className="font-suit">그 </span>
                    <span className="font-suit font-bold">말이</span>
                    <span className="font-suit">
                      {" "}
                      설득력을 갖도록 만드는 일,
                      <br />
                    </span>
                    <span className="font-suit font-bold">그것이 바로 </span>
                    <span className="font-serif">BRILLO</span>
                    <span className="font-suit font-bold">
                      가 가장 잘하는 일입니다.
                    </span>
                  </p>
                </article>
              </div>
            </section>

            <section
              className="pt-32 relative mx-auto max-w-screen-lg"
              aria-labelledby="philosophy-section"
            >
              <div className="flex flex-col-reverse md:flex-row gap-14 justify-center items-center md:items-start">
                <article className="w-full md:w-auto flex flex-col items-center md:items-start gap-10">
                  <p className="text-center md:text-left font-suit font-normal text-black text-sm leading-[21px]">
                    <span className="font-suit">
                      누구나 본능적으로 멋지고 아름다워지길 원합니다.
                      <br />
                      하지만 그것을 현실로 구현하기 위해서는
                      <br />
                      반드시{" "}
                    </span>
                    <span className="font-suit font-bold">의도적 메이킹</span>
                    <span className="font-suit">이 필요합니다.</span>
                  </p>

                  <p className="text-center md:text-left font-suit font-normal text-black text-sm leading-[21px]">
                    <span className="font-suit">
                      외모는 더 이상 타고나는 것이 아닙니다.
                      <br />
                    </span>
                    <span className="font-suit font-bold">
                      기획하고, 설계할 수 있는 자산
                    </span>
                    <span className="font-suit">입니다.</span>
                  </p>

                  <p className="text-center md:text-left font-suit font-normal text-black text-sm leading-[21px]">
                    <span className="font-suit">
                      아직 알지 못할 뿐,
                      <br />
                    </span>
                    <span className="font-suit font-bold">
                      당신에게는 당신만의 최상의 비주얼이 잠재되어 있습니다.
                      <br />
                    </span>
                    <span className="font-suit">
                      그리고 그 변화는 삶의 모든 순간을 바꿉니다.
                    </span>
                  </p>

                  <p className="text-center md:text-left font-serif font-normal text-black text-sm leading-[21px]">
                    <span className="font-serif">BRILLO</span>
                    <span className="font-suit">
                      에서
                      <br />
                      지금 바로 변화를 시작하세요.
                    </span>
                  </p>
                </article>

                <img
                  className="w-full max-w-[300px] aspect-[0.96] object-cover"
                  alt="VIP woman portrait demonstrating visual transformation"
                  src="/img/vip-women-1-1-1.png"
                />
              </div>
            </section>
          </div>
        </div>

        <section className="block bg-black">
          <div className="mx-auto pt-14 pb-32 flex flex-col md:flex-row gap-14 justify-center items-center md:items-start px-4 max-w-screen-lg">
            <img
              className="w-full max-w-[300px] object-cover"
              alt="Representative profile portrait"
              src="/img/rectangle-17.png"
            />

            <article className="w-full md:w-auto">
              <h2
                id="representative-section"
                className="font-suit font-medium text-white text-2xl leading-9 mb-8 text-center md:text-left"
              >
                대표소개
              </h2>

              <div className="w-full max-w-md">
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
                    <p className="font-suit font-normal text-white text-base leading-6">
                      {info.includes("BRILLO") ? (
                        <>
                          <span className="font-medium">
                            프리미엄 퍼스널 비주얼디렉팅{" "}
                          </span>
                          <span className="font-playfair">BRILLO</span>
                          <span className="font-medium"> 대표</span>
                        </>
                      ) : info.includes("SM Entertainment") ? (
                        <span className="font-playfair">{info}</span>
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
    </div>
  );
}
