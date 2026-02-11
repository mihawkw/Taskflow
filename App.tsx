
import React, { useState, useEffect, useCallback } from 'react';
import { Task, TaskLog } from './types';
import { TaskForm } from './components/TaskForm';
import { ActionModal } from './components/ActionModal';
import { DetailView } from './components/DetailView';
import { SettingsModal } from './components/SettingsModal';
import { Plus, MoreHorizontal, CheckCircle2, Circle, Settings, Download, CheckSquare, XSquare, Trash2, Bell, BellOff, LogOut, User } from 'lucide-react';

const UNIT_MAP: Record<string, string> = {
  minute: '分钟',
  hour: '小时',
  day: '天',
  week: '周',
  month: '月',
  year: '年'
};

const UNIT_MS: Record<string, number> = {
  minute: 60 * 1000,
  hour: 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000,
  year: 365 * 24 * 60 * 60 * 1000,
};

// Robust ID generator to avoid issues in non-secure contexts
const generateId = () => {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
  } catch (e) {}
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// --- Login Component ---
const LoginScreen = ({ onLogin }: { onLogin: (u: string) => void }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) onLogin(input.trim());
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-xl w-full max-w-md transition-all">
         <div className="flex justify-center mb-8">
            <div className="w-24 h-24 bg-gray-900 rounded-3xl flex items-center justify-center text-white shadow-xl transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                <CheckCircle2 size={48} className="text-blue-400" />
            </div>
         </div>
         <h1 className="text-3xl font-black text-center text-gray-900 mb-2">TaskFlow Pro</h1>
         <p className="text-center text-gray-500 mb-8 font-medium">专注你的目标，管理你的时间</p>
         
         <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">用户名 / 识别码</label>
              <div className="relative">
                <div className="absolute left-4 top-4 text-gray-400">
                    <User size={20} />
                </div>
                <input 
                  autoFocus
                  type="text" 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="输入您的名字"
                  className="w-full pl-12 pr-6 py-4 rounded-xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 outline-none text-lg font-bold transition-all text-gray-800 placeholder-gray-300"
                />
              </div>
            </div>
            <button 
              disabled={!input.trim()}
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              进入工作区
            </button>
         </form>
         
         <p className="mt-8 text-center text-xs text-gray-300">
            相同用户名将进入相同的数据空间
         </p>
      </div>
    </div>
  );
};

