import React, { useState } from 'react';
import { Settings as SettingsIcon, Download, Upload, Trash2, RefreshCw, User } from 'lucide-react';
import { useFirestore } from '../hooks/useFirestore';
import { useAuth } from '../hooks/useAuth';

export function Settings() {
  const { user, signOut } = useAuth();
  const { habits, progress } = useFirestore(user?.uid || null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const exportData = () => {
    setIsExporting(true);
    
    const data = {
      habits,
      progress,
      exportDate: new Date().toISOString(),
      version: '1.0.0',
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habitflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setTimeout(() => setIsExporting(false), 1000);
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        
        if (importedData.habits && importedData.progress) {
          // Note: In a real implementation, you would need to implement
          // import functionality that adds the data to Firestore
          alert('Import functionality would be implemented to add data to your Firestore database');
        } else {
          alert('Invalid backup file format');
        }
      } catch (error) {
        alert('Error importing data. Please check the file format.');
      } finally {
        setIsImporting(false);
      }
    };
    
    reader.readAsText(file);
  };

  const handleSignOut = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      try {
        await signOut();
      } catch (error) {
        console.error('Error signing out:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
          <p className="text-gray-600 dark:text-gray-300">Manage your app preferences and data</p>
        </div>

        <div className="space-y-6">
          {/* Account Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-green-200 dark:border-gray-700 shadow-sm p-6 transition-colors duration-200">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Account Information</span>
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">Email</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{user?.email}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">Account Status</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Active</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="ml-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-green-200 dark:border-gray-700 shadow-sm p-6 transition-colors duration-200">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <SettingsIcon className="w-5 h-5" />
              <span>Data Management</span>
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">Export Data</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Download a backup of all your habits and progress</p>
                </div>
                <button
                  onClick={exportData}
                  disabled={isExporting}
                  className="ml-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>{isExporting ? 'Exporting...' : 'Export'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">Import Data</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Restore from a previously exported backup file</p>
                </div>
                <div className="ml-4">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileImport}
                    className="hidden"
                    id="import-file"
                  />
                  <label
                    htmlFor="import-file"
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{isImporting ? 'Importing...' : 'Import'}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* App Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-green-200 dark:border-gray-700 shadow-sm p-6 transition-colors duration-200">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">App Information</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-green-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-300">Total Habits</span>
                <span className="font-medium text-gray-900 dark:text-white">{habits.length}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-green-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-300">Active Habits</span>
                <span className="font-medium text-gray-900 dark:text-white">{habits.filter(h => h.isActive).length}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-green-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-300">Total Progress Entries</span>
                <span className="font-medium text-gray-900 dark:text-white">{progress.length}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-green-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-300">Data Storage</span>
                <span className="font-medium text-gray-900 dark:text-white">Cloud (Firestore)</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-gray-600 dark:text-gray-300">Version</span>
                <span className="font-medium text-gray-900 dark:text-white">1.0.0</span>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-green-200 dark:border-gray-700 shadow-sm p-6 transition-colors duration-200">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">About HabitFlow</h2>
            <div className="prose text-gray-600 dark:text-gray-300">
              <p className="mb-4">
                HabitFlow is a beautiful and intuitive habit tracking application designed to help you build lasting routines and achieve your goals.
              </p>
              <p className="mb-4">
                Features include:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Create and manage unlimited habits</li>
                <li>Track daily progress with visual indicators</li>
                <li>View detailed statistics and insights</li>
                <li>Calendar view for monthly progress overview</li>
                <li>Cloud synchronization across devices</li>
                <li>Data export and import capabilities</li>
                <li>Responsive design for all devices</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}