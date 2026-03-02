// React & NextJS
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import DOMPurify from 'isomorphic-dompurify';

// Quill Editor Styles
import 'react-quill-new/dist/quill.snow.css';

// Redux
import { useSelector, useDispatch } from 'react-redux';
import { UPDATE_SINGLE_LEAD } from '../../store/actions/types';

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
const Checkbox = dynamic(() => import('primereact/checkbox').then((mod) => mod.Checkbox), {
    ssr: false,
});
const InputText = dynamic(() => import('primereact/inputtext').then((mod) => mod.InputText), {
    ssr: false,
});
const ReactQuill = dynamic(() => import('react-quill-new'), {
    ssr: false,
    loading: () => <p>Loading editor...</p>,
});

// IRG Components
import MainLayout from '../../components/layout/MainLayout';
import PrpCard from '../../components/prpCard/PrpCard';

// IRG API
import IrgApi from '../../assets/irgApi';

// Utils
import showToast from '../../utils/showToast';
import getLeadDisplayName, { getLeadInitials } from '../../utils/getLeadDisplayName';

const Lead = () => {
    // __________________Redux State______________________\\
    const leads = useSelector((state) => state.allLeadsPage.leads);
    const isLoggedIn = useSelector((state) => state.isLoggedIn);
    const agent = useSelector((state) => state.agent);
    const dispatch = useDispatch();

    const [lead, setLead] = useState({});
    const [leadLoading, setLeadLoading] = useState(true);
    const [leadNotFound, setLeadNotFound] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [category, setCategory] = useState('');
    const [statusOpen, setStatusOpen] = useState(false);
    const statusRef = useRef(null);
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

    // Transfer lead state
    const [showTransferLeadDialog, setShowTransferLeadDialog] = useState(false);
    const [agents, setAgents] = useState([]);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [notifyAgent, setNotifyAgent] = useState(false);
    const [transferNote, setTransferNote] = useState('');
    const [transferring, setTransferring] = useState(false);
    const [loadingAgents, setLoadingAgents] = useState(false);

    // Send Email state
    const [showSendEmailDialog, setShowSendEmailDialog] = useState(false);
    const [emailSubject, setEmailSubject] = useState('');
    const getInitialEmailBody = () =>
        agent?.email_signature ? `<p><br></p><p><br></p>---<br>${agent.email_signature}` : '';
    const [emailBody, setEmailBody] = useState(getInitialEmailBody());
    const [sendingEmail, setSendingEmail] = useState(false);

    // Add to Google Contacts state
    const [addingToContacts, setAddingToContacts] = useState(false);

    // Drip Campaigns state
    const [showEnrollDripDialog, setShowEnrollDripDialog] = useState(false);
    const [availableCampaigns, setAvailableCampaigns] = useState([]);
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [enrollingDrip, setEnrollingDrip] = useState(false);
    const [loadingCampaigns, setLoadingCampaigns] = useState(false);

    // Lead Type inline edit state
    const [editingLeadType, setEditingLeadType] = useState(false);
    const [savingLeadType, setSavingLeadType] = useState(false);

    // Quill Editor Configuration
    const quillModules = {
        toolbar: [
            [{ header: [1, 2, 3, false] }],
            [{ size: ['small', false, 'large', 'huge'] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ color: [] }, { background: [] }],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ align: [] }],
            ['link', 'image'],
            ['clean'],
            // Placeholder for signature button - will be added later
        ],
    };

    const quillFormats = [
        'header',
        'size',
        'bold',
        'italic',
        'underline',
        'strike',
        'color',
        'background',
        'list',
        'bullet',
        'align',
        'link',
        'image',
    ];

    const router = useRouter();

    const { id: leadId } = router.query;

    useEffect(() => {
        if (!router.isReady || !leadId || !isLoggedIn) return;

        // Instant: show cached Redux data while API fetch is in-flight
        const cached = leads.find((l) => l._id === leadId);
        if (cached) {
            setLead(cached);
            setLeadLoading(false);
        }

        // Always fetch fresh from DB as source of truth
        const fetchLead = async () => {
            try {
                const response = await IrgApi.post(
                    '/users/user',
                    { userId: leadId },
                    { headers: { Authorization: `Bearer ${isLoggedIn}` } }
                );
                if (response.data.status === 'success') {
                    setLead(response.data.data);
                    setLeadNotFound(false);
                    dispatch({ type: UPDATE_SINGLE_LEAD, payload: response.data.data });
                }
            } catch (error) {
                if (!cached) setLeadNotFound(true);
                showToast('error', 'Failed to load lead data', 'Error');
            } finally {
                setLeadLoading(false);
            }
        };

        fetchLead();

        return () => setLead({});
    }, [router.isReady, leadId]); // eslint-disable-line

    useEffect(() => {
        if (lead?.backend_profile?.lead_category) {
            const cat =
                lead.backend_profile.lead_category.charAt(0).toUpperCase() +
                lead.backend_profile.lead_category.slice(1);
            setCategory(cat);
        }
    }, [lead]);

    // Close status dropdown on click-outside or Escape
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (statusRef.current && !statusRef.current.contains(e.target)) {
                setStatusOpen(false);
            }
        };
        const handleEscape = (e) => {
            if (e.key === 'Escape') setStatusOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, []);

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
            const response = await IrgApi.get(`/google/gmail/emails/${encodeURIComponent(lead.email)}`, {
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
            // Silently fail if Google is not connected
            if (error.response?.status !== 401) {
                // Non-critical — email fetch failed silently
            }
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

    const LEAD_TYPE_OPTIONS = [
        { label: 'Buyer', value: 'Buyer' },
        { label: 'Seller', value: 'Seller' },
        { label: 'Buyer & Seller', value: 'Buyer & Seller' },
    ];

    const updateLeadType = async (newType) => {
        if (newType === lead?.backend_profile?.lead_type) {
            setEditingLeadType(false);
            return;
        }

        const previousLead = { ...lead };
        setSavingLeadType(true);

        // Optimistic update
        setLead((prev) => ({
            ...prev,
            backend_profile: { ...prev.backend_profile, lead_type: newType },
        }));
        setEditingLeadType(false);

        try {
            const response = await IrgApi.get(
                `/agents/change-lead-type/${encodeURIComponent(newType)}/${leadId}`,
                { headers: { Authorization: `Bearer ${isLoggedIn}` } }
            );
            if (response.data.status === 'success') {
                setLead(response.data.data);
                dispatch({ type: UPDATE_SINGLE_LEAD, payload: response.data.data });
                showToast('success', `Lead type updated to ${newType}`, 'Updated');
            }
        } catch (error) {
            setLead(previousLead);
            showToast('error', error.response?.data?.message || 'Failed to update lead type', 'Error');
        } finally {
            setSavingLeadType(false);
        }
    };

    const STATUS_OPTIONS = [
        { label: 'New', value: 'new' },
        { label: 'Nurture', value: 'nurture' },
        { label: 'Watch', value: 'watch' },
        { label: 'Qualify', value: 'qualify' },
        { label: 'Pending', value: 'pending' },
        { label: 'Closed', value: 'closed' },
        { label: 'Hot', value: 'hot' },
        { label: 'Archive', value: 'archive' },
        { label: 'Trash', value: 'trash' },
    ];

    const updateStatus = async (newStatus) => {
        const previousCategory = category;
        const previousLead = { ...lead };

        // Optimistic update
        const capitalizedStatus = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
        setCategory(capitalizedStatus);
        setLead((prev) => ({
            ...prev,
            backend_profile: { ...prev.backend_profile, lead_category: newStatus },
        }));
        setStatusOpen(false);

        try {
            const response = await IrgApi.get(
                `/agents/change-category/${newStatus}/${leadId}`,
                { headers: { Authorization: `Bearer ${isLoggedIn}` } }
            );
            if (response.data.status === 'success') {
                setLead(response.data.data);
                dispatch({ type: UPDATE_SINGLE_LEAD, payload: response.data.data });
                showToast('success', `Status updated to ${capitalizedStatus}`, 'Updated');
            }
        } catch (error) {
            // Revert on failure
            setCategory(previousCategory);
            setLead(previousLead);
            showToast('error', error.response?.data?.message || 'Failed to update status', 'Error');
        }
    };

    const getInitials = () => getLeadInitials(lead);

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
                dispatch({ type: UPDATE_SINGLE_LEAD, payload: response.data.data });
                setCallContent('');
                setShowLogCallDialog(false);
                showToast('success', 'Call has been successfully logged', 'Call Logged');
            }
        } catch (error) {
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
                dispatch({ type: UPDATE_SINGLE_LEAD, payload: response.data.data });
                setNoteContent('');
                setShowCreateNoteDialog(false);
                showToast('success', 'Note has been successfully created', 'Note Created');
            }
        } catch (error) {
            showToast('error', 'Failed to create note. Please try again.', 'Error');
        } finally {
            setSavingNote(false);
        }
    };

    // Get all activity (notes, calls, sent emails, received emails) sorted by date
    const getAllActivity = () => {
        const actions = lead?.agent_actions || [];
        const filtered = actions.filter(
            (action) => action.type === 'note' || action.type === 'call' || action.type === 'email'
        );

        // Build a set of gmail_ids already in agent_actions to avoid duplicates
        const loggedGmailIds = new Set(
            filtered.filter((a) => a.gmail_id).map((a) => a.gmail_id)
        );

        // Merge Gmail emails that aren't already logged (received emails + any missed sent)
        const gmailItems = emails
            .filter((e) => !loggedGmailIds.has(e.id))
            .map((e) => ({
                _source: 'gmail',
                type: e.direction === 'received' ? 'email_received' : 'email',
                date_created: new Date(e.date),
                value: e.body,
                subject: e.subject,
                from: e.from,
                to: e.to,
                id: e.id,
            }));

        const allItems = [...filtered, ...gmailItems];

        // Sort by date descending (most recent first)
        return allItems.sort((a, b) => {
            const dateA = new Date(a.date_created);
            const dateB = new Date(b.date_created);
            return dateB - dateA;
        });
    };

    // Get last contacted text from calls and emails
    const getLastContactedText = () => {
        const actions = lead?.agent_actions || [];
        const contactActions = actions.filter(
            (action) => action.type === 'call' || action.type === 'email'
        );

        if (contactActions.length === 0) {
            return 'Not Contacted Yet';
        }

        // Sort by date_created descending (most recent first)
        const sortedActions = contactActions.sort((a, b) => {
            const dateA = new Date(a.date_created);
            const dateB = new Date(b.date_created);
            return dateB - dateA;
        });

        const mostRecent = sortedActions[0];
        const contactDate = new Date(mostRecent.date_created);
        const now = new Date();
        const diffMs = now - contactDate;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return 'Today';
        } else if (diffDays === 1) {
            return '1 day ago';
        } else {
            return `${diffDays} days ago`;
        }
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
                dispatch({ type: UPDATE_SINGLE_LEAD, payload: response.data.data });
                setReminderDate(null);
                setReminderType('general');
                setReminderDescription('');
                setShowAddReminderDialog(false);
                showToast('success', 'Reminder has been successfully added', 'Reminder Added');
            }
        } catch (error) {
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
                dispatch({ type: UPDATE_SINGLE_LEAD, payload: response.data.data });
                showToast('success', 'Reminder marked as complete', 'Reminder Completed');
            }
        } catch (error) {
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
                dispatch({ type: UPDATE_SINGLE_LEAD, payload: response.data.data });
                showToast('success', 'Reminder has been deleted', 'Reminder Deleted');
            }
        } catch (error) {
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

    // Handle sending email through Gmail
    const handleSendEmail = async () => {
        if (!emailSubject.trim()) {
            showToast('warn', 'Please enter an email subject', 'Missing Subject');
            return;
        }

        // Strip HTML tags to check if there's actual content
        const strippedBody = emailBody.replace(/<[^>]*>/g, '').trim();
        if (!strippedBody) {
            showToast('warn', 'Please enter email content', 'Missing Content');
            return;
        }

        if (!lead.email) {
            showToast('error', 'This lead does not have an email address', 'No Email');
            return;
        }

        setSendingEmail(true);

        try {
            // Send email through Gmail API
            const response = await IrgApi.post(
                '/google/gmail/send',
                {
                    to: lead.email,
                    subject: emailSubject,
                    body: emailBody, // Rich HTML content from Quill editor
                    leadId: lead._id,
                },
                {
                    headers: { Authorization: `Bearer ${isLoggedIn}` },
                }
            );

            if (response.data.status === 'success') {
                showToast('success', `Email sent successfully to ${getLeadDisplayName(lead)}!`, 'Success');
                setEmailSubject('');
                setEmailBody(getInitialEmailBody());
                setShowSendEmailDialog(false);

                // Refresh lead data to show new email in agent actions
                const updatedLead = await IrgApi.post(
                    '/users/user',
                    { userId: lead._id },
                    { headers: { Authorization: `Bearer ${isLoggedIn}` } }
                );
                if (updatedLead.data.status === 'success') {
                    setLead(updatedLead.data.data);
                }
            }
        } catch (error) {
            // Check if it's an authorization error (Google not connected)
            if (error.response?.status === 401) {
                showToast(
                    'error',
                    'Please connect your Google account in Settings to send emails',
                    'Google Not Connected'
                );
            } else {
                showToast('error', 'Failed to send email. Please try again.', 'Error');
            }
        } finally {
            setSendingEmail(false);
        }
    };

    // Handle adding lead to Google Contacts
    const handleAddToGoogleContacts = async () => {
        setAddingToContacts(true);

        try {
            const response = await IrgApi.post(
                '/google/contacts/add',
                {
                    leadId: lead._id,
                },
                {
                    headers: { Authorization: `Bearer ${isLoggedIn}` },
                }
            );

            if (response.data.status === 'success') {
                showToast('success', `${getLeadDisplayName(lead)} added to Google Contacts!`, 'Success');
            }
        } catch (error) {
            // Check if it's an authorization error (Google not connected)
            if (error.response?.status === 401) {
                showToast(
                    'error',
                    'Please connect your Google account in Settings to add contacts',
                    'Google Not Connected'
                );
            } else {
                showToast('error', 'Failed to add to Google Contacts. Please try again.', 'Error');
            }
        } finally {
            setAddingToContacts(false);
        }
    };

    // Drip Campaign handlers
    const fetchAvailableCampaigns = async () => {
        setLoadingCampaigns(true);
        try {
            const response = await IrgApi.get('/drip-campaigns', {
                headers: { Authorization: `Bearer ${isLoggedIn}` },
            });
            if (response.data.status === 'success') {
                setAvailableCampaigns(response.data.data);
            }
        } catch (error) {
            showToast('error', 'Failed to load campaigns', 'Error');
        } finally {
            setLoadingCampaigns(false);
        }
    };

    const handleEnrollInCampaign = async () => {
        if (!selectedCampaign) return;
        setEnrollingDrip(true);
        try {
            const response = await IrgApi.post(
                '/drip-campaigns/enroll',
                { userId: lead._id, campaignId: selectedCampaign },
                { headers: { Authorization: `Bearer ${isLoggedIn}` } }
            );
            if (response.data.status === 'success') {
                setLead(response.data.data);
                dispatch({ type: UPDATE_SINGLE_LEAD, payload: response.data.data });
                showToast('success', 'Lead enrolled in campaign', 'Success');
                setShowEnrollDripDialog(false);
                setSelectedCampaign(null);
            }
        } catch (error) {
            showToast('error', error.response?.data?.message || 'Failed to enroll', 'Error');
        } finally {
            setEnrollingDrip(false);
        }
    };

    const handleUnenrollFromCampaign = async (campaignId) => {
        try {
            const response = await IrgApi.post(
                '/drip-campaigns/unenroll',
                { userId: lead._id, campaignId },
                { headers: { Authorization: `Bearer ${isLoggedIn}` } }
            );
            if (response.data.status === 'success') {
                setLead(response.data.data);
                dispatch({ type: UPDATE_SINGLE_LEAD, payload: response.data.data });
                showToast('success', 'Lead removed from campaign', 'Success');
            }
        } catch (error) {
            showToast('error', 'Failed to remove from campaign', 'Error');
        }
    };

    const getDripCampaignProgress = (enrollment) => {
        if (!enrollment?.scheduled_emails) return { sent: 0, total: 0, percent: 0 };
        const sent = enrollment.scheduled_emails.filter((e) => e.sent).length;
        const total = enrollment.scheduled_emails.length;
        const percent = total > 0 ? Math.round((sent / total) * 100) : 0;
        return { sent, total, percent };
    };

    const getLastSentDate = (enrollment) => {
        if (!enrollment?.scheduled_emails) return null;
        const sentEmails = enrollment.scheduled_emails.filter((e) => e.sent && e.sent_date);
        if (sentEmails.length === 0) return null;
        sentEmails.sort((a, b) => new Date(b.sent_date) - new Date(a.sent_date));
        return sentEmails[0].sent_date;
    };

    const getLastOpenedDate = (enrollment) => {
        if (!enrollment?.scheduled_emails) return null;
        const openedEmails = enrollment.scheduled_emails.filter((e) => e.opened && e.last_opened_date);
        if (openedEmails.length === 0) return null;
        openedEmails.sort((a, b) => new Date(b.last_opened_date) - new Date(a.last_opened_date));
        return openedEmails[0].last_opened_date;
    };

    const getDripTypeBadgeColor = (type) => {
        const colors = {
            Buyer: { bg: 'hsl(var(--primary) / 0.12)', color: 'hsl(var(--primary))', border: 'hsl(var(--primary) / 0.35)' },
            Seller: { bg: 'hsl(var(--success) / 0.12)', color: 'hsl(var(--success))', border: 'hsl(var(--success) / 0.35)' },
            Both: { bg: 'hsl(var(--secondary) / 0.12)', color: 'hsl(var(--secondary))', border: 'hsl(var(--secondary) / 0.35)' },
        };
        return colors[type] || colors.Both;
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

    // Fetch agents for transfer when dialog opens
    const fetchAgentsForTransfer = async () => {
        setLoadingAgents(true);
        try {
            const response = await IrgApi.get('/agents/agents-for-transfer', {
                headers: { Authorization: `Bearer ${isLoggedIn}` },
            });

            if (response.data.status === 'success') {
                // Format agents for dropdown
                const formattedAgents = response.data.data.map((ag) => ({
                    label: `${ag.name} - ${ag.title}`,
                    value: ag._id,
                    ...ag,
                }));
                setAgents(formattedAgents);
            }
        } catch (error) {
            showToast('error', 'Failed to load agents', 'Error');
        } finally {
            setLoadingAgents(false);
        }
    };

    // Handle opening transfer dialog
    const handleOpenTransferDialog = () => {
        setShowTransferLeadDialog(true);
        fetchAgentsForTransfer();
    };

    // Handle transferring the lead
    const handleTransferLead = async () => {
        if (!selectedAgent) {
            showToast('warn', 'Please select an agent to transfer to', 'Missing Information');
            return;
        }

        setTransferring(true);
        try {
            const response = await IrgApi.post(
                '/agents/transfer-lead',
                {
                    leadId: lead._id,
                    newAgentId: selectedAgent,
                    note: transferNote,
                    notifyAgent: notifyAgent,
                },
                {
                    headers: { Authorization: `Bearer ${isLoggedIn}` },
                }
            );

            if (response.data.status === 'success') {
                setLead(response.data.data);
                dispatch({ type: UPDATE_SINGLE_LEAD, payload: response.data.data });
                setShowTransferLeadDialog(false);
                setSelectedAgent(null);
                setNotifyAgent(false);
                setTransferNote('');
                showToast('success', 'Lead has been successfully transferred', 'Lead Transferred');
            }
        } catch (error) {
            showToast('error', 'Failed to transfer lead. Please try again.', 'Error');
        } finally {
            setTransferring(false);
        }
    };

    if (leadLoading && !lead?.first_name) {
        return (
            <MainLayout>
                <div className="lead-profile-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                    <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }} />
                </div>
            </MainLayout>
        );
    }

    if (leadNotFound) {
        return (
            <MainLayout>
                <div className="lead-profile-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '1rem' }}>
                    <i className="pi pi-user-minus" style={{ fontSize: '3rem', color: 'hsl(var(--foreground-muted))' }} />
                    <h2 style={{ margin: 0, color: 'hsl(var(--foreground))' }}>Lead Not Found</h2>
                    <p style={{ color: 'hsl(var(--foreground-muted))', margin: 0 }}>
                        This lead may have been removed or you may not have access.
                    </p>
                    <button
                        type="button"
                        className="lead-profile-back"
                        onClick={() => router.push('/leads')}
                        style={{ marginTop: '0.5rem' }}
                    >
                        <i className="pi pi-arrow-left" />
                        Back to Leads
                    </button>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="lead-profile-page">
                {/* Back Navigation */}
                <button
                    type="button"
                    className="lead-profile-back"
                    onClick={() => router.push('/leads')}
                >
                    <i className="pi pi-arrow-left" />
                    Back to Leads
                </button>

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
                                            {getLeadDisplayName(lead)}
                                        </h2>
                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                            <div className="lead-status-pill" ref={statusRef}>
                                                <button
                                                    className={`lead-status-pill__trigger status-${lead?.backend_profile?.lead_category}`}
                                                    onClick={() => setStatusOpen((prev) => !prev)}
                                                    type="button"
                                                >
                                                    {category}
                                                    <i className="pi pi-chevron-down lead-status-pill__chevron" />
                                                </button>
                                                {statusOpen && (
                                                    <div className="lead-status-pill__dropdown animate-slide-down">
                                                        {STATUS_OPTIONS.map((opt) => {
                                                            const isActive =
                                                                lead?.backend_profile?.lead_category === opt.value;
                                                            return (
                                                                <button
                                                                    key={opt.value}
                                                                    className={`lead-status-pill__option${isActive ? ' lead-status-pill__option--active' : ''}`}
                                                                    onClick={() => updateStatus(opt.value)}
                                                                    type="button"
                                                                >
                                                                    <span
                                                                        className="lead-status-pill__dot"
                                                                        style={{
                                                                            backgroundColor: `hsl(var(--status-${opt.value}))`,
                                                                        }}
                                                                    />
                                                                    {opt.label}
                                                                    {isActive && (
                                                                        <i className="pi pi-check lead-status-pill__check" />
                                                                    )}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                            {hasUpcomingReminder() && (
                                                <Chip
                                                    label="Follow-Up Soon"
                                                    icon="pi pi-bell"
                                                    style={{
                                                        backgroundColor: 'hsl(var(--warning))',
                                                        color: 'hsl(var(--warning-foreground))',
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
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                            <strong>Lead Type:</strong>{' '}
                                            {editingLeadType ? (
                                                <Dropdown
                                                    value={lead?.backend_profile?.lead_type || null}
                                                    options={LEAD_TYPE_OPTIONS}
                                                    onChange={(e) => updateLeadType(e.value)}
                                                    placeholder="Select type..."
                                                    autoFocus
                                                    onHide={() => setEditingLeadType(false)}
                                                    style={{ minWidth: '140px', fontSize: '0.875rem' }}
                                                />
                                            ) : (
                                                <span
                                                    onClick={() => setEditingLeadType(true)}
                                                    style={{
                                                        cursor: 'pointer',
                                                        borderBottom: '1px dashed hsl(var(--foreground-muted) / 0.4)',
                                                        paddingBottom: '1px',
                                                    }}
                                                    title="Click to edit lead type"
                                                >
                                                    {savingLeadType ? 'Saving...' : (lead?.backend_profile?.lead_type || 'Not set')}
                                                    {' '}
                                                    <i
                                                        className="pi pi-pencil"
                                                        style={{ fontSize: '0.7rem', opacity: 0.5 }}
                                                    />
                                                </span>
                                            )}
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
                                    onClick={() => setShowLogCallDialog(true)}
                                />
                                <Button
                                    icon="pi pi-envelope"
                                    label="Email"
                                    className="p-button-rounded p-button-info mr-2"
                                    onClick={() => setShowSendEmailDialog(true)}
                                />
                                <Button
                                    icon="pi pi-th-large"
                                    label="Shared Dashboard"
                                    className="p-button-rounded p-button-help mr-2"
                                    onClick={() => router.push(`/lead/dashboard/${leadId}`)}
                                />
                                <Button
                                    icon="pi pi-user-plus"
                                    label="Transfer Lead"
                                    className="p-button-rounded p-button-warning"
                                    onClick={handleOpenTransferDialog}
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
                                            {(lead?.saved_searches?.length || 0) + (lead?.e_alerts?.length || 0)}
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
                                        <span className="stat-value">{getLastContactedText()}</span>
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
                                    color: 'hsl(var(--foreground))',
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

                {/* Drip Campaigns Section */}
                <div className="lead-drip-campaigns" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
                    <Card>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{
                                fontSize: '1.25rem',
                                fontWeight: '700',
                                color: 'hsl(var(--foreground))',
                                margin: 0
                            }}>
                                Drip Campaigns
                            </h3>
                            <Button
                                label="Enroll In Campaign"
                                icon="pi pi-plus"
                                className="p-button-sm p-button-outlined"
                                onClick={() => {
                                    fetchAvailableCampaigns();
                                    setShowEnrollDripDialog(true);
                                }}
                                style={{ fontWeight: '600' }}
                            />
                        </div>

                        {lead?.drip_campaigns?.filter((dc) => dc.enabled).length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {lead.drip_campaigns
                                    .filter((dc) => dc.enabled)
                                    .map((enrollment) => {
                                        const campaign = enrollment.campaign;
                                        const progress = getDripCampaignProgress(enrollment);
                                        const lastSent = getLastSentDate(enrollment);
                                        const lastOpened = getLastOpenedDate(enrollment);
                                        const badgeColor = getDripTypeBadgeColor(campaign?.type);

                                        return (
                                            <div
                                                key={enrollment._id}
                                                style={{
                                                    padding: '1rem',
                                                    backgroundColor: 'hsl(var(--muted))',
                                                    borderLeft: '4px solid hsl(var(--primary))',
                                                    borderRadius: '8px',
                                                }}
                                            >
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'start',
                                                    marginBottom: '0.75rem'
                                                }}>
                                                    <div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                                            <span style={{ fontWeight: '700', fontSize: '1rem', color: 'hsl(var(--foreground))' }}>
                                                                {campaign?.name || 'Unknown Campaign'}
                                                            </span>
                                                            {campaign?.type && (
                                                                <span style={{
                                                                    backgroundColor: badgeColor.bg,
                                                                    color: badgeColor.color,
                                                                    border: `1px solid ${badgeColor.border}`,
                                                                    padding: '0.15rem 0.5rem',
                                                                    borderRadius: '12px',
                                                                    fontSize: '0.7rem',
                                                                    fontWeight: '600',
                                                                }}>
                                                                    {campaign.type}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span style={{ fontSize: '0.85rem', color: 'hsl(var(--foreground-muted))' }}>
                                                            {progress.sent} of {progress.total} emails sent
                                                        </span>
                                                    </div>
                                                    <Button
                                                        icon="pi pi-times"
                                                        className="p-button-sm p-button-danger p-button-text"
                                                        onClick={() => handleUnenrollFromCampaign(campaign?._id || enrollment.campaign)}
                                                        tooltip="Remove from campaign"
                                                        tooltipOptions={{ position: 'top' }}
                                                    />
                                                </div>

                                                {/* Progress Bar */}
                                                <div style={{
                                                    height: '6px',
                                                    backgroundColor: 'hsl(var(--border))',
                                                    borderRadius: '3px',
                                                    marginBottom: '0.75rem',
                                                    overflow: 'hidden'
                                                }}>
                                                    <div style={{
                                                        height: '100%',
                                                        width: `${progress.percent}%`,
                                                        backgroundColor: progress.percent === 100 ? 'hsl(var(--success))' : 'hsl(var(--primary))',
                                                        borderRadius: '3px',
                                                        transition: 'width 0.3s ease',
                                                    }} />
                                                </div>

                                                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                                                    {lastSent && (
                                                        <span style={{ fontSize: '0.8rem', color: 'hsl(var(--foreground-muted))' }}>
                                                            <i className="pi pi-send" style={{ marginRight: '0.3rem' }}></i>
                                                            Last sent: {new Date(lastSent).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                        </span>
                                                    )}
                                                    {lastOpened && (
                                                        <span style={{ fontSize: '0.8rem', color: 'hsl(var(--success))' }}>
                                                            <i className="pi pi-eye" style={{ marginRight: '0.3rem' }}></i>
                                                            Last opened: {new Date(lastOpened).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                        </span>
                                                    )}
                                                    {!lastSent && !lastOpened && (
                                                        <span style={{ fontSize: '0.8rem', color: 'hsl(var(--foreground-muted))' }}>
                                                            <i className="pi pi-clock" style={{ marginRight: '0.3rem' }}></i>
                                                            Enrolled {new Date(enrollment.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                        </span>
                                                    )}
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
                                <i className="pi pi-send" style={{ fontSize: '2.5rem', display: 'block', marginBottom: '1rem', opacity: 0.5 }}></i>
                                <p style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>No active drip campaigns</p>
                                <p style={{ fontSize: '0.9rem' }}>Click "Enroll In Campaign" to add an automated email sequence</p>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Activity Actions Section */}
                <div className="lead-activity-actions" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
                    <Card>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{
                                fontSize: '1.25rem',
                                fontWeight: '700',
                                color: 'hsl(var(--foreground))',
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
                                    onClick={() => setShowSendEmailDialog(true)}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        fontSize: '1rem',
                                        fontWeight: '600'
                                    }}
                                />
                                <Button
                                    label="Add to Google Contacts"
                                    icon="pi pi-user-plus"
                                    className="p-button-help"
                                    onClick={handleAddToGoogleContacts}
                                    loading={addingToContacts}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        fontSize: '1rem',
                                        fontWeight: '600'
                                    }}
                                    tooltip="Add this lead to your Google Contacts"
                                    tooltipOptions={{ position: 'bottom' }}
                                />
                            </div>
                        </div>

                        {/* Notes and Calls History — only show when loading or has activity */}
                        {(loadingEmails || getAllActivity().length > 0) && (
                        <div style={{
                            borderTop: '1px solid hsl(var(--border))',
                            paddingTop: '1.5rem'
                        }}>
                            <h4 style={{
                                fontSize: '1.1rem',
                                fontWeight: '700',
                                color: 'hsl(var(--foreground))',
                                marginBottom: '1rem'
                            }}>
                                Activity
                            </h4>
                            <div>
                                {loadingEmails && getAllActivity().length === 0 ? (
                                    <div style={{
                                        textAlign: 'center',
                                        padding: '3rem',
                                        color: 'hsl(var(--foreground-muted))'
                                    }}>
                                        <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem', display: 'block', marginBottom: '1rem' }}></i>
                                        <p style={{ fontSize: '0.9rem' }}>Loading activity...</p>
                                    </div>
                                ) : getAllActivity().length > 0 ? (
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '1rem'
                                    }}>
                                        {getAllActivity().map((action, index) => {
                                            const isReceived = action.type === 'email_received';
                                            const isEmail = action.type === 'email' || isReceived;
                                            const isCall = action.type === 'call';

                                            let bgColor = 'hsl(var(--primary) / 0.08)';
                                            let borderColor = 'hsl(var(--primary))';
                                            let iconClass = 'pi-file-edit';
                                            let iconColor = 'hsl(var(--primary))';
                                            let label = action.type;

                                            if (isCall) {
                                                bgColor = 'hsl(var(--success) / 0.08)'; borderColor = 'hsl(var(--success))'; iconClass = 'pi-phone'; iconColor = 'hsl(var(--success))';
                                            } else if (isReceived) {
                                                bgColor = 'hsl(var(--warning) / 0.08)'; borderColor = 'hsl(var(--warning))'; iconClass = 'pi-inbox'; iconColor = 'hsl(var(--warning))'; label = 'Email Received';
                                            } else if (isEmail) {
                                                bgColor = 'hsl(var(--danger) / 0.08)'; borderColor = 'hsl(var(--danger))'; iconClass = 'pi-send'; iconColor = 'hsl(var(--danger))'; label = 'Email Sent';
                                            }

                                            return (
                                                <div
                                                    key={action.id || action._id || index}
                                                    style={{
                                                        padding: '1rem',
                                                        backgroundColor: bgColor,
                                                        borderLeft: `4px solid ${borderColor}`,
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
                                                        <div style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.5rem'
                                                        }}>
                                                            <i
                                                                className={`pi ${iconClass}`}
                                                                style={{ fontSize: '1.1rem', color: iconColor }}
                                                            ></i>
                                                            <span style={{
                                                                fontWeight: '700',
                                                                fontSize: '0.95rem',
                                                                color: 'hsl(var(--foreground))',
                                                            }}>
                                                                {label}
                                                            </span>
                                                            {isEmail && action.subject && (
                                                                <span style={{
                                                                    fontSize: '0.85rem',
                                                                    color: 'hsl(var(--foreground-muted))',
                                                                    fontWeight: '400',
                                                                }}>
                                                                    — {action.subject}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span style={{
                                                            fontSize: '0.85rem',
                                                            color: 'hsl(var(--foreground-muted))',
                                                            whiteSpace: 'nowrap',
                                                            marginLeft: '0.5rem'
                                                        }}>
                                                            {action.date_created
                                                                ? `${formatDate(action.date_created)} at ${new Date(action.date_created).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
                                                                : 'Recent'}
                                                        </span>
                                                    </div>
                                                    {isEmail ? (
                                                        <div
                                                            style={{
                                                                fontSize: '0.95rem',
                                                                color: 'hsl(var(--foreground-muted))',
                                                                lineHeight: '1.6',
                                                                maxHeight: '200px',
                                                                overflow: 'hidden',
                                                            }}
                                                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(action.value) }}
                                                        />
                                                    ) : (
                                                        <div style={{
                                                            fontSize: '0.95rem',
                                                            color: 'hsl(var(--foreground-muted))',
                                                            lineHeight: '1.6',
                                                            whiteSpace: 'pre-wrap'
                                                        }}>
                                                            {action.value}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : null}
                            </div>
                        </div>
                        )}
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <div className="lead-profile-content">
                    <Card>
                        <TabView
                            activeIndex={activeIndex}
                            onTabChange={(e) => setActiveIndex(e.index)}
                        >
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
                                    {(() => {
                                        const allSearches = [
                                            ...(lead?.saved_searches || []),
                                            ...(lead?.e_alerts || []),
                                        ];
                                        return allSearches.length ? (
                                            allSearches.map((search, index) => (
                                                <Card
                                                    key={search._id || search.searchId || index}
                                                    className="search-card"
                                                >
                                                    <div className="search-content">
                                                        <div className="search-header">
                                                            <i className="pi pi-bookmark"></i>
                                                            <h4>{search.searchName || 'Unnamed Search'}</h4>
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
                                        );
                                    })()}
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
                                                                __html: DOMPurify.sanitize(email.body || email.textBody || ''),
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
                                color: 'hsl(var(--foreground-muted))'
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
                        <small style={{ display: 'block', marginTop: '0.5rem', color: 'hsl(var(--foreground-muted))' }}>
                            Document key points from your conversation with {getLeadDisplayName(lead)}
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
                                color: 'hsl(var(--foreground-muted))'
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
                        <small style={{ display: 'block', marginTop: '0.5rem', color: 'hsl(var(--foreground-muted))' }}>
                            Add important information or observations about {getLeadDisplayName(lead)}
                        </small>
                    </div>
                </Dialog>

                {/* Send Email Dialog */}
                <Dialog
                    header="Send An Email"
                    visible={showSendEmailDialog}
                    style={{ width: '700px' }}
                    onHide={() => {
                        setShowSendEmailDialog(false);
                        setEmailSubject('');
                        setEmailBody(getInitialEmailBody());
                    }}
                    footer={
                        <div>
                            <Button
                                label="Cancel"
                                icon="pi pi-times"
                                onClick={() => {
                                    setShowSendEmailDialog(false);
                                    setEmailSubject('');
                                    setEmailBody(getInitialEmailBody());
                                }}
                                className="p-button-text"
                            />
                            <Button
                                label="Send"
                                icon="pi pi-send"
                                onClick={handleSendEmail}
                                loading={sendingEmail}
                                className="p-button-success"
                            />
                        </div>
                    }
                >
                    <div style={{ padding: '1rem 0' }}>
                        {/* To Field (Read-only) */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label
                                htmlFor="email-to"
                                style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: 'hsl(var(--foreground-muted))'
                                }}
                            >
                                To
                            </label>
                            <InputText
                                id="email-to"
                                value={lead?.email || ''}
                                disabled
                                style={{
                                    width: '100%',
                                    backgroundColor: 'hsl(var(--muted))',
                                    cursor: 'not-allowed'
                                }}
                            />
                        </div>

                        {/* Subject Field */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label
                                htmlFor="email-subject"
                                style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: 'hsl(var(--foreground-muted))'
                                }}
                            >
                                Subject
                            </label>
                            <InputText
                                id="email-subject"
                                value={emailSubject}
                                onChange={(e) => setEmailSubject(e.target.value)}
                                placeholder="Enter email subject..."
                                style={{ width: '100%' }}
                                autoFocus
                            />
                        </div>

                        {/* Body Field */}
                        <div>
                            <label
                                htmlFor="email-body"
                                style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: 'hsl(var(--foreground-muted))'
                                }}
                            >
                                Message
                            </label>
                            <div style={{ marginBottom: '0.5rem' }}>
                                <ReactQuill
                                    theme="snow"
                                    value={emailBody}
                                    onChange={setEmailBody}
                                    modules={quillModules}
                                    formats={quillFormats}
                                    placeholder="Compose your email message..."
                                    style={{
                                        height: '300px',
                                        marginBottom: '50px',
                                    }}
                                />
                            </div>
                            <small style={{ display: 'block', marginTop: '0.5rem', color: 'hsl(var(--foreground-muted))' }}>
                                This email will be sent to {getLeadDisplayName(lead)} at {lead?.email}
                            </small>
                        </div>
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
                                    color: 'hsl(var(--foreground-muted))'
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
                            <small style={{ display: 'block', marginTop: '0.25rem', color: 'hsl(var(--foreground-muted))' }}>
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
                                    color: 'hsl(var(--foreground-muted))'
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
                                    color: 'hsl(var(--foreground-muted))'
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
                            <small style={{ display: 'block', marginTop: '0.5rem', color: 'hsl(var(--foreground-muted))' }}>
                                Add notes about what you need to do or discuss with {getLeadDisplayName(lead)}
                            </small>
                        </div>
                    </div>
                </Dialog>

                {/* Transfer Lead Dialog */}
                <Dialog
                    header="Transfer Lead"
                    visible={showTransferLeadDialog}
                    style={{ width: '600px' }}
                    onHide={() => {
                        setShowTransferLeadDialog(false);
                        setSelectedAgent(null);
                        setNotifyAgent(false);
                        setTransferNote('');
                    }}
                    footer={
                        <div>
                            <Button
                                label="Cancel"
                                icon="pi pi-times"
                                onClick={() => {
                                    setShowTransferLeadDialog(false);
                                    setSelectedAgent(null);
                                    setNotifyAgent(false);
                                    setTransferNote('');
                                }}
                                className="p-button-text"
                            />
                            <Button
                                label="Transfer Lead"
                                icon="pi pi-user-plus"
                                onClick={handleTransferLead}
                                loading={transferring}
                                disabled={!selectedAgent}
                                className="p-button-warning"
                            />
                        </div>
                    }
                >
                    <div style={{ padding: '1rem 0' }}>
                        {/* Agent Selection Dropdown */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label
                                htmlFor="select-agent"
                                style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: 'hsl(var(--foreground-muted))'
                                }}
                            >
                                Select Agent *
                            </label>
                            <Dropdown
                                id="select-agent"
                                value={selectedAgent}
                                options={agents}
                                onChange={(e) => setSelectedAgent(e.value)}
                                placeholder={loadingAgents ? 'Loading agents...' : 'Select an agent to transfer to'}
                                style={{ width: '100%' }}
                                disabled={loadingAgents}
                                filter
                                filterPlaceholder="Search agents..."
                            />
                            <small style={{ display: 'block', marginTop: '0.25rem', color: 'hsl(var(--foreground-muted))' }}>
                                Choose the agent who will take over this lead
                            </small>
                        </div>

                        {/* Notify Agent Checkbox */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <Checkbox
                                inputId="notify-agent"
                                checked={notifyAgent}
                                onChange={(e) => setNotifyAgent(e.checked)}
                            />
                            <label
                                htmlFor="notify-agent"
                                style={{ fontWeight: '600', cursor: 'pointer', color: 'hsl(var(--foreground-muted))' }}
                            >
                                Notify Agent
                            </label>
                        </div>

                        {/* Transfer Note (conditional) */}
                        {notifyAgent && (
                            <div>
                                <label
                                    htmlFor="transfer-note"
                                    style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontWeight: '600',
                                        color: 'hsl(var(--foreground-muted))'
                                    }}
                                >
                                    Note to Agent (Optional)
                                </label>
                                <InputTextarea
                                    id="transfer-note"
                                    value={transferNote}
                                    onChange={(e) => setTransferNote(e.target.value)}
                                    rows={5}
                                    placeholder="Add a note for the new agent..."
                                    style={{ width: '100%', fontFamily: 'inherit' }}
                                />
                                <small style={{ display: 'block', marginTop: '0.5rem', color: 'hsl(var(--foreground-muted))' }}>
                                    This note will be included in the notification email sent to the agent
                                </small>
                            </div>
                        )}
                    </div>
                </Dialog>

                {/* Enroll in Drip Campaign Dialog */}
                <Dialog
                    header="Enroll In Drip Campaign"
                    visible={showEnrollDripDialog}
                    style={{ width: '600px' }}
                    onHide={() => {
                        setShowEnrollDripDialog(false);
                        setSelectedCampaign(null);
                    }}
                    footer={
                        <div>
                            <Button
                                label="Cancel"
                                icon="pi pi-times"
                                onClick={() => {
                                    setShowEnrollDripDialog(false);
                                    setSelectedCampaign(null);
                                }}
                                className="p-button-text"
                            />
                            <Button
                                label="Enroll"
                                icon="pi pi-check"
                                onClick={handleEnrollInCampaign}
                                loading={enrollingDrip}
                                disabled={!selectedCampaign}
                                className="p-button-success"
                            />
                        </div>
                    }
                >
                    <div style={{ padding: '1rem 0' }}>
                        <label
                            htmlFor="select-campaign"
                            style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                fontWeight: '600',
                                color: 'hsl(var(--foreground-muted))'
                            }}
                        >
                            Select Campaign *
                        </label>
                        <Dropdown
                            id="select-campaign"
                            value={selectedCampaign}
                            options={availableCampaigns.map((c) => ({
                                label: `${c.name} (${c.type} - ${c.timeframe}) - ${c.emails?.length || 0} emails`,
                                value: c._id,
                            }))}
                            onChange={(e) => setSelectedCampaign(e.value)}
                            placeholder={loadingCampaigns ? 'Loading campaigns...' : 'Select a campaign'}
                            style={{ width: '100%' }}
                            disabled={loadingCampaigns}
                            filter
                            filterPlaceholder="Search campaigns..."
                        />
                        <small style={{ display: 'block', marginTop: '0.5rem', color: 'hsl(var(--foreground-muted))' }}>
                            Choose a drip campaign to enroll {getLeadDisplayName(lead)} in. Emails will be sent automatically on schedule.
                        </small>
                    </div>
                </Dialog>
            </div>
        </MainLayout>
    );
};

export default Lead;
