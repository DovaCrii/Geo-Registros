"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useToast } from "@/lib/toast-context";
import { markAllNotificationsRead, markNotificationRead } from "@/server/notifications/actions";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  link: string | null;
  createdAt: string;
};

const TYPE_ICONS: Record<string, string> = {
  PERMISSION_TRANSITION: "🔷",
  DOCUMENT_ATTACHED: "📎",
  DOCUMENT_REMOVED: "🗑",
  NOTE_ADDED: "📝",
  EXPIRY_ALERT: "⏰",
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);

  if (mins < 1) return "ahora";
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `hace ${days}d`;
}

export function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const pageSize = 10;

  const fetchNotifications = useCallback(async (pageNum = 1, append = false) => {
    setLoading(true);
    try {
      const [notifRes, unreadRes] = await Promise.all([
        fetch(`/api/notifications?page=${pageNum}&pageSize=${pageSize}`),
        fetch("/api/notifications/unread"),
      ]);
      if (notifRes.ok) {
        const data = await notifRes.json();
        setNotifications((prev) =>
          append ? [...prev, ...data.notifications] : data.notifications,
        );
        setTotal(data.pagination.total);
        setPage(pageNum);
      }
      if (unreadRes.ok) {
        const { count } = await unreadRes.json();
        setUnreadCount(count);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications(1);
    const interval = setInterval(() => fetchNotifications(1), 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const showMore = notifications.length < total;

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    toast("info", "Todas las notificaciones marcadas como leídas");
  };

  const handleOpen = () => {
    setOpen(!open);
    if (!open) fetchNotifications(1);
  };

  return (
    <div ref={panelRef} className="relative">
      {/* Bell button */}
      <button
        onClick={handleOpen}
        className="relative rounded-xl p-2 text-slate-400 transition hover:bg-slate-800/60 hover:text-white"
        aria-label="Notificaciones"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-cyan-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-2xl border border-slate-800/80 bg-slate-950/95 shadow-2xl shadow-slate-950/50 backdrop-blur-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-3">
            <h3 className="text-sm font-semibold text-white">Notificaciones</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-cyan-300 transition hover:text-cyan-200"
              >
                Marcar todas leídas
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <p className="p-4 text-center text-xs text-slate-500">Cargando...</p>
            ) : notifications.length === 0 ? (
              <p className="p-4 text-center text-xs text-slate-500">Sin notificaciones</p>
            ) : (
              <>
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`flex gap-3 border-b border-slate-800/50 px-4 py-3 transition ${
                      n.read ? "opacity-70" : "bg-cyan-500/5 hover:bg-cyan-500/10"
                    }`}
                  >
                    <span className="mt-0.5 text-sm">{TYPE_ICONS[n.type] ?? "🔔"}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white">
                        {n.link ? (
                          <Link
                            href={n.link}
                            onClick={() => {
                              if (!n.read) handleMarkRead(n.id);
                              setOpen(false);
                            }}
                            className="hover:text-cyan-300"
                          >
                            {n.title}
                          </Link>
                        ) : (
                          n.title
                        )}
                      </p>
                      <p className="truncate text-xs text-slate-400">{n.message}</p>
                      <p className="mt-0.5 text-[10px] text-slate-600">{timeAgo(n.createdAt)}</p>
                    </div>
                    {!n.read && (
                      <button
                        onClick={() => handleMarkRead(n.id)}
                        className="mt-1 shrink-0 rounded-full bg-cyan-500/20 p-1 text-[10px] text-cyan-300 transition hover:bg-cyan-500/30"
                        aria-label="Marcar como leída"
                      >
                        ✓
                      </button>
                    )}
                  </div>
                ))}

                {/* Load more */}
                {showMore && (
                  <button
                    onClick={() => fetchNotifications(page + 1, true)}
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 px-4 py-3 text-xs text-slate-400 transition hover:bg-slate-800/30 hover:text-cyan-300 disabled:opacity-50"
                  >
                    {loading ? (
                      "Cargando..."
                    ) : (
                      <>
                        Ver más ({notifications.length} de {total})
                      </>
                    )}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
