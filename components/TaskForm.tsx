import React, { useState, useEffect } from 'react';
import { Task, TaskType, FrequencyUnit, COLORS, ICONS } from '../types';
import { IconPicker } from './IconPicker';
import { ColorPicker } from './ColorPicker';
import { X, Trash2 } from 'lucide-react';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'createdAt' | 'isCompleted'>) => void;
  onDelete?: (taskId: string) => void;
  initialData?: Task | null;
}

export const TaskForm: React.FC<TaskFormProps> = ({ isOpen, onClose, onSave, onDelete, initialData }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TaskType>('habit');
  const [needsTracking, setNeedsTracking] = useState(true);
  const [freqValue, setFreqValue] = useState(1);
  const [freqUnit, setFreqUnit] = useState<FrequencyUnit>('day');
  const [color, setColor] = useState(COLORS[0]);
  const [icon, setIcon] = useState(ICONS[0]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title);
        setDescription(initialData.description || '');
        setType(initialData.type);
        setNeedsTracking(initialData.needsTracking);
        setFreqValue(initialData.frequency?.value || 1);
        setFreqUnit(initialData.frequency?.unit || 'day');
        setColor(initialData.color);
        setIcon(initialData.icon);
      } else {
        // Reset defaults
        setTitle('');
        setDescription('');
        setType('habit');
        setNeedsTracking(true);
        setFreqValue(1);
        setFreqUnit('day');
        setColor(COLORS[0]);
        setIcon(ICONS[0]);
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert("请填写任务名称");
      return;
    }

    onSave({
      title,
      description,
      type,
      needsTracking,
      frequency: { value: freqValue, unit: freqUnit },
      color,
      icon,
    });
    
    onClose();
  };

  const handleDelete = () => {
    if (initialData && onDelete) {
        // Just call onDelete, let the App component handle confirmation
        onDelete(initialData.id);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg h-[90vh] sm:h-auto sm:max-h-[90vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">{initialData ? '编辑任务' : '新建任务'}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">任务名称 <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例如：读书、喝水"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">描述（可选）</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="关于目标的详细信息..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>
          </div>

          {/* Visuals */}
          <div className="space-y-4">
             <label className="block text-sm font-medium text-gray-700">外观</label>
             <div className="space-y-3">
               <IconPicker selectedIcon={icon} onSelect={setIcon} />
               <ColorPicker selectedColor={color} onSelect={setColor} />
             </div>
          </div>

          {/* Settings */}
          <div className="space-y-6 bg-gray-50 p-4 rounded-2xl">
            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">任务类型</label>
              <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-200">
                <button
                  type="button"
                  onClick={() => setType('single')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    type === 'single' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  单次事项
                </button>
                <button
                  type="button"
                  onClick={() => setType('habit')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    type === 'habit' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  习惯
                </button>
              </div>
            </div>

            {/* Tracking Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">开启记录</span>
                <span className="text-xs text-gray-500">记录时间和次数</span>
              </div>
              <button
                type="button"
                onClick={() => setNeedsTracking(!needsTracking)}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  needsTracking ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                  needsTracking ? 'translate-x-6' : ''
                }`} />
              </button>
            </div>

            {/* Frequency */}
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">重复频率</label>
               <div className="flex gap-2">
                 <input 
                   type="number" 
                   min="1" 
                   value={freqValue} 
                   onChange={(e) => setFreqValue(parseInt(e.target.value) || 1)}
                   className="w-20 px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                 />
                 <select
                   value={freqUnit}
                   onChange={(e) => setFreqUnit(e.target.value as FrequencyUnit)}
                   className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                 >
                   <option value="minute">分钟</option>
                   <option value="hour">小时</option>
                   <option value="day">天</option>
                   <option value="week">周</option>
                   <option value="month">月</option>
                   <option value="year">年</option>
                 </select>
               </div>
            </div>
          </div>

        </form>

        <div className="p-4 border-t border-gray-100 flex gap-3">
          {initialData && onDelete && (
             <button
               type="button"
               onClick={handleDelete}
               className="px-6 py-4 bg-red-50 text-red-500 rounded-xl font-bold hover:bg-red-100 transition"
             >
               <Trash2 size={20} />
             </button>
          )}
          <button
            onClick={handleSubmit}
            className="flex-1 py-4 bg-gray-900 text-white rounded-xl font-bold shadow-lg hover:bg-black transition active:scale-[0.99]"
          >
            {initialData ? '保存修改' : '创建任务'}
          </button>
        </div>
      </div>
    </div>
  );
};