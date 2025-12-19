'use client';

import React, { useState, useEffect } from 'react';
import { History, FileText, Trash2, X, Clock, ChevronDown, ChevronUp } from 'lucide-react';

export interface HistoryItem {
  id: string;
  timestamp: number;
  title: string;
  content: string;
}

interface HistoryManagerProps {
  history: HistoryItem[];
  onLoad: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
}

const HistoryManager: React.FC<HistoryManagerProps> = ({ history, onLoad, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('ko-KR', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      {/* Floating Button / Panel */}
      <div className="fixed top-36 right-10 z-40 flex flex-col items-end gap-2">
         {/* Toggle Button */}
         <button 
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-lg hover:bg-slate-50 transition-all text-slate-700 font-bold group"
         >
            <History size={20} className="text-blue-600 group-hover:rotate-180 transition-transform duration-500" />
            <span>히스토리</span>
            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full min-w-[24px] text-center">
                {history.length}
            </span>
         </button>

         {/* Dropdown List */}
         {isOpen && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-80 max-h-[60vh] overflow-hidden flex flex-col animate-accordion-down origin-top-right">
                <div className="p-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-500">최근 생성 기록</span>
                    <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                        <X size={14} />
                    </button>
                </div>
                
                <div className="overflow-y-auto flex-1 p-2 space-y-2">
                    {history.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">
                            <History size={32} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm">기록이 없습니다</p>
                        </div>
                    ) : (
                        history.map((item) => (
                            <div 
                                key={item.id} 
                                className="group relative bg-white border border-slate-100 hover:border-blue-300 rounded-lg p-3 transition-all cursor-pointer hover:shadow-md"
                                onClick={() => setSelectedItem(item)}
                            >
                                <div className="pr-6">
                                    <h4 className="text-sm font-semibold text-slate-800 line-clamp-1 mb-1">
                                        {item.title || '제목 없음'}
                                    </h4>
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                        <Clock size={10} />
                                        {formatDate(item.timestamp)}
                                    </div>
                                </div>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(item.id);
                                    }}
                                    className="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                                    title="삭제"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
         )}
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <FileText size={20} className="text-blue-600" />
                            {selectedItem.title}
                        </h2>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                            <Clock size={12} />
                            생성일시: {new Date(selectedItem.timestamp).toLocaleString('ko-KR')}
                        </p>
                    </div>
                    <button 
                        onClick={() => setSelectedItem(null)}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <X size={24} className="text-slate-500" />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
                    <div className="bg-white shadow-sm border border-slate-100 rounded-xl p-8 max-w-3xl mx-auto prose prose-slate">
                         <div dangerouslySetInnerHTML={{ __html: selectedItem.content }} />
                    </div>
                </div>

                <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-white rounded-b-2xl">
                    <button 
                        onClick={() => handleDelete(selectedItem.id)} 
                        className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium flex items-center gap-1.5"
                    >
                        <Trash2 size={16} /> 삭제하기
                    </button>
                    <button 
                         onClick={() => setSelectedItem(null)}
                         className="px-5 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900"
                    >
                        닫기
                    </button>
                </div>
            </div>
        </div>
      )}
    </>
  );

  function handleDelete(id: string) {
      if (confirm('정말 삭제하시겠습니까?')) {
          onDelete(id);
          setSelectedItem(null);
      }
  }
};

export default HistoryManager;
