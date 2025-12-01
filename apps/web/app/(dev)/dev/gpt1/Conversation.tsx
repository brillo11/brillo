'use client'
import { Input } from '@repo/ui/components/input'
import { Label } from '@repo/ui/components/label'
import { useEffect, useState } from 'react'
import {
  sendTitleResponses,
  sendScriptResponses,
  sendThumbnailGuideResponses,
  sendThumbnailResponses,
  sendFixThumbnailResponses,
} from './serverActions'
import { Button } from '@repo/ui/components/button'
import { LoadingSpinner } from '@repo/ui/components/loading-spinner'
import MarkdownRenderer from './MarkdownRenderer'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@repo/ui/components/card'
import { toast } from 'sonner'
import { Textarea } from '@repo/ui/components/textarea'

export default function Conversation({ sessionId }: { sessionId: string }) {
  const [datas, setDatas] = useState<any>({})
  const [isTitleLoading, setIsTitleLoading] = useState(false)
  const [isThumbnailGuideLoading, setIsThumbnailGuideLoading] = useState(false)
  const [isThumbnailLoading, setIsThumbnailLoading] = useState(false)
  const [isScriptLoading, setIsScriptLoading] = useState(false)
  const [thumbnailEditText, setThumbnailEditText] = useState('')
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const step = datas?.step || 'TITLE'
  useEffect(() => {
    //로컬 스토리지에서 세션 가져오기
    const session = localStorage.getItem(sessionId)
    if (!session) {
      localStorage.setItem(sessionId, JSON.stringify({}))
      setDatas({})
    } else {
      const data = JSON.parse(session)
      setDatas(data)
    }
  }, [sessionId])

  async function createTitle() {
    setIsTitleLoading(true)
    const response = await sendTitleResponses(sessionId, datas.titleMessage)
    const newData = { ...datas, titleResponses: response }
    setDatas(newData)

    localStorage.setItem(sessionId, JSON.stringify(newData))
    setIsTitleLoading(false)
  }
  async function createScript() {
    setIsScriptLoading(true)
    const response = await sendScriptResponses(sessionId)
    const newData = { ...datas, scriptResponses: response }
    setDatas(newData)
    localStorage.setItem(sessionId, JSON.stringify(newData))
    handleStepChange('METADATA')
    setIsScriptLoading(false)
  }
  async function createThumbnailGuide() {
    setIsThumbnailGuideLoading(true)

    console.log(datas.selectedTitleIndex)
    const response = await sendThumbnailGuideResponses(sessionId, datas.selectedTitleIndex)
    const newData = { ...datas, thumbnailGuideResponses: response }
    setDatas(newData)
    localStorage.setItem(sessionId, JSON.stringify(newData))
    handleStepChange('SCRIPT')

    toast.error('썸네일 가이드 생성 실패. 나노바나나가 현재 혼잡합니다.')

    setIsThumbnailGuideLoading(false)
  }
  async function selectTitle(index: number) {
    const newData = { ...datas, selectedTitleIndex: index }
    setDatas(newData)
    localStorage.setItem(sessionId, JSON.stringify(newData))

    handleStepChange('THUMBNAIL_GUIDE')
  }
  async function handleStepChange(step: string) {
    setDatas((prev: any) => {
      const newData = { ...prev, step: step }
      localStorage.setItem(sessionId, JSON.stringify(newData))
      return newData
    })
  }
  async function selectThumbnailGuide(index: number) {
    const newData = { ...datas, selectedThumbnailGuideIndex: index }
    setDatas(newData)
    localStorage.setItem(sessionId, JSON.stringify(newData))
    handleStepChange('THUMBNAIL')
  }
  async function createThumbnail() {
    setIsThumbnailLoading(true)
    try {
      if (!datas.selectedThumbnailGuideIndex) toast.error('썸네일 가이드를 선택해주세요.')
      const selectedTitleSet = datas.titleResponses?.sets[datas.selectedTitleIndex]
      const thumbnailGuide = datas.thumbnailGuideResponses?.thumbnailGuides[datas.selectedThumbnailGuideIndex]
      const response = await sendThumbnailResponses({
        thumbnailTitle: selectedTitleSet.thumbnailTitle,
        hookingText: selectedTitleSet.hookingText,
        videoTitle: selectedTitleSet.videoTitle,
        thumbnailGuide: thumbnailGuide.guideDescription,
      })
      const newData = { ...datas, thumbnailResponses: response }
      setDatas(newData)
      localStorage.setItem(sessionId, JSON.stringify(newData))
      handleStepChange('SCRIPT')
    } catch (error) {
      toast.error('썸네일 생성 실패. 나노바나나가 현재 혼잡합니다.')
    } finally {
      setIsThumbnailLoading(false)
    }
  }
  async function fixThumbnail() {
    setIsThumbnailLoading(true)
    try {
      const file = thumbnailFile ? await thumbnailFile?.arrayBuffer() : undefined
      const base64 = file ? Buffer.from(file).toString('base64') : undefined
      const mimeType = thumbnailFile ? thumbnailFile?.type : undefined
      const response = await sendFixThumbnailResponses(thumbnailEditText, datas.thumbnailResponses, base64, mimeType)
      const newData = { ...datas, thumbnailResponses: response }
      setDatas(newData)
      localStorage.setItem(sessionId, JSON.stringify(newData))
      setIsThumbnailLoading(false)
    } catch (error) {
      toast.error('썸네일 수정 실패. 나노바나나가 현재 혼잡합니다.')
    } finally {
      setIsThumbnailLoading(false)
    }
  }
  return (
    <div className="flex flex-col gap-4 mt-12 p-4 border rounded-lg">
      <div className="flex gap-2 items-center">
        <h1>{sessionId}</h1>
        <Button
          onClick={() => {
            localStorage.removeItem(sessionId)
            const sessions = localStorage.getItem('gpt1-session')
            if (sessions && sessions.length > 0) {
              const sessionsArray = JSON.parse(sessions)
              localStorage.setItem(
                'gpt1-session',
                JSON.stringify(sessionsArray.filter((session: string) => session !== sessionId))
              )
            } else {
              localStorage.removeItem('gpt1-session')
            }
            setDatas({})
          }}
        >
          세션 삭제
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <Label>주제 입력</Label>
        <Input
          type="text"
          value={datas.titleMessage || ''}
          onChange={(e) => setDatas({ ...datas, titleMessage: e.target.value })}
          disabled={isTitleLoading || step !== 'TITLE'}
        />
        <Button onClick={createTitle} disabled={isTitleLoading || step !== 'TITLE'}>
          {isTitleLoading ? <LoadingSpinner loadingText="제목 생성 중..." /> : '제목 생성'}
        </Button>
        <div className="grid grid-cols-3 gap-2">
          {datas.titleResponses?.sets.map((set: any, index: number) => {
            const isSelected = datas.selectedTitleIndex === index
            return (
              <Card key={index} className={isSelected ? 'border-2 border-primary' : ''}>
                <CardHeader>
                  <CardTitle>{index + 1}번 세트</CardTitle>
                </CardHeader>
                <CardContent>
                  썸네일 제목 <MarkdownRenderer content={set.thumbnailTitle} />
                  후킹 텍스트 <MarkdownRenderer content={set.hookingText} />
                  영상 제목 <MarkdownRenderer content={set.videoTitle} />
                </CardContent>
                <CardFooter>
                  <Button onClick={() => selectTitle(index)}>선택</Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </div>
      {datas.titleResponses && (
        <div className="flex flex-col gap-2">
          <Button onClick={createThumbnailGuide} disabled={isThumbnailGuideLoading || step !== 'THUMBNAIL_GUIDE'}>
            {isThumbnailGuideLoading ? <LoadingSpinner loadingText="썸네일 가이드 생성 중..." /> : '썸네일 가이드 생성'}
          </Button>
          <div className="grid grid-cols-3 gap-2">
            {datas.thumbnailGuideResponses?.thumbnailGuides?.map((guide: any, index: number) => {
              const isSelected = datas.selectedThumbnailGuideIndex === index
              return (
                <Card key={index} className={isSelected ? 'border-2 border-primary' : ''}>
                  <CardHeader>
                    <CardTitle className="flex flex-wrap">
                      <MarkdownRenderer content={`**${index + 1}**. ${guide.guideTitle}`} />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MarkdownRenderer content={guide.guideDescription} />
                  </CardContent>
                  <CardFooter>
                    <Button onClick={() => selectThumbnailGuide(index)}>선택</Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </div>
      )}
      {datas.thumbnailGuideResponses && (
        <div className="flex flex-col gap-2">
          <Button
            onClick={createThumbnail}
            disabled={isThumbnailLoading || step !== 'THUMBNAIL' || !datas.selectedThumbnailGuideIndex === null}
          >
            {isThumbnailLoading ? <LoadingSpinner loadingText="썸네일 생성 중..." /> : '썸네일 생성'}
          </Button>
          {datas.thumbnailResponses && (
            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-lg bg-white overflow-hidden">
                <img src={`data:image/jpeg;base64,${datas.thumbnailResponses}`} alt="썸네일" />
              </div>
              <Card>
                <CardHeader>썸네일 수정</CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <Textarea
                    value={thumbnailEditText}
                    onChange={(e: any) => setThumbnailEditText(e.target.value)}
                    className="resize-none"
                    disabled={isThumbnailLoading}
                  />
                  <Label>참고 이미지</Label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e: any) => setThumbnailFile(e.target.files[0])}
                    disabled={isThumbnailLoading}
                  />
                  <Button onClick={fixThumbnail} disabled={isThumbnailLoading}>
                    수정
                  </Button>
                  {isThumbnailLoading ? <LoadingSpinner loadingText="썸네일 수정 중..." /> : '수정'}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {datas.thumbnailResponses && (
        <div className="flex flex-col gap-2">
          <Button onClick={createScript} disabled={isScriptLoading || step !== 'SCRIPT'}>
            {isScriptLoading ? <LoadingSpinner loadingText="대본 생성 중..." /> : '대본 생성'}
          </Button>
          <div className="flex flex-col gap-2">
            {datas.scriptResponses && (
              <div className="mt-4 p-4 border rounded-lg bg-white dark:bg-gray-900">
                <MarkdownRenderer content={datas.scriptResponses} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
