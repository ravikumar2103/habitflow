import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onClick?: () => void;
  clickable?: boolean;
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  subtitle, 
  trend, 
  onClick, 
  clickable = false 
}: StatCardProps) {
  const CardContent = () => (
    <>
      <div className="flex items-center justify-between mb-4">
        <div 
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: color + '20' }}
        >
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 text-sm ${
            trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            <span>{trend.isPositive ? '+' : ''}{trend.value}%</span>
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h3>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</p>
        {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>}
      </div>
    </>
  );

  if (clickable && onClick) {
    return (
      <button
        onClick={onClick}
        className="bg-white dark:bg-gray-800 rounded-xl border border-green-200 dark:border-gray-700 p-6 hover:shadow-lg hover:border-green-300 dark:hover:border-green-600 transition-all duration-200 text-left w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transform hover:scale-105"
      >
        <CardContent />
      </button>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-green-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200">
      <CardContent />
    </div>
  );
}