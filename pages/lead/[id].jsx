// React & NextJS
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

// Redux
import {
    useSelector,
    // useDispatch
} from 'react-redux';

// Dynamically Import Third Party Components
const Card = dynamic(() => import('primereact/card').then((mod) => mod.Card), { ssr: false });
const TabView = dynamic(() => import('primereact/tabview').then((mod) => mod.TabView), {
    ssr: false,
});
const TabPanel = dynamic(() => import('primereact/tabview').then((mod) => mod.TabPanel), {
    ssr: false,
});
const Avatar = dynamic(() => import('primereact/avatar').then((mod) => mod.Avatar), {
    ssr: false,
});
const ScrollPanel = dynamic(() => import('primereact/scrollpanel').then((mod) => mod.ScrollPanel), {
    ssr: false,
});
const SplitButton = dynamic(() => import('primereact/splitbutton').then((mod) => mod.SplitButton), {
    ssr: false,
});
const Toast = dynamic(() => import('primereact/toast').then((mod) => mod.Toast), { ssr: false });
const Button = dynamic(() => import('primereact/button').then((mod) => mod.Button), {
    ssr: false,
});
const Badge = dynamic(() => import('primereact/badge').then((mod) => mod.Badge), { ssr: false });
const Chip = dynamic(() => import('primereact/chip').then((mod) => mod.Chip), { ssr: false });
const Dialog = dynamic(() => import('primereact/dialog').then((mod) => mod.Dialog), {
    ssr: false,
});
const Accordion = dynamic(() => import('primereact/accordion').then((mod) => mod.Accordion), {
    ssr: false,
});
const AccordionTab = dynamic(() => import('primereact/accordion').then((mod) => mod.AccordionTab), {
    ssr: false,
});
const InputTextarea = dynamic(() => import('primereact/inputtextarea').then((mod) => mod.InputTextarea), {
    ssr: false,
});
const Calendar = dynamic(() => import('primereact/calendar').then((mod) => mod.Calendar), {
    ssr: false,
});
const Dropdown = dynamic(() => import('primereact/dropdown').then((mod) => mod.Dropdown), {
    ssr: false,
});

// IRG Components
import MainLayout from '../../components/layout/MainLayout';
import PrpCard from '../../components/prpCard/PrpCard';

// IRG API
import IrgApi from '../../assets/irgApi';

// Utils
import showToast from '../../utils/showToast';

