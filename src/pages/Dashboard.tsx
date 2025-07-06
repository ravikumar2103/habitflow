import React, { useState } from 'react';
import { Plus, Target, TrendingUp, Calendar, CheckSquare, AlertCircle, X } from 'lucide-react';
import * as Icons from 'lucide-react';
import { useFirestore } from '../hooks/useFirestore';
import { useAuth } from '../hooks/useAuth';
import { HabitCard } from '../components/HabitCard';
import { HabitForm } from '../components/HabitForm';
import { StatCard } from '../components/StatCard';
import { calculateDashboardStats, calculateHabitStats } from '../utils/statistics';
import { Habit } from '../types/habit';
import { getToday, isTargetDay, getTodayIST } from '../utils/helpers';

interface StatModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

function StatModal({ isOpen, onClose, title, children }: StatModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-green-200 dark:border-gray-700 shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-green-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-green-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

interface HabitDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  habit: Habit | null;
  progress: any[];
}

function HabitDetailModal({ isOpen, onClose, habit, progress }: HabitDetailModalProps) {
  if (!isOpen || !habit) return null;

  const stats = calculateHabitStats(habit, progress);
  const IconComponent = Icons[habit.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full border border-green-200 dark:border-gray-700 shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-green-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: habit.color + '20' }}
            >
              {IconComponent && <IconComponent className="w-5 h-5" style={{ color: habit.color }} />}
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{habit.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-green-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {habit.description && (
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">Description</h3>
              <p className="text-gray-600 dark:text-gray-300">{habit.description}</p>
            </div>
          )}
          
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-1">Target Days</h3>
            <p className="text-gray-600 dark:text-gray-300">
              {habit.targetDays.map(day => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day]).join(', ')}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
              <h4 className="font-medium text-green-800 dark:text-green-400">Current Streak</h4>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.currentStreak}</p>
              <p className="text-xs text-green-600 dark:text-green-400">days</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
              <h4 className="font-medium text-green-800 dark:text-green-400">Completion Rate</h4>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{Math.round(stats.completionRate)}%</p>
              <p className="text-xs text-green-600 dark:text-green-400">overall</p>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Progress</h3>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
              <div
                className="h-4 rounded-full transition-all duration-300 flex items-center justify-end pr-2"
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
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-green-200 dark:border-gray-700">
            Created on {new Date(habit.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Dashboard() {
  const { user } = useAuth();
  const { habits, progress, loading, error, addHabit, updateHabit, deleteHabit, toggleProgress } = useFirestore(user?.uid || null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'today' | 'active' | 'weekly' | 'streak' | null;
  }>({ isOpen: false, type: null });
  const [habitDetailModal, setHabitDetailModal] = useState<{
    isOpen: boolean;
    habit: Habit | null;
  }>({ isOpen: false, habit: null });

  const activeHabits = habits.filter(h => h.isActive);
  const stats = calculateDashboardStats(activeHabits, progress);
  const today = getToday();
  const todayDate = getTodayIST();

  const handleAddHabit = async (habitData: Omit<Habit, 'id' | 'createdAt' | 'isActive'>) => {
    setIsSubmitting(true);
    try {
      await addHabit(habitData);
      console.log('Habit added successfully');
    } catch (error) {
      console.error('Error adding habit:', error);
      alert('Failed to add habit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setIsFormOpen(true);
  };

  const handleUpdateHabit = async (habitData: Omit<Habit, 'id' | 'createdAt' | 'isActive'>) => {
    if (editingHabit?.id) {
      setIsSubmitting(true);
      try {
        await updateHabit(editingHabit.id, habitData);
        console.log('Habit updated successfully');
      } catch (error) {
        console.error('Error updating habit:', error);
        alert('Failed to update habit. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    if (window.confirm('Are you sure you want to delete this habit? This action cannot be undone.')) {
      try {
        await deleteHabit(habitId);
        console.log('Habit deleted successfully');
      } catch (error) {
        console.error('Error deleting habit:', error);
        alert('Failed to delete habit. Please try again.');
      }
    }
  };

  const handleToggleProgress = async (habitId: string, date: string) => {
    try {
      await toggleProgress(habitId, date);
      console.log('Progress toggled successfully');
    } catch (error) {
      console.error('Error toggling progress:', error);
      alert('Failed to update progress. Please try again.');
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingHabit(undefined);
  };

  const openModal = (type: 'today' | 'active' | 'weekly' | 'streak') => {
    setModalState({ isOpen: true, type });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, type: null });
  };

  const openHabitDetail = (habit: Habit) => {
    setHabitDetailModal({ isOpen: true, habit });
  };

  const closeHabitDetail = () => {
    setHabitDetailModal({ isOpen: false, habit: null });
  };

  const getTodayHabits = () => {
    return activeHabits.filter(habit => isTargetDay(habit, todayDate));
  };

  const getCompletedTodayHabits = () => {
    const todayHabits = getTodayHabits();
    return todayHabits.filter(habit => {
      const todayProgress = progress.find(p => p.habitId === habit.id && p.date === today);
      return todayProgress?.completed;
    });
  };

  const renderModalContent = () => {
    switch (modalState.type) {
      case 'today':
        const todayHabits = getTodayHabits();
        const completedToday = getCompletedTodayHabits();
        return (
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Today's habits ({completedToday.length}/{todayHabits.length} completed)
            </p>
            {todayHabits.map(habit => {
              const todayProgress = progress.find(p => p.habitId === habit.id && p.date === today);
              const isCompleted = todayProgress?.completed || false;
              const IconComponent = Icons[habit.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>;
              return (
                <div key={habit.id} className={`p-4 rounded-lg border-2 ${
                  isCompleted ? 'border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/30' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: habit.color + '20' }}
                      >
                        {IconComponent && <IconComponent className="w-4 h-4" style={{ color: habit.color }} />}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{habit.name}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{habit.description}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isCompleted 
                        ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-400' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}>
                      {isCompleted ? 'Completed' : 'Pending'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      
      case 'active':
        return (
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300 mb-4">All active habits ({activeHabits.length} total)</p>
            {activeHabits.map(habit => {
              const IconComponent = Icons[habit.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>;
              return (
                <div key={habit.id} className="p-4 rounded-lg border border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/30">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: habit.color + '20' }}
                    >
                      {IconComponent && <IconComponent className="w-4 h-4" style={{ color: habit.color }} />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">{habit.name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{habit.description}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        Target days: {habit.targetDays.map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      
      case 'weekly':
        return (
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300 mb-4">Weekly completion rate: {Math.round(stats.weeklyCompletionRate)}%</p>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              This shows your average completion rate across all active habits for the past 7 days.
            </div>
          </div>
        );
      
      case 'streak':
        return (
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300 mb-4">Best current streak: {stats.bestStreak} days</p>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              This is the longest current streak among all your active habits. Keep it up!
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center transition-colors duration-200">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading your habits...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center transition-colors duration-200">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Something went wrong</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Track your daily habits and build lasting routines</p>
            {user && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Welcome back, {user.email}</p>
            )}
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Current time (IST): {getTodayIST().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
            </p>
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            disabled={isSubmitting}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Add Habit</span>
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Today's Progress"
            value={`${stats.todayCompleted}/${stats.todayTotal}`}
            icon={Target}
            color="#10B981"
            subtitle={`${stats.todayTotal > 0 ? Math.round((stats.todayCompleted / stats.todayTotal) * 100) : 0}% complete`}
            clickable={true}
            onClick={() => openModal('today')}
          />
          <StatCard
            title="Active Habits"
            value={stats.activeHabits}
            icon={TrendingUp}
            color="#10B981"
            subtitle={`${stats.totalHabits} total habits`}
            clickable={true}
            onClick={() => openModal('active')}
          />
          <StatCard
            title="Weekly Average"
            value={`${Math.round(stats.weeklyCompletionRate)}%`}
            icon={Calendar}
            color="#10B981"
            subtitle="Completion rate"
            clickable={true}
            onClick={() => openModal('weekly')}
          />
          <StatCard
            title="Best Streak"
            value={`${stats.bestStreak} days`}
            icon={CheckSquare}
            color="#10B981"
            subtitle="Current best"
            clickable={true}
            onClick={() => openModal('streak')}
          />
        </div>

        {/* Habits */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Your Habits</h2>
          {activeHabits.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-green-200 dark:border-gray-700 shadow-sm">
              <Target className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No habits yet</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Start building great habits by creating your first one!
              </p>
              <button
                onClick={() => setIsFormOpen(true)}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                Create Your First Habit
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeHabits.map((habit) => (
                <div key={habit.id} onClick={() => openHabitDetail(habit)} className="cursor-pointer">
                  <HabitCard
                    habit={habit}
                    progress={progress}
                    onToggleProgress={handleToggleProgress}
                    onEdit={handleEditHabit}
                    onDelete={handleDeleteHabit}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <HabitForm
          habit={editingHabit}
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          onSubmit={editingHabit ? handleUpdateHabit : handleAddHabit}
        />

        <StatModal
          isOpen={modalState.isOpen}
          onClose={closeModal}
          title={
            modalState.type === 'today' ? "Today's Progress" :
            modalState.type === 'active' ? 'Active Habits' :
            modalState.type === 'weekly' ? 'Weekly Average' :
            modalState.type === 'streak' ? 'Best Streak' : ''
          }
        >
          {renderModalContent()}
        </StatModal>

        <HabitDetailModal
          isOpen={habitDetailModal.isOpen}
          onClose={closeHabitDetail}
          habit={habitDetailModal.habit}
          progress={progress}
        />
      </div>
    </div>
  );
}