export type FrequencyUnit = 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';

export interface Frequency {
  value: number;
  unit: FrequencyUnit;
}

export interface TaskLog {
  id: string;
  taskId: string;
  timestamp: number; // Date.now()
  count: number;
  durationSeconds: number;
  note?: string;
}

export type TaskType = 'single' | 'habit';

export interface Task {
  id: string;
  title: string;
  description?: string;
  type: TaskType;
  frequency?: Frequency;
  needsTracking: boolean; // If true, shows the counter/timer modal
  isCompleted: boolean; // Primarily for 'single' tasks
  createdAt: number;
  color: string;
  icon: string;
  notificationEnabled: boolean; // Whether reminders are enabled for this specific task
  lastNotifiedAt?: number;      // Timestamp of the last sent notification
}

export const ICONS = ['📝', '🏋️', '💊', '💧', '📚', '🧘', '🧹', '💻', '🎨', '🍳', '🏃', '💤'];
export const COLORS = [
  'bg-red-500',
  'bg-orange-500',
  'bg-amber-500',
  'bg-green-500',
  'bg-emerald-500',
  'bg-teal-500',
  'bg-cyan-500',
  'bg-blue-500',
  'bg-indigo-500',
  'bg-violet-500',
  'bg-purple-500',
  'bg-fuchsia-500',
  'bg-pink-500',
  'bg-rose-500',
];