// --- Main Dashboard Component ---
interface DashboardProps {
  username: string;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ username, onLogout }) => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(`tf_${username}_tasks`);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  
  const [logs, setLogs] = useState<TaskLog[]>(() => {
    try {
      const saved = localStorage.getItem(`tf_${username}_logs`);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [globalNotifications, setGlobalNotifications] = useState(() => {
    return localStorage.getItem(`tf_${username}_global_notif`) !== 'false';
  });

  // Modals & Active State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null); 
  const [detailTask, setDetailTask] = useState<Task | null>(null); 

  // Selection Mode
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

  // Computed live tasks (to ensure modals get fresh data)
  const liveActiveTask = activeTask ? tasks.find(t => t.id === activeTask.id) || activeTask : null;
  const liveDetailTask = detailTask ? tasks.find(t => t.id === detailTask.id) || detailTask : null;

  // Persistence
  useEffect(() => {
    localStorage.setItem(`tf_${username}_tasks`, JSON.stringify(tasks));
  }, [tasks, username]);

  useEffect(() => {
    localStorage.setItem(`tf_${username}_logs`, JSON.stringify(logs));
  }, [logs, username]);

  useEffect(() => {
    localStorage.setItem(`tf_${username}_global_notif`, String(globalNotifications));
  }, [globalNotifications, username]);

  // Notification Logic
  const handleToggleGlobalNotifications = async () => {
    if (!globalNotifications) {
      // Trying to enable
      if (!("Notification" in window)) {
        alert("您的浏览器不支持通知功能。");
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setGlobalNotifications(true);
        // Send a test notification immediately to confirm it works
        try {
          new Notification("TaskFlow Pro", { body: "提醒功能已开启！我们将按计划提醒您。" });
        } catch (e) {
          console.error("Test notification failed", e);
        }
      } else {
        alert("无法开启提醒。请在浏览器设置中允许通知权限。");
        setGlobalNotifications(false);
      }
    } else {
      setGlobalNotifications(false);
    }
  };

  useEffect(() => {
    const checkReminders = () => {
      // 1. Basic checks
      if (!globalNotifications || Notification.permission !== 'granted') return;

      const now = Date.now();
      let hasUpdates = false;

      // 2. Iterate and update tasks
      // Using functional update to ensure we don't have stale state inside interval
      setTasks(currentTasks => {
        const nextTasks = currentTasks.map(task => {
          if (task.type !== 'habit' || !task.notificationEnabled || task.isCompleted) return task;

          const taskLogs = logs.filter(l => String(l.taskId) === String(task.id));
          const lastActivity = taskLogs.length > 0 
            ? Math.max(...taskLogs.map(l => l.timestamp)) 
            : task.createdAt;

          const freqMs = (task.frequency?.value || 1) * (UNIT_MS[task.frequency?.unit || 'day']);
          
          const timeSinceLastActivity = now - lastActivity;
          const timeSinceLastNotified = task.lastNotifiedAt ? now - task.lastNotifiedAt : Infinity;

          // Notify if: Time passed since action > Freq AND Time passed since last notification > Freq
          if (timeSinceLastActivity >= freqMs && timeSinceLastNotified >= freqMs) {
            try {
               new Notification(`该行动了: ${task.title}`, {
                body: `距离上次完成已过去很久了，加油！`,
                icon: '/favicon.ico', // Optional: requires actual icon
                tag: `task-${task.id}` // Prevent stacking too many of same type
              });
            } catch (e) {
              console.error("Notification failed", e);
            }
            hasUpdates = true;
            return { ...task, lastNotifiedAt: now };
          }
          return task;
        });
        
        // Only return new array if something changed to prevent unnecessary re-renders
        return hasUpdates ? nextTasks : currentTasks;
      });
    };

    // Check every 10 seconds (more responsive than 30s)
    const interval = setInterval(checkReminders, 10000); 
    return () => clearInterval(interval);
  }, [globalNotifications, logs, username]); // Removed 'tasks' from dependency to prevent interval reset loop

  const handleCreateOrUpdateTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'isCompleted' | 'notificationEnabled'>) => {
    if (editingTask) {
      setTasks(prev => prev.map(t => 
        String(t.id) === String(editingTask.id) 
          ? { ...t, ...taskData } 
          : t
      ));
      setEditingTask(null);
    } else {
      const newTask: Task = {
        ...taskData,
        id: generateId(),
        createdAt: Date.now(),
        isCompleted: false,
        notificationEnabled: true,
      };
      setTasks(prev => [newTask, ...prev]);
    }
  };

  const toggleTaskNotification = (taskId: string) => {
    setTasks(prev => prev.map(t => 
      String(t.id) === String(taskId) ? { ...t, notificationEnabled: !t.notificationEnabled } : t
    ));
  };

  const handleImport = (newTasks: Task[], newLogs: TaskLog[]) => {
      setTasks(newTasks);
      setLogs(newLogs);
      setIsSettingsOpen(false);
  };

  const saveLog = (logData: Omit<TaskLog, 'id'>) => {
    const newLog: TaskLog = {
      ...logData,
      id: generateId(),
    };
    setLogs(prev => [...prev, newLog]);
  };

  const toggleSingleTask = (taskId: string) => {
    setTasks(prev => prev.map(t => 
      String(t.id) === String(taskId) ? { ...t, isCompleted: !t.isCompleted } : t
    ));
  };

  const handleTaskClick = (task: Task) => {
    if (isSelectionMode) {
        toggleSelection(task.id);
        return;
    }

    if (task.needsTracking) {
      setActiveTask(task);
    } else {
      toggleSingleTask(task.id);
    }
  };

  const toggleSelection = (taskId: string) => {
      setSelectedTaskIds(prev => {
          const sId = String(taskId);
          return prev.some(id => String(id) === sId)
            ? prev.filter(id => String(id) !== sId)
            : [...prev, sId];
      });
  };
  
  const handleOpenDetail = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    if (isSelectionMode) {
        toggleSelection(task.id);
    } else {
        setDetailTask(task);
    }
  };

  const startEditing = (task: Task) => {
    setDetailTask(null);
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const deleteTask = useCallback((taskId: string) => {
    const sId = String(taskId);
    setDetailTask(null);
    setEditingTask(null);
    setIsFormOpen(false);
    setActiveTask(null); // Ensure active task is cleared
    
    setTasks(prev => prev.filter(t => String(t.id) !== sId));
    setLogs(prev => prev.filter(l => String(l.taskId) !== sId));
    setSelectedTaskIds(prev => prev.filter(id => String(id) !== sId));
  }, []);

  const batchDeleteTasks = () => {
    if (selectedTaskIds.length === 0) return;
    const idsToDelete = new Set(selectedTaskIds.map(id => String(id)));
    setTasks(prev => prev.filter(t => !idsToDelete.has(String(t.id))));
    setLogs(prev => prev.filter(l => !idsToDelete.has(String(l.taskId))));
    setSelectedTaskIds([]);
    setIsSelectionMode(false);
  };

  const openNewTaskForm = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  const exportSelectedToText = () => {
    if (selectedTaskIds.length === 0) return;

    const ids = new Set(selectedTaskIds.map(id => String(id)));
    const selected = tasks.filter(t => ids.has(String(t.id)));
    let content = `TaskFlow Pro 导出报告 (${username}) - ${new Date().toLocaleString('zh-CN')}\n\n`;

    selected.forEach(t => {
      content += `========================================\n`;
      content += `任务: ${t.title}\n`;
      content += `类型: ${t.type === 'habit' ? '习惯' : '单次事项'}\n`;
      content += `描述: ${t.description || '无'}\n`;
      
      const tLogs = logs.filter(l => String(l.taskId) === String(t.id)).sort((a,b) => b.timestamp - a.timestamp);
      content += `\n活动记录 (${tLogs.length}条):\n`;
      
      if (tLogs.length === 0) {
          content += `  (暂无记录)\n`;
      } else {
          tLogs.forEach(l => {
              const date = new Date(l.timestamp).toLocaleString('zh-CN');
              content += `  - [${date}] `;
              const parts = [];
              if (l.durationSeconds > 0) {
                  const h = Math.floor(l.durationSeconds / 3600);
                  const m = Math.floor((l.durationSeconds % 3600) / 60);
                  const s = l.durationSeconds % 60;
                  parts.push(`时长: ${h}h ${m}m ${s}s`);
              }
              if (l.count > 0 || (l.count === 0 && l.durationSeconds === 0)) {
                  parts.push(`次数: ${l.count}`);
              }
              content += parts.join(', ');
              
              if (l.note) {
                  content += `\n    备注: ${l.note}`;
              }
              content += `\n`;
          });
      }
      content += `\n`;
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taskflow_${username}_export_${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setIsSelectionMode(false);
    setSelectedTaskIds([]);
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900 pb-24 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto bg-white min-h-screen shadow-2xl relative overflow-hidden flex flex-col">
        
        <header className="px-6 py-6 bg-white sticky top-0 z-10 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1 flex flex-col gap-1">
             <h1 className="text-2xl font-black tracking-tight text-gray-900 flex items-center gap-2">
                TaskFlow Pro 
                <span className="text-xs font-normal text-white bg-blue-600 px-2 py-0.5 rounded-full tracking-wide">{username}</span>
             </h1>
             <p className="text-sm text-gray-400 font-medium">
               {new Date().toLocaleDateString('zh-CN', { weekday: 'long', month: 'long', day: 'numeric' })}
             </p>
          </div>
          
          <div className="flex items-center gap-2 self-end sm:self-auto">
             {isSelectionMode ? (
                 <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right">
                     <span className="text-sm font-bold text-blue-600 mr-2">已选 {selectedTaskIds.length}</span>
                     
                     <button 
                        onClick={exportSelectedToText}
                        disabled={selectedTaskIds.length === 0}
                        className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition disabled:opacity-50"
                        title="导出"
                     >
                        <Download size={20} />
                     </button>

                     <button 
                        onClick={batchDeleteTasks}
                        disabled={selectedTaskIds.length === 0}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition disabled:opacity-50"
                        title="删除"
                     >
                        <Trash2 size={20} />
                     </button>

                     <button 
                        onClick={() => { setIsSelectionMode(false); setSelectedTaskIds([]); }}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                        title="取消"
                     >
                        <XSquare size={20} />
                     </button>
                 </div>
             ) : (
                 <div className="flex items-center gap-2">
                     <button 
                        onClick={handleToggleGlobalNotifications}
                        className={`p-2 rounded-full transition-all ${globalNotifications ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'}`}
                        title={globalNotifications ? '关闭提醒' : '开启提醒'}
                     >
                        {globalNotifications ? <Bell size={20} /> : <BellOff size={20} />}
                     </button>
                     <button 
                        onClick={() => setIsSelectionMode(true)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition"
                        title="批量操作"
                     >
                        <CheckSquare size={20} /> 
                     </button>
                     <button 
                       onClick={() => setIsSettingsOpen(true)}
                       className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition"
                       title="设置"
                     >
                        <Settings size={20} />
                     </button>
                     <div className="w-px h-6 bg-gray-200 mx-1"></div>
                     <button 
                       onClick={onLogout}
                       className="p-2 text-gray-500 hover:bg-red-50 hover:text-red-500 rounded-full transition"
                       title="退出登录"
                     >
                        <LogOut size={20} />
                     </button>
                 </div>
             )}
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-y-auto no-scrollbar">
          {tasks.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-64 text-center p-8">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                  <Plus className="text-blue-500" size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-800">欢迎, {username}</h3>
                <p className="text-gray-400 mt-2">这里空空如也，创建你的第一个任务吧。</p>
             </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {tasks.map(task => {
                const isCompleted = task.isCompleted;
                const taskLogs = logs.filter(l => String(l.taskId) === String(task.id));
                const lastLog = taskLogs.sort((a,b) => b.timestamp - a.timestamp)[0];
                const isSelected = selectedTaskIds.some(id => String(id) === String(task.id));
                
                return (
                  <button
                    key={task.id}
                    onClick={() => handleTaskClick(task)}
                    className={`relative aspect-square sm:aspect-auto sm:h-48 rounded-3xl p-5 flex flex-col justify-between text-left transition-all active:scale-95 shadow-sm border ${
                      isSelected 
                        ? 'ring-4 ring-blue-500 ring-offset-2 border-transparent'
                        : 'border-transparent'
                    } ${
                      isCompleted 
                        ? 'bg-gray-100 border-gray-200' 
                        : `${task.color} text-white shadow-${task.color.replace('bg-', '')}/30`
                    }`}
                  >
                    {isSelectionMode && (
                        <div className={`absolute top-4 right-4 z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? 'bg-blue-500 border-white text-white' : 'border-white/50 bg-black/10'
                        }`}>
                            {isSelected && <CheckCircle2 size={16} />}
                        </div>
                    )}

                    <div className="flex justify-between items-start w-full">
                       <div className="flex items-center gap-2">
                          <span className={`text-3xl ${isCompleted ? 'opacity-50 grayscale' : ''}`}>{task.icon}</span>
                          {!isCompleted && task.type === 'habit' && task.notificationEnabled && (
                            <Bell size={14} className="text-white/70" />
                          )}
                       </div>
                       {!isSelectionMode && (
                         <div 
                           onClick={(e) => handleOpenDetail(e, task)}
                           className={`p-1.5 rounded-full ${isCompleted ? 'hover:bg-gray-200' : 'hover:bg-white/20'}`}
                         >
                           <MoreHorizontal size={20} className={isCompleted ? 'text-gray-400' : 'text-white/80'} />
                         </div>
                       )}
                    </div>
                    
                    <div>
                      <h3 className={`font-bold text-lg leading-tight line-clamp-2 ${isCompleted ? 'text-gray-400 line-through' : ''}`}>
                        {task.title}
                      </h3>
                      {!isCompleted && task.frequency && (
                         <span className="text-[10px] opacity-80 uppercase tracking-wider font-medium mt-1 block">
                           每 {task.frequency.value} {UNIT_MAP[task.frequency.unit]}
                         </span>
                      )}
                      {lastLog && !isCompleted && (
                        <span className="text-[10px] opacity-70 mt-2 block">
                           上次: {new Date(lastLog.timestamp).toLocaleDateString('zh-CN', {month:'numeric', day: 'numeric'})}
                        </span>
                      )}
                    </div>

                    {!task.needsTracking && !isSelectionMode && (
                      <div className={`absolute bottom-4 right-4`}>
                        {isCompleted ? <CheckCircle2 size={24} className="text-gray-400" /> : <Circle size={24} className="text-white/60" />}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </main>

        {!isSelectionMode && (
            <div className="fixed bottom-8 right-8 flex justify-center pointer-events-none z-20">
            <button
                onClick={openNewTaskForm}
                className="pointer-events-auto bg-gray-900 text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
            >
                <Plus size={32} />
            </button>
            </div>
        )}

        <TaskForm 
          isOpen={isFormOpen} 
          onClose={() => setIsFormOpen(false)} 
          onSave={handleCreateOrUpdateTask}
          onDelete={deleteTask}
          initialData={editingTask}
        />
        
        {liveActiveTask && (
          <ActionModal
            task={liveActiveTask}
            isOpen={!!activeTask}
            onClose={() => setActiveTask(null)}
            onSave={saveLog}
            onToggleNotification={() => toggleTaskNotification(liveActiveTask.id)}
          />
        )}

        {liveDetailTask && (
          <DetailView
            task={liveDetailTask}
            logs={logs.filter(l => String(l.taskId) === String(liveDetailTask.id))}
            onClose={() => setDetailTask(null)}
            onEdit={startEditing}
            onDelete={deleteTask}
          />
        )}

        <SettingsModal 
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            tasks={tasks}
            logs={logs}
            onImport={handleImport}
            username={username}
        />
      </div>
    </div>
  );
};

// --- Root App ---
function App() {
  const [user, setUser] = useState<string | null>(() => {
    return localStorage.getItem('tf_current_user');
  });

  const handleLogin = (username: string) => {
    localStorage.setItem('tf_current_user', username);
    setUser(username);
  };

  const handleLogout = () => {
    localStorage.removeItem('tf_current_user');
    setUser(null);
  };

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // Key={user} forces a remount when user changes, ensuring state resets correctly
  return <Dashboard key={user} username={user} onLogout={handleLogout} />;
}

export default App;
