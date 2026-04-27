import dynamic from 'next/dynamic';

const Card = dynamic(() => import('primereact/card').then((mod) => mod.Card), { ssr: false });
const Button = dynamic(() => import('primereact/button').then((mod) => mod.Button), {
    ssr: false,
});

const LeadRemindersCard = ({
    reminders,
    onAddReminderClick,
    onCompleteReminder,
    onDeleteReminder,
}) => (
    <div className="lead-reminders" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
        <Card>
            <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: '700',
                        color: 'hsl(var(--foreground))',
                        margin: 0
                    }}>
                        Reminders & Follow-Ups
                    </h3>
                    <Button
                        label="Add A Reminder"
                        icon="pi pi-plus"
                        className="p-button-warning"
                        onClick={onAddReminderClick}
                        style={{
                            padding: '0.5rem 1rem',
                            fontSize: '0.9rem',
                            fontWeight: '600'
                        }}
                    />
                </div>

                {/* Reminders List */}
                {reminders.length > 0 ? (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem'
                    }}>
                        {reminders.map((reminder) => {
                            const currentReminderDate = new Date(reminder.reminder_date);
                            const now = new Date();
                            const isOverdue = currentReminderDate < now;
                            const daysUntil = Math.ceil((currentReminderDate - now) / (1000 * 60 * 60 * 24));

                            return (
                                <div
                                    key={reminder.id}
                                    style={{
                                        padding: '1rem',
                                        backgroundColor: isOverdue ? 'hsl(var(--danger) / 0.15)' : 'hsl(var(--warning) / 0.15)',
                                        borderLeft: `4px solid ${isOverdue ? 'hsl(var(--danger))' : 'hsl(var(--warning))'}`,
                                        borderRadius: '8px',
                                        boxShadow: '0 1px 3px hsl(var(--shadow-color) / 0.1)'
                                    }}
                                >
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'start',
                                        marginBottom: '0.5rem'
                                    }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                marginBottom: '0.5rem'
                                            }}>
                                                <i
                                                    className={`pi ${
                                                        reminder.type === 'call' ? 'pi-phone' :
                                                        reminder.type === 'email' ? 'pi-envelope' :
                                                        'pi-bell'
                                                    }`}
                                                    style={{
                                                        fontSize: '1.1rem',
                                                        color: isOverdue ? 'hsl(var(--danger))' : 'hsl(var(--warning))'
                                                    }}
                                                ></i>
                                                <span style={{
                                                    fontWeight: '700',
                                                    fontSize: '0.95rem',
                                                    color: 'hsl(var(--foreground))',
                                                    textTransform: 'capitalize'
                                                }}>
                                                    {reminder.type} Reminder
                                                </span>
                                                <span style={{
                                                    fontSize: '0.8rem',
                                                    padding: '0.2rem 0.5rem',
                                                    borderRadius: '12px',
                                                    backgroundColor: isOverdue ? 'hsl(var(--danger))' : 'hsl(var(--warning))',
                                                    color: 'white',
                                                    fontWeight: '600'
                                                }}>
                                                    {isOverdue ? 'Overdue' : `${daysUntil} day${daysUntil !== 1 ? 's' : ''}`}
                                                </span>
                                            </div>
                                            <div style={{
                                                fontSize: '0.9rem',
                                                color: 'hsl(var(--foreground-muted))',
                                                marginBottom: '0.5rem'
                                            }}>
                                                {reminder.description}
                                            </div>
                                            <div style={{
                                                fontSize: '0.85rem',
                                                color: 'hsl(var(--foreground-muted))'
                                            }}>
                                                Due: {currentReminderDate.toLocaleDateString('en-US', {
                                                    weekday: 'short',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                                            <Button
                                                icon="pi pi-check"
                                                className="p-button-success p-button-sm"
                                                onClick={() => onCompleteReminder(reminder.id)}
                                                tooltip="Mark as complete"
                                                tooltipOptions={{ position: 'top' }}
                                            />
                                            <Button
                                                icon="pi pi-trash"
                                                className="p-button-danger p-button-sm p-button-text"
                                                onClick={() => onDeleteReminder(reminder.id)}
                                                tooltip="Delete reminder"
                                                tooltipOptions={{ position: 'top' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div style={{
                        textAlign: 'center',
                        padding: '2rem',
                        color: 'hsl(var(--foreground-muted))',
                        backgroundColor: 'hsl(var(--muted))',
                        borderRadius: '8px'
                    }}>
                        <i className="pi pi-bell-slash" style={{ fontSize: '2.5rem', display: 'block', marginBottom: '1rem', opacity: 0.5 }}></i>
                        <p style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>No active reminders</p>
                        <p style={{ fontSize: '0.9rem' }}>Click "Add A Reminder" to set up a follow-up</p>
                    </div>
                )}
            </div>
        </Card>
    </div>
);

export default LeadRemindersCard;
