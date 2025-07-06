import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import * as Icons from 'lucide-react';
import { useFirestore } from '../hooks/useFirestore';
import { useAuth } from '../hooks/useAuth';
import { getDaysInMonth, getFirstDayOfMonth, formatDateIST, isTargetDay, getTodayIST, createDateFromIST } from '../utils/helpers';

export function Calendar() {
  const { user } = useAuth();
  const { habits, progress, loading, toggleProgress } = useFirestore(user?.uid || null);
  const [currentDate, setCurrentDate] = useState(() => {
    const istDate = getTodayIST();
    return new Date(istDate.getFullYear(), istDate.getMonth(), 1);
  });
  const [selectedHabit, setSelectedHabit] = useState<string | null>(
    habits.length > 0 ? habits[0].id || null : null
  );

  const activeHabits = habits.filter(h => h.isActive);
  const currentHabit = selectedHabit ? activeHabits.find(h => h.id === selectedHabit) : null;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = getFirstDayOfMonth(year, month);

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getDayStatus = (day: number) => {
    if (!currentHabit) return null;
    
    const date = createDateFromIST(year, month, day);
    const dateStr = formatDateIST(date);
    const dayProgress = progress.find(p => 
      p.habitId === currentHabit.id && p.date === dateStr
    );
    
    const isTarget = isTargetDay(currentHabit, date);
    const isCompleted = dayProgress?.completed || false;
    const today = getTodayIST();
    const todayStr = formatDateIST(today);
    const isToday = dateStr === todayStr;
    
    return { isTarget, isCompleted, isToday };
  };

  const handleDayClick = async (day: number) => {
    if (!currentHabit?.id) return;
    
    const date = createDateFromIST(year, month, day);
    const dateStr = formatDateIST(date);
    
    try {
      await toggleProgress(currentHabit.id, dateStr);
    } catch (error) {
      console.error('Error toggling progress:', error);
    }
  };

  const renderCalendarDays = () => {
    const days = [];
    const today = getTodayIST();
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-10 md:h-12" />
      );
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const status = getDayStatus(day);
      const date = createDateFromIST(year, month, day);
      const isFuture = date > today;
      
      days.push(
        <button
          key={day}
          onClick={() => handleDayClick(day)}
          className={`
            h-10 md:h-12 w-full rounded-lg text-sm font-medium transition-all duration-200
            flex items-center justify-center relative hover:scale-105
            ${status?.isCompleted
              ? 'bg-green-500 text-white hover:bg-green-600 shadow-md'
              : status?.isToday
                ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 border-2 border-green-400 dark:border-green-500 hover:bg-green-200 dark:hover:bg-green-900/70'
                : status?.isTarget
                  ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/50 border border-green-200 dark:border-green-700'
                  : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
            }
            ${isFuture ? 'opacity-70' : ''}
          `}
        >
          {day}
          {status?.isToday && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full" />
          )}
        </button>
      );
    }
    
    return days;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center transition-colors duration-200">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Calendar View</h1>
          <p className="text-gray-600 dark:text-gray-300">Track your habit progress over time</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Showing calendar in Indian Standard Time (IST) - Today: {formatDateIST(getTodayIST())}
          </p>
        </div>

        {activeHabits.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-green-200 dark:border-gray-700 shadow-sm transition-colors duration-200">
            <CalendarIcon className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No habits to display</h3>
            <p className="text-gray-600 dark:text-gray-300">Create some habits to see them in the calendar view.</p>
          </div>
        ) : (
          <>
            {/* Habit Selector */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-green-200 dark:border-gray-700 shadow-sm p-6 mb-6 transition-colors duration-200">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select Habit</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {activeHabits.map((habit) => {
                  const IconComponent = Icons[habit.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>;
                  return (
                    <button
                      key={habit.id}
                      onClick={() => setSelectedHabit(habit.id || null)}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 flex items-center space-x-3 hover:scale-105 ${
                        selectedHabit === habit.id
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/30'
                          : 'border-green-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-500 bg-white dark:bg-gray-700'
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: habit.color + '20' }}
                      >
                        {IconComponent && <IconComponent className="w-4 h-4" style={{ color: habit.color }} />}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">{habit.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Calendar */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-green-200 dark:border-gray-700 shadow-sm p-6 transition-colors duration-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {monthName} {year}
                </h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={previousMonth}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextMonth}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Days of the week */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-2">
                {renderCalendarDays()}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center space-x-6 mt-6 pt-6 border-t border-green-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">Completed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">Target Day</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-100 dark:bg-green-900/50 border-2 border-green-400 dark:border-green-500 rounded" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">Today</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">Available</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}