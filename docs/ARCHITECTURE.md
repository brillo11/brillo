# 🏗️ 페이지 아키텍처 전략

## 🎯 렌더링 방식별 적용 가이드

### 📊 **페이지 분류 매트릭스**

| 페이지 타입                      | 렌더링 방식 | 이유                   | 최적화 포인트               |
| -------------------------------- | ----------- | ---------------------- | --------------------------- |
| **랜딩 페이지** (`/`)            | SSG → ISR   | SEO 최우선, 빠른 로딩  | 정적 빌드 + 점진적 업데이트 |
| **관리자 대시보드** (`/admin/*`) | SSR + 동적  | 최신 데이터, 서버 보안 | 미들웨어 + 서버 권한검증    |
| **게시판 목록** (`/posts`)       | ISR         | SEO + 최신 데이터 균형 | 주기적 재생성               |
| **게시글 상세** (`/posts/[id]`)  | ISR         | SEO 중요, 댓글 실시간  | 댓글만 CSR 하이브리드       |
| **로그인/회원가입** (`/auth/*`)  | SSR         | 초기 상태 필요         | 서버 검증 + 클라이언트 UI   |
| **결제 페이지** (`/payment/*`)   | CSR         | 보안, 동적 처리        | 클라이언트 전용             |

---

## 🔧 **구체적 구현 전략**

### 1. **SSG (Static Site Generation)**

```typescript
// app/page.tsx - 랜딩 페이지
export const dynamic = 'force-static';

export default async function HomePage() {
  // 빌드 타임에 고정되는 데이터만
  const staticData = {
    features: [...],
    testimonials: [...]
  };

  return <HomePage data={staticData} />;
}
```

### 2. **ISR (Incremental Static Regeneration)**

```typescript
// app/posts/page.tsx - 게시판 목록
export const revalidate = 3600; // 1시간마다 재생성

export default async function PostsPage() {
  const posts = await getPosts(); // 빌드 타임 + 주기적 업데이트
  return <PostsList posts={posts} />;
}
```

### 3. **SSR (Server-Side Rendering)**

```typescript
// app/auth/login/page.tsx - 로그인 페이지
export default async function LoginPage() {
  const session = await auth();

  if (session) {
    redirect('/dashboard');
  }

  return <LoginForm />;
}
```

### 4. **SSR + Dynamic (관리자 페이지용)**

```typescript
// app/admin/page.tsx - 관리자 대시보드
import { requireAdmin } from "@/lib/auth-guards";

export const dynamic = 'force-dynamic'; // 캐시 비활성화

export default async function AdminDashboard() {
  // 서버에서 권한 검증 + 데이터 페칭
  await requireAdmin();
  const data = await getAdminDashboardStats();

  return <Dashboard data={data} />;
}
```

---

## 🤔 **관리자 페이지: SSR vs CSR 선택 기준**

### **SSR + Dynamic 선택하는 경우** ✅

```typescript
// ✅ 적합한 상황:
// - 간단한 대시보드 (복잡한 상호작용 적음)
// - 항상 최신 데이터가 중요
// - 서버에서 권한 검증 후 바로 데이터 제공
// - SEO는 불필요하지만 초기 렌더링 속도 중요

export const dynamic = 'force-dynamic';
export default async function AdminDashboard() {
  await requireAdmin(); // 서버 권한 검증
  const data = await getData(); // 서버 데이터 페칭
  return <Dashboard data={data} />;
}
```

### **CSR 선택하는 경우** ⚡

```typescript
// ⚡ 적합한 상황:
// - 복잡한 상호작용 (필터링, 정렬, 실시간 업데이트)
// - 부분적 데이터 갱신이 빈번함
// - 사용자 경험이 최우선
// - 클라이언트 상태 관리가 복잡함

"use client";
export default function AdminDashboard() {
  const { data, refetch } = useQuery(...); // 클라이언트 페칭
  return <InteractiveDashboard data={data} onRefresh={refetch} />;
}
```

---

## 🌊 **하이브리드 패턴**

### **SSR + CSR 하이브리드**

```typescript
// app/posts/[id]/page.tsx - 게시글 상세
export default async function PostPage({ params }: { params: { id: string } }) {
  // SSR로 초기 데이터 (SEO용)
  const post = await getPost(params.id);

  return (
    <div>
      <PostContent post={post} /> {/* SSR */}
      <CommentsSection postId={params.id} /> {/* CSR */}
    </div>
  );
}

// components/CommentsSection.tsx
"use client";
function CommentsSection({ postId }: { postId: string }) {
  const [comments, setComments] = useState([]);
  // 실시간 댓글 로딩 및 업데이트
}
```

---

## ⚡ **성능 최적화 전략**

### **1. 코드 스플리팅**

```typescript
// 동적 임포트로 필요시에만 로딩
const AdminPanel = dynamic(() => import('./AdminPanel'), {
  loading: () => <LoadingSpinner />,
  ssr: false // CSR 전용
});

const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <ChartSkeleton />
});
```

