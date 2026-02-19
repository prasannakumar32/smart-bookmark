import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { useTranslation } from '@/lib/language-context';
import { useSettings } from '@/lib/settings-context';
import { UserProfileDropdown } from './user-profile-dropdown';

interface Bookmark {
  id: string;
  title: string;
  url: string;
  user_id: string;
  created_at: string;
}

export function BookmarksComponent() {
  const { session } = useAuth();
  const { t } = useTranslation();
  const { settings } = useSettings();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');
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
    
    // Store in localStorage for cross-tab sync
    if (data) {
      localStorage.setItem(`bookmarks_${session.user.id}`, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    }
  };

  // Real-time subscription handler
  const handleRealtimeUpdate = useCallback((payload: any) => {
    console.log('Real-time update received:', payload);
    setSyncStatus('syncing');
    
    let updatedBookmarks: Bookmark[] = [];
    
    if (payload.eventType === 'INSERT') {
      console.log('Adding bookmark from real-time:', payload.new);
      updatedBookmarks = [payload.new, ...bookmarks];
      setBookmarks(updatedBookmarks);
    } else if (payload.eventType === 'DELETE') {
      console.log('Removing bookmark from real-time:', payload.old.id);
      updatedBookmarks = bookmarks.filter((b) => b.id !== payload.old.id);
      setBookmarks(updatedBookmarks);
    } else if (payload.eventType === 'UPDATE') {
      console.log('Updating bookmark from real-time:', payload.new);
      updatedBookmarks = bookmarks.map((b) => 
        b.id === payload.new.id ? payload.new : b
      );
      setBookmarks(updatedBookmarks);
    }
    
    // Update localStorage for cross-tab sync
    if (updatedBookmarks.length > 0 || payload.eventType === 'DELETE') {
      if (session?.user) {
        localStorage.setItem(`bookmarks_${session.user.id}`, JSON.stringify({
          data: updatedBookmarks,
          timestamp: Date.now()
        }));
        
        // Trigger storage event for other tabs
        window.dispatchEvent(new StorageEvent('storage', {
          key: `bookmarks_${session.user.id}`,
          newValue: JSON.stringify({
            data: updatedBookmarks,
            timestamp: Date.now()
          })
        }));
      }
    }
    
    setTimeout(() => setSyncStatus('synced'), 1000);
  }, [bookmarks, session?.user]);

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
        handleRealtimeUpdate
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Real-time subscription established');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Real-time subscription error');
          // Fallback to polling if real-time fails
          startPolling();
        }
      });

    // Fallback polling mechanism
    const startPolling = () => {
      const pollInterval = setInterval(() => {
        fetchBookmarks();
      }, 5000); // Poll every 5 seconds
      
      return () => clearInterval(pollInterval);
    };

    // Listen for localStorage changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `bookmarks_${session.user.id}` && e.newValue) {
        try {
          const { data, timestamp } = JSON.parse(e.newValue);
          // Only update if data is newer than current state
          if (timestamp > Date.now() - 10000) { // Within 10 seconds
            setBookmarks(data);
          }
        } catch (error) {
          console.error('Error parsing localStorage data:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Check for initial localStorage data
    const storedBookmarks = localStorage.getItem(`bookmarks_${session.user.id}`);
    if (storedBookmarks) {
      try {
        const { data, timestamp } = JSON.parse(storedBookmarks);
        // Use cached data if it's less than 30 seconds old
        if (Date.now() - timestamp < 30000) {
          setBookmarks(data);
        }
      } catch (error) {
        console.error('Error parsing stored bookmarks:', error);
      }
    }

    return () => {
      channel.unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
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
        const newBookmarks = [data[0], ...bookmarks];
        setBookmarks(newBookmarks);
        
        // Update localStorage for cross-tab sync
        if (session?.user) {
          localStorage.setItem(`bookmarks_${session.user.id}`, JSON.stringify({
            data: newBookmarks,
            timestamp: Date.now()
          }));
          
          // Trigger storage event for other tabs
          window.dispatchEvent(new StorageEvent('storage', {
            key: `bookmarks_${session.user.id}`,
            newValue: JSON.stringify({
              data: newBookmarks,
              timestamp: Date.now()
            })
          }));
        }
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
      const newBookmarks = bookmarks.filter((b) => b.id !== id);
      setBookmarks(newBookmarks);
      
      // Update localStorage for cross-tab sync
      if (session?.user) {
        localStorage.setItem(`bookmarks_${session.user.id}`, JSON.stringify({
          data: newBookmarks,
          timestamp: Date.now()
        }));
        
        // Trigger storage event for other tabs
        window.dispatchEvent(new StorageEvent('storage', {
          key: `bookmarks_${session.user.id}`,
          newValue: JSON.stringify({
            data: newBookmarks,
            timestamp: Date.now()
          })
        }));
      }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Smart Bookmarks</h1>
            </div>
            <UserProfileDropdown />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* User Info Card */}
        <div className="bg-white dark:bg-gray-800 backdrop-blur-lg rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-8 animate-fadeIn">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Welcome back</p>
              <p className="text-lg font-semibold text-gray-800 dark:text-white">{session?.user?.email}</p>
            </div>
          </div>
        </div>

        {/* Add Bookmark Form */}
        <div className="bg-white dark:bg-gray-800 backdrop-blur-lg rounded-2xl border border-gray-200 dark:border-gray-700 p-8 mb-8 animate-fadeIn">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">{t('bookmarks.addNew')}</h2>
          </div>
          
          <form onSubmit={handleAddBookmark} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('bookmarks.title')}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    console.log('Title input changed:', e.target.value);
                    setTitle(e.target.value);
                  }}
                  placeholder={t('bookmarks.titlePlaceholder')}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 bg-white dark:bg-gray-700 text-black dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('bookmarks.url')}
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => {
                    console.log('URL input changed:', e.target.value);
                    setUrl(e.target.value);
                  }}
                  placeholder={t('bookmarks.urlPlaceholder')}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 bg-white dark:bg-gray-700 text-black dark:text-white"
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
                  {t('bookmarks.adding')}
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {t('bookmarks.addBookmark')}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Bookmarks List */}
        <div className="bg-white dark:bg-gray-800 backdrop-blur-lg rounded-2xl border border-gray-200 dark:border-gray-700 p-8 animate-fadeIn min-h-[200px]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">{t('bookmarks.title')}</h2>
              {/* Sync Status Indicator */}
              <div className="flex items-center gap-1">
                {syncStatus === 'syncing' && (
                  <div className="flex items-center gap-1 text-blue-500">
                    <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs text-blue-500">Syncing...</span>
                  </div>
                )}
                {syncStatus === 'synced' && (
                  <div className="flex items-center gap-1 text-green-500">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs text-green-500">Synced</span>
                  </div>
                )}
                {syncStatus === 'error' && (
                  <div className="flex items-center gap-1 text-red-500">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs text-red-500">Sync Error</span>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm font-medium">
              {bookmarks.length} {bookmarks.length === 1 ? 'bookmark' : 'bookmarks'}
            </div>
          </div>
          
          {bookmarks.length === 0 ? (
            <div className="text-center py-16 bg-gradient-to-br from-blue-50/50 dark:from-gray-800/50 to-transparent rounded-xl">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">{t('bookmarks.noBookmarks')}</h3>
              <p className="text-gray-600 dark:text-gray-400">{t('bookmarks.noBookmarksDesc')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookmarks.map((bookmark, index) => (
                <div
                  key={bookmark.id}
                  className="group flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 animate-fadeIn"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <a
                        href={bookmark.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 block truncate"
                      >
                        {bookmark.title}
                      </a>
                      <p className="text-gray-500 dark:text-gray-400 text-sm truncate">{bookmark.url}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => openDeleteDialog(bookmark)}
                    className="ml-4 text-red-400 hover:text-red-300 dark:hover:text-red-400 hover:bg-red-500/20 dark:hover:bg-red-500/30 p-2 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
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

      {/* Delete Confirmation Dialog - Moved outside main container */}
      {deleteDialog.isOpen && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-md mx-4 border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="text-red-600 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Bookmark</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete "<span className="font-semibold">{deleteDialog.bookmarkTitle}</span>"? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={closeDeleteDialog}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
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
