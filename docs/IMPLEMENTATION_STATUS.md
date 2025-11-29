# 구현 현황 및 미구현 기능 정리

## 📋 요구사항 대비 구현 현황

### ✅ 구현 완료된 기능

1. **유튜브 계정 영상 분석**
   - ✅ 조회수, 썸네일, 제목, 댓글수, 좋아요 크롤링
   - 위치: `apps/web/serverActions/youtube/youtube-channel-analysis.actions.ts`
   - UI: `apps/web/app/(student)/student/studentLounge/mission/_components/YouTubeChannelAnalyzer.tsx`

2. **자막 추출**
   - ✅ YouTube 영상 자막 추출 기능
   - 위치: `apps/web/serverActions/youtube/youtube-transcript.actions.ts`
   - UI: `apps/web/app/(student)/student/studentLounge/mission/_components/StandaloneYouTubeExtractor.tsx`

3. **유튜브 영상 대본 크롤링**
   - ✅ YouTube URL 입력 시 대본 추출
   - ✅ 자동 생성 자막/수동 자막 구분 표시

4. **숏폼 대본 추출**
   - ✅ YouTube Shorts URL 지원
   - 위치: `apps/web/lib/utils/youtube.ts` (extractVideoId 함수)

5. **롱폼 대본 추출**
   - ✅ 일반 YouTube 영상 대본 추출 지원

6. **본인 채널 분석**
   - ✅ 채널 ID 또는 @username으로 채널 분석
   - ✅ 채널 통계 및 영상 목록 조회

### ⚠️ 부분 구현된 기능

7. **수강생별 개인화 대본 생성**
   - ✅ Gemini API를 통한 개인화된 학습 자료 생성 기능 존재
   - ❌ 수강생 프로필에 학습 수준/목표 자동 저장 기능 없음
   - ❌ 미션 제출 시 자동으로 개인화된 대본 생성 기능 없음
   - ❌ 수강생별 학습 이력 기반 자동 개인화 없음
   - 위치: `apps/web/serverActions/youtube/gemini-personalize.actions.ts`

### ❌ 미구현 기능

8. **LMS 시스템과의 통합**
   - ❌ Class/Cohort에 YouTube 영상 연결 기능
   - ❌ Mission에 YouTube 영상 자동 연결 및 개인화 대본 제공
   - ❌ 수강생 프로필에 학습 수준/목표 저장 기능
   - ❌ 강의별 YouTube 영상 라이브러리 관리
   - ❌ 수강생별 학습 진도 추적 (YouTube 영상 기반)

## 🎯 우선 구현 필요 기능

### 1. 수강생 프로필 확장

- **목적**: 수강생별 학습 수준과 목표를 저장하여 자동 개인화 가능하게
- **작업 내용**:
  - User 모델에 `learningLevel`, `learningGoals` 필드 추가
  - 프로필 설정 페이지에 학습 수준/목표 입력 UI 추가
  - 개인화 대본 생성 시 프로필 정보 자동 활용

### 2. Mission과 YouTube 영상 연동

- **목적**: 미션에 YouTube 영상을 연결하고 자동으로 개인화된 대본 제공
- **작업 내용**:
  - Mission 모델에 `youtubeUrl`, `youtubeVideoId` 필드 추가
  - 미션 생성 시 YouTube URL 입력 기능 추가
  - 미션 조회 시 자동으로 개인화된 대본 생성 및 표시

### 3. Class/Cohort에 YouTube 영상 라이브러리

- **목적**: 강의별로 YouTube 영상 컬렉션 관리
- **작업 내용**:
  - Class 또는 Cohort 모델에 YouTube 영상 목록 연결
  - 강의 페이지에 영상 라이브러리 UI 추가
  - 영상별 개인화된 학습 자료 자동 생성

### 4. 학습 진도 추적

- **목적**: 수강생이 어떤 영상을 학습했는지 추적
- **작업 내용**:
  - UserVideoProgress 모델 생성 (User, Video, progress, completedAt 등)
  - 영상 시청 시 자동으로 진도 저장
  - 대시보드에 학습 진도 시각화

## 📊 데이터베이스 스키마 추가 필요

```prisma
// User 모델 확장
model User {
  // ... 기존 필드
  learningLevel    String?  // 초급, 중급, 고급 등
  learningGoals    String?  // 학습 목표 텍스트
  learningHistory  Json?    @default("{}") // 학습 이력
}

// Mission 모델 확장
model Mission {
  // ... 기존 필드
  youtubeUrl      String?
  youtubeVideoId  String?
  autoPersonalize Boolean  @default(false) // 자동 개인화 여부
}

// 새로운 모델: YouTube 영상 정보
model YouTubeVideo {
  id              BigInt   @id @default(autoincrement())
  videoId         String   @unique
  title           String
  description     String?
  thumbnail       String?
  duration        Int?     // 초 단위
  channelId       String?
  channelTitle    String?
  transcript      String?   // 원본 대본
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  personalizedTranscripts PersonalizedTranscript[]
  videoProgress           UserVideoProgress[]

  @@index([videoId])
}

// 새로운 모델: 개인화된 대본
model PersonalizedTranscript {
  id              BigInt   @id @default(autoincrement())
  userId          String
  videoId         String
  originalTranscript String
  personalizedContent String
  learningLevel   String?
  learningGoals   String?
  createdAt       DateTime @default(now())

  user            User         @relation(fields: [userId], references: [id])
  video           YouTubeVideo @relation(fields: [videoId], references: [id])

  @@unique([userId, videoId])
  @@index([userId])
  @@index([videoId])
}

// 새로운 모델: 학습 진도
model UserVideoProgress {
  id              BigInt   @id @default(autoincrement())
  userId          String
  videoId         String
  progress        Float    @default(0) // 0-100%
  completedAt     DateTime?
  lastWatchedAt   DateTime @default(now())
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user            User         @relation(fields: [userId], references: [id])
  video           YouTubeVideo @relation(fields: [videoId], references: [id])

  @@unique([userId, videoId])
  @@index([userId])
  @@index([videoId])
}
```

## 🚀 구현 우선순위

1. **Phase 1: 기반 구축** (1-2주)
   - 수강생 프로필 확장
   - 데이터베이스 스키마 추가

2. **Phase 2: 핵심 통합** (2-3주)
   - Mission과 YouTube 영상 연동
   - 자동 개인화 대본 생성

3. **Phase 3: 고급 기능** (2-3주)
   - Class/Cohort 영상 라이브러리
   - 학습 진도 추적

4. **Phase 4: UX 개선** (1-2주)
   - 대시보드 개선
   - 학습 통계 시각화
