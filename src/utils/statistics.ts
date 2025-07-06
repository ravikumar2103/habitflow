import { Habit, Progress, HabitStats, DashboardStats } from '../types/habit';
import { formatDate, getToday, addDays, isTargetDay, getTodayIST } from './helpers';

export function calculateHabitStats(
  habit: Habit, 
  progressData: Progress[]
): HabitStats {
  const habitProgress = progressData
    .filter(p => p.habitId === habit.id)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const currentStreak = calculateCurrentStreak(habit, habitProgress);
  const longestStreak = calculateLongestStreak(habit, habitProgress);
  const totalCompletions = habitProgress.filter(p => p.completed).length;
  const completionRate = calculateCompletionRate(habit, habitProgress);
  const weeklyAverage = calculateWeeklyAverage(habit, habitProgress);

  return {
    currentStreak,
    longestStreak,
    totalCompletions,
    completionRate,
    weeklyAverage,
  };
}

function calculateCurrentStreak(habit: Habit, progressData: Progress[]): number {
  const today = getTodayIST();
  let streak = 0;
  let currentDate = today;

  while (true) {
    const dateStr = formatDate(currentDate);
    const progress = progressData.find(p => p.date === dateStr);
    
    if (!isTargetDay(habit, currentDate)) {
      currentDate = addDays(currentDate, -1);
      continue;
    }

    if (progress && progress.completed) {
      streak++;
      currentDate = addDays(currentDate, -1);
    } else if (formatDate(currentDate) === getToday()) {
      currentDate = addDays(currentDate, -1);
    } else {
      break;
    }
  }

  return streak;
}

function calculateLongestStreak(habit: Habit, progressData: Progress[]): number {
  let longestStreak = 0;
  let currentStreak = 0;
  
  const createdDate = new Date(habit.createdAt);
  const today = getTodayIST();
  
  for (let date = createdDate; date <= today; date = addDays(date, 1)) {
    if (!isTargetDay(habit, date)) continue;
    
    const dateStr = formatDate(date);
    const progress = progressData.find(p => p.date === dateStr);
    
    if (progress && progress.completed) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }
  
  return longestStreak;
}

function calculateCompletionRate(habit: Habit, progressData: Progress[]): number {
  const createdDate = new Date(habit.createdAt);
  const today = getTodayIST();
  
  let totalTargetDays = 0;
  let completedDays = 0;
  
  for (let date = createdDate; date <= today; date = addDays(date, 1)) {
    if (!isTargetDay(habit, date)) continue;
    
    totalTargetDays++;
    const dateStr = formatDate(date);
    const progress = progressData.find(p => p.date === dateStr);
    
    if (progress && progress.completed) {
      completedDays++;
    }
  }
  
  return totalTargetDays > 0 ? (completedDays / totalTargetDays) * 100 : 0;
}

function calculateWeeklyAverage(habit: Habit, progressData: Progress[]): number {
  const today = getTodayIST();
  const weekAgo = addDays(today, -7);
  
  let weeklyCompletions = 0;
  let weeklyTargetDays = 0;
  
  for (let date = weekAgo; date <= today; date = addDays(date, 1)) {
    if (!isTargetDay(habit, date)) continue;
    
    weeklyTargetDays++;
    const dateStr = formatDate(date);
    const progress = progressData.find(p => p.date === dateStr);
    
    if (progress && progress.completed) {
      weeklyCompletions++;
    }
  }
  
  return weeklyTargetDays > 0 ? (weeklyCompletions / weeklyTargetDays) * 100 : 0;
}

export function calculateDashboardStats(
  habits: Habit[], 
  progressData: Progress[]
): DashboardStats {
  const activeHabits = habits.filter(h => h.isActive);
  const today = getToday();
  const todayDate = getTodayIST();
  
  let todayCompleted = 0;
  let todayTotal = 0;
  let bestStreak = 0;
  
  activeHabits.forEach(habit => {
    if (isTargetDay(habit, todayDate)) {
      todayTotal++;
      const progress = progressData.find(p => 
        p.habitId === habit.id && p.date === today
      );
      if (progress && progress.completed) {
        todayCompleted++;
      }
    }
    
    const stats = calculateHabitStats(habit, progressData);
    bestStreak = Math.max(bestStreak, stats.currentStreak);
  });
  
  const weeklyCompletionRate = calculateWeeklyCompletionRate(activeHabits, progressData);
  
  return {
    totalHabits: habits.length,
    activeHabits: activeHabits.length,
    todayCompleted,
    todayTotal,
    weeklyCompletionRate,
    bestStreak,
  };
}

function calculateWeeklyCompletionRate(habits: Habit[], progressData: Progress[]): number {
  if (habits.length === 0) return 0;
  
  const rates = habits.map(habit => 
    calculateHabitStats(habit, progressData).weeklyAverage
  );
  
  return rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
}