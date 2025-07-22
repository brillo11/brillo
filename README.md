# Bonfire - Next.js Starter Template

현대적인 웹 애플리케이션 개발을 위한 풀스택 Next.js 스타터 템플릿입니다.

## 🚀 주요 기능

### 🔐 인증 시스템

- **NextAuth v5** 기반 인증
- 다중 OAuth 제공자 지원 (Kakao, Google, GitHub, Apple)
- JWT 토큰 기반 세션 관리
- 역할 기반 접근 제어 (Admin/User)

### 📝 게시판 시스템

- 다중 게시판 지원
- 게시글 작성/수정/삭제
- 댓글 시스템 (대댓글 지원)
- 태그 시스템
- 파일 업로드 지원

### 💰 결제 시스템

- 토스페이먼츠 / 포트원(아임포트) 연동 준비
- 결제 내역 관리
- 환불 처리 시스템
- 결제 세션 관리

### 🛠 관리자 패널

- 대시보드 (통계 및 개요)
- 사용자 관리
- 게시글 관리
- 결제/환불 관리
- 관리자 계정 생성

## 🏗 기술 스택

### Frontend

- **Next.js 15** - React 프레임워크
- **React 19** - UI 라이브러리
- **TypeScript** - 정적 타입 검사
- **Tailwind CSS** - 유틸리티 CSS 프레임워크
- **shadcn/ui** - UI 컴포넌트

### Backend

- **Prisma** - ORM 및 데이터베이스 툴킷
- **PostgreSQL** - 메인 데이터베이스
- **NextAuth v5** - 인증

### 개발 도구

- **Turbo** - 모노레포 빌드 시스템
- **ESLint** - 코드 품질 검사
- **Prettier** - 코드 포맷팅
- **pnpm** - 패키지 매니저

## 📦 프로젝트 구조

```
bonfire/
├── apps/
│   └── web/                 # Next.js 웹 애플리케이션
│       ├── app/            # App Router 페이지
│       ├── components/     # 공통 컴포넌트
│       ├── serverActions/  # 서버 액션
│       └── lib/           # 유틸리티 함수
├── packages/
│   ├── database/          # Prisma 스키마 및 클라이언트
│   ├── ui/               # 공통 UI 컴포넌트
│   ├── eslint-config/    # ESLint 설정
│   └── typescript-config/ # TypeScript 설정
└── package.json
```

## 🚀 시작하기

### 1. 프로젝트 클론

```bash
git clone https://github.com/your-username/bonfire.git
cd bonfire
```

### 2. 의존성 설치

```bash
pnpm install
```

### 3. 환경 변수 설정

```bash
cp apps/web/.env.example apps/web/.env.local
```

`.env.local` 파일을 열어 필요한 환경 변수를 설정하세요:

- `DATABASE_URL`: PostgreSQL 연결 URL
- `NEXTAUTH_SECRET`: NextAuth 비밀 키
- OAuth 제공자 키들 (선택사항)

### 4. 데이터베이스 설정

```bash
# 데이터베이스 마이그레이션
pnpm db:push

# 시드 데이터 생성 (선택사항)
pnpm db:seed
```

### 5. 개발 서버 실행

```bash
pnpm dev
```

[http://localhost:3000](http://localhost:3000)에서 애플리케이션을 확인할 수 있습니다.

## 📋 사용 가능한 스크립트

```bash
# 개발 서버 실행
pnpm dev

# 프로덕션 빌드
pnpm build

# 프로덕션 서버 실행
pnpm start

# 린팅
pnpm lint

# 코드 포맷팅
pnpm format

# 데이터베이스 마이그레이션
pnpm db:push

# Prisma 클라이언트 생성
pnpm generate
```

## 🔧 커스터마이징

### 1. 데이터베이스 스키마 수정

`packages/database/prisma/schema.prisma` 파일을 수정하고:

```bash
pnpm db:push
pnpm generate
```

### 2. UI 컴포넌트 추가

```bash
cd packages/ui
npx shadcn@latest add [component-name]
```

### 3. OAuth 제공자 추가

`apps/web/auth.config.ts`에서 새로운 제공자를 설정하세요.

## 🌐 배포

### Vercel

1. Vercel에 프로젝트 연결
2. 환경 변수 설정
3. 자동 배포

### Docker

```bash
# Docker 이미지 빌드
docker build -t bonfire .

# 컨테이너 실행
docker run -p 3000:3000 bonfire
```

## 📚 문서

- [Next.js 문서](https://nextjs.org/docs)
- [NextAuth.js 문서](https://next-auth.js.org)
- [Prisma 문서](https://www.prisma.io/docs)
- [shadcn/ui 문서](https://ui.shadcn.com)

## 🤝 기여하기

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 🆘 지원

문제가 발생하거나 질문이 있으시면 [GitHub Issues](https://github.com/your-username/bonfire/issues)를 통해 문의해 주세요.
