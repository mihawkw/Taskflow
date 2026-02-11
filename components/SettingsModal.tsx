
import React, { useState } from 'react';
import { X, Github, Save, Download, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Task, TaskLog } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  logs: TaskLog[];
  onImport: (tasks: Task[], logs: TaskLog[]) => void;
  username: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, tasks, logs, onImport, username }) => {
  const [token, setToken] = useState(() => localStorage.getItem(`tf_${username}_gh_token`) || '');
  const [gistId, setGistId] = useState(() => localStorage.getItem(`tf_${username}_gist_id`) || '');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMsg, setStatusMsg] = useState('');

  const saveConfig = () => {
    localStorage.setItem(`tf_${username}_gh_token`, token);
    localStorage.setItem(`tf_${username}_gist_id`, gistId);
  };

  const handleSyncToGithub = async () => {
    if (!token) {
        setStatus('error');
        setStatusMsg('请先填写 GitHub Token');
        return;
    }
    
    saveConfig();
    setStatus('loading');
    
    const dataContent = JSON.stringify({ tasks, logs }, null, 2);
    const payload = {
      description: `TaskFlow Pro Data Backup (${username})`,
      public: false,
      files: {
        [`taskflow_${username}_data.json`]: {
          content: dataContent
        }
      }
    };

    try {
      const url = gistId 
        ? `https://api.github.com/gists/${gistId}` 
        : `https://api.github.com/gists`;
      
      const method = gistId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to sync');
      
      const data = await res.json();
      if (!gistId) {
          setGistId(data.id);
          localStorage.setItem(`tf_${username}_gist_id`, data.id);
      }
      
      setStatus('success');
      setStatusMsg('保存成功! 数据已同步到 GitHub Gist。');
    } catch (e) {
      setStatus('error');
      setStatusMsg('同步失败，请检查 Token 权限或网络连接。');
    }
  };

  const handleLoadFromGithub = async () => {
    if (!token || !gistId) {
        setStatus('error');
        setStatusMsg('请填写 Token 和 Gist ID');
        return;
    }
    
    saveConfig();
    setStatus('loading');

    try {
      const res = await fetch(`https://api.github.com/gists/${gistId}`, {
        headers: {
          'Authorization': `token ${token}`,
        }
      });
      
      if (!res.ok) throw new Error('Failed to fetch');
      
      const data = await res.json();
      const fileName = `taskflow_${username}_data.json`;
      // Try username specific file first, fallback to generic
      const fileContent = data.files[fileName]?.content || data.files["taskflow_data.json"]?.content;
      
      if (fileContent) {
          const parsed = JSON.parse(fileContent);
          if (parsed.tasks && parsed.logs) {
              onImport(parsed.tasks, parsed.logs);
              setStatus('success');
              setStatusMsg('读取成功! 数据已更新。');
          } else {
              throw new Error('Invalid format');
          }
      } else {
          throw new Error('File not found');
      }
    } catch (e) {
      setStatus('error');
      setStatusMsg('读取失败，请检查 Gist ID 是否正确。');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Github /> 数据云同步 ({username})
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="p-4 bg-blue-50 text-blue-800 rounded-xl text-sm">
             <strong>提示：</strong> 使用 GitHub Gist 保存数据。你需要一个 
             <a href="https://github.com/settings/tokens" target="_blank" rel="noreferrer" className="underline font-bold mx-1">GitHub Personal Access Token</a> 
             (勾选 gist 权限)。
          </div>

          <div className="space-y-4">
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GitHub Token</label>
                <input 
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxx"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none font-mono text-sm"
                />
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gist ID (自动生成/手动填入)</label>
                <input 
                  type="text"
                  value={gistId}
                  onChange={(e) => setGistId(e.target.value)}
                  placeholder="保存后自动生成"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none font-mono text-sm"
                />
             </div>
          </div>

          {status !== 'idle' && (
              <div className={`flex items-center gap-2 p-3 rounded-xl text-sm ${
                  status === 'error' ? 'bg-red-50 text-red-600' : 
                  status === 'success' ? 'bg-green-50 text-green-600' : 
                  'bg-gray-50 text-gray-600'
              }`}>
                  {status === 'loading' && <Loader2 className="animate-spin" size={16} />}
                  {status === 'error' && <AlertCircle size={16} />}
                  {status === 'success' && <CheckCircle2 size={16} />}
                  {statusMsg || (status === 'loading' ? '处理中...' : '')}
              </div>
          )}

          <div className="grid grid-cols-2 gap-4">
             <button 
                onClick={handleLoadFromGithub}
                disabled={status === 'loading'}
                className="flex items-center justify-center gap-2 py-3 border border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
             >
                <Download size={18} /> 读取数据
             </button>
             <button 
                onClick={handleSyncToGithub}
                disabled={status === 'loading'}
                className="flex items-center justify-center gap-2 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition disabled:opacity-50"
             >
                <Save size={18} /> 保存/上传
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};
