'use client';

import { useEffect, useState, useCallback } from 'react';
import { Bell } from 'lucide-react';
import { createSupabaseClient } from '@/lib/supabase/client';

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message?: string;
  entity_type?: string;
  entity_id?: string;
  read: boolean;
  created_at: string;
}

export function NotificationBell() {
  const supabase = createSupabaseClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/notifications?read=all&page=1&limit=10', { cache: 'no-store' });
      const data = await res.json();
      if (data?.data) {
        setNotifications(data.data);
        setUnreadCount(data.unread_count || 0);
      }
    } catch (err) {
      console.error('Fetch notifications error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshUnread = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications?read=unread&page=1&limit=1', { cache: 'no-store' });
      const data = await res.json();
      setUnreadCount(data?.count || 0);
    } catch (err) {
      console.error('Fetch unread count error:', err);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true })
      });
      await fetchNotifications();
    } catch (err) {
      console.error('Mark all read error:', err);
    }
  }, [fetchNotifications]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      const uid = data?.user?.id || null;
      if (!mounted) return;
      setUserId(uid);
      await fetchNotifications();

      if (uid) {
        const channel = supabase
          .channel('notifications')
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${uid}`,
          }, async () => {
            await refreshUnread();
            if (open) await fetchNotifications();
          })
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      }
    })();
    return () => { mounted = false; };
  }, [supabase, fetchNotifications, refreshUnread, open]);

  return (
    <div className="relative">
      <button
        aria-label="Notifications"
        onClick={() => {
          const next = !open;
          setOpen(next);
          if (next) fetchNotifications();
        }}
        className="relative inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-slate-800">
            <h4 className="text-sm font-semibold">Notifications</h4>
            <button
              onClick={markAllRead}
              className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              Mark all read
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-sm text-slate-500">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-sm text-slate-500">No notifications</div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${n.read ? 'bg-slate-300' : 'bg-red-500'}`}></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{n.title}</div>
                      {n.message && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{n.message}</div>
                      )}
                      <div className="text-xs text-slate-400 mt-1">{new Date(n.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}