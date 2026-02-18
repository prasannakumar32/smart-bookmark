'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useSettings } from '@/lib/settings-context';
import { useTranslation } from '@/lib/language-context';

export default function SettingsPage() {
  const { session, signOut } = useAuth();
  const { settings, updateSetting } = useSettings();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in</h1>
          <p className="text-gray-600">You need to be signed in to view settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('settings.title')}</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {t('settings.subtitle')}
          </p>
        </div>

        {/* Profile Section */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('settings.profile')}</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-2xl">
                  {session.user.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {session.user.email?.split('@')[0]}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">{session.user.email}</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Member since {new Date(session.user.created_at).toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Appearance Settings */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('settings.appearance')}</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('settings.theme')}
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => updateSetting('theme', 'light')}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                    settings.theme === 'light'
                      ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    {t('settings.light')}
                  </div>
                </button>
                <button
                  onClick={() => updateSetting('theme', 'dark')}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                    settings.theme === 'dark'
                      ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                    {t('settings.dark')}
                  </div>
                </button>
                <button
                  onClick={() => updateSetting('theme', 'system')}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                    settings.theme === 'system'
                      ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {t('settings.system')}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('settings.preferences')}</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">{t('settings.notifications')}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.notificationsDesc')}</p>
              </div>
              <button
                onClick={() => updateSetting('notifications', !settings.notifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.notifications ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.notifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">{t('settings.autoSave')}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.autoSaveDesc')}</p>
              </div>
              <button
                onClick={() => updateSetting('autoSave', !settings.autoSave)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.autoSave ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.autoSave ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('settings.language')}
              </label>
              <select
                value={settings.language}
                onChange={(e) => updateSetting('language', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="zh">中文</option>
                <option value="ja">日本語</option>
              </select>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-red-200 dark:border-red-800">
            <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">{t('settings.dangerZone')}</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">{t('settings.signOut')}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.signOutDesc')}</p>
              </div>
              <button
                onClick={handleSignOut}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? t('settings.signingOut') : t('settings.signOut')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