const Lead = () => {
    // __________________Redux State______________________\\
    const leads = useSelector((state) => state.allLeadsPage);
    const isLoggedIn = useSelector((state) => state.isLoggedIn);
    const agent = useSelector((state) => state.agent);

    const [lead, setLead] = useState({});
    const [activeIndex, setActiveIndex] = useState(0);
    const [category, setCategory] = useState('');
    const [showViewedHomesDialog, setShowViewedHomesDialog] = useState(false);
    const [showFavoritedHomesDialog, setShowFavoritedHomesDialog] = useState(false);
    const [showSavedSearchesDialog, setShowSavedSearchesDialog] = useState(false);
    const [showSearchHistoryDialog, setShowSearchHistoryDialog] = useState(false);
    const [emails, setEmails] = useState([]);
    const [loadingEmails, setLoadingEmails] = useState(false);

    // Notes and Calls state
    const [showLogCallDialog, setShowLogCallDialog] = useState(false);
    const [showCreateNoteDialog, setShowCreateNoteDialog] = useState(false);
    const [callContent, setCallContent] = useState('');
    const [noteContent, setNoteContent] = useState('');
    const [savingNote, setSavingNote] = useState(false);
    const [savingCall, setSavingCall] = useState(false);

    // Reminders state
    const [showAddReminderDialog, setShowAddReminderDialog] = useState(false);
    const [reminderDate, setReminderDate] = useState(null);
    const [reminderType, setReminderType] = useState('general');
    const [reminderDescription, setReminderDescription] = useState('');
    const [savingReminder, setSavingReminder] = useState(false);

    const router = useRouter();

    const leadId = router.asPath.replace(/\/lead\//, '');

    useEffect(() => {
        const ld = leads.filter((l) => {
            if (l._id === leadId) {
                return l;
            }
            return null;
        });
        setLead(ld[0]);
        return () => setLead({});
    }, []); // eslint-disable-line

    useEffect(() => {
        if (lead?.backend_profile?.lead_category) {
            const cat =
                lead.backend_profile.lead_category.charAt(0).toUpperCase() +
                lead.backend_profile.lead_category.slice(1);
            setCategory(cat);
        }
    }, [lead]);

    // Fetch emails when lead email is available
    useEffect(() => {
        if (lead?.email && isLoggedIn) {
            fetchEmails();
        }
    }, [lead?.email]); // eslint-disable-line

    const fetchEmails = async () => {
        if (!lead?.email) return;

        setLoadingEmails(true);
        try {
            const response = await IrgApi.get(`/gmail/emails/${encodeURIComponent(lead.email)}`, {
                headers: { Authorization: `Bearer ${isLoggedIn}` },
            });

            if (response.data.status === 'success') {
                // Sort emails by date (most recent first)
                const sortedEmails = response.data.data.sort((a, b) => {
                    return new Date(b.date) - new Date(a.date);
                });
                setEmails(sortedEmails);
            }
        } catch (error) {
            console.error('Error fetching emails:', error); // eslint-disable-line
            setEmails([]);
        } finally {
            setLoadingEmails(false);
        }
    };

    const formatDate = (val) => {
        const properDate = new Date(val);

        return properDate.toLocaleDateString('en-US', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const updateStatus = (newStatus) => {
        showToast('success', `New Status: ${newStatus}`, 'Updated');
    };

    const items = [
        {
            label: 'New',
            command: () => updateStatus('New'),
        },
        {
            label: 'Nurture',
            command: () => updateStatus('Nurture'),
        },
        {
            label: 'Watch',
            command: () => updateStatus('Watch'),
        },
        {
            label: 'Qualify',
            command: () => updateStatus('Qualify'),
        },
        {
            label: 'Pending',
            command: () => updateStatus('Pending'),
        },
        {
            label: 'Closed',
            command: () => updateStatus('Closed'),
        },
        {
            label: 'Hot',
            command: () => updateStatus('Hot'),
        },
        {
            label: 'Archive',
            command: () => updateStatus('Archive'),
        },
        {
            label: 'Trash',
            command: () => updateStatus('Trash'),
        },
    ];

    const getStatusSeverity = (status) => {
        const statusMap = {
            new: 'info',
            nurture: 'secondary',
            watch: 'warning',
            qualify: 'success',
            pending: 'warning',
            closed: 'danger',
            hot: 'danger',
            archive: null,
            trash: null,
        };
        return statusMap[status?.toLowerCase()] || 'info';
    };

    const getInitials = () => {
        const first = lead?.first_name?.[0] || '';
        const last = lead?.last_name?.[0] || '';
        return `${first}${last}`.toUpperCase();
    };

    // Calculate average price of viewed homes
    const getAveragePrice = () => {
        const viewedHomes = lead?.viewed_homes?.filter((home) => home?.property_viewed) || [];
        if (viewedHomes.length === 0) return 'N/A';

        const total = viewedHomes.reduce((sum, home) => {
            const price = home.property_viewed?.price;
            if (!price) return sum;
            // Remove $ and commas, then parse to number
            const numPrice = parseFloat(price.replace(/[$,]/g, ''));
            return sum + (isNaN(numPrice) ? 0 : numPrice);
        }, 0);

        const average = total / viewedHomes.length;
        return `$${Math.round(average).toLocaleString()}`;
    };

    // Format last visit time
    const formatLastVisit = (lastVisit) => {
        if (!lastVisit) return 'Never';

        const now = new Date();
        const visitDate = new Date(lastVisit);
        const diffMs = now - visitDate;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffHours < 1) {
            return 'An hour ago';
        } else if (diffHours < 24) {
            return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
        } else {
            return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
        }
    };

    // Get last 3 unique cities from searches performed
    const getAreasSearched = () => {
        const searches = lead?.searches_performed || [];
        if (searches.length === 0) return 'None';

        // Extract unique cities from search terms (assuming search term contains city names)
        const cities = new Set();
        searches.forEach((search) => {
            // Try to extract city from searchTerm
            const term = search.searchTerm?.toLowerCase() || '';
            // This is a simple extraction - adjust based on your data structure
            if (term) {
                // You might need to adjust this logic based on how cities are stored
                const parts = term.split(',');
                if (parts.length > 0) {
                    cities.add(parts[0].trim());
                }
            }
        });

        const cityArray = Array.from(cities).slice(0, 3);
        return cityArray.length > 0 ? cityArray.join(', ') : 'None';
    };

    // Handle logging a call
    const handleLogCall = async () => {
        if (!callContent.trim()) {
            showToast('warn', 'Please enter call notes before submitting', 'Missing Information');
            return;
        }

        setSavingCall(true);
        try {
            const response = await IrgApi.post(
                '/users/add-a-call',
                {
                    userId: lead._id,
                    call: callContent,
                    agentId: agent._id,
                },
                {
                    headers: { Authorization: `Bearer ${isLoggedIn}` },
                }
            );

            if (response.data.status === 'success') {
                setLead(response.data.data);
                setCallContent('');
                setShowLogCallDialog(false);
                showToast('success', 'Call has been successfully logged', 'Call Logged');
            }
        } catch (error) {
            console.error('Error logging call:', error);
            showToast('error', 'Failed to log call. Please try again.', 'Error');
        } finally {
            setSavingCall(false);
        }
    };

    // Handle creating a note
    const handleCreateNote = async () => {
        if (!noteContent.trim()) {
            showToast('warn', 'Please enter note content before submitting', 'Missing Information');
            return;
        }

        setSavingNote(true);
        try {
            const response = await IrgApi.post(
                '/users/add-a-note',
                {
                    userId: lead._id,
                    note: noteContent,
                    agentId: agent._id,
                },
                {
                    headers: { Authorization: `Bearer ${isLoggedIn}` },
                }
            );

            if (response.data.status === 'success') {
                setLead(response.data.data);
                setNoteContent('');
                setShowCreateNoteDialog(false);
                showToast('success', 'Note has been successfully created', 'Note Created');
            }
        } catch (error) {
            console.error('Error creating note:', error);
            showToast('error', 'Failed to create note. Please try again.', 'Error');
        } finally {
            setSavingNote(false);
        }
    };

    // Get notes and calls sorted by date (most recent first)
    const getNotesAndCalls = () => {
        const actions = lead?.agent_actions || [];
        const notesAndCalls = actions.filter(
            (action) => action.type === 'note' || action.type === 'call'
        );
        // Sort by date_created descending (most recent first)
        return notesAndCalls.sort((a, b) => {
            const dateA = new Date(a.date_created);
            const dateB = new Date(b.date_created);
            return dateB - dateA;
        });
    };

    // Handle adding a reminder
    const handleAddReminder = async () => {
        if (!reminderDate || !reminderDescription.trim()) {
            showToast('warn', 'Please select a date and enter a description', 'Missing Information');
            return;
        }

        setSavingReminder(true);
        try {
            const response = await IrgApi.post(
                '/users/add-reminder',
                {
                    userId: lead._id,
                    reminderDate: reminderDate,
                    type: reminderType,
                    description: reminderDescription,
                    agentId: agent._id,
                },
                {
                    headers: { Authorization: `Bearer ${isLoggedIn}` },
                }
            );

            if (response.data.status === 'success') {
                setLead(response.data.data);
                setReminderDate(null);
                setReminderType('general');
                setReminderDescription('');
                setShowAddReminderDialog(false);
                showToast('success', 'Reminder has been successfully added', 'Reminder Added');
            }
        } catch (error) {
            console.error('Error adding reminder:', error);
            showToast('error', 'Failed to add reminder. Please try again.', 'Error');
        } finally {
            setSavingReminder(false);
        }
    };

    // Handle marking reminder as complete
    const handleCompleteReminder = async (reminderId) => {
        try {
            const response = await IrgApi.post(
                '/users/update-reminder',
                {
                    userId: lead._id,
                    reminderId: reminderId,
                    completed: true,
                },
                {
                    headers: { Authorization: `Bearer ${isLoggedIn}` },
                }
            );

            if (response.data.status === 'success') {
                setLead(response.data.data);
                showToast('success', 'Reminder marked as complete', 'Reminder Completed');
            }
        } catch (error) {
            console.error('Error completing reminder:', error);
            showToast('error', 'Failed to complete reminder. Please try again.', 'Error');
        }
    };

    // Handle deleting a reminder
    const handleDeleteReminder = async (reminderId) => {
        try {
            const response = await IrgApi.post(
                '/users/delete-reminder',
                {
                    userId: lead._id,
                    reminderId: reminderId,
                },
                {
                    headers: { Authorization: `Bearer ${isLoggedIn}` },
                }
            );

            if (response.data.status === 'success') {
                setLead(response.data.data);
                showToast('success', 'Reminder has been deleted', 'Reminder Deleted');
            }
        } catch (error) {
            console.error('Error deleting reminder:', error);
            showToast('error', 'Failed to delete reminder. Please try again.', 'Error');
        }
    };

    // Get active reminders sorted by date (soonest first)
    const getActiveReminders = () => {
        const reminders = lead?.reminders || [];
        return reminders
            .filter((reminder) => !reminder.completed)
            .sort((a, b) => {
                const dateA = new Date(a.reminder_date);
                const dateB = new Date(b.reminder_date);
                return dateA - dateB;
            });
    };

    // Check if there's an upcoming reminder (within next 7 days)
    const hasUpcomingReminder = () => {
        const reminders = getActiveReminders();
        if (reminders.length === 0) return false;

        const now = new Date();
        const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        return reminders.some((reminder) => {
            const reminderDate = new Date(reminder.reminder_date);
            return reminderDate >= now && reminderDate <= sevenDaysFromNow;
        });
    };

    // Format phone number to (XXX) XXX-XXXX
    const formatPhoneNumber = (phoneNumber) => {
        if (!phoneNumber) return 'No phone';

        // Remove all non-numeric characters
        const cleaned = phoneNumber.toString().replace(/\D/g, '');

        // Check if we have 10 digits
        if (cleaned.length === 10) {
            return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
        }

        // If not 10 digits, return original
        return phoneNumber;
    };

    return (
        <MainLayout>
            <div className="lead-profile-page">
                {/* Header Section */}
                <div className="lead-profile-header">
                    <Card className="lead-profile-header-card">
                        <div className="lead-profile-header-content">
                            <div className="lead-profile-avatar-section">
                                <Avatar
                                    label={getInitials()}
                                    className="lead-profile-avatar"
                                    size="xlarge"
                                    shape="circle"
                                />
                                <div className="lead-profile-info">
                                    <div className="lead-profile-name-row">
                                        <h2 className="lead-profile-name">
                                            {lead?.first_name} {lead?.last_name}
                                        </h2>
                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                            <Chip
                                                label={category}
                                                className={`lead-status-chip status-${lead?.backend_profile?.lead_category}`}
                                            />
                                            {hasUpcomingReminder() && (
                                                <Chip
                                                    label="Follow-Up Soon"
                                                    icon="pi pi-bell"
                                                    style={{
                                                        backgroundColor: '#f59e0b',
                                                        color: 'white',
                                                        fontWeight: '600',
                                                        padding: '0.25rem 0.75rem',
                                                        fontSize: '0.875rem'
                                                    }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                    <div className="lead-profile-contact">
                                        <div className="contact-item">
                                            <i className="pi pi-phone"></i>
                                            <span>{formatPhoneNumber(lead?.phone_number)}</span>
                                        </div>
                                        <div className="contact-item">
                                            <i className="pi pi-envelope"></i>
                                            <span>{lead?.email || 'No email'}</span>
                                        </div>
                                        {lead?.user_location?.city && (
                                            <div className="contact-item">
                                                <i className="pi pi-map-marker"></i>
                                                <span>
                                                    {lead.user_location.city}
                                                    {lead.user_location.state &&
                                                        `, ${lead.user_location.state}`}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="lead-profile-meta">
                                        <span>
                                            <strong>Lead Type:</strong>{' '}
                                            {lead?.backend_profile?.lead_type || 'Not set'}
                                        </span>
                                        <span className="meta-divider">•</span>
                                        <span>
                                            <strong>Source:</strong>{' '}
                                            {lead?.backend_profile?.lead_source || 'Unknown'}
                                        </span>
                                        <span className="meta-divider">•</span>
                                        <span>
                                            <strong>Created:</strong>{' '}
                                            {lead?.date_created
                                                ? formatDate(lead.date_created)
                                                : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="lead-profile-actions">
                                <Button
                                    icon="pi pi-phone"
                                    label="Call"
                                    className="p-button-rounded p-button-success mr-2"
                                    onClick={() =>
                                        window.open(`tel:${lead?.phone_number}`, '_self')
                                    }
                                />
                                <Button
                                    icon="pi pi-envelope"
                                    label="Email"
                                    className="p-button-rounded p-button-info mr-2"
                                    onClick={() => window.open(`mailto:${lead?.email}`, '_self')}
                                />
                                <SplitButton
                                    label="Change Status"
                                    model={items}
                                    className="p-button-rounded"
                                />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Statistics Cards */}
                <div className="lead-profile-stats">
                    <div className="grid">
                        <div className="col-12 md:col-3">
                            <Card
                                className="stat-card clickable"
                                onClick={() => setShowViewedHomesDialog(true)}
                            >
                                <div className="stat-content">
                                    <i className="pi pi-home stat-icon"></i>
                                    <div className="stat-details">
                                        <span className="stat-value">
                                            {lead?.viewed_homes?.length || 0}
                                        </span>
                                        <span className="stat-label">Homes Viewed</span>
                                    </div>
                                </div>
                            </Card>
                        </div>
                        <div className="col-12 md:col-3">
                            <Card
                                className="stat-card clickable"
                                onClick={() => setShowFavoritedHomesDialog(true)}
                            >
                                <div className="stat-content">
                                    <i className="pi pi-heart stat-icon"></i>
                                    <div className="stat-details">
                                        <span className="stat-value">
                                            {lead?.favorited_homes?.length || 0}
                                        </span>
                                        <span className="stat-label">Favorited Homes</span>
                                    </div>
                                </div>
                            </Card>
                        </div>
                        <div className="col-12 md:col-3">
                            <Card
                                className="stat-card clickable"
                                onClick={() => setShowSearchHistoryDialog(true)}
                            >
                                <div className="stat-content">
                                    <i className="pi pi-search stat-icon"></i>
                                    <div className="stat-details">
                                        <span className="stat-value">
                                            {lead?.searches_performed?.length || 0}
                                        </span>
                                        <span className="stat-label">Searches Performed</span>
                                    </div>
                                </div>
                            </Card>
                        </div>
                        <div className="col-12 md:col-3">
                            <Card
                                className="stat-card clickable"
                                onClick={() => setShowSavedSearchesDialog(true)}
                            >
                                <div className="stat-content">
                                    <i className="pi pi-bookmark stat-icon"></i>
                                    <div className="stat-details">
                                        <span className="stat-value">
                                            {lead?.saved_searches?.length || 0}
                                        </span>
                                        <span className="stat-label">Saved Searches</span>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>

                    {/* Second Row of Stats */}
                    <div className="grid" style={{ marginTop: '1rem' }}>
                        <div className="col-12 md:col-3">
                            <Card className="stat-card">
                                <div className="stat-content">
                                    <i className="pi pi-dollar stat-icon"></i>
                                    <div className="stat-details">
                                        <span className="stat-value">{getAveragePrice()}</span>
                                        <span className="stat-label">Average Price</span>
                                    </div>
                                </div>
                            </Card>
                        </div>
                        <div className="col-12 md:col-3">
                            <Card className="stat-card">
                                <div className="stat-content">
                                    <i className="pi pi-clock stat-icon"></i>
                                    <div className="stat-details">
                                        <span className="stat-value">
                                            {formatLastVisit(lead?.last_visit)}
                                        </span>
                                        <span className="stat-label">Last Visit</span>
                                    </div>
                                </div>
                            </Card>
                        </div>
                        <div className="col-12 md:col-3">
                            <Card className="stat-card">
                                <div className="stat-content">
                                    <i className="pi pi-map-marker stat-icon"></i>
                                    <div className="stat-details">
                                        <span className="stat-value" style={{ fontSize: '1.2rem' }}>
                                            {getAreasSearched()}
                                        </span>
                                        <span className="stat-label">Areas Searched</span>
                                    </div>
                                </div>
                            </Card>
                        </div>
                        <div className="col-12 md:col-3">
                            <Card className="stat-card">
                                <div className="stat-content">
                                    <i className="pi pi-comment stat-icon"></i>
                                    <div className="stat-details">
                                        <span className="stat-value">3 days ago</span>
                                        <span className="stat-label">Last Contacted</span>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Reminders Section */}
                <div className="lead-reminders" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
                    <Card>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3 style={{
                                    fontSize: '1.25rem',
                                    fontWeight: '700',
                                    color: '#2c3e50',
                                    margin: 0
                                }}>
                                    Reminders & Follow-Ups
                                </h3>
                                <Button
                                    label="Add A Reminder"
                                    icon="pi pi-plus"
                                    className="p-button-warning"
                                    onClick={() => setShowAddReminderDialog(true)}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        fontSize: '0.9rem',
                                        fontWeight: '600'
                                    }}
                                />
                            </div>

                            {/* Reminders List */}
                            {getActiveReminders().length > 0 ? (
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '1rem'
                                }}>
                                    {getActiveReminders().map((reminder) => {
                                        const reminderDate = new Date(reminder.reminder_date);
                                        const now = new Date();
                                        const isOverdue = reminderDate < now;
                                        const daysUntil = Math.ceil((reminderDate - now) / (1000 * 60 * 60 * 24));

                                        return (
                                            <div
                                                key={reminder.id}
                                                style={{
                                                    padding: '1rem',
                                                    backgroundColor: isOverdue ? '#fee2e2' : '#fef3c7',
                                                    borderLeft: `4px solid ${isOverdue ? '#ef4444' : '#f59e0b'}`,
                                                    borderRadius: '8px',
                                                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
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
                                                                    color: isOverdue ? '#ef4444' : '#f59e0b'
                                                                }}
                                                            ></i>
                                                            <span style={{
                                                                fontWeight: '700',
                                                                fontSize: '0.95rem',
                                                                color: '#2c3e50',
                                                                textTransform: 'capitalize'
                                                            }}>
                                                                {reminder.type} Reminder
                                                            </span>
                                                            <span style={{
                                                                fontSize: '0.8rem',
                                                                padding: '0.2rem 0.5rem',
                                                                borderRadius: '12px',
                                                                backgroundColor: isOverdue ? '#ef4444' : '#f59e0b',
                                                                color: 'white',
                                                                fontWeight: '600'
                                                            }}>
                                                                {isOverdue ? 'Overdue' : `${daysUntil} day${daysUntil !== 1 ? 's' : ''}`}
                                                            </span>
                                                        </div>
                                                        <div style={{
                                                            fontSize: '0.9rem',
                                                            color: '#495057',
                                                            marginBottom: '0.5rem'
                                                        }}>
                                                            {reminder.description}
                                                        </div>
                                                        <div style={{
                                                            fontSize: '0.85rem',
                                                            color: '#6c757d'
                                                        }}>
                                                            Due: {reminderDate.toLocaleDateString('en-US', {
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
                                                            onClick={() => handleCompleteReminder(reminder.id)}
                                                            tooltip="Mark as complete"
                                                            tooltipOptions={{ position: 'top' }}
                                                        />
                                                        <Button
                                                            icon="pi pi-trash"
                                                            className="p-button-danger p-button-sm p-button-text"
                                                            onClick={() => handleDeleteReminder(reminder.id)}
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
                                    color: '#6c757d',
                                    backgroundColor: '#f8f9fa',
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

                {/* Activity Actions Section */}
                <div className="lead-activity-actions" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
                    <Card>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{
                                fontSize: '1.25rem',
                                fontWeight: '700',
                                color: '#2c3e50',
                                marginBottom: '1rem'
                            }}>
                                Activity Actions
                            </h3>
                            <div style={{
                                display: 'flex',
                                gap: '1rem',
                                flexWrap: 'wrap'
                            }}>
                                <Button
                                    label="Log A Call"
                                    icon="pi pi-phone"
                                    className="p-button-success"
                                    onClick={() => setShowLogCallDialog(true)}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        fontSize: '1rem',
                                        fontWeight: '600'
                                    }}
                                />
                                <Button
                                    label="Create A Note"
                                    icon="pi pi-file-edit"
                                    className="p-button-primary"
                                    onClick={() => setShowCreateNoteDialog(true)}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        fontSize: '1rem',
                                        fontWeight: '600'
                                    }}
                                />
                                <Button
                                    label="Send An Email"
                                    icon="pi pi-envelope"
                                    className="p-button-info"
                                    disabled
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        fontSize: '1rem',
                                        fontWeight: '600'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Notes and Calls History */}
                        <div style={{
                            borderTop: '1px solid #dee2e6',
                            paddingTop: '1.5rem'
                        }}>
                            <h4 style={{
                                fontSize: '1.1rem',
                                fontWeight: '700',
                                color: '#2c3e50',
                                marginBottom: '1rem'
                            }}>
                                Notes & Call History
                            </h4>
                            <ScrollPanel style={{ width: '100%', height: '400px' }}>
                                {getNotesAndCalls().length > 0 ? (
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '1rem'
                                    }}>
                                        {getNotesAndCalls().map((action, index) => (
                                            <div
                                                key={action.id || index}
                                                style={{
                                                    padding: '1rem',
                                                    backgroundColor: action.type === 'call' ? '#f0fdf4' : '#eff6ff',
                                                    borderLeft: `4px solid ${action.type === 'call' ? '#22c55e' : '#667eea'}`,
                                                    borderRadius: '8px',
                                                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                                                }}
                                            >
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'start',
                                                    marginBottom: '0.5rem'
                                                }}>
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem'
                                                    }}>
                                                        <i
                                                            className={`pi ${action.type === 'call' ? 'pi-phone' : 'pi-file-edit'}`}
                                                            style={{
                                                                fontSize: '1.1rem',
                                                                color: action.type === 'call' ? '#22c55e' : '#667eea'
                                                            }}
                                                        ></i>
                                                        <span style={{
                                                            fontWeight: '700',
                                                            fontSize: '0.95rem',
                                                            color: '#2c3e50',
                                                            textTransform: 'capitalize'
                                                        }}>
                                                            {action.type}
                                                        </span>
                                                    </div>
                                                    <span style={{
                                                        fontSize: '0.85rem',
                                                        color: '#6c757d'
                                                    }}>
                                                        {action.date_created
                                                            ? formatDate(action.date_created)
                                                            : 'Recent'}
                                                    </span>
                                                </div>
                                                <div style={{
                                                    fontSize: '0.95rem',
                                                    color: '#495057',
                                                    lineHeight: '1.6',
                                                    whiteSpace: 'pre-wrap'
                                                }}>
                                                    {action.value}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{
                                        textAlign: 'center',
                                        padding: '3rem',
                                        color: '#6c757d'
                                    }}>
                                        <i className="pi pi-inbox" style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}></i>
                                        <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No activity recorded yet</p>
                                        <p style={{ fontSize: '0.9rem' }}>Log a call or create a note to get started</p>
                                    </div>
                                )}
                            </ScrollPanel>
                        </div>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <div className="lead-profile-content">
                    <Card>
                        <TabView
                            activeIndex={activeIndex}
                            onTabChange={(e) => setActiveIndex(e.index)}
                        >
                            <TabPanel header="Activity & Notes" leftIcon="pi pi-comments mr-2">
                                <div className="activity-timeline">
                                    {lead?.agent_actions?.length ? (
                                        lead.agent_actions.map((item, index) => (
                                            <div className="activity-item" key={item._id || index}>
                                                <div className="activity-marker"></div>
                                                <div className="activity-card">
                                                    <div className="activity-header">
                                                        <div className="activity-type">
                                                            <i className="pi pi-comment"></i>
                                                            <span>{item.type}</span>
                                                        </div>
                                                        <span className="activity-date">
                                                            {item.date
                                                                ? formatDate(item.date)
                                                                : 'Recent'}
                                                        </span>
                                                    </div>
                                                    <div className="activity-content">
                                                        {item.value}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="empty-state">
                                            <i className="pi pi-inbox"></i>
                                            <p>No activity recorded yet</p>
                                        </div>
                                    )}
                                </div>
                            </TabPanel>
                            <TabPanel header="Viewed Homes" leftIcon="pi pi-home mr-2">
                                <ScrollPanel className="viewed-homes-scroll">
                                    <div className="properties-grid">
                                        {lead?.viewed_homes?.filter((home) => home?.property_viewed)
                                            .length > 0 ? (
                                            lead.viewed_homes
                                                .filter((home) => home?.property_viewed)
                                                .map((home) => (
                                                    <PrpCard
                                                        key={home._id}
                                                        property={home.property_viewed}
                                                    />
                                                ))
                                        ) : (
                                            <div className="empty-state">
                                                <i className="pi pi-home"></i>
                                                <p>No homes viewed yet</p>
                                            </div>
                                        )}
                                    </div>
                                </ScrollPanel>
                            </TabPanel>
                            <TabPanel header="Saved Searches" leftIcon="pi pi-bookmark mr-2">
                                <div className="saved-searches-list">
                                    {lead?.saved_searches?.length ? (
                                        lead.saved_searches.map((search, index) => (
                                            <Card
                                                key={search.searchId || index}
                                                className="search-card"
                                            >
                                                <div className="search-content">
                                                    <div className="search-header">
                                                        <i className="pi pi-bookmark"></i>
                                                        <h4>{search.searchName}</h4>
                                                    </div>
                                                    <p className="search-frequency">
                                                        <strong>Frequency:</strong>{' '}
                                                        {search.searchFrequency}
                                                    </p>
                                                </div>
                                            </Card>
                                        ))
                                    ) : (
                                        <div className="empty-state">
                                            <i className="pi pi-bookmark"></i>
                                            <p>No saved searches</p>
                                        </div>
                                    )}
                                </div>
                            </TabPanel>
                            <TabPanel header="Search History" leftIcon="pi pi-search mr-2">
                                <div className="search-history-list">
                                    {lead?.searches_performed?.length ? (
                                        lead.searches_performed.map((search, index) => (
                                            <Card
                                                key={search.date_viewed || index}
                                                className="history-card"
                                            >
                                                <div className="history-content">
                                                    <div className="history-main">
                                                        <i className="pi pi-search"></i>
                                                        <div className="history-details">
                                                            <h4>{search.searchTerm}</h4>
                                                            <Badge
                                                                value={search.searchType}
                                                                severity="info"
                                                            />
                                                        </div>
                                                    </div>
                                                    <span className="history-date">
                                                        {formatDate(search.date_viewed)}
                                                    </span>
                                                </div>
                                            </Card>
                                        ))
                                    ) : (
                                        <div className="empty-state">
                                            <i className="pi pi-search"></i>
                                            <p>No search history</p>
                                        </div>
                                    )}
                                </div>
                            </TabPanel>
                            <TabPanel header="Email History" leftIcon="pi pi-envelope mr-2">
                                <div className="email-history-container">
                                    {loadingEmails ? (
                                        <div className="empty-state">
                                            <i className="pi pi-spin pi-spinner"></i>
                                            <p>Loading emails...</p>
                                        </div>
                                    ) : emails.length > 0 ? (
                                        <Accordion>
                                            {emails.map((email, index) => (
                                                <AccordionTab
                                                    key={email.id || index}
                                                    header={
                                                        <div className="email-header">
                                                            <div className="email-header-left">
                                                                <i
                                                                    className={`pi ${
                                                                        email.direction === 'sent'
                                                                            ? 'pi-send'
                                                                            : 'pi-inbox'
                                                                    }`}
                                                                ></i>
                                                                <span className="email-subject">
                                                                    {email.subject || '(No Subject)'}
                                                                </span>
                                                            </div>
                                                            <span className="email-date">
                                                                {formatDate(email.date)}
                                                            </span>
                                                        </div>
                                                    }
                                                >
                                                    <div className="email-content">
                                                        <div className="email-meta">
                                                            <div className="email-meta-row">
                                                                <strong>From:</strong>{' '}
                                                                <span>{email.from}</span>
                                                            </div>
                                                            <div className="email-meta-row">
                                                                <strong>To:</strong>{' '}
                                                                <span>{email.to}</span>
                                                            </div>
                                                            <div className="email-meta-row">
                                                                <strong>Date:</strong>{' '}
                                                                <span>
                                                                    {new Date(
                                                                        email.date
                                                                    ).toLocaleString()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div
                                                            className="email-body"
                                                            dangerouslySetInnerHTML={{
                                                                __html: email.body || email.textBody,
                                                            }}
                                                        />
                                                    </div>
                                                </AccordionTab>
                                            ))}
                                        </Accordion>
                                    ) : (
                                        <div className="empty-state">
                                            <i className="pi pi-envelope"></i>
                                            <p>No email history found</p>
                                        </div>
                                    )}
                                </div>
                            </TabPanel>
                        </TabView>
                    </Card>
                </div>

                {/* Viewed Homes Dialog */}
                <Dialog
                    header="Viewed Homes"
                    visible={showViewedHomesDialog}
                    style={{ width: '90vw', maxWidth: '1200px' }}
                    onHide={() => setShowViewedHomesDialog(false)}
                    maximizable
                >
                    <div className="dialog-properties-grid">
                        {lead?.viewed_homes?.filter((home) => home?.property_viewed).length > 0 ? (
                            lead.viewed_homes
                                .filter((home) => home?.property_viewed)
                                .map((home) => (
                                    <PrpCard key={home._id} property={home.property_viewed} />
                                ))
                        ) : (
                            <div className="empty-state">
                                <i className="pi pi-home"></i>
                                <p>No homes viewed yet</p>
                            </div>
                        )}
                    </div>
                </Dialog>

                {/* Favorited Homes Dialog */}
                <Dialog
                    header="Favorited Homes"
                    visible={showFavoritedHomesDialog}
                    style={{ width: '90vw', maxWidth: '1200px' }}
                    onHide={() => setShowFavoritedHomesDialog(false)}
                    maximizable
                >
                    <div className="dialog-properties-grid">
                        {lead?.favorited_homes?.filter((home) => home?.property_favorited).length >
                        0 ? (
                            lead.favorited_homes
                                .filter((home) => home?.property_favorited)
                                .map((home) => (
                                    <PrpCard key={home._id} property={home.property_favorited} />
                                ))
                        ) : (
                            <div className="empty-state">
                                <i className="pi pi-heart"></i>
                                <p>No favorited homes</p>
                            </div>
                        )}
                    </div>
                </Dialog>

                {/* Search History Dialog */}
                <Dialog
                    header="Search History"
                    visible={showSearchHistoryDialog}
                    style={{ width: '80vw', maxWidth: '900px' }}
                    onHide={() => setShowSearchHistoryDialog(false)}
                    maximizable
                >
                    <div className="search-history-list">
                        {lead?.searches_performed?.length ? (
                            lead.searches_performed.map((search, index) => (
                                <Card key={search.date_viewed || index} className="history-card">
                                    <div className="history-content">
                                        <div className="history-main">
                                            <i className="pi pi-search"></i>
                                            <div className="history-details">
                                                <h4>{search.searchTerm}</h4>
                                                <Badge value={search.searchType} severity="info" />
                                            </div>
                                        </div>
                                        <span className="history-date">
                                            {formatDate(search.date_viewed)}
                                        </span>
                                    </div>
                                </Card>
                            ))
                        ) : (
                            <div className="empty-state">
                                <i className="pi pi-search"></i>
                                <p>No search history</p>
                            </div>
                        )}
                    </div>
                </Dialog>

                {/* Saved Searches Dialog */}
                <Dialog
                    header="Saved Searches"
                    visible={showSavedSearchesDialog}
                    style={{ width: '80vw', maxWidth: '900px' }}
                    onHide={() => setShowSavedSearchesDialog(false)}
                    maximizable
                >
                    <div className="saved-searches-list">
                        {lead?.saved_searches?.length ? (
                            lead.saved_searches.map((search, index) => (
                                <Card key={search.searchId || index} className="search-card">
                                    <div className="search-content">
                                        <div className="search-header">
                                            <i className="pi pi-bookmark"></i>
                                            <h4>{search.searchName}</h4>
                                        </div>
                                        <p className="search-frequency">
                                            <strong>Frequency:</strong> {search.searchFrequency}
                                        </p>
                                    </div>
                                </Card>
                            ))
                        ) : (
                            <div className="empty-state">
                                <i className="pi pi-bookmark"></i>
                                <p>No saved searches</p>
                            </div>
                        )}
                    </div>
                </Dialog>

                {/* Log Call Dialog */}
                <Dialog
                    header="Log A Call"
                    visible={showLogCallDialog}
                    style={{ width: '600px' }}
                    onHide={() => {
                        setShowLogCallDialog(false);
                        setCallContent('');
                    }}
                    footer={
                        <div>
                            <Button
                                label="Cancel"
                                icon="pi pi-times"
                                onClick={() => {
                                    setShowLogCallDialog(false);
                                    setCallContent('');
                                }}
                                className="p-button-text"
                            />
                            <Button
                                label="Save Call"
                                icon="pi pi-check"
                                onClick={handleLogCall}
                                loading={savingCall}
                                className="p-button-success"
                            />
                        </div>
                    }
                >
                    <div style={{ padding: '1rem 0' }}>
                        <label
                            htmlFor="call-notes"
                            style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                fontWeight: '600',
                                color: '#495057'
                            }}
                        >
                            Call Notes
                        </label>
                        <InputTextarea
                            id="call-notes"
                            value={callContent}
                            onChange={(e) => setCallContent(e.target.value)}
                            rows={8}
                            placeholder="Enter notes about this call..."
                            style={{ width: '100%', fontFamily: 'inherit' }}
                            autoFocus
                        />
                        <small style={{ display: 'block', marginTop: '0.5rem', color: '#6c757d' }}>
                            Document key points from your conversation with {lead?.first_name}
                        </small>
                    </div>
                </Dialog>

                {/* Create Note Dialog */}
                <Dialog
                    header="Create A Note"
                    visible={showCreateNoteDialog}
                    style={{ width: '600px' }}
                    onHide={() => {
                        setShowCreateNoteDialog(false);
                        setNoteContent('');
                    }}
                    footer={
                        <div>
                            <Button
                                label="Cancel"
                                icon="pi pi-times"
                                onClick={() => {
                                    setShowCreateNoteDialog(false);
                                    setNoteContent('');
                                }}
                                className="p-button-text"
                            />
                            <Button
                                label="Save Note"
                                icon="pi pi-check"
                                onClick={handleCreateNote}
                                loading={savingNote}
                                className="p-button-primary"
                            />
                        </div>
                    }
                >
                    <div style={{ padding: '1rem 0' }}>
                        <label
                            htmlFor="note-content"
                            style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                fontWeight: '600',
                                color: '#495057'
                            }}
                        >
                            Note Content
                        </label>
                        <InputTextarea
                            id="note-content"
                            value={noteContent}
                            onChange={(e) => setNoteContent(e.target.value)}
                            rows={8}
                            placeholder="Enter your note about this lead..."
                            style={{ width: '100%', fontFamily: 'inherit' }}
                            autoFocus
                        />
                        <small style={{ display: 'block', marginTop: '0.5rem', color: '#6c757d' }}>
                            Add important information or observations about {lead?.first_name}
                        </small>
                    </div>
                </Dialog>

                {/* Add Reminder Dialog */}
                <Dialog
                    header="Add A Reminder"
                    visible={showAddReminderDialog}
                    style={{ width: '600px' }}
                    onHide={() => {
                        setShowAddReminderDialog(false);
                        setReminderDate(null);
                        setReminderType('general');
                        setReminderDescription('');
                    }}
                    footer={
                        <div>
                            <Button
                                label="Cancel"
                                icon="pi pi-times"
                                onClick={() => {
                                    setShowAddReminderDialog(false);
                                    setReminderDate(null);
                                    setReminderType('general');
                                    setReminderDescription('');
                                }}
                                className="p-button-text"
                            />
                            <Button
                                label="Save Reminder"
                                icon="pi pi-check"
                                onClick={handleAddReminder}
                                loading={savingReminder}
                                className="p-button-warning"
                            />
                        </div>
                    }
                >
                    <div style={{ padding: '1rem 0' }}>
                        {/* Reminder Date */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label
                                htmlFor="reminder-date"
                                style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#495057'
                                }}
                            >
                                Reminder Date *
                            </label>
                            <Calendar
                                id="reminder-date"
                                value={reminderDate}
                                onChange={(e) => setReminderDate(e.value)}
                                showIcon
                                dateFormat="mm/dd/yy"
                                placeholder="Select a date"
                                style={{ width: '100%' }}
                                minDate={new Date()}
                            />
                            <small style={{ display: 'block', marginTop: '0.25rem', color: '#6c757d' }}>
                                When should we remind you?
                            </small>
                        </div>

                        {/* Reminder Type */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label
                                htmlFor="reminder-type"
                                style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#495057'
                                }}
                            >
                                Reminder Type
                            </label>
                            <Dropdown
                                id="reminder-type"
                                value={reminderType}
                                onChange={(e) => setReminderType(e.value)}
                                options={[
                                    { label: 'General Follow-Up', value: 'general' },
                                    { label: 'Call Lead', value: 'call' },
                                    { label: 'Email Lead', value: 'email' },
                                ]}
                                placeholder="Select reminder type"
                                style={{ width: '100%' }}
                            />
                        </div>

                        {/* Reminder Description */}
                        <div>
                            <label
                                htmlFor="reminder-description"
                                style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#495057'
                                }}
                            >
                                Description *
                            </label>
                            <InputTextarea
                                id="reminder-description"
                                value={reminderDescription}
                                onChange={(e) => setReminderDescription(e.target.value)}
                                rows={5}
                                placeholder="What do you need to follow up on?"
                                style={{ width: '100%', fontFamily: 'inherit' }}
                                autoFocus
                            />
                            <small style={{ display: 'block', marginTop: '0.5rem', color: '#6c757d' }}>
                                Add notes about what you need to do or discuss with {lead?.first_name}
                            </small>
                        </div>
                    </div>
                </Dialog>
            </div>
        </MainLayout>
    );
};

export default Lead;
