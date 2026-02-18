import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';

interface Bookmark {
  id: string;
  title: string;
  url: string;
  user_id: string;
  created_at: string;
}

export function BookmarksComponent() {
  const { session, signOut } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; bookmarkId: string; bookmarkTitle: string }>({
    isOpen: false,
    bookmarkId: '',
    bookmarkTitle: ''
  });

  // Fetch bookmarks
  const fetchBookmarks = async () => {
    if (!session?.user) return;

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
    if (!session?.user) return;

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
          console.log('Real-time update received:', payload);
          if (payload.eventType === 'INSERT') {
            console.log('Adding bookmark from real-time:', payload.new);
            setBookmarks((prev) => [payload.new, ...prev]);
          } else if (payload.eventType === 'DELETE') {
            console.log('Removing bookmark from real-time:', payload.old.id);
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
    if (!session?.user) {
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
      const { data, error } = await supabase.from('bookmarks').insert({
        title: title.trim(),
        url: url.trim(),
        user_id: session.user.id,
      }).select();

      if (error) throw error;

      // Manually add the new bookmark to state for immediate UI update
      if (data && data[0]) {
        setBookmarks((prev) => [data[0], ...prev]);
      }

      setTitle('');
      setUrl('');
      setError('');
    } catch (err) {
      console.error('Error adding bookmark:', err);
      setError('Failed to add bookmark');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBookmark = async (id: string) => {
    setError('');
    try {
      const { error } = await supabase.from('bookmarks').delete().eq('id', id);
      if (error) throw error;
      
      // Manually remove from state for immediate UI update
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error('Error deleting bookmark:', err);
      setError('Failed to delete bookmark');
    }
  };

  const openDeleteDialog = (bookmark: Bookmark) => {
    setDeleteDialog({
      isOpen: true,
      bookmarkId: bookmark.id,
      bookmarkTitle: bookmark.title
    });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({
      isOpen: false,
      bookmarkId: '',
      bookmarkTitle: ''
    });
  };

  const confirmDelete = async () => {
    if (deleteDialog.bookmarkId) {
      await handleDeleteBookmark(deleteDialog.bookmarkId);
      closeDeleteDialog();
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-lg border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white">Smart Bookmarks</h1>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* User Info Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 mb-8 animate-fadeIn">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-300">Welcome back</p>
              <p className="text-lg font-semibold text-white">{session?.user?.email}</p>
            </div>
          </div>
        </div>

        {/* Add Bookmark Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 mb-8 animate-fadeIn">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">Add New Bookmark</h2>
          </div>
          
          <form onSubmit={handleAddBookmark} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    console.log('Title input changed:', e.target.value);
                    setTitle(e.target.value);
                  }}
                  placeholder="e.g., GitHub, YouTube, etc."
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => {
                    console.log('URL input changed:', e.target.value);
                    setUrl(e.target.value);
                  }}
                  placeholder="https://example.com"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200"
                />
              </div>
            </div>
            
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Adding Bookmark...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Bookmark
                </>
              )}
            </button>
          </form>
        </div>

        {/* Bookmarks List */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 animate-fadeIn">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white">Your Bookmarks</h2>
            </div>
            <div className="bg-white/10 text-gray-300 px-3 py-1 rounded-full text-sm font-medium">
              {bookmarks.length} {bookmarks.length === 1 ? 'bookmark' : 'bookmarks'}
            </div>
          </div>
          
          {bookmarks.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No bookmarks yet</h3>
              <p className="text-gray-400">Add your first bookmark to get started organizing your digital world!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookmarks.map((bookmark, index) => (
                <div
                  key={bookmark.id}
                  className="group flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all duration-200 animate-fadeIn"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <a
                        href={bookmark.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-white hover:text-blue-400 transition-colors duration-200 block truncate"
                      >
                        {bookmark.title}
                      </a>
                      <p className="text-gray-400 text-sm truncate">{bookmark.url}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => openDeleteDialog(bookmark)}
                    className="ml-4 text-red-400 hover:text-red-300 hover:bg-red-500/20 p-2 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteDialog.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <div className="text-center">
              <div className="text-red-600 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Bookmark</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "<span className="font-semibold">{deleteDialog.bookmarkTitle}</span>"? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={closeDeleteDialog}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
