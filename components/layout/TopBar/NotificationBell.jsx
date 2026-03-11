import { useState, useRef, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import getLeadDisplayName from '../../../utils/getLeadDisplayName';

const typeIconMap = {
    call: 'pi pi-phone',
    email: 'pi pi-envelope',
    general: 'pi pi-bell',
};

const formatReminderDate = (date, isToday, isTomorrow, isOverdue) => {
    if (isToday) return 'Today';
    if (isTomorrow) return 'Tomorrow';

    const formatted = date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    });

    if (isOverdue) return `Overdue \u2022 ${formatted}`;
    return formatted;
};

const NotificationBell = () => {
    const router = useRouter();
    const allLeads = useSelector((state) => state.allLeadsPage.leads);

    const [open, setOpen] = useState(false);
    const bellRef = useRef(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (bellRef.current && !bellRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Close on route change
    useEffect(() => {
        const handleRoute = () => setOpen(false);
        router.events.on('routeChangeStart', handleRoute);
        return () => router.events.off('routeChangeStart', handleRoute);
    }, [router.events]);

    // Derive upcoming + overdue reminders from Redux lead data
    const upcomingReminders = useMemo(() => {
        if (!allLeads || allLeads.length === 0) return [];

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfTomorrow = new Date(startOfToday.getTime() + 86400000);
        const startOfDayAfterTomorrow = new Date(startOfToday.getTime() + 172800000);
        const sevenDaysOut = new Date(startOfToday);
        sevenDaysOut.setDate(sevenDaysOut.getDate() + 8); // exclusive upper bound

        const reminders = [];

        for (const lead of allLeads) {
            if (!lead.reminders || lead.reminders.length === 0) continue;

            for (const reminder of lead.reminders) {
                if (reminder.completed) continue;

                const reminderDate = new Date(reminder.reminder_date);
                if (Number.isNaN(reminderDate.getTime())) continue;

                // Include overdue (any past date) + next 7 days
                if (reminderDate < sevenDaysOut) {
                    reminders.push({
                        id: reminder.id,
                        description: reminder.description,
                        type: reminder.type || 'general',
                        reminderDate,
                        leadId: lead._id,
                        leadName: getLeadDisplayName(lead),
                        isOverdue: reminderDate < startOfToday,
                        isToday: reminderDate >= startOfToday && reminderDate < startOfTomorrow,
                        isTomorrow: reminderDate >= startOfTomorrow && reminderDate < startOfDayAfterTomorrow,
                    });
                }
            }
        }

        // Overdue first (oldest first), then upcoming (soonest first)
        reminders.sort((a, b) => {
            if (a.isOverdue && !b.isOverdue) return -1;
            if (!a.isOverdue && b.isOverdue) return 1;
            return a.reminderDate - b.reminderDate;
        });

        return reminders;
    }, [allLeads]);

    const count = upcomingReminders.length;

    return (
        <div className="notification-bell" ref={bellRef}>
            {/* Bell Button */}
            <button
                onClick={() => setOpen((prev) => !prev)}
                className="hidden lg:flex relative items-center justify-center text-foreground-muted hover:text-foreground transition-colors duration-150"
                title="Reminders"
                aria-label={`Reminders${count > 0 ? `, ${count} upcoming` : ''}`}
            >
                <i className="pi pi-bell text-xl" />
                {count > 0 && (
                    <span className="notification-bell__badge">
                        {count >= 10 ? '9+' : count}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {open && (
                <div className="notification-bell__panel animate-slide-down">
                    {/* Header */}
                    <div className="notification-bell__header">
                        <div>
                            <p className="notification-bell__title">Upcoming Reminders</p>
                            <p className="notification-bell__subtitle">Next 7 days</p>
                        </div>
                        {count > 0 && (
                            <span className="notification-bell__count">{count}</span>
                        )}
                    </div>

                    {/* List or Empty */}
                    {upcomingReminders.length === 0 ? (
                        <div className="notification-bell__empty">
                            <i className="pi pi-check-circle" />
                            <p>No upcoming reminders</p>
                        </div>
                    ) : (
                        <div className="notification-bell__list">
                            {upcomingReminders.map((reminder) => (
                                <div
                                    key={reminder.id}
                                    className={`notification-bell__item${
                                        reminder.isOverdue
                                            ? ' notification-bell__item--overdue'
                                            : reminder.isToday
                                              ? ' notification-bell__item--today'
                                              : ''
                                    }`}
                                >
                                    <div className="notification-bell__item-icon">
                                        <i className={typeIconMap[reminder.type] || 'pi pi-bell'} />
                                    </div>
                                    <div className="notification-bell__item-content">
                                        <p className="notification-bell__item-desc">
                                            {reminder.description || 'No description'}
                                        </p>
                                        <div className="notification-bell__item-meta">
                                            <span
                                                className={`notification-bell__item-date${
                                                    reminder.isOverdue
                                                        ? ' notification-bell__item-date--overdue'
                                                        : reminder.isToday
                                                          ? ' notification-bell__item-date--today'
                                                          : ''
                                                }`}
                                            >
                                                {formatReminderDate(
                                                    reminder.reminderDate,
                                                    reminder.isToday,
                                                    reminder.isTomorrow,
                                                    reminder.isOverdue
                                                )}
                                            </span>
                                            <span className="notification-bell__item-separator">
                                                &middot;
                                            </span>
                                            <button
                                                onClick={() => {
                                                    setOpen(false);
                                                    router.push(`/lead/${reminder.leadId}`);
                                                }}
                                                className="notification-bell__item-lead"
                                            >
                                                {reminder.leadName}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
