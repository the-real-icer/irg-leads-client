// React & NextJS
import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useSelector } from 'react-redux';

// FullCalendar
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

// Dynamically import PrimeReact components
const Card = dynamic(() => import('primereact/card').then((mod) => mod.Card), { ssr: false });
const Button = dynamic(() => import('primereact/button').then((mod) => mod.Button), { ssr: false });

// IRG Components
import MainLayout from '../../components/layout/MainLayout';

// API & Utils
import IrgApi from '../../assets/irgApi';
import showToast from '../../utils/showToast';

const Calendar = () => {
    const isLoggedIn = useSelector((state) => state.isLoggedIn);
    const allLeads = useSelector((state) => state.allLeadsPage);

    const calendarRef = useRef(null);
    const [transactions, setTransactions] = useState([]);
    const [googleCalendarEvents, setGoogleCalendarEvents] = useState([]);
    const [calendarEvents, setCalendarEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [calendarView, setCalendarView] = useState('dayGridMonth'); // dayGridMonth, timeGridWeek, timeGridDay

    // Fetch transactions and Google Calendar on mount
    useEffect(() => {
        if (!isLoggedIn) return;
        fetchTransactions();
        fetchGoogleCalendar();
    }, [isLoggedIn]); // eslint-disable-line

    // Process events when transactions, leads, or Google Calendar change
    useEffect(() => {
        processCalendarEvents();
    }, [transactions, allLeads, googleCalendarEvents]); // eslint-disable-line

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const response = await IrgApi.get('/transactions/all-agent-transactions', {
                headers: { Authorization: `Bearer ${isLoggedIn}` },
            });

            if (response.data.status === 'success') {
                setTransactions(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
            showToast('error', 'Failed to load transactions', 'Error');
        } finally {
            setLoading(false);
        }
    };

    const fetchGoogleCalendar = async () => {
        try {
            const response = await IrgApi.get('/google/calendar/events', {
                headers: { Authorization: `Bearer ${isLoggedIn}` },
            });

            if (response.data.status === 'success') {
                setGoogleCalendarEvents(response.data.data);
            }
        } catch (error) {
            // Silently fail if Google Calendar is not connected or returns error
            // This prevents error messages for agents who haven't connected Google yet
            if (error.response?.status !== 401) {
                console.error('Error fetching Google Calendar:', error);
            }
        }
    };

    const processCalendarEvents = () => {
        const events = [];

        // Process transaction events
        transactions.forEach((transaction) => {
            // Anticipated Closing Date
            if (transaction.anticipatedClosingDate) {
                events.push({
                    id: `transaction-close-${transaction._id}`,
                    title: `Closing: ${transaction.address}`,
                    start: transaction.anticipatedClosingDate,
                    allDay: true,
                    backgroundColor: '#667eea',
                    borderColor: '#667eea',
                    textColor: '#ffffff',
                    extendedProps: {
                        type: 'transaction-closing',
                        transactionId: transaction._id,
                        address: transaction.address,
                        salesPrice: transaction.salesPrice,
                    },
                });
            }

            // Actual Closing Date (if closed)
            if (transaction.actualClosingDate) {
                events.push({
                    id: `transaction-closed-${transaction._id}`,
                    title: `✓ Closed: ${transaction.address}`,
                    start: transaction.actualClosingDate,
                    allDay: true,
                    backgroundColor: '#4CAF50',
                    borderColor: '#4CAF50',
                    textColor: '#ffffff',
                    extendedProps: {
                        type: 'transaction-closed',
                        transactionId: transaction._id,
                        address: transaction.address,
                        salesPrice: transaction.salesPrice,
                    },
                });
            }

            // Acceptance Date
            if (transaction.acceptanceDate) {
                events.push({
                    id: `transaction-acceptance-${transaction._id}`,
                    title: `Accepted: ${transaction.address}`,
                    start: transaction.acceptanceDate,
                    allDay: true,
                    backgroundColor: '#22c55e',
                    borderColor: '#22c55e',
                    textColor: '#ffffff',
                    extendedProps: {
                        type: 'transaction-acceptance',
                        transactionId: transaction._id,
                        address: transaction.address,
                    },
                });
            }

            // Inspection Contingency (calculate from acceptance date + typical inspection period)
            // Assuming inspection contingency is typically 17 days after acceptance
            if (transaction.acceptanceDate && transaction.escrowLength) {
                const acceptanceDate = new Date(transaction.acceptanceDate);
                const inspectionDate = new Date(acceptanceDate);
                inspectionDate.setDate(acceptanceDate.getDate() + 17); // Typical inspection period

                events.push({
                    id: `transaction-inspection-${transaction._id}`,
                    title: `Inspection Due: ${transaction.address}`,
                    start: inspectionDate,
                    allDay: true,
                    backgroundColor: '#f59e0b',
                    borderColor: '#f59e0b',
                    textColor: '#ffffff',
                    extendedProps: {
                        type: 'transaction-inspection',
                        transactionId: transaction._id,
                        address: transaction.address,
                    },
                });
            }

            // Appraisal Contingency (typically 21 days after acceptance)
            if (transaction.acceptanceDate && transaction.financing) {
                const acceptanceDate = new Date(transaction.acceptanceDate);
                const appraisalDate = new Date(acceptanceDate);
                appraisalDate.setDate(acceptanceDate.getDate() + 21);

                events.push({
                    id: `transaction-appraisal-${transaction._id}`,
                    title: `Appraisal Due: ${transaction.address}`,
                    start: appraisalDate,
                    allDay: true,
                    backgroundColor: '#f59e0b',
                    borderColor: '#f59e0b',
                    textColor: '#ffffff',
                    extendedProps: {
                        type: 'transaction-appraisal',
                        transactionId: transaction._id,
                        address: transaction.address,
                    },
                });
            }

            // Loan Contingency (typically 21 days after acceptance)
            if (transaction.acceptanceDate && transaction.financing) {
                const acceptanceDate = new Date(transaction.acceptanceDate);
                const loanDate = new Date(acceptanceDate);
                loanDate.setDate(acceptanceDate.getDate() + 21);

                events.push({
                    id: `transaction-loan-${transaction._id}`,
                    title: `Loan Contingency: ${transaction.address}`,
                    start: loanDate,
                    allDay: true,
                    backgroundColor: '#f59e0b',
                    borderColor: '#f59e0b',
                    textColor: '#ffffff',
                    extendedProps: {
                        type: 'transaction-loan',
                        transactionId: transaction._id,
                        address: transaction.address,
                    },
                });
            }
        });

        // Process lead reminder events
        if (Array.isArray(allLeads)) {
            allLeads.forEach((lead) => {
                if (lead.reminders && Array.isArray(lead.reminders)) {
                    lead.reminders
                        .filter((reminder) => !reminder.completed)
                        .forEach((reminder) => {
                            events.push({
                                id: `reminder-${reminder.id}`,
                                title: `📋 ${lead.first_name} ${lead.last_name}: ${reminder.description}`,
                                start: reminder.reminder_date,
                                allDay: true,
                                backgroundColor: '#ef4444',
                                borderColor: '#ef4444',
                                textColor: '#ffffff',
                                extendedProps: {
                                    type: 'lead-reminder',
                                    leadId: lead._id,
                                    leadName: `${lead.first_name} ${lead.last_name}`,
                                    reminderType: reminder.type,
                                    description: reminder.description,
                                },
                            });
                        });
                }
            });
        }

        // Add Google Calendar events
        if (Array.isArray(googleCalendarEvents)) {
            events.push(...googleCalendarEvents);
        }

        setCalendarEvents(events);
    };

    const handleEventClick = (info) => {
        const { extendedProps } = info.event;

        // Navigate to transaction or lead page based on event type
        if (extendedProps.type.startsWith('transaction')) {
            window.location.href = `/transactions`; // TODO: Update when transaction detail page is created
        } else if (extendedProps.type === 'lead-reminder') {
            window.location.href = `/lead/${extendedProps.leadId}`;
        } else if (extendedProps.type === 'google-calendar' && extendedProps.htmlLink) {
            // Open Google Calendar event in new tab
            window.open(extendedProps.htmlLink, '_blank');
        }
    };

    const changeView = (view) => {
        setCalendarView(view);
        if (calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();
            calendarApi.changeView(view);
        }
    };

    return (
        <MainLayout>
            <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2rem'
                }}>
                    <div>
                        <h1 style={{
                            fontSize: '2rem',
                            fontWeight: '700',
                            color: '#2c3e50',
                            marginBottom: '0.5rem',
                        }}>
                            Calendar
                        </h1>
                        <p style={{ color: '#6c757d', fontSize: '0.95rem' }}>
                            View your transactions, lead reminders, and Google Calendar events
                        </p>
                    </div>

                    {/* View Switcher */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Button
                            label="Daily"
                            className={calendarView === 'timeGridDay' ? 'p-button-primary' : 'p-button-outlined'}
                            onClick={() => changeView('timeGridDay')}
                            style={{ padding: '0.5rem 1rem' }}
                        />
                        <Button
                            label="Weekly"
                            className={calendarView === 'timeGridWeek' ? 'p-button-primary' : 'p-button-outlined'}
                            onClick={() => changeView('timeGridWeek')}
                            style={{ padding: '0.5rem 1rem' }}
                        />
                        <Button
                            label="Monthly"
                            className={calendarView === 'dayGridMonth' ? 'p-button-primary' : 'p-button-outlined'}
                            onClick={() => changeView('dayGridMonth')}
                            style={{ padding: '0.5rem 1rem' }}
                        />
                    </div>
                </div>

                {/* Legend */}
                <Card style={{ marginBottom: '1.5rem', padding: '1rem' }}>
                    <div style={{
                        display: 'flex',
                        gap: '2rem',
                        flexWrap: 'wrap',
                        alignItems: 'center'
                    }}>
                        <h4 style={{ margin: 0, marginRight: '1rem', color: '#2c3e50' }}>Legend:</h4>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{
                                width: '16px',
                                height: '16px',
                                backgroundColor: '#667eea',
                                borderRadius: '3px'
                            }}></div>
                            <span style={{ fontSize: '0.9rem' }}>Anticipated Closing</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{
                                width: '16px',
                                height: '16px',
                                backgroundColor: '#4CAF50',
                                borderRadius: '3px'
                            }}></div>
                            <span style={{ fontSize: '0.9rem' }}>Closed Transaction</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{
                                width: '16px',
                                height: '16px',
                                backgroundColor: '#22c55e',
                                borderRadius: '3px'
                            }}></div>
                            <span style={{ fontSize: '0.9rem' }}>Acceptance Date</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{
                                width: '16px',
                                height: '16px',
                                backgroundColor: '#f59e0b',
                                borderRadius: '3px'
                            }}></div>
                            <span style={{ fontSize: '0.9rem' }}>Contingency Due</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{
                                width: '16px',
                                height: '16px',
                                backgroundColor: '#ef4444',
                                borderRadius: '3px'
                            }}></div>
                            <span style={{ fontSize: '0.9rem' }}>Lead Reminder</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{
                                width: '16px',
                                height: '16px',
                                backgroundColor: '#34A853',
                                borderRadius: '3px'
                            }}></div>
                            <span style={{ fontSize: '0.9rem' }}>Google Calendar</span>
                        </div>
                    </div>
                </Card>

                {/* Calendar */}
                <Card style={{
                    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                    borderRadius: '12px'
                }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#6c757d' }}>
                            <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
                            <p style={{ marginTop: '1rem' }}>Loading calendar...</p>
                        </div>
                    ) : (
                        <FullCalendar
                            ref={calendarRef}
                            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                            initialView={calendarView}
                            headerToolbar={{
                                left: 'prev,next today',
                                center: 'title',
                                right: ''
                            }}
                            height="auto"
                            editable={false}
                            selectable={false}
                            selectMirror={true}
                            dayMaxEvents={true}
                            weekends={true}
                            events={calendarEvents}
                            eventClick={handleEventClick}
                        />
                    )}
                </Card>
            </div>
        </MainLayout>
    );
};

export default Calendar;
