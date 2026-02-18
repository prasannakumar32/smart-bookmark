'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@/lib/auth-context';

interface Bookmark {
  id: string;
  title: string;
  url: string;
  user_id: string;
  created_at: string;
}

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export function BookmarksComponent() {
  const { session, signOut } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch bookmarks
  const fetchBookmarks = async () => {
    if (!session?.user || !supabase) return;

    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bookmarks:', error);
      setError('Failed to load bookmarks');
      return;
    }

    setBookmarks(data || []);
  };

  useEffect(() => {
    fetchBookmarks();

    // Subscribe to real-time changes
    if (!session?.user || !supabase) return;

    const channel = supabase
      .channel(`bookmarks:${session.user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookmarks',
          filter: `user_id=eq.${session.user.id}`,
        },
        (payload: any) => {
          if (payload.eventType === 'INSERT') {
            setBookmarks((prev) => [payload.new, ...prev]);
          } else if (payload.eventType === 'DELETE') {
            setBookmarks((prev) => prev.filter((b) => b.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [session?.user?.id]);

  const handleAddBookmark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user || !supabase) {
      setError('Not logged in');
      return;
    }

    if (!title.trim() || !url.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.from('bookmarks').insert({
        title: title.trim(),
        url: url.trim(),
        user_id: session.user.id,
      });

      if (error) throw error;

      setTitle('');
      setUrl('');
    } catch (err) {
      console.error('Error adding bookmark:', err);
      setError('Failed to add bookmark');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBookmark = async (id: string) => {
    if (!supabase) return;
    
    setError('');
    try {
      const { error } = await supabase.from('bookmarks').delete().eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('Error deleting bookmark:', err);
      setError('Failed to delete bookmark');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-2xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Smart Bookmarks</h1>
          <button
            onClick={handleSignOut}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
          >
            Sign Out
          </button>
        </div>

        {/* User Info */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <p className="text-gray-600">
            Logged in as: <span className="font-semibold">{session?.user?.email}</span>
          </p>
        </div>

        {/* Add Bookmark Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Add New Bookmark</h2>
          <form onSubmit={handleAddBookmark} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., GitHub"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
            >
              {loading ? 'Adding...' : 'Add Bookmark'}
            </button>
          </form>
        </div>

        {/* Bookmarks List */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Your Bookmarks ({bookmarks.length})
          </h2>
          {bookmarks.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No bookmarks yet. Add one to get started!
            </p>
          ) : (
            <ul className="space-y-3">
              {bookmarks.map((bookmark) => (
                <li
                  key={bookmark.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex-1 min-w-0">
                    <a
                      href={bookmark.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-blue-600 hover:text-blue-800 block truncate"
                    >
                      {bookmark.title}
                    </a>
                    <p className="text-gray-500 text-sm truncate">{bookmark.url}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteBookmark(bookmark.id)}
                    className="ml-4 bg-red-100 text-red-600 hover:bg-red-200 px-3 py-1 rounded transition flex-shrink-0"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
