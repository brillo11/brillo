export default function TermsPage() {
  return (
    <div className="font-suit text-black">
      <h1 className="text-3xl font-bold mb-8">이용약관</h1>

      <div className="space-y-8 text-sm leading-relaxed text-gray-700">
        <section>
          <h2 className="text-lg font-bold text-black mb-3">제 1 조 (목적)</h2>
          <p>
            본 약관은 BRILLO(이하 &quot;회사&quot;라 합니다)가 제공하는 퍼스널
            비주얼디렉팅 서비스(이하 &quot;서비스&quot;라 합니다)의 이용과
            관련하여 회사와 회원 간의 권리, 의무 및 책임사항, 기타 필요한 사항을
            규정함을 목적으로 합니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-black mb-3">
            제 2 조 (용어의 정의)
          </h2>
          <p>
            1. &quot;회원&quot;이란 회사의 웹사이트에 접속하여 본 약관에 따라
            회사와 이용계약을 체결하고 회사가 제공하는 서비스를 이용하는 고객을
            말합니다.
            <br />
            2. &quot;서비스&quot;란 회사가 제공하는 시각적 매력 차별화를 위한
            온·오프라인 컨설팅, 스타일링, 메이크오버 등의 모든 서비스를
            의미합니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-black mb-3">
            제 3 조 (약관의 효력 및 변경)
          </h2>
          <p>
            1. 회사는 본 약관의 내용을 회원이 쉽게 알 수 있도록 서비스 초기
            화면에 게시합니다.
            <br />
            2. 회사는 관련 법령을 위배하지 않는 범위에서 본 약관을 개정할 수
            있으며, 약관을 개정할 경우에는 적용일자 및 개정사유를 명시하여 현행
            약관과 함께 서비스 초기 화면에 그 적용일자 7일 전부터 공지합니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-black mb-3">
            제 4 조 (서비스의 제공 및 변경)
          </h2>
          <p>
            1. 회사는 회원에게 사전 결제 완료를 원칙으로 하여 예약된 일정에
            맞추어 서비스를 제공합니다.
            <br />
            2. 오프라인 서비스의 특성상 결제 후 일정이 확정되며, 지각 및 노쇼로
            인한 책임은 회원 본인에게 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-black mb-3">
            제 5 조 (예약 취소 및 환불)
          </h2>
          <p>
            1. 서비스 예약 취소에 따른 위약금 규정은 다음과 같습니다.
            <br />
            - 서비스 이용 4일 전 취소: 결제 금액의 30% 공제 후 환불
            <br />
            - 서비스 이용 1일 전 취소: 결제 금액의 50% 공제 후 환불
            <br />- 당일 취소: 환불 불가
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-black mb-3">
            제 6 조 (면책조항)
          </h2>
          <p>
            1. 회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를
            제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.
            <br />
            2. 회사는 회원의 귀책사유로 인한 서비스 이용의 장애에 대하여는
            책임을 지지 않습니다.
          </p>
        </section>
      </div>
    </div>
  );
}
