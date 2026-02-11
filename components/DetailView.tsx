
import React from 'react';
import { Task, TaskLog } from '../types';
import { X, Clock, Hash, Calendar, Trash2, Edit2, StickyNote } from 'lucide-react';

interface DetailViewProps {
  task: Task;
  logs: TaskLog[];
  onClose: () => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export const DetailView: React.FC<DetailViewProps> = ({ task, logs, onClose, onEdit, onDelete }) => {
  const sortedLogs = [...logs].sort((a, b) => b.timestamp - a.timestamp);

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return '-';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}小时 ${m}分 ${s}秒`;
    if (m > 0) return `${m}分 ${s}秒`;
    return `${s}秒`;
  };

  const formatDate = (ts: number) => {
    return new Intl.DateTimeFormat('zh-CN', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    }).format(new Date(ts));
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); 
    // Trigger the deletion logic directly from App
    onDelete(task.id);
  };

  return (
    <div className="fixed inset-0 z-40 bg-white flex flex-col animate-in slide-in-from-right duration-300 sm:max-w-xl sm:ml-auto sm:border-l sm:shadow-2xl">
      <div className={`${task.color} p-6 pb-12 text-white relative`}>
        <div className="absolute top-6 right-4 flex gap-2">
            <button 
              type="button"
              onClick={() => onEdit(task)}
              className="p-2 bg-white/20 rounded-full hover:bg-white/30 backdrop-blur-md"
              title="编辑"
            >
              <Edit2 size={20} />
            </button>
            <button 
              type="button"
              onClick={handleDelete}
              className="p-2 bg-white/20 rounded-full hover:bg-red-500/50 backdrop-blur-md transition-colors"
              title="删除"
            >
              <Trash2 size={20} />
            </button>
            <button 
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }}
              className="p-2 bg-white/20 rounded-full hover:bg-white/30 backdrop-blur-md"
              title="关闭"
            >
              <X size={20} />
            </button>
        </div>
        
        <div className="flex flex-col items-center mt-8">
          <div className="text-6xl mb-4">{task.icon}</div>
          <h1 className="text-3xl font-bold text-center">{task.title}</h1>
          <p className="opacity-80 mt-2 text-center max-w-xs">{task.description}</p>
        </div>
      </div>

      <div className="flex-1 bg-gray-50 -mt-6 rounded-t-3xl overflow-hidden flex flex-col shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        <div className="p-6 border-b border-gray-100 flex justify-between items-end">
          <h3 className="font-bold text-gray-800 text-lg">活动历史</h3>
          <span className="text-xs text-gray-500 font-medium bg-gray-200 px-2 py-1 rounded-full">{logs.length} 条记录</span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {sortedLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <Calendar size={48} className="mb-2 opacity-20" />
              <p>暂无活动记录</p>
            </div>
          ) : (
            sortedLogs.map((log) => (
              <div key={log.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                    <span className="text-gray-900 font-medium text-sm">{formatDate(log.timestamp)}</span>
                    <span className="text-gray-400 text-xs">记录时间</span>
                    </div>
                    <div className="flex items-center gap-4">
                    {(log.durationSeconds > 0) && (
                        <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1 text-orange-500 font-bold">
                            <Clock size={14} /> {formatDuration(log.durationSeconds)}
                        </div>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wide">时长</span>
                        </div>
                    )}
                    {(log.count > 0 || log.durationSeconds === 0) && (
                        <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1 text-blue-500 font-bold">
                            <Hash size={14} /> {log.count}
                        </div>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wide">次数</span>
                        </div>
                    )}
                    </div>
                </div>
                {log.note && (
                    <div className="mt-2 pt-2 border-t border-gray-50 flex items-start gap-2">
                        <StickyNote size={14} className="text-gray-400 mt-0.5 shrink-0" />
                        <p className="text-sm text-gray-600 italic">{log.note}</p>
                    </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
