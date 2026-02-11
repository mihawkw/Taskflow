import React, { useState, useEffect, useRef } from 'react';
import { Task, TaskLog } from '../types';
import { Play, Pause, Square, Plus, Minus, X, Check, Clock, Hash, StickyNote, Bell, BellOff } from 'lucide-react';

interface ActionModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onSave: (log: Omit<TaskLog, 'id'>) => void;
  onToggleNotification?: () => void;
}

export const ActionModal: React.FC<ActionModalProps> = ({ task, isOpen, onClose, onSave, onToggleNotification }) => {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [count, setCount] = useState(0);
  const [note, setNote] = useState('');
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSeconds(0);
      setCount(0);
      setNote('');
      setIsActive(false);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isActive) {
      timerRef.current = window.setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else if (!isActive && timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive]);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSave = () => {
    onSave({
      taskId: task.id,
      timestamp: Date.now(),
      count: count,
      durationSeconds: seconds,
      note: note.trim() || undefined,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className={`p-6 ${task.color} text-white flex justify-between items-start`}>
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span>{task.icon}</span> {task.title}
            </h2>
            <p className="opacity-90 mt-1">{task.description || '正在记录进度...'}</p>
          </div>
          <div className="flex items-center gap-2">
            {task.type === 'habit' && onToggleNotification && (
              <button 
                onClick={onToggleNotification}
                className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition text-white"
                title={task.notificationEnabled ? '关闭此任务提醒' : '开启此任务提醒'}
              >
                {task.notificationEnabled ? <Bell size={20} /> : <BellOff size={20} />}
              </button>
            )}
            <button onClick={onClose} className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {/* Timer Section */}
            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center gap-2 text-gray-500 font-medium uppercase tracking-wider text-xs">
                <Clock size={16} /> 计时器
              </div>
              <div className="text-4xl sm:text-5xl font-mono font-semibold text-gray-800 tabular-nums">
                {formatTime(seconds)}
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsActive(!isActive)}
                  className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-transform active:scale-95 ${
                    isActive ? 'bg-amber-500' : 'bg-green-500'
                  }`}
                >
                  {isActive ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                </button>
                {seconds > 0 && !isActive && (
                  <button
                    onClick={() => setSeconds(0)}
                    className="w-10 h-10 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-300"
                  >
                    <Square size={16} fill="currentColor" />
                  </button>
                )}
              </div>
            </div>

            {/* Counter Section */}
            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center gap-2 text-gray-500 font-medium uppercase tracking-wider text-xs">
                <Hash size={16} /> 计数器
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCount(Math.max(0, count - 1))}
                  className="w-10 h-10 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 active:bg-gray-300 transition"
                >
                  <Minus size={20} />
                </button>
                
                <input 
                  type="number"
                  min="0"
                  value={count}
                  onChange={(e) => setCount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="text-4xl sm:text-5xl font-bold text-gray-800 w-24 text-center bg-transparent border-b-2 border-transparent focus:border-blue-500 outline-none"
                />

                <button
                  onClick={() => setCount(count + 1)}
                  className="w-10 h-10 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 active:bg-gray-300 transition"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>
          </div>
          
          <div className="h-px bg-gray-100 w-full" />

          {/* Note Section */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center gap-2 text-gray-500 font-medium uppercase tracking-wider text-xs">
               <StickyNote size={16} /> 备注
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="添加备注信息..."
              className="w-full p-3 bg-gray-50 rounded-xl text-gray-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none h-24"
            />
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-4 rounded-xl font-bold text-gray-500 hover:bg-gray-200 transition"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition flex items-center justify-center gap-2"
          >
            <Check size={20} /> 完成
          </button>
        </div>
      </div>
    </div>
  );
};