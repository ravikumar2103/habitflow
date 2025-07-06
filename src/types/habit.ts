export interface Habit {
  id?: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  targetDays: number[];
  createdAt: string;
  isActive: boolean;
  userId?: string;
}

export interface Progress {
  id?: string;
  habitId: string;
  date: string;
  completed: boolean;
  note?: string;
  userId?: string;
}

export interface HabitStats {
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  completionRate: number;
  weeklyAverage: number;
}

export interface DashboardStats {
  totalHabits: number;
  activeHabits: number;
  todayCompleted: number;
  todayTotal: number;
  weeklyCompletionRate: number;
  bestStreak: number;
}