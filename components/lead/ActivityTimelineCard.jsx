import dynamic from 'next/dynamic';

const Card = dynamic(() => import('primereact/card').then((mod) => mod.Card), { ssr: false });

const ACTIVITY_LABELS = {
    'lead.note.created': 'Note added',
    'lead.call.logged': 'Call logged',
    'lead.owner.changed': 'Lead owner changed',
    'lead.category.changed': 'Category changed',
    'lead.type.changed': 'Lead type changed',
    'lead.reminder.created': 'Reminder created',
    'lead.reminder.updated': 'Reminder updated',
    'lead.reminder.completed': 'Reminder completed',
    'lead.reminder.deleted': 'Reminder deleted',
    'lead.e_alert.created': 'E-alert created',
    'lead.e_alert.updated': 'E-alert updated',
    'lead.e_alert.deleted': 'E-alert deleted',
    'lead.drip.enrolled': 'Enrolled in drip campaign',
    'lead.drip.unenrolled': 'Unenrolled from drip campaign',
    'property.sent.agent_direct': 'Properties sent',
    'property_note.created.agent': 'Property note added',
    'showing.status.changed': 'Showing status changed',
    'email.sent.gmail': 'Gmail email sent',
    'calendar.event.created': 'Calendar event created',
    'lead.google_contact.created': 'Google contact created',
};

const ACTIVITY_METADATA_LABELS = {
    frequency: 'Frequency',
    enabled: 'Enabled',
    active: 'Active',
    status: 'Status',
    propertyCount: 'Properties',
    successfulRecipientCount: 'Sent',
    failedRecipientCount: 'Failed',
    coBuyerCount: 'Co-buyers',
    campaignName: 'Campaign',
    campaignType: 'Campaign Type',
    timeframe: 'Timeframe',
    hasLead: 'Lead Linked',
    recipientCount: 'Recipients',
    subject: 'Subject',
    title: 'Title',
    start: 'Start',
    end: 'End',
    reminderType: 'Reminder Type',
    reminderDate: 'Reminder Date',
    dueDate: 'Due',
    description: 'Details',
    gmailMessageId: 'Gmail ID',
    googleEventId: 'Google Event',
    googleContactResourceName: 'Google Contact',
    channel: 'Channel',
    insertedDeliveryCount: 'Deliveries',
};

const ACTIVITY_CHANGE_LABELS = {
    'backend_profile.lead_category': 'Category',
    'backend_profile.lead_type': 'Lead Type',
    agent_assigned: 'Assigned Agent',
    'reminders.reminder_date': 'Reminder Date',
    reminder_date: 'Reminder Date',
    'reminders.type': 'Reminder Type',
    type: 'Type',
    'reminders.completed': 'Reminder Complete',
    completed: 'Completed',
    'reminders.description': 'Reminder Description',
    description: 'Description',
    searchFrequency: 'Search Frequency',
    frequency: 'Frequency',
    active: 'Active',
    enabled: 'Enabled',
    status: 'Status',
    salesPrice: 'Sale Price',
    acceptanceDate: 'Acceptance Date',
    anticipatedClosingDate: 'Est. Closing',
    actualClosingDate: 'Actual Closing',
    agent: 'Agent',
};

const ACTIVITY_METADATA_BY_TYPE = {
    'lead.reminder.created': ['reminderType', 'reminderDate', 'dueDate', 'description', 'status'],
    'lead.reminder.updated': ['reminderType', 'reminderDate', 'dueDate', 'description', 'status'],
    'lead.reminder.completed': [],
    'lead.reminder.deleted': ['reminderType', 'reminderDate', 'dueDate'],
    'property.sent.agent_direct': [
        'propertyCount',
        'successfulRecipientCount',
        'failedRecipientCount',
        'coBuyerCount',
        'insertedDeliveryCount',
    ],
    'lead.drip.enrolled': ['campaignName', 'campaignType', 'timeframe'],
    'lead.drip.unenrolled': ['campaignName', 'campaignType', 'timeframe'],
    'email.sent.gmail': ['subject'],
    'calendar.event.created': ['title', 'start', 'end'],
    'lead.google_contact.created': [],
    'lead.e_alert.created': ['frequency', 'enabled', 'active', 'status'],
    'lead.e_alert.updated': ['frequency', 'enabled', 'active', 'status'],
    'lead.e_alert.deleted': ['frequency', 'enabled', 'active', 'status'],
};

