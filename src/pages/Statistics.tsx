import React, { useState } from 'react';
import { BarChart3, TrendingUp, Target, CheckSquare, Calendar, Award } from 'lucide-react';
import * as Icons from 'lucide-react';
import { useFirestore } from '../hooks/useFirestore';
import { useAuth } from '../hooks/useAuth';
import { StatCard } from '../components/StatCard';
import { calculateHabitStats } from '../utils/statistics';
import { formatDate, addDays } from '../utils/helpers';

export function Statistics() {
  const { user } = useAuth();
  const { habits, progress, loading } = useFirestore(user?.uid || null);
  const [selectedHabit, setSelectedHabit] = useState<string | null>(
    habits.length > 0 ? habits[0].id || null : null
  );

  const activeHabits = habits.filter(h => h.isActive);
  const currentHabit = selectedHabit ? activeHabits.find(h => h.id === selectedHabit) : null;
  const stats = currentHabit ? calculateHabitStats(currentHabit, progress) : null;

  // Calculate weekly progress for the selected habit
  const getWeeklyProgress = () => {
    if (!currentHabit) return [];
    
    const today = new Date();
    const weeklyData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = addDays(today, -i);
      const dateStr = formatDate(date);
      const dayProgress = progress.find(p => 
        p.habitId === currentHabit.id && p.date === dateStr
      );
      
      weeklyData.push({
        day: date.toLocaleDateString('en', { weekday: 'short' }),
        completed: dayProgress?.completed || false,
        date: dateStr,
      });
    }
    
    return weeklyData;
  };

  const weeklyProgress = getWeeklyProgress();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center transition-colors duration-200">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Statistics</h1>
          <p className="text-gray-600 dark:text-gray-300">Analyze your habit progress and performance</p>
        </div>

        {activeHabits.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-green-200 dark:border-gray-700 shadow-sm transition-colors duration-200">
            <BarChart3 className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No statistics available</h3>
            <p className="text-gray-600 dark:text-gray-300">Create some habits to see detailed statistics and insights.</p>
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

            {currentHabit && stats && (
              <>
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  <StatCard
                    title="Current Streak"
                    value={`${stats.currentStreak} days`}
                    icon={CheckSquare}
                    color="#10B981"
                    subtitle="Keep it going!"
                  />
                  <StatCard
                    title="Longest Streak"
                    value={`${stats.longestStreak} days`}
                    icon={Award}
                    color="#10B981"
                    subtitle="Personal best"
                  />
                  <StatCard
                    title="Total Completions"
                    value={stats.totalCompletions}
                    icon={Target}
                    color="#10B981"
                    subtitle="Times completed"
                  />
                  <StatCard
                    title="Completion Rate"
                    value={`${Math.round(stats.completionRate)}%`}
                    icon={TrendingUp}
                    color="#10B981"
                    subtitle="Overall performance"
                  />
                  <StatCard
                    title="Weekly Average"
                    value={`${Math.round(stats.weeklyAverage)}%`}
                    icon={Calendar}
                    color="#10B981"
                    subtitle="Last 7 days"
                  />
                  <StatCard
                    title="Days Active"
                    value={Math.ceil((new Date().getTime() - new Date(currentHabit.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                    icon={BarChart3}
                    color="#10B981"
                    subtitle="Since creation"
                  />
                </div>

                {/* Weekly Progress Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-green-200 dark:border-gray-700 shadow-sm p-6 mb-6 transition-colors duration-200">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Weekly Progress</h2>
                  <div className="grid grid-cols-7 gap-4">
                    {weeklyProgress.map((day, index) => (
                      <div key={index} className="text-center">
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{day.day}</div>
                        <div
                          className={`h-20 rounded-lg flex items-end justify-center transition-all duration-300 ${
                            day.completed
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                          }`}
                        >
                          <div className={`w-full h-full rounded-lg flex items-center justify-center ${
                            day.completed ? 'bg-green-500' : 'bg-gray-100 dark:bg-gray-700'
                          }`}>
                            {day.completed ? '✓' : '○'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Habit Details */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-green-200 dark:border-gray-700 shadow-sm p-6 transition-colors duration-200">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Habit Details</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-green-100 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-300">Name</span>
                      <span className="font-medium text-gray-900 dark:text-white">{currentHabit.name}</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-green-100 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-300">Description</span>
                      <span className="font-medium text-gray-900 dark:text-white">{currentHabit.description || 'No description'}</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-green-100 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-300">Target Days</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
                          .filter((_, index) => currentHabit.targetDays.includes(index))
                          .join(', ')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-green-100 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-300">Created</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {new Date(currentHabit.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <span className="text-gray-600 dark:text-gray-300">Status</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        currentHabit.isActive 
                          ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-400' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                      }`}>
                        {currentHabit.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}