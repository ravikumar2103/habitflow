import { useLocalStorage } from './useLocalStorage';
import { Habit, Progress } from '../types/habit';
import { generateId } from '../utils/helpers';

export function useHabits() {
  const [habits, setHabits] = useLocalStorage<Habit[]>('habits', []);
  const [progress, setProgress] = useLocalStorage<Progress[]>('progress', []);

  const addHabit = (habitData: Omit<Habit, 'id' | 'createdAt' | 'isActive'>) => {
    const newHabit: Habit = {
      ...habitData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      isActive: true,
    };
    setHabits(prev => [...prev, newHabit]);
    return newHabit;
  };

  const updateHabit = (id: string, updates: Partial<Habit>) => {
    setHabits(prev => prev.map(habit => 
      habit.id === id ? { ...habit, ...updates } : habit
    ));
  };

  const deleteHabit = (id: string) => {
    setHabits(prev => prev.filter(habit => habit.id !== id));
    setProgress(prev => prev.filter(p => p.habitId !== id));
  };

  const toggleProgress = (habitId: string, date: string, note?: string) => {
    const existingProgress = progress.find(p => 
      p.habitId === habitId && p.date === date
    );

    if (existingProgress) {
      setProgress(prev => prev.map(p => 
        p.habitId === habitId && p.date === date 
          ? { ...p, completed: !p.completed, note }
          : p
      ));
    } else {
      const newProgress: Progress = {
        habitId,
        date,
        completed: true,
        note,
      };
      setProgress(prev => [...prev, newProgress]);
    }
  };

  const getProgressForDate = (habitId: string, date: string) => {
    return progress.find(p => p.habitId === habitId && p.date === date);
  };

  const getProgressForHabit = (habitId: string) => {
    return progress.filter(p => p.habitId === habitId);
  };

  return {
    habits,
    progress,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleProgress,
    getProgressForDate,
    getProgressForHabit,
  };
}