const getActivityLabel = (type) => {
    if (ACTIVITY_LABELS[type]) return ACTIVITY_LABELS[type];
    if (!type) return 'Activity';

    return type
        .replace(/[._]/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatActivityTimestamp = (occurredAt) => {
    const date = new Date(occurredAt);
    if (Number.isNaN(date.getTime())) return 'Recent';

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
};

const getActivityIcon = (type) => {
    if (type?.includes('reminder')) return 'pi pi-bell';
    if (type?.includes('email') || type?.includes('gmail')) return 'pi pi-envelope';
    if (type?.includes('call')) return 'pi pi-phone';
    if (type?.includes('drip')) return 'pi pi-send';
    if (type?.includes('e_alert')) return 'pi pi-bookmark';
    if (type?.includes('property') || type?.includes('showing')) return 'pi pi-home';
    if (type?.includes('calendar')) return 'pi pi-calendar';
    if (type?.includes('contact')) return 'pi pi-user-plus';
    if (type?.includes('owner') || type?.includes('agent')) return 'pi pi-user-edit';
    return 'pi pi-history';
};

const isUsefulActivityValue = (value, { allowFalse = false, allowZero = false } = {}) => {
    if (value === null || value === undefined) return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object') return Object.keys(value).length > 0;
    if (value === false) return allowFalse;
    if (value === 0) return allowZero;
    if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed !== '' && trimmed.toLowerCase() !== 'none' && trimmed.length <= 80;
    }
    return true;
};

const formatActivityValue = (value, { allowFalse = false, allowZero = false } = {}) => {
    if (!isUsefulActivityValue(value, { allowFalse, allowZero })) return null;
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'number') return String(value);
    if (typeof value !== 'string') return null;

    const date = new Date(value);
    if (/^\d{4}-\d{2}-\d{2}/.test(value) && !Number.isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    }

    return value;
};

