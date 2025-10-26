import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase, getCurrentUser } from '../lib/supabase/client';

function timeAgo(ts) {
  const now = Date.now();
  const then = new Date(ts).getTime();
  const diff = Math.max(0, Math.floor((now - then) / 1000));
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function NotificationBell() {
  const [userId, setUserId] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const channelRef = useRef(null);
  const bellRef = useRef(null);

  useEffect(() => {
    // Close dropdown on outside click
    function onClickOutside(e) {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('click', onClickOutside);
    return () => document.removeEventListener('click', onClickOutside);
  }, []);

  useEffect(() => {
    (async () => {
      const user = await getCurrentUser();
      if (!user) return;
      setUserId(user.id);
      await fetchNotifications(user.id);
      subscribeRealtime(user.id);
    })();
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchNotifications(uid) {
    try {
      setLoading(true);
      const { data, error, count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', uid)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setNotifications(data || []);
      const unread = (data || []).filter(n => !n.read_at).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Notifications fetch error', err);
    } finally {
      setLoading(false);
    }
  }

  function subscribeRealtime(uid) {
    if (channelRef.current) return;
    channelRef.current = supabase
      .channel('notifications-bell')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${uid}`,
        },
        payload => {
          const newItem = payload.new;
          setNotifications(prev => [newItem, ...prev]);
          setUnreadCount(prev => prev + (newItem.read_at ? 0 : 1));
        }
      )
      .subscribe();
  }

  async function markAllAsRead() {
    if (!userId) return;
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', userId)
        .is('read_at', null);
      if (error) throw error;
      setNotifications(prev => prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Mark all read error', err);
    }
  }

  async function markOneAsRead(id) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', id)
        .is('read_at', null);
      if (error) throw error;
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: n.read_at || new Date().toISOString() } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Mark one read error', err);
    }
  }

  const hasNotifications = notifications.length > 0;
  const unreadBadge = useMemo(() => unreadCount > 0 ? unreadCount : null, [unreadCount]);

  return (
    <div className="notification-bell" ref={bellRef}>
      <button
        className="bell-button"
        onClick={() => setOpen(v => !v)}
        aria-label="Notifications"
        title="Notifications"
      >
        <span className="bell-icon">🔔</span>
        {unreadBadge && <span className="bell-badge">{unreadBadge}</span>}
      </button>

      {open && (
        <div className="notifications-dropdown">
          <div className="dropdown-header">
            <span>Notifications</span>
            <button className="mark-all" onClick={markAllAsRead} disabled={unreadCount === 0}>
              Mark all as read
            </button>
          </div>

          <div className="dropdown-body">
            {loading && <div className="loading">Loading…</div>}
            {!loading && !hasNotifications && (
              <div className="empty">No notifications yet</div>
            )}

            {!loading && hasNotifications && (
              <ul className="notifications-list">
                {notifications.map(n => (
                  <li key={n.id} className={`notification-item ${n.read_at ? 'read' : 'unread'}`}>
                    <div className="item-main">
                      <div className="item-title">{n.title || 'Notification'}</div>
                      <div className="item-message">{n.message}</div>
                    </div>
                    <div className="item-meta">
                      <span className="item-time">{timeAgo(n.created_at)}</span>
                      {!n.read_at && (
                        <button className="mark-read" onClick={() => markOneAsRead(n.id)}>Mark read</button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <style>{`
        .notification-bell { position: relative; margin-left: 12px; }
        .bell-button { position: relative; background: transparent; border: none; cursor: pointer; font-size: 16px; }
        .bell-icon { font-size: 18px; }
        .bell-badge { position: absolute; top: -6px; right: -8px; background: #e11d48; color: white; border-radius: 999px; padding: 0 6px; font-size: 11px; line-height: 18px; min-width: 18px; text-align: center; }
        .notifications-dropdown { position: absolute; right: 0; top: 28px; width: 320px; background: #111827; color: #fff; border: 1px solid #374151; border-radius: 8px; box-shadow: 0 10px 20px rgba(0,0,0,0.25); z-index: 50; }
        .dropdown-header { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; border-bottom: 1px solid #374151; }
        .mark-all { background: transparent; border: 1px solid #4b5563; color: #e5e7eb; padding: 4px 8px; border-radius: 6px; font-size: 12px; cursor: pointer; }
        .mark-all:disabled { opacity: 0.5; cursor: default; }
        .dropdown-body { max-height: 360px; overflow: auto; }
        .loading, .empty { padding: 12px; color: #9ca3af; }
        .notifications-list { list-style: none; margin: 0; padding: 0; }
        .notification-item { display: flex; justify-content: space-between; gap: 8px; padding: 10px 12px; border-bottom: 1px solid #1f2937; }
        .notification-item.unread { background: rgba(30, 64, 175, 0.2); }
        .item-title { font-weight: 600; font-size: 14px; }
        .item-message { font-size: 13px; color: #d1d5db; margin-top: 2px; }
        .item-meta { display: flex; align-items: center; gap: 8px; }
        .item-time { font-size: 12px; color: #9ca3af; }
        .mark-read { background: transparent; border: 1px solid #4b5563; color: #e5e7eb; padding: 2px 6px; border-radius: 6px; font-size: 12px; cursor: pointer; }
      `}</style>
    </div>
  );
}