### **2. 데이터 페칭 최적화**

```typescript
// React Query + Server Actions 조합
function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => getAdminDashboardStats(),
    refetchInterval: 30000, // 30초마다 갱신
    staleTime: 10000, // 10초간 캐시 유효
  });
}
```

### **3. 캐싱 전략**

```typescript
// next.config.js
module.exports = {
  experimental: {
    staleTimes: {
      dynamic: 30, // 동적 페이지
      static: 180, // 정적 페이지
    },
  },
};
```

---

## 🛡️ **보안 고려사항 (3단계 방어)**

### **🚨 중요: 보안은 서버 사이드에서!**

> ⚠️ **절대 클라이언트만으로 권한 검증하지 마세요!**
>
> 클라이언트 검증은 UX용이고, 실제 보안은 서버에서 처리해야 합니다.

### **1단계: 미들웨어 (라우트 보호)**

```typescript
// middleware.ts - 1차 방어선
export async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}
```

### **2단계: 서버 액션/페이지 (데이터 보호)**

```typescript
// lib/auth-guards.ts - 재사용 가능한 권한 검증
export async function requireAdmin() {
  const session = await auth();

  if (!session || session.user?.role !== 'ADMIN') {
    console.warn(`🚨 Unauthorized access attempt`);
    redirect('/admin/login');
  }

  return session;
}

// 사용법
export async function AdminPage() {
  await requireAdmin(); // 서버에서 권한 검증
  const data = await getAdminData();
  return <AdminDashboard data={data} />;
}
```

### **3단계: API 라우트 (API 보호)**

```typescript
// app/api/admin/route.ts
export async function GET() {
  const session = await auth();

  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 실제 데이터 처리
  return NextResponse.json(data);
}
```

### **2. 민감한 데이터 처리**

```typescript
// 클라이언트에서 민감 정보 제외
function sanitizeUserData(user: User) {
  const { password, resetToken, ...safeData } = user;
  return safeData;
}
```

---

## 📊 **모니터링 및 측정**

### **Performance Metrics**

```typescript
// Web Vitals 측정
export function reportWebVitals(metric: NextWebVitalsMetric) {
  console.log(metric);

  // 페이지별 성능 추적
  switch (metric.name) {
    case "CLS":
    case "FID":
    case "FCP":
    case "LCP":
    case "TTFB":
      sendToAnalytics(metric);
      break;
    default:
      break;
  }
}
```

### **렌더링 방식별 성능 목표**

| 방식              | TTFB    | FCP    | LCP    | TTI    | 특징            |
| ----------------- | ------- | ------ | ------ | ------ | --------------- |
| **SSG**           | < 100ms | < 1.5s | < 2.5s | < 2s   | 최고 성능       |
| **ISR**           | < 200ms | < 2s   | < 3s   | < 2.5s | 캐시 + 업데이트 |
| **SSR**           | < 500ms | < 2.5s | < 3s   | < 3s   | 최신 데이터     |
| **SSR + Dynamic** | < 800ms | < 3s   | < 3.5s | < 3.5s | 관리자용        |
| **CSR**           | N/A     | < 3s   | < 4s   | < 3s   | 상호작용 중심   |

---

## 🚀 **마이그레이션 로드맵**

### **Phase 1: 기본 최적화**

- ✅ 메인 페이지 SSG 적용
- ✅ 관리자 페이지 SSR + Dynamic 최적화
- ✅ 미들웨어 권한 보호 구현
- ✅ 서버 액션 권한 검증 강화
- ✅ 결제 페이지 보안 강화

### **Phase 2: 고급 최적화**

- [ ] 게시판 ISR 구현
- [ ] 댓글 실시간 업데이트 (WebSocket)
- [ ] 이미지 최적화 (next/image)

### **Phase 3: 고도화**

- [ ] Edge Functions 적용
- [ ] Service Worker 캐싱
- [ ] Progressive Web App (PWA)

---

## 🎨 **개발자 경험 (DX) 개선**

### **개발 모드 디버깅**

```typescript
// 렌더링 정보 표시 (개발 환경에서만)
{process.env.NODE_ENV === 'development' && (
  <div className="debug-info">
    <p>렌더링: {renderType}</p>
    <p>캐시: {cacheStatus}</p>
    <p>로드 시간: {loadTime}ms</p>
  </div>
)}
```

### **타입 안전성**

```typescript
// 페이지별 Props 타입 정의
type SSGPageProps = {
  staticData: StaticData;
};

type SSRPageProps = {
  session: Session | null;
  initialData: InitialData;
};

type CSRPageProps = {
  // 클라이언트 전용, props 없음
};
```

---

## 📚 **참고 자료**

- [Next.js App Router 렌더링](https://nextjs.org/docs/app/building-your-application/rendering)
- [React Server Components](https://react.dev/reference/react/use-server)
- [Web Vitals 가이드](https://web.dev/vitals/)
- [NextAuth.js v5 마이그레이션](https://authjs.dev/getting-started/migrating-to-v5)