const normalizeActivityText = (value) => (
    String(value || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim()
);

const shouldShowActivitySummary = (activity, label) => (
    isUsefulActivityValue(activity?.summary)
    && normalizeActivityText(activity.summary) !== normalizeActivityText(label)
);

const getDisplayMetadataForActivity = (activity) => {
    const metadata = activity?.metadata || {};
    if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return [];

    if (activity?.type === 'lead.google_contact.created') {
        return [{ key: 'googleContactCreated', label: 'Contact', value: 'Added to Google Contacts' }];
    }

    const keys = ACTIVITY_METADATA_BY_TYPE[activity?.type] || ['status', 'subject', 'title'];

    return keys
        .map((key) => {
            const label = ACTIVITY_METADATA_LABELS[key];
            const value = formatActivityValue(metadata[key]);
            return value ? { key, label, value } : null;
        })
        .filter(Boolean);
};

const getDisplayChangesForActivity = (activity) => {
    const changes = activity?.changes || [];
    if (!Array.isArray(changes)) return [];

    return changes
        .map((change) => {
            const label = ACTIVITY_CHANGE_LABELS[change?.path];
            if (!label) return null;

            const before = formatActivityValue(change.before, { allowFalse: true, allowZero: true });
            const after = formatActivityValue(change.after, { allowFalse: true, allowZero: true });
            return before !== null && after !== null ? { label, before, after } : null;
        })
        .filter(Boolean);
};

const ActivityTimelineCard = ({ activityLogs = [], loading = false, error = '' }) => (
    <div className="lead-activity-timeline" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
        <Card>
            <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                color: 'hsl(var(--foreground))',
                marginBottom: '1rem',
                margin: 0,
            }}>
                Activity Timeline
            </h3>

            {loading ? (
                <div style={{
                    textAlign: 'center',
                    padding: '1.5rem',
                    color: 'hsl(var(--foreground-muted))',
                }}>
                    <i
                        className="pi pi-spin pi-spinner"
                        style={{
                            fontSize: '1.5rem',
                            display: 'block',
                            marginBottom: '0.75rem',
                        }}
                    ></i>
                    <p style={{ fontSize: '0.9rem', margin: 0 }}>Loading activity timeline...</p>
                </div>
            ) : error ? (
                <div style={{
                    textAlign: 'center',
                    padding: '1.5rem',
                    color: 'hsl(var(--foreground-muted))',
                    backgroundColor: 'hsl(var(--muted))',
                    borderRadius: '8px',
                    marginTop: '1rem',
                }}>
                    <i
                        className="pi pi-info-circle"
                        style={{
                            fontSize: '1.5rem',
                            display: 'block',
                            marginBottom: '0.75rem',
                            opacity: 0.6,
                        }}
                    ></i>
                    <p style={{ fontSize: '0.9rem', margin: 0 }}>{error}</p>
                </div>
            ) : activityLogs.length > 0 ? (
                <>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                        marginTop: '1rem',
                    }}>
                        {activityLogs.slice(0, 25).map((activity) => {
                            const label = getActivityLabel(activity.type);
                            const metadata = getDisplayMetadataForActivity(activity);
                            const changes = getDisplayChangesForActivity(activity);

                            return (
                                <div
                                    key={activity._id}
                                    style={{
                                        padding: '0.85rem 1rem',
                                        backgroundColor: 'hsl(var(--background))',
                                        border: '1px solid hsl(var(--border))',
                                        borderLeft: '3px solid hsl(var(--primary) / 0.35)',
                                        borderRadius: '8px',
                                    }}
                                >
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        gap: '1rem',
                                        alignItems: 'flex-start',
                                    }}>
                                        <div style={{ display: 'flex', gap: '0.65rem', flex: 1 }}>
                                            <i
                                                className={getActivityIcon(activity.type)}
                                                style={{
                                                    color: 'hsl(var(--primary) / 0.75)',
                                                    fontSize: '1rem',
                                                    marginTop: '0.15rem',
                                                }}
                                            ></i>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{
                                                    display: 'flex',
                                                    flexWrap: 'wrap',
                                                    alignItems: 'baseline',
                                                    gap: '0.4rem',
                                                    marginBottom: '0.35rem',
                                                }}>
                                                    <span style={{
                                                        fontWeight: '700',
                                                        fontSize: '0.95rem',
                                                        color: 'hsl(var(--foreground))',
                                                    }}>
                                                        {label}
                                                    </span>
                                                    {activity.actor?.name && (
                                                        <span style={{
                                                            fontSize: '0.8rem',
                                                            color: 'hsl(var(--foreground-muted))',
                                                        }}>
                                                            by {activity.actor.name}
                                                        </span>
                                                    )}
                                                </div>

                                                {shouldShowActivitySummary(activity, label) && (
                                                    <p style={{
                                                        fontSize: '0.9rem',
                                                        color: 'hsl(var(--foreground-muted))',
                                                        margin: '0 0 0.5rem',
                                                    }}>
                                                        {activity.summary}
                                                    </p>
                                                )}

                                                {metadata.length > 0 && (
                                                    <div style={{
                                                        display: 'flex',
                                                        flexWrap: 'wrap',
                                                        gap: '0.65rem',
                                                        marginBottom: changes.length > 0 ? '0.5rem' : 0,
                                                    }}>
                                                        {metadata.map((item) => (
                                                            <span
                                                                key={item.key}
                                                                style={{
                                                                    fontSize: '0.8rem',
                                                                    color: 'hsl(var(--foreground-muted))',
                                                                }}
                                                            >
                                                                <strong>{item.label}:</strong> {item.value}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                {changes.length > 0 && (
                                                    <div style={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: '0.25rem',
                                                        fontSize: '0.82rem',
                                                        color: 'hsl(var(--foreground-muted))',
                                                    }}>
                                                        {changes.map((change) => (
                                                            <div key={change.label}>
                                                                <strong>{change.label}:</strong>{' '}
                                                                {change.before} &rarr; {change.after}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <span style={{
                                            fontSize: '0.8rem',
                                            color: 'hsl(var(--foreground-muted))',
                                            whiteSpace: 'nowrap',
                                        }}>
                                            {formatActivityTimestamp(activity.occurredAt)}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {activityLogs.length > 25 && (
                        <p style={{
                            fontSize: '0.82rem',
                            color: 'hsl(var(--foreground-muted))',
                            margin: '0.75rem 0 0',
                        }}>
                            Showing latest 25 activity events.
                        </p>
                    )}
                </>
            ) : (
                <div style={{
                    textAlign: 'center',
                    padding: '1.5rem',
                    color: 'hsl(var(--foreground-muted))',
                    backgroundColor: 'hsl(var(--muted))',
                    borderRadius: '8px',
                    marginTop: '1rem',
                }}>
                    <i
                        className="pi pi-history"
                        style={{
                            fontSize: '2rem',
                            display: 'block',
                            marginBottom: '0.75rem',
                            opacity: 0.5,
                        }}
                    ></i>
                    <p style={{ fontSize: '0.9rem', margin: 0 }}>No ActivityLog events yet.</p>
                </div>
            )}
        </Card>
    </div>
);

export default ActivityTimelineCard;
