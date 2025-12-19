'use client';

import React, { useState } from 'react';
import { Download, Plus, Info } from 'lucide-react';
import { useBlogForm } from './BlogFormContext';
import AccordionItem from './AccordionItem';

const StepGif: React.FC = () => {
  const { formData, updateFormData } = useBlogForm();
  
  // Local state for UI
  const [youtubeUrl, setYoutubeUrl] = useState(formData.gif.youtubeUrl || '');
  const [videoId, setVideoId] = useState('');
  const [minute, setMinute] = useState('');
  const [second, setSecond] = useState('');
  
  // Initialize from global state if available
  const [startTimes, setStartTimes] = useState<string[]>(formData.gif.startTimes || []);

  const extractVideoId = (url: string) => {
    // Handle various YouTube URL formats
    // 1. https://www.youtube.com/watch?v=VIDEO_ID
    // 2. https://youtu.be/VIDEO_ID
    // 3. https://www.youtube.com/embed/VIDEO_ID
    // 4. https://www.youtube.com/shorts/VIDEO_ID
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2] && match[2].length === 11) ? match[2] : null;
  };

  const handleYoutubeChange = (value: string) => {
    setYoutubeUrl(value);
  };

  const handleLoadVideo = () => {
    const extractedId = extractVideoId(youtubeUrl);
    
    if (extractedId) {
      setVideoId(extractedId);
      // Only update global state when video is successfully loaded
      updateFormData('gif', (prev: any) => ({ ...prev, youtubeUrl: youtubeUrl }));
    } else {
      alert('유효한 유튜브 링크를 입력해주세요.\n(예: https://www.youtube.com/watch?v=... 또는 https://youtu.be/...)');
      setVideoId('');
    }
  };

  // ... (rest of the component)

  const handleAddTime = () => {
    if (!minute && !second) return;
    
    const m = minute ? parseInt(minute) : 0;
    const s = second ? parseInt(second) : 0;
    
    if (isNaN(m) || isNaN(s)) {
      alert('숫자만 입력해주세요.');
      return;
    }

    const formattedTime = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    
    if (startTimes.includes(formattedTime)) {
      alert('이미 추가된 시간입니다.');
      return;
    }

    const newTimes = [...startTimes, formattedTime].sort();
    setStartTimes(newTimes);
    updateFormData('gif', (prev: any) => ({ ...prev, startTimes: newTimes })); // Update global state
    
    // Reset inputs
    setMinute('');
    setSecond('');
  };

  const handleRemoveTime = (index: number) => {
    const newTimes = startTimes.filter((_, i) => i !== index);
    setStartTimes(newTimes);
    updateFormData('gif', (prev: any) => ({ ...prev, startTimes: newTimes }));
  };

  return (
    <AccordionItem title="4단계: 유튜브 GIF 만들기 (선택)" defaultOpen={false}>
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          유튜브 링크와 시작 시간을 선택하면 해당 시점부터 5초 구간을 720p GIF로 만들어 글 상단에 자동 삽입합니다.
        </p>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">유튜브 링크</label>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={youtubeUrl}
              onChange={(e) => handleYoutubeChange(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <button 
              onClick={handleLoadVideo}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1 whitespace-nowrap shadow-sm shadow-blue-200"
            >
              <Download size={16} /> 불러오기
            </button>
          </div>

          {videoId && (
            <div className="mb-6 rounded-lg overflow-hidden border border-slate-200 bg-black aspect-video">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          )}
        </div>

        <div>
           <label className="block text-sm font-medium text-slate-700 mb-2">시작 시각 선택 - 여러 개</label>
           
           {/* Time Input Row */}
           <div className="flex items-center gap-2 mb-4">
             <input 
                type="number" 
                min="0"
                max="59"
                placeholder="00" 
                value={minute}
                onChange={(e) => setMinute(e.target.value)}
                className="w-16 px-2 py-2 border border-slate-300 rounded text-center text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
             />
             <span className="text-slate-500 font-bold">:</span>
             <input 
                type="number" 
                min="0"
                max="59"
                placeholder="00" 
                value={second}
                onChange={(e) => setSecond(e.target.value)}
                className="w-16 px-2 py-2 border border-slate-300 rounded text-center text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
             />
             <button 
                onClick={handleAddTime}
                className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-2 rounded-lg font-medium text-sm flex items-center gap-1 transition-colors"
              >
               <Plus size={16} /> 추가
             </button>
           </div>

           {/* Time List */}
           {startTimes.length > 0 ? (
             <div className="space-y-2 mb-4">
               {startTimes.map((time, index) => (
                 <div key={index} className="flex items-center justify-between bg-white border border-slate-200 px-4 py-3 rounded-lg shadow-sm">
                   <div className="flex items-center gap-3">
                     <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold w-6 h-6 flex items-center justify-center">
                       {index + 1}
                     </span>
                     <span className="font-mono text-slate-800 font-medium text-base">
                       {time}
                     </span>
                     <span className="text-xs text-slate-400">
                       ~ {(() => {
                         const parts = time.split(':').map(Number);
                         const m = parts[0] || 0;
                         const s = parts[1] || 0;
                         const totalSeconds = m * 60 + s + 5;
                         const endM = Math.floor(totalSeconds / 60);
                         const endS = totalSeconds % 60;
                         return `${String(endM).padStart(2, '0')}:${String(endS).padStart(2, '0')}`;
                       })()} (5초)
                     </span>
                   </div>
                   <button 
                     onClick={() => handleRemoveTime(index)}
                     className="text-slate-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-all"
                   >
                     <Plus size={18} className="rotate-45" /> {/* Using Plus rotated as X icon */}
                   </button>
                 </div>
               ))}
             </div>
           ) : (
              <div className="bg-slate-50 border border-slate-200 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-slate-400 gap-2 mb-3">
                 <Info size={20} />
                 <span className="text-sm">시간을 입력하고 추가 버튼을 눌러주세요</span>
              </div>
           )}
           
           <div className="flex items-start gap-1 mt-2 text-xs text-slate-500">
             <Info size={12} className="mt-0.5 shrink-0" />
             <span>입력한 시간부터 5초 길이로 GIF가 생성됩니다. 파일 용량을 고려해 프레임 최적화가 적용됩니다.</span>
           </div>
        </div>

      </div>
    </AccordionItem>
  );
};

export default StepGif;