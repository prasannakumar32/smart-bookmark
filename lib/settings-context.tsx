'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface Settings {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  autoSave: boolean;
  language: string;
}

interface SettingsContextType {
  settings: Settings;
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  resetSettings: () => void;
}

const defaultSettings: Settings = {
  theme: 'light',
  notifications: true,
  autoSave: true,
  language: 'en'
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('app-settings');
    console.log('=== LOADING SETTINGS ===');
    console.log('Saved settings from localStorage:', savedSettings);
    
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        console.log('Parsed settings:', parsed);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.error('Error parsing settings:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Apply theme
    const applyTheme = () => {
      const root = document.documentElement;
      console.log('=== THEME DEBUG ===');
      console.log('Current settings.theme:', settings.theme);
      console.log('Current root classes before:', root.className);
      
      root.classList.remove('light', 'dark');
      
      if (settings.theme === 'dark') {
        root.classList.add('dark');
        console.log('Applied: dark class');
      } else if (settings.theme === 'light') {
        root.classList.add('light');
        console.log('Applied: light class');
      } else {
        // System theme
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.add(prefersDark ? 'dark' : 'light');
        console.log('Applied system theme:', prefersDark ? 'dark' : 'light');
      }
      
      console.log('Current root classes after:', root.className);
      console.log('Body computed style:', getComputedStyle(document.body).background);
      console.log('==================');
    };

    applyTheme();
    localStorage.setItem('app-settings', JSON.stringify(settings));
  }, [settings.theme]);

  useEffect(() => {
    // Listen for system theme changes when theme is 'system'
    if (settings.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(mediaQuery.matches ? 'dark' : 'light');
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [settings.theme]);

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem('app-settings');
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
