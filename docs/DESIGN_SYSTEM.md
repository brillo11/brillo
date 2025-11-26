# LearnFlow 디자인 시스템

## 개요

LearnFlow는 YouTube 기반 개인화 학습 LMS 플랫폼으로, 명확하고 일관된 디자인 시스템을 통해 사용자 경험을 최적화합니다.

## 컬러 시스템

### Primary Colors

```css
/* LearnFlow Blue - 메인 브랜드 컬러 */
--learnflow-blue: #3b82f6;
--learnflow-blue-dark: #1e3a8a;
--learnflow-blue-light: #60a5fa;
```

**사용 예시:**

- 메인 CTA 버튼
- 링크 텍스트
- 활성 상태 표시
- 로고 및 브랜딩 요소

### Accent Colors

```css
/* YouTube Red - YouTube 관련 요소 */
--youtube-red: #ff0000;

/* Success Green - 성공 상태 */
--success-green: #10b981;

/* Warning Amber - 경고 상태 */
--warning-amber: #f59e0b;

/* Info Cyan - 정보성 메시지 */
--info-cyan: #06b6d4;
```

### Neutral Colors

```css
/* 텍스트 및 배경 */
--pure-white: #ffffff;
--light-gray: #f3f4f6;
--medium-gray: #9ca3af;
--dark-gray: #374151;
--deep-black: #111827;
```

## 타이포그래피

### 폰트 패밀리

- **Primary**: Pretendard (한글 최적화)
- **Secondary**: Inter (영문, 숫자)
- **Code**: 'Fira Code', monospace

### 폰트 크기

| 이름       | 크기 | Line Height | 용도           |
| ---------- | ---- | ----------- | -------------- |
| Display    | 48px | 1.2         | 메인 헤드라인  |
| H1         | 36px | 1.3         | 페이지 제목    |
| H2         | 30px | 1.4         | 섹션 제목      |
| H3         | 24px | 1.5         | 서브 섹션 제목 |
| H4         | 20px | 1.5         | 카드 제목      |
| Body Large | 18px | 1.6         | 본문 강조      |
| Body       | 16px | 1.6         | 기본 본문      |
| Body Small | 14px | 1.5         | 서브 텍스트    |
| Caption    | 12px | 1.4         | 캡션, 라벨     |

### 폰트 굵기

- **Light**: 300
- **Regular**: 400
- **Medium**: 500
- **Semibold**: 600
- **Bold**: 700

## 간격 시스템 (Spacing)

8px 기준 그리드 시스템 사용:

| 이름 | 크기 | 용도           |
| ---- | ---- | -------------- |
| xs   | 4px  | 매우 작은 간격 |
| sm   | 8px  | 작은 간격      |
| md   | 16px | 기본 간격      |
| lg   | 24px | 큰 간격        |
| xl   | 32px | 매우 큰 간격   |
| 2xl  | 48px | 섹션 간격      |
| 3xl  | 64px | 페이지 간격    |

## 버튼 스타일

### Primary Button

- 배경: LearnFlow Blue (#3B82F6)
- 텍스트: White
- 호버: LearnFlow Blue Dark (#1E3A8A)
- 패딩: 12px 24px
- 보더 라디우스: 8px

### Secondary Button

- 배경: Transparent
- 텍스트: LearnFlow Blue
- 보더: LearnFlow Blue
- 호버: LearnFlow Blue 배경

### YouTube Button

- 배경: YouTube Red (#FF0000)
- 텍스트: White
- YouTube 관련 기능에 사용

## 카드 스타일

- 배경: White (다크 모드: Dark Gray)
- 보더: Light Gray
- 보더 라디우스: 12px
- 그림자: `0 1px 3px rgba(0, 0, 0, 0.1)`
- 패딩: 24px

## 입력 필드 스타일

- 배경: White (다크 모드: Dark Gray)
- 보더: Light Gray
- 포커스: LearnFlow Blue Ring
- 보더 라디우스: 8px
- 패딩: 12px 16px

## 아이콘 시스템

- **라이브러리**: Lucide React
- **스타일**: Outline (기본), Fill (강조)
- **크기**: 16px, 20px, 24px, 32px
- **색상**: 현재 텍스트 컬러 상속 또는 명시적 컬러 지정

## 애니메이션

### 전환 효과

```css
/* 기본 전환 */
transition: all 0.2s ease-in-out;

/* 호버 효과 */
transition:
  transform 0.2s ease-in-out,
  box-shadow 0.2s ease-in-out;

/* 페이드 인 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
```

### 로딩 애니메이션

- 스피너: LearnFlow Blue
- 스켈레톤: Light Gray
- 펄스 효과: 2초 주기

## 반응형 브레이크포인트

| 이름    | 크기       | 용도     |
| ------- | ---------- | -------- |
| Mobile  | 0-640px    | 모바일   |
| Tablet  | 641-1024px | 태블릿   |
| Desktop | 1025px+    | 데스크톱 |

## 접근성 (Accessibility)

### 컬러 대비

- 본문 텍스트: 최소 4.5:1 대비율
- 큰 텍스트 (18px+): 최소 3:1 대비율
- 인터랙티브 요소: 최소 3:1 대비율

### 키보드 내비게이션

- 모든 인터랙티브 요소는 키보드로 접근 가능
- 포커스 표시: LearnFlow Blue Ring (2px)
- Tab 순서: 논리적 순서 유지

### 스크린 리더

- 모든 이미지에 alt 텍스트
- 버튼과 링크에 명확한 라벨
- 폼 필드에 적절한 라벨 및 에러 메시지

## 컴포넌트 가이드

### 버튼

```tsx
// Primary Button
<Button className="bg-learnflow-blue text-white hover:bg-learnflow-blue-dark">
  시작하기
</Button>

// Secondary Button
<Button variant="outline" className="border-learnflow-blue text-learnflow-blue">
  자세히 보기
</Button>

// YouTube Button
<Button className="bg-youtube-red text-white hover:bg-red-700">
  YouTube 영상 분석
</Button>
```

### 카드

```tsx
<Card className="border border-gray-200 rounded-xl p-6 shadow-sm">
  <CardHeader>
    <CardTitle>제목</CardTitle>
  </CardHeader>
  <CardContent>내용</CardContent>
</Card>
```

### 입력 필드

```tsx
<Input
  className="border-gray-300 focus:border-learnflow-blue focus:ring-learnflow-blue"
  placeholder="입력하세요"
/>
```

## 다크 모드

다크 모드는 자동으로 시스템 설정을 따르며, 수동 전환도 가능합니다.

### 다크 모드 컬러 조정

- 배경: Deep Learning Navy 변형
- 텍스트: 밝은 회색 톤
- Primary 컬러: 밝기 조정하여 사용
- 보더: 어두운 회색

## 사용 가이드

1. **일관성 유지**: 모든 페이지에서 동일한 디자인 시스템 사용
2. **접근성 우선**: 모든 사용자가 접근 가능하도록 설계
3. **반응형 디자인**: 모든 디바이스에서 최적화된 경험 제공
4. **성능 최적화**: 불필요한 애니메이션 및 효과 최소화
