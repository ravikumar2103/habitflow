import React from 'react';
import { Check, CheckSquare, Edit2, Trash2 } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Habit, Progress } from '../types/habit';
import { getToday, isTargetDay, getTodayIST } from '../utils/helpers';
import { calculateHabitStats } from '../utils/statistics';

interface HabitCardProps {
  habit: Habit;
  progress: Progress[];
  onToggleProgress: (habitId: string, date: string) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habitId: string) => void;
}

export function HabitCard({ 
  habit, 
  progress, 
  onToggleProgress, 
  onEdit, 
  onDelete 
}: HabitCardProps) {
  const today = getToday();
  const todayDate = getTodayIST();
  const todayProgress = progress.find(p => p.habitId === habit.id && p.date === today);
  const isCompleted = todayProgress?.completed || false;
  const isTargetToday = isTargetDay(habit, todayDate);
  const stats = calculateHabitStats(habit, progress);

  const IconComponent = Icons[habit.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isTargetToday) {
      onToggleProgress(habit.id, today);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(habit);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(habit.id);
  };

  const targetDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const targetDaysText = habit.targetDays.map(day => targetDayNames[day]).join(', ');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-green-200 dark:border-gray-700 p-6 hover:shadow-lg hover:border-green-300 dark:hover:border-green-600 transition-all duration-200 cursor-pointer transform hover:scale-105">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: habit.color + '20' }}
          >
            {IconComponent && <IconComponent className="w-6 h-6" style={{ color: habit.color }} />}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{habit.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{targetDaysText}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleEdit}
            className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-green-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
            aria-label="Edit habit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors duration-200"
            aria-label="Delete habit"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {habit.description && (
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{habit.description}</p>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <CheckSquare className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {stats.currentStreak} day streak
            </span>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {Math.round(stats.completionRate)}% complete
          </div>
        </div>

        {isTargetToday && (
          <button
            onClick={handleToggle}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
              isCompleted
                ? 'bg-green-500 text-white hover:bg-green-600 shadow-lg'
                : 'border-2 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 hover:border-green-500 hover:text-green-500'
            }`}
            aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
          >
            <Check className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
        <div
          className="h-3 rounded-full transition-all duration-300 flex items-center justify-end pr-2"
          style={{ 
            width: `${Math.max(stats.completionRate, 5)}%`,
            backgroundColor: habit.color 
          }}
        >
          {stats.completionRate > 15 && (
            <span className="text-xs text-white font-medium">
              {Math.round(stats.completionRate)}%
            </span>
          )}
        </div>
      </div>
      
      {stats.completionRate <= 15 && stats.completionRate > 0 && (
        <div className="text-right">
          <span className="text-xs font-medium" style={{ color: habit.color }}>
            {Math.round(stats.completionRate)}%
          </span>
        </div>
      )}
    </div>
  );
}