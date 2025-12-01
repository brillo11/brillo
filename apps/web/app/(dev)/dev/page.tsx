'use client'

import { Button } from '@repo/ui/components/button'
import { useRouter } from 'next/navigation'

export default function DevPage() {
  const router = useRouter()
  return (
    <div>
      <Button onClick={() => router.push('/dev/gpt1')}>1번 gpt 가기</Button>
    </div>
  )
}
