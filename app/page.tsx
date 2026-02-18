'use client';

import { useAuth } from '@/lib/auth-context';
import { LoginComponent } from '@/components/login';
import { BookmarksComponent } from '@/components/bookmarks';

export default function Home() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return session ? <BookmarksComponent /> : <LoginComponent />;
}
