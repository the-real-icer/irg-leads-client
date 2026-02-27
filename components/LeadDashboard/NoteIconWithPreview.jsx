import { useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { FaComment, FaRegComment } from 'react-icons/fa';
import IrgApi from '../../assets/irgApi';

const formatRelativeTime = (dateStr) => {
    if (!dateStr) return '';
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const NoteIconWithPreview = ({ delivery, leadId, isLoggedIn, onOpenNotes }) => {
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);
    const [position, setPosition] = useState('below');

    const hoverTimerRef = useRef(null);
    const hideTimerRef = useRef(null);
    const containerRef = useRef(null);
    const fetchedRef = useRef(false);

    const hasNotes = (delivery.total_notes || 0) > 0;
    const unreadCount = delivery.unread_notes || 0;

    // Fetch preview data (once per mount, on first hover)
    const fetchPreview = useCallback(async () => {
        if (fetchedRef.current || !hasNotes) return;
        fetchedRef.current = true;
        setLoading(true);
        try {
            const response = await IrgApi.get(
                `/users/dashboard/${leadId}/properties/${delivery._id}/notes/preview`,
                { headers: { Authorization: `Bearer ${isLoggedIn}` } },
            );
            if (response.data.status === 'success') {
                setPreview(response.data.data);
            }
        } catch (error) {
            // Error handled — preview state remains empty
            fetchedRef.current = false;
        } finally {
            setLoading(false);
        }
    }, [delivery._id, leadId, isLoggedIn, hasNotes]);

    // Compute popover position (flip if near bottom of viewport)
    const computePosition = useCallback(() => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        setPosition(spaceBelow < 220 ? 'above' : 'below');
    }, []);

    // Mouse enter: start 250ms delay, then show popover
    const handleMouseEnter = useCallback(() => {
        if (!hasNotes) return;
        clearTimeout(hideTimerRef.current);
        hoverTimerRef.current = setTimeout(() => {
            computePosition();
            setVisible(true);
            fetchPreview();
        }, 250);
    }, [hasNotes, computePosition, fetchPreview]);

    // Mouse leave: hide with short delay (allows moving to popover)
    const handleMouseLeave = useCallback(() => {
        clearTimeout(hoverTimerRef.current);
        hideTimerRef.current = setTimeout(() => {
            setVisible(false);
        }, 150);
    }, []);

    // When hovering over the popover itself, cancel hide
    const handlePopoverEnter = useCallback(() => {
        clearTimeout(hideTimerRef.current);
    }, []);

    const handlePopoverLeave = useCallback(() => {
        hideTimerRef.current = setTimeout(() => {
            setVisible(false);
        }, 150);
    }, []);

    // Click: open full notes panel + close popover
    const handleClick = useCallback(() => {
        clearTimeout(hoverTimerRef.current);
        setVisible(false);
        onOpenNotes();
    }, [onOpenNotes]);

    // Cleanup timers on unmount
    useEffect(() => {
        return () => {
            clearTimeout(hoverTimerRef.current);
            clearTimeout(hideTimerRef.current);
        };
    }, []);

    // Reset fetched state when total_notes changes (after new note created)
    useEffect(() => {
        fetchedRef.current = false;
        setPreview(null);
    }, [delivery.total_notes]);

    const isTouchDevice = typeof window !== 'undefined' && 'ontouchstart' in window;

    return (
        <div
            className="note-icon-wrapper"
            ref={containerRef}
            onMouseEnter={isTouchDevice ? undefined : handleMouseEnter}
            onMouseLeave={isTouchDevice ? undefined : handleMouseLeave}
        >
            {/* Clickable icon button */}
            <button
                className={`note-icon-btn ${hasNotes ? 'note-icon-btn--has-notes' : 'note-icon-btn--empty'}`}
                onClick={handleClick}
                type="button"
                aria-label={`Notes${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
            >
                {hasNotes ? (
                    <FaComment className="note-icon-btn__icon" />
                ) : (
                    <FaRegComment className="note-icon-btn__icon" />
                )}
                {unreadCount > 0 && (
                    <span className="note-icon-btn__badge">{unreadCount}</span>
                )}
            </button>

            {/* Hover popover */}
            {visible && (
                <div
                    className={`note-preview note-preview--${position}`}
                    onMouseEnter={handlePopoverEnter}
                    onMouseLeave={handlePopoverLeave}
                >
                    <div className="note-preview__header">
                        <span className="note-preview__title">
                            Messages ({delivery.total_notes})
                        </span>
                    </div>

                    <div className="note-preview__messages">
                        {loading ? (
                            <div className="note-preview__loading">
                                <i className="pi pi-spin pi-spinner"></i>
                            </div>
                        ) : preview && preview.length > 0 ? (
                            preview.map((note) => (
                                <div
                                    key={note._id}
                                    className={`note-preview__bubble ${
                                        note.author_type === 'agent'
                                            ? 'note-preview__bubble--agent'
                                            : 'note-preview__bubble--user'
                                    }`}
                                >
                                    <div className="note-preview__bubble-header">
                                        <span className="note-preview__bubble-author">
                                            {note.author_name}
                                        </span>
                                        <span className="note-preview__bubble-time">
                                            {formatRelativeTime(note.created_at)}
                                        </span>
                                    </div>
                                    <div className="note-preview__bubble-body">
                                        {note.body}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="note-preview__loading">No messages</div>
                        )}
                    </div>

                    <div className="note-preview__footer">
                        Click to open full conversation
                    </div>
                </div>
            )}
        </div>
    );
};

NoteIconWithPreview.propTypes = {
    delivery: PropTypes.object.isRequired,
    leadId: PropTypes.string.isRequired,
    isLoggedIn: PropTypes.string.isRequired,
    onOpenNotes: PropTypes.func.isRequired,
};

export default NoteIconWithPreview;
