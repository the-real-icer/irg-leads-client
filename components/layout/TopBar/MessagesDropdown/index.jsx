import { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import IrgApi from '../../../../assets/irgApi';
import styles from './MessagesDropdown.module.scss';

const MessagesDropdown = () => {
    const router = useRouter();
    const isLoggedIn = useSelector((state) => state.isLoggedIn);
    const agent = useSelector((state) => state.agent);
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const dropdownRef = useRef(null);
    const intervalRef = useRef(null);

    const fetchMessages = useCallback(async () => {
        try {
            const res = await IrgApi.get('/users/dashboard/messages', {
                headers: { Authorization: `Bearer ${isLoggedIn}` },
            });
            setMessages(res.data.data || []);
            setUnreadCount(res.data.unread_count || 0);
        } catch (err) {
            console.error('Failed to fetch messages:', err);
        } finally {
            setLoading(false);
        }
    }, [isLoggedIn]);

    // Initial fetch + 60s polling (only when authenticated)
    useEffect(() => {
        if (!isLoggedIn || !agent?._id) return;
        fetchMessages();
        intervalRef.current = setInterval(fetchMessages, 60000);
        return () => clearInterval(intervalRef.current);
    }, [isLoggedIn, agent, fetchMessages]);

    // Refetch when dropdown opens
    useEffect(() => {
        if (open) fetchMessages();
    }, [open, fetchMessages]);

    // Close on outside click
    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    // Close on route change
    useEffect(() => {
        const handleRouteChange = () => setOpen(false);
        router.events.on('routeChangeStart', handleRouteChange);
        return () => router.events.off('routeChangeStart', handleRouteChange);
    }, [router.events]);

    const handleMessageClick = async (msg) => {
        try {
            if (!msg.isRead) {
                await IrgApi.put(`/users/dashboard/messages/${msg._id}/read`, null, {
                    headers: { Authorization: `Bearer ${isLoggedIn}` },
                });
            }
        } catch (err) {
            console.error('Failed to mark read:', err);
        }
        setOpen(false);
        router.push(`/lead/${msg.leadId}`);
    };

    const formatTime = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays === 1) return 'Yesterday';
        return `${diffDays}d ago`;
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <div className={styles.wrapper} ref={dropdownRef}>
            <button
                type="button"
                className="flex relative items-center justify-center text-foreground-muted hover:text-foreground transition-colors duration-150"
                onClick={() => setOpen((o) => !o)}
                title="Messages"
                aria-label={`Messages${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
            >
                <i className="pi pi-comments text-xl" />
                {unreadCount > 0 && (
                    <span className={styles.badge}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className={`${styles.panel} animate-slide-down`}>
                    <div className={styles.header}>
                        <span>Messages</span>
                        {unreadCount > 0 && (
                            <span className={styles.unreadLabel}>
                                {unreadCount} unread
                            </span>
                        )}
                    </div>

                    <div className={styles.list}>
                        {loading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className={styles.skeletonRow} />
                            ))
                        ) : messages.length === 0 ? (
                            <div className={styles.empty}>
                                <i className="pi pi-comments" />
                                <p>No messages yet</p>
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <button
                                    key={msg._id}
                                    type="button"
                                    className={`${styles.messageRow}${!msg.isRead ? ` ${styles.unread}` : ''}`}
                                    onClick={() => handleMessageClick(msg)}
                                >
                                    <div className={styles.avatar}>
                                        {getInitials(msg.authorName)}
                                    </div>
                                    <div className={styles.content}>
                                        <div className={styles.name}>
                                            {msg.authorName}
                                        </div>
                                        <div className={styles.body}>
                                            {msg.body}
                                        </div>
                                    </div>
                                    <div className={styles.time}>
                                        {formatTime(msg.createdAt)}
                                    </div>
                                </button>
                            ))
                        )}
                    </div>

                    <div className={styles.footer}>
                        <button
                            type="button"
                            onClick={() => {
                                setOpen(false);
                                router.push('/leads');
                            }}
                        >
                            See all leads
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MessagesDropdown;
