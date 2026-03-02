// React & NextJS
import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useSelector } from 'react-redux';

// FullCalendar
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';
import interactionPlugin from '@fullcalendar/interaction';

// Dynamically import PrimeReact components
const Card = dynamic(() => import('primereact/card').then((mod) => mod.Card), { ssr: false });
const Button = dynamic(() => import('primereact/button').then((mod) => mod.Button), { ssr: false });
const Dialog = dynamic(() => import('primereact/dialog').then((mod) => mod.Dialog), { ssr: false });
const InputText = dynamic(() => import('primereact/inputtext').then((mod) => mod.InputText), { ssr: false });
const InputTextarea = dynamic(() => import('primereact/inputtextarea').then((mod) => mod.InputTextarea), { ssr: false });
const Dropdown = dynamic(() => import('primereact/dropdown').then((mod) => mod.Dropdown), { ssr: false });
const CalendarPicker = dynamic(() => import('primereact/calendar').then((mod) => mod.Calendar), { ssr: false });

// IRG Components
import MainLayout from '../../components/layout/MainLayout';

// API & Utils
import IrgApi from '../../assets/irgApi';
import showToast from '../../utils/showToast';
import getLeadDisplayName from '../../utils/getLeadDisplayName';

const Calendar = () => {
    const isLoggedIn = useSelector((state) => state.isLoggedIn);
    const allLeads = useSelector((state) => state.allLeadsPage.leads);

    const calendarRef = useRef(null);
    const [transactions, setTransactions] = useState([]);
    const [googleCalendarEvents, setGoogleCalendarEvents] = useState([]);
    const [calendarEvents, setCalendarEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [calendarView, setCalendarView] = useState('dayGridMonth'); // dayGridMonth, resourceTimeGridWeek, resourceTimeGridDay

    // Create Event Modal State
    const [showCreateEventDialog, setShowCreateEventDialog] = useState(false);
    const [eventTitle, setEventTitle] = useState('');
    const [eventStartDate, setEventStartDate] = useState(null);
    const [eventEndDate, setEventEndDate] = useState(null);
    const [eventCalendar, setEventCalendar] = useState(null);
    const [eventDescription, setEventDescription] = useState('');
    const [eventLocation, setEventLocation] = useState('');
    const [eventLead, setEventLead] = useState(null);
    const [eventColor, setEventColor] = useState(null);
    const [creatingEvent, setCreatingEvent] = useState(false);
    const [availableCalendars, setAvailableCalendars] = useState([]);
    const [loadingCalendars, setLoadingCalendars] = useState(false);

    // Define resources for day/week views
    const resources = [
        { id: 'transactions', title: 'Transaction Deadlines', eventColor: '#667eea' },
        { id: 'leads', title: 'Lead Follow Ups', eventColor: '#ef4444' },
        { id: 'calendar', title: 'Events', eventColor: '#34A853' },
    ];

    // Google Calendar color options
    const calendarColorOptions = [
        { label: 'Lavender', value: '1', color: '#a4bdfc' },
        { label: 'Sage', value: '2', color: '#7ae7bf' },
        { label: 'Grape', value: '3', color: '#dbadff' },
        { label: 'Flamingo', value: '4', color: '#ff887c' },
        { label: 'Banana', value: '5', color: '#fbd75b' },
        { label: 'Tangerine', value: '6', color: '#ffb878' },
        { label: 'Peacock', value: '7', color: '#46d6db' },
        { label: 'Graphite', value: '8', color: '#e1e1e1' },
        { label: 'Blueberry', value: '9', color: '#5484ed' },
        { label: 'Basil', value: '10', color: '#51b749' },
        { label: 'Tomato', value: '11', color: '#dc2127' },
    ];

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
                // Non-critical — Google Calendar fetch failed silently
            }
        }
    };

    // Fetch available calendars for event creation
    const fetchAvailableCalendars = async () => {
        setLoadingCalendars(true);
        try {
            const response = await IrgApi.get('/google/calendar/list', {
                headers: { Authorization: `Bearer ${isLoggedIn}` },
            });

            if (response.data.status === 'success') {
                const formattedCalendars = response.data.data.map((cal) => ({
                    label: cal.summary + (cal.primary ? ' (Primary)' : ''),
                    value: cal.id,
                }));
                setAvailableCalendars(formattedCalendars);

                // Pre-select primary calendar
                const primaryCal = formattedCalendars.find(cal => cal.label.includes('Primary'));
                if (primaryCal) {
                    setEventCalendar(primaryCal.value);
                }
            }
        } catch (error) {
            // Error handled — calendars state remains empty
        } finally {
            setLoadingCalendars(false);
        }
    };

    // Handle event creation
    const handleCreateEvent = async () => {
        // Validation
        if (!eventTitle || !eventTitle.trim()) {
            showToast('error', 'Please enter an event title', 'Validation Error');
            return;
        }
        if (!eventStartDate || !eventEndDate) {
            showToast('error', 'Please select start and end times', 'Validation Error');
            return;
        }
        if (!eventCalendar) {
            showToast('error', 'Please select a calendar', 'Validation Error');
            return;
        }
        if (new Date(eventEndDate) <= new Date(eventStartDate)) {
            showToast('error', 'End time must be after start time', 'Validation Error');
            return;
        }

        setCreatingEvent(true);
        try {
            const response = await IrgApi.post(
                '/google/calendar/create',
                {
                    title: eventTitle,
                    startDateTime: eventStartDate.toISOString(),
                    endDateTime: eventEndDate.toISOString(),
                    calendarId: eventCalendar,
                    description: eventDescription,
                    location: eventLocation,
                    leadId: eventLead,
                    colorId: eventColor,
                },
                { headers: { Authorization: `Bearer ${isLoggedIn}` } }
            );

            if (response.data.status === 'success') {
                showToast('success', 'Calendar event created successfully', 'Success');
                setShowCreateEventDialog(false);
                resetEventForm();
                await fetchGoogleCalendar(); // Refresh events
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to create calendar event';
            showToast('error', errorMessage, 'Error');
        } finally {
            setCreatingEvent(false);
        }
    };

    const resetEventForm = () => {
        setEventTitle('');
        setEventStartDate(null);
        setEventEndDate(null);
        setEventDescription('');
        setEventLocation('');
        setEventLead(null);
        setEventColor(null);
    };

    const openCreateEventDialog = (prefilledDate = null) => {
        fetchAvailableCalendars();

        if (prefilledDate) {
            const startDate = new Date(prefilledDate);
            setEventStartDate(startDate);
            const endDate = new Date(startDate);
            endDate.setHours(endDate.getHours() + 1);
            setEventEndDate(endDate);
        } else {
            const now = new Date();
            setEventStartDate(now);
            const oneHourLater = new Date(now);
            oneHourLater.setHours(oneHourLater.getHours() + 1);
            setEventEndDate(oneHourLater);
        }

        setShowCreateEventDialog(true);
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
                    resourceId: 'transactions', // Assign to Transaction Deadlines section
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
                    resourceId: 'transactions',
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
                    resourceId: 'transactions',
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
                    resourceId: 'transactions',
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
                    resourceId: 'transactions',
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
                    resourceId: 'transactions',
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
                                title: `📋 ${getLeadDisplayName(lead)}: ${reminder.description}`,
                                start: reminder.reminder_date,
                                allDay: true,
                                resourceId: 'leads', // Assign to Lead Follow Ups section
                                backgroundColor: '#ef4444',
                                borderColor: '#ef4444',
                                textColor: '#ffffff',
                                extendedProps: {
                                    type: 'lead-reminder',
                                    leadId: lead._id,
                                    leadName: getLeadDisplayName(lead),
                                    reminderType: reminder.type,
                                    description: reminder.description,
                                },
                            });
                        });
                }
            });
        }

        // Add Google Calendar events with resourceId
        if (Array.isArray(googleCalendarEvents)) {
            googleCalendarEvents.forEach((gcalEvent) => {
                events.push({
                    ...gcalEvent,
                    resourceId: 'calendar', // Assign to Events section
                });
            });
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

    const handleDateClick = (info) => {
        // If in monthly view, clicking a date should navigate to daily view for that date
        if (calendarView === 'dayGridMonth') {
            setCalendarView('resourceTimeGridDay');
            if (calendarRef.current) {
                const calendarApi = calendarRef.current.getApi();
                calendarApi.changeView('resourceTimeGridDay');
                calendarApi.gotoDate(info.date);
            }
        } else {
            // In other views, clicking opens the create event dialog
            openCreateEventDialog(info.date);
        }
    };

    const handleDateSelect = (info) => {
        setEventStartDate(info.start);
        setEventEndDate(info.end);
        fetchAvailableCalendars();
        setShowCreateEventDialog(true);
    };

    const changeView = (view) => {
        // Map button clicks to correct view names
        const viewMapping = {
            'timeGridDay': 'resourceTimeGridDay',
            'timeGridWeek': 'timeGridWeek', // Use regular week view, not resource-based
            'dayGridMonth': 'dayGridMonth'
        };

        const actualView = viewMapping[view] || view;
        setCalendarView(actualView);

        if (calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();
            calendarApi.changeView(actualView);
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
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <Button
                            label="Create Event"
                            icon="pi pi-plus"
                            onClick={() => openCreateEventDialog()}
                            style={{
                                padding: '0.5rem 1rem',
                                marginRight: '1rem',
                                backgroundColor: '#34A853',
                                borderColor: '#34A853'
                            }}
                        />

                        <Button
                            label="Daily"
                            className={calendarView === 'resourceTimeGridDay' ? 'p-button-primary' : 'p-button-outlined'}
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
                            plugins={[dayGridPlugin, timeGridPlugin, resourceTimeGridPlugin, interactionPlugin]}
                            initialView={calendarView}
                            schedulerLicenseKey="GPL-My-Project-Is-Open-Source"
                            headerToolbar={{
                                left: 'prev,next today',
                                center: 'title',
                                right: ''
                            }}
                            views={{
                                resourceTimeGridDay: {
                                    titleFormat: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }
                                }
                            }}
                            height="auto"
                            editable={false}
                            selectable={true}
                            selectMirror={true}
                            dayMaxEvents={true}
                            weekends={true}
                            resources={resources}
                            events={calendarEvents}
                            eventClick={handleEventClick}
                            dateClick={handleDateClick}
                            select={handleDateSelect}
                            resourceAreaHeaderContent="Categories"
                            resourceAreaWidth="180px"
                        />
                    )}
                </Card>
            </div>

            {/* Create Event Dialog */}
            <Dialog
                header="Create Calendar Event"
                visible={showCreateEventDialog}
                onHide={() => setShowCreateEventDialog(false)}
                style={{ width: '600px' }}
                footer={
                    <div>
                        <Button
                            label="Cancel"
                            icon="pi pi-times"
                            onClick={() => setShowCreateEventDialog(false)}
                            className="p-button-text"
                            disabled={creatingEvent}
                        />
                        <Button
                            label={creatingEvent ? 'Creating...' : 'Create Event'}
                            icon={creatingEvent ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
                            onClick={handleCreateEvent}
                            disabled={creatingEvent}
                            style={{ backgroundColor: '#34A853', borderColor: '#34A853' }}
                        />
                    </div>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Title */}
                    <div>
                        <label htmlFor="event-title" style={{
                            display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#495057'
                        }}>
                            Event Title <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <InputText
                            id="event-title"
                            value={eventTitle}
                            onChange={(e) => setEventTitle(e.target.value)}
                            placeholder="e.g., Property Showing"
                            style={{ width: '100%' }}
                        />
                    </div>

                    {/* Start Date/Time */}
                    <div>
                        <label htmlFor="event-start" style={{
                            display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#495057'
                        }}>
                            Start Date & Time <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <CalendarPicker
                            id="event-start"
                            value={eventStartDate}
                            onChange={(e) => setEventStartDate(e.value)}
                            showTime
                            hourFormat="12"
                            showIcon
                            dateFormat="mm/dd/yy"
                            placeholder="Select start date & time"
                            style={{ width: '100%' }}
                        />
                    </div>

                    {/* End Date/Time */}
                    <div>
                        <label htmlFor="event-end" style={{
                            display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#495057'
                        }}>
                            End Date & Time <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <CalendarPicker
                            id="event-end"
                            value={eventEndDate}
                            onChange={(e) => setEventEndDate(e.value)}
                            showTime
                            hourFormat="12"
                            showIcon
                            dateFormat="mm/dd/yy"
                            placeholder="Select end date & time"
                            style={{ width: '100%' }}
                        />
                    </div>

                    {/* Calendar Selection */}
                    <div>
                        <label htmlFor="event-calendar" style={{
                            display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#495057'
                        }}>
                            Calendar <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <Dropdown
                            id="event-calendar"
                            value={eventCalendar}
                            options={availableCalendars}
                            onChange={(e) => setEventCalendar(e.value)}
                            placeholder={loadingCalendars ? "Loading calendars..." : "Select calendar"}
                            style={{ width: '100%' }}
                            disabled={loadingCalendars}
                        />
                    </div>

                    {/* Event Color */}
                    <div>
                        <label htmlFor="event-color" style={{
                            display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#495057'
                        }}>
                            Event Color
                        </label>
                        <Dropdown
                            id="event-color"
                            value={eventColor}
                            options={calendarColorOptions}
                            onChange={(e) => setEventColor(e.value)}
                            placeholder="Select color (optional)"
                            style={{ width: '100%' }}
                            showClear
                            itemTemplate={(option) => (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '4px',
                                        backgroundColor: option.color,
                                        border: '1px solid #dee2e6'
                                    }}></div>
                                    <span>{option.label}</span>
                                </div>
                            )}
                            valueTemplate={(option) => {
                                if (!option) return <span style={{ color: '#6c757d' }}>Select color (optional)</span>;
                                return (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{
                                            width: '20px',
                                            height: '20px',
                                            borderRadius: '4px',
                                            backgroundColor: option.color,
                                            border: '1px solid #dee2e6'
                                        }}></div>
                                        <span>{option.label}</span>
                                    </div>
                                );
                            }}
                        />
                    </div>

                    {/* Location */}
                    <div>
                        <label htmlFor="event-location" style={{
                            display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#495057'
                        }}>
                            Location
                        </label>
                        <InputText
                            id="event-location"
                            value={eventLocation}
                            onChange={(e) => setEventLocation(e.target.value)}
                            placeholder="e.g., 123 Main St, Sacramento, CA"
                            style={{ width: '100%' }}
                        />
                    </div>

                    {/* Link to Lead */}
                    <div>
                        <label htmlFor="event-lead" style={{
                            display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#495057'
                        }}>
                            Link to Lead
                        </label>
                        <Dropdown
                            id="event-lead"
                            value={eventLead}
                            options={
                                Array.isArray(allLeads)
                                    ? allLeads.map((lead) => ({
                                          label: getLeadDisplayName(lead),
                                          value: lead._id,
                                      }))
                                    : []
                            }
                            onChange={(e) => setEventLead(e.value)}
                            placeholder="Select lead (optional)"
                            filter
                            showClear
                            style={{ width: '100%' }}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="event-description" style={{
                            display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#495057'
                        }}>
                            Description
                        </label>
                        <InputTextarea
                            id="event-description"
                            value={eventDescription}
                            onChange={(e) => setEventDescription(e.target.value)}
                            placeholder="Add notes or details about this event..."
                            rows={4}
                            style={{ width: '100%' }}
                        />
                    </div>

                    {/* Help text */}
                    <div style={{
                        fontSize: '0.875rem',
                        color: '#6c757d',
                        padding: '0.75rem',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '6px',
                        borderLeft: '3px solid #34A853'
                    }}>
                        <i className="pi pi-info-circle" style={{ marginRight: '0.5rem' }}></i>
                        This event will be created in your Google Calendar. If you link a lead, their contact info will be added to the event description.
                    </div>
                </div>
            </Dialog>
        </MainLayout>
    );
};

export default Calendar;
