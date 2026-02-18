'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

export function UserProfileDropdown() {
  const { session, signOut } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get user email with multiple fallbacks
  const getUserEmail = () => {
    return session?.user?.user_metadata?.email || 
           session?.user?.email || 
           'user@example.com';
  };

  // Extract username from email (part before @gmail.com)
  const getUsername = (email: string) => {
    const username = email.split('@')[0];
    return username.charAt(0).toUpperCase() + username.slice(1);
  };

  // Get avatar URL from multiple possible locations
  const getAvatarUrl = () => {
    return session?.user?.user_metadata?.avatar_url ||
           session?.user?.user_metadata?.picture ||
           session?.user?.identities?.[0]?.identity_data?.avatar_url ||
           session?.user?.identities?.[0]?.identity_data?.picture;
  };

  // Get first letter for avatar
  const getAvatarLetter = (email: string) => {
    const username = email.split('@')[0];
    return username.charAt(0).toUpperCase();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!session?.user?.user_metadata?.email && !session?.user?.email) {
    console.log('No session or email found', session);
    return null;
  }

  const userEmail = getUserEmail();
  const avatarUrl = getAvatarUrl();
  console.log("Session object:", session); // Add this line to inspect the session object
  console.log("Avatar URL:", avatarUrl); // Check avatar URL specifically
  console.log("User metadata:", session?.user?.user_metadata); // Check all user metadata
  console.log("User identities:", session?.user?.identities); // Check identities for Google avatar
  console.log('Session data:', session);
  console.log('User email:', userEmail);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 group"
      >
        {/* User Avatar */}
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-200">
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt="Profile" 
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-white font-bold text-xl">
              {getAvatarLetter(getUserEmail())}
            </span>
          )}
        </div>
        
        {/* User Info */}
        <div className="hidden md:block text-left">
          <p className="text-sm font-semibold text-gray-800">
            {getUsername(userEmail)}
          </p>
          <p className="text-xs text-gray-500">
            {userEmail}
          </p>
        </div>

        {/* Dropdown Arrow */}
        <svg 
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-fadeIn">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-3xl">
                    {getAvatarLetter(userEmail)}
                  </span>
                )}
              </div>
              <div className="text-white">
                <h3 className="font-bold text-lg">
                  {getUsername(userEmail)}
                </h3>
                <p className="text-sm opacity-90">
                  {userEmail}
                </p>
                <p className="text-xs opacity-75 mt-1">
                  Member since {new Date(session.user?.created_at).toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-2">
            <div className="space-y-1">
              {/* Profile Item */}
              <button 
                onClick={() => {
                  setIsOpen(false);
                  router.push('/profile');
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200 text-left group"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Profile</p>
                  <p className="text-xs text-gray-500">View your profile</p>
                </div>
              </button>

              {/* Settings Item */}
              <button 
                onClick={() => {
                  setIsOpen(false);
                  router.push('/settings');
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200 text-left group"
              >
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c-.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426-1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Settings</p>
                  <p className="text-xs text-gray-500">Preferences and privacy</p>
                </div>
              </button>

              {/* Divider */}
              <div className="border-t border-gray-200 my-2"></div>

              {/* Sign Out Item */}
              <button
                onClick={async () => {
                  setIsOpen(false);
                  await signOut();
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 transition-colors duration-200 text-left group"
              >
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-red-600">Sign Out</p>
                  <p className="text-xs text-gray-500">Sign out of your account</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
