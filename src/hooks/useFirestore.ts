import { useState, useEffect } from 'react';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Habit, Progress } from '../types/habit';

export function useFirestore(userId: string | null) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setHabits([]);
      setProgress([]);
      setLoading(false);
      return;
    }

    setError(null);

    // Subscribe to habits - simplified query without orderBy to avoid index requirement
    const habitsQuery = query(
      collection(db, 'habits'),
      where('userId', '==', userId)
    );

    const unsubscribeHabits = onSnapshot(
      habitsQuery, 
      (snapshot) => {
        try {
          const habitsData = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
            };
          }) as Habit[];
          
          // Sort on client side instead of server side
          habitsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          
          setHabits(habitsData);
          setLoading(false);
        } catch (err) {
          console.error('Error processing habits:', err);
          setError('Failed to load habits');
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error fetching habits:', err);
        setError('Failed to load habits');
        setLoading(false);
      }
    );

    // Subscribe to progress
    const progressQuery = query(
      collection(db, 'progress'),
      where('userId', '==', userId)
    );

    const unsubscribeProgress = onSnapshot(
      progressQuery,
      (snapshot) => {
        try {
          const progressData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as Progress[];
          setProgress(progressData);
        } catch (err) {
          console.error('Error processing progress:', err);
        }
      },
      (err) => {
        console.error('Error fetching progress:', err);
      }
    );

    return () => {
      unsubscribeHabits();
      unsubscribeProgress();
    };
  }, [userId]);

  const addHabit = async (habitData: Omit<Habit, 'id' | 'createdAt' | 'isActive'>) => {
    if (!userId) throw new Error('User not authenticated');

    const newHabit = {
      ...habitData,
      userId,
      createdAt: Timestamp.now(),
      isActive: true,
    };

    try {
      const docRef = await addDoc(collection(db, 'habits'), newHabit);
      console.log('Habit added with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding habit:', error);
      throw new Error('Failed to add habit');
    }
  };

  const updateHabit = async (id: string, updates: Partial<Habit>) => {
    if (!userId) throw new Error('User not authenticated');

    try {
      const habitRef = doc(db, 'habits', id);
      await updateDoc(habitRef, updates);
    } catch (error) {
      console.error('Error updating habit:', error);
      throw new Error('Failed to update habit');
    }
  };

  const deleteHabit = async (id: string) => {
    if (!userId) throw new Error('User not authenticated');

    try {
      // Delete the habit
      await deleteDoc(doc(db, 'habits', id));
      
      // Delete all progress entries for this habit
      const habitProgress = progress.filter(p => p.habitId === id);
      const deletePromises = habitProgress.map(p => 
        deleteDoc(doc(db, 'progress', p.id!))
      );
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error deleting habit:', error);
      throw new Error('Failed to delete habit');
    }
  };

  const toggleProgress = async (habitId: string, date: string, note?: string) => {
    if (!userId) throw new Error('User not authenticated');

    const existingProgress = progress.find(p => 
      p.habitId === habitId && p.date === date
    );

    try {
      if (existingProgress) {
        const progressRef = doc(db, 'progress', existingProgress.id!);
        await updateDoc(progressRef, {
          completed: !existingProgress.completed,
          note: note || existingProgress.note,
        });
      } else {
        const newProgress = {
          habitId,
          date,
          completed: true,
          note: note || null, // Ensure note is never undefined
          userId,
        };
        await addDoc(collection(db, 'progress'), newProgress);
      }
    } catch (error) {
      console.error('Error toggling progress:', error);
      throw new Error('Failed to update progress');
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
    loading,
    error,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleProgress,
    getProgressForDate,
    getProgressForHabit,
  };
}