export default function PrivacyPage() {
  return (
    <div className="font-suit text-black">
      <h1 className="text-3xl font-bold mb-8">개인정보처리방침</h1>

      <div className="space-y-8 text-sm leading-relaxed text-gray-700">
        <section>
          <h2 className="text-lg font-bold text-black mb-3">
            1. 개인정보의 수집 및 이용 목적
          </h2>
          <p>
            회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는
            개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이
            변경되는 경우에는 관련 법령에 따라 별도의 동의를 받는 등 필요한
            조치를 이행할 예정입니다.
            <br />
            - 회원 가입 및 관리
            <br />
            - 서비스 제공 및 예약 확인
            <br />
            - 결제 처리 및 환불
            <br />- 맞춤형 컨설팅 및 서비스 품질 향상
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-black mb-3">
            2. 수집하는 개인정보 항목
          </h2>
          <p>
            - 필수항목: 이름, 연락처(전화번호), 이메일 및 소셜 연동 정보
            <br />- 선택항목: 성별, 연령대, 체형 정보, 선호 스타일 등 원활한
            서비스 제공을 위해 고객이 직접 입력한 항목
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-black mb-3">
            3. 개인정보의 보유 및 이용 기간
          </h2>
          <p>
            회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터
            개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서
            개인정보를 처리·보유합니다.
            <br />
            - 신용정보의 수집/처리 및 이용 등에 관한 기록: 3년
            <br />
            - 대금결제 및 재화 등의 공급에 관한 기록: 5년
            <br />- 회원 탈퇴 시: 즉시 파기 (단, 관계 법령에 따라 보존할 의무가
            있는 경우 해당 기간 동안 보존)
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-black mb-3">
            4. 개인정보의 제3자 제공
          </h2>
          <p>
            회사는 정보주체의 개인정보를 본 방침에서 명시한 범위 내에서만
            처리하며, 정보주체의 사전 동의 없이는 본래의 범위를 초과하여
            처리하거나 제3자에게 제공하지 않습니다. (단, 관련 법령에 의거한
            적법한 요청이 있는 경우는 제외)
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-black mb-3">
            5. 정보주체의 권리와 그 행사방법
          </h2>
          <p>
            이용자는 등록되어 있는 본인의 개인정보를 열람하거나 수정할 수
            있으며, 가입 해지를 요청할 수 있습니다. 개인정보 관리책임자에게
            서면, 전화 또는 이메일로 연락하시면 지체 없이 조치하겠습니다.
          </p>
        </section>
      </div>
    </div>
  );
}
