'use client'
import { Button } from '@repo/ui/components/button'
import { useEffect, useState } from 'react'
import { createConversation } from './serverActions'
import Conversation from './Conversation'

export default function GPT1Page() {
  const [selectedSession, setSelectedSession] = useState<string>('')

  const [sessions, setSessions] = useState<string[]>([])
  const [sessionDatas, setSessionDatas] = useState<any>([])

  useEffect(() => {
    //로컬 스토리지에서 세션 가져오기
    const sessions = localStorage.getItem('gpt1-session') || '[]'
    const sessionsArray = JSON.parse(sessions)

    setSessions(sessionsArray ? sessionsArray : [])

    const newSessionDatas = []
    for (const session of sessionsArray) {
      const sessionData = localStorage.getItem(session)
      if (sessionData) {
        newSessionDatas.push(JSON.parse(sessionData))
      }
    }
    setSessionDatas(newSessionDatas)
  }, [])

  async function flushSessions() {
    setSessions([])
    localStorage.removeItem('gpt1-session')
  }

  async function createSession() {
    const id = await createConversation()
    setSessions([...sessions, id])
    setSessionDatas([...sessionDatas, { id: id }])
    localStorage.setItem('gpt1-session', JSON.stringify([...sessions, id]))
    localStorage.setItem(id, JSON.stringify({ id: id }))
  }

  return (
    <div className="flex flex-col h-screen overflow-y-auto p-4">
      <div className="flex gap-4  items-center">
        <Button onClick={createSession}>새 세션 만들기</Button>
        <Button onClick={flushSessions}>세션 초기화</Button>
      </div>
      <div className="flex flex-col gap-2 mt-4">
        {sessionDatas?.map((session: any, index: number) => (
          <Button key={index} onClick={() => setSelectedSession(session.id)} variant="outline" className="w-fit">
            {session.titleMessage || '새 세션'}
          </Button>
        ))}
      </div>
      {selectedSession && <Conversation sessionId={selectedSession} />}
    </div>
  )
}
