// betterAuth로 마이그레이션됨
// 이 라우트는 더 이상 사용되지 않음
// 실제 인증 라우트는 /api/auth/[...all]/route.ts를 사용
export const { GET, POST } = {
  GET: async () => new Response("Not Found", { status: 404 }),
  POST: async () => new Response("Not Found", { status: 404 }),
};
