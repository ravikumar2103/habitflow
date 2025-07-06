export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function getToday(): string {
  return formatDateIST(getTodayIST());
}

export function getTodayIST(): Date {
  // Get current date in IST timezone
  const now = new Date();
  const istDate = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
  return istDate;
}

export function getCurrentTimeIST(): Date {
  return getTodayIST();
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function isSameDate(date1: Date, date2: Date): boolean {
  return formatDate(date1) === formatDate(date2);
}

export function getDayOfWeek(date: Date): number {
  return date.getDay();
}

export function isTargetDay(habit: { targetDays: number[] }, date: Date): boolean {
  const dayOfWeek = getDayOfWeek(date);
  return habit.targetDays.includes(dayOfWeek);
}

export function formatDateIST(date: Date): string {
  // Format date as YYYY-MM-DD in IST
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatTimeIST(date: Date): string {
  return date.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour12: true
  });
}

export function createDateFromIST(year: number, month: number, day: number): Date {
  // Create a date object for the given IST date
  return new Date(year, month, day);
}