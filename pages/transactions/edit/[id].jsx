// React & NextJS
import { useState, useCallback, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';

// Dynamically import PrimeReact components
const Card = dynamic(() => import('primereact/card').then((mod) => mod.Card), { ssr: false });
const InputText = dynamic(() => import('primereact/inputtext').then((mod) => mod.InputText), {
    ssr: false,
});
const Checkbox = dynamic(() => import('primereact/checkbox').then((mod) => mod.Checkbox), {
    ssr: false,
});
const Dropdown = dynamic(() => import('primereact/dropdown').then((mod) => mod.Dropdown), {
    ssr: false,
});
const Calendar = dynamic(() => import('primereact/calendar').then((mod) => mod.Calendar), {
    ssr: false,
});
const Button = dynamic(() => import('primereact/button').then((mod) => mod.Button), { ssr: false });
const AutoComplete = dynamic(() => import('primereact/autocomplete').then((mod) => mod.AutoComplete), {
    ssr: false,
});

// IRG Components
import MainLayout from '../../../components/layout/MainLayout';

// API & Utils
import IrgApi from '../../../assets/irgApi';
import showToast from '../../../utils/showToast';

const EditTransaction = () => {
    const router = useRouter();
    const { id } = router.query;

    // Redux state
    const isLoggedIn = useSelector((state) => state.isLoggedIn);
    const agent = useSelector((state) => state.agent);

    // Loading state
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Property search state
    const [propertySearch, setPropertySearch] = useState('');
    const [propertySearchSuggestions, setPropertySearchSuggestions] = useState([]);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [searchLoading, setSearchLoading] = useState(false);

    // Link to lead state
    const [linkToLead, setLinkToLead] = useState(false);
    const [leadSearch, setLeadSearch] = useState('');
    const [leadSearchSuggestions, setLeadSearchSuggestions] = useState([]);

    // Seller lead state (for double-ended transactions)
    const [doubleEnded, setDoubleEnded] = useState(false);
    const [sellerLeadSearch, setSellerLeadSearch] = useState('');
    const [sellerLeadSearchSuggestions, setSellerLeadSearchSuggestions] = useState([]);

    // Client information state
    const [clientInfo, setClientInfo] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
    });

    // Transaction information state
    const [transactionInfo, setTransactionInfo] = useState({
        price: '',
        financing: null,
        acceptanceDate: null,
        expectedCloseDate: null,
        escrowLength: '',
        leadSource: '',
        referralFee: false,
        referralFeeAmt: 0,
        totalEstimatedCommission: '',
        buyersAgentCommissionPct: '',
        estimatedAgentCommission: '',
        status: 'Pending',
        actualClosingDate: null,
    });

    // Contingencies state
    const [contingencies, setContingencies] = useState({
        inspection: false,
        appraisal: false,
        financing: false,
    });

    // Contingency dates state
    const [contingencyDates, setContingencyDates] = useState({
        inspectionDue: null,
        appraisalDue: null,
        financingDue: null,
    });

    // Client credits state (array of credit objects)
    const [clientCredits, setClientCredits] = useState([]);
    const [showClientCredits, setShowClientCredits] = useState(false);

    // Financing options
    const financingOptions = [
        { label: 'Cash', value: 'cash' },
        { label: 'Conventional', value: 'conventional' },
        { label: 'FHA', value: 'fha' },
        { label: 'VA', value: 'va' },
        { label: 'Seller-Financed', value: 'seller-financed' },
        { label: 'Other', value: 'other' },
    ];

    // Status options
    const statusOptions = [
        { label: 'Pending', value: 'Pending' },
        { label: 'In Escrow', value: 'In Escrow' },
        { label: 'Closed', value: 'Closed' },
        { label: 'Cancelled', value: 'Cancelled' },
    ];

    // Credit categories
    const clientCreditCategories = [
        { label: 'Closing Costs', value: 'Closing Costs' },
        { label: 'Home Warranty', value: 'Home Warranty' },
        { label: 'Repairs', value: 'Repairs' },
        { label: 'General', value: 'General' },
    ];

    // Lead source options
    const leadSourceOptions = [
        { label: 'Referral', value: 'Referral' },
        { label: 'Open House', value: 'Open House' },
        { label: 'Online', value: 'Online' },
        { label: 'Cold Call', value: 'Cold Call' },
        { label: 'Past Client', value: 'Past Client' },
        { label: 'Other', value: 'Other' },
    ];

    // Fetch transaction data on mount
    useEffect(() => {
        if (!id || !isLoggedIn) return;

        const fetchTransaction = async () => {
            try {
                setLoading(true);
                const response = await IrgApi.get(`/transactions/single-transaction/${id}`, {
                    headers: { Authorization: `Bearer ${isLoggedIn}` },
                });

                if (response.data.status === 'success' && response.data.data && response.data.data[0]) {
                    const txn = response.data.data[0];

                    // Set selected property
                    if (txn.property) {
                        setSelectedProperty(txn.property);
                    }

                    // Set transaction info
                    setTransactionInfo({
                        price: txn.salesPrice || '',
                        financing: txn.financing ? 'conventional' : 'cash',
                        acceptanceDate: txn.acceptanceDate ? new Date(txn.acceptanceDate) : null,
                        expectedCloseDate: txn.anticipatedClosingDate ? new Date(txn.anticipatedClosingDate) : null,
                        escrowLength: txn.escrowLength || '',
                        leadSource: txn.leadSource || '',
                        referralFee: txn.referralFee || false,
                        referralFeeAmt: txn.referralFeeAmt || 0,
                        totalEstimatedCommission: txn.totalEstimatedCommission || '',
                        buyersAgentCommissionPct: txn.buyersAgentCommissionPct || '',
                        estimatedAgentCommission: txn.estimatedAgentCommission || '',
                        status: txn.status || 'Pending',
                        actualClosingDate: txn.actualClosingDate ? new Date(txn.actualClosingDate) : null,
                    });

                    // Set client credits
                    if (txn.clientCredits && txn.clientCredits.length > 0) {
                        setClientCredits(
                            txn.clientCredits.map((credit, idx) => ({
                                ...credit,
                                id: Date.now() + idx,
                            }))
                        );
                        setShowClientCredits(true);
                    }

                    // Set double-ended
                    if (txn.doubleEnded) {
                        setDoubleEnded(true);
                        if (txn.sellerLead) {
                            setSellerLeadSearch(txn.sellerLead);
                        }
                    }

                    // Set buyer lead
                    if (txn.lead) {
                        setLinkToLead(true);
                        setLeadSearch(txn.lead);
                    }
                }
            } catch (error) {
                console.error('Fetch transaction error:', error);
                showToast('error', 'Failed to load transaction', 'Error');
            } finally {
                setLoading(false);
            }
        };

        fetchTransaction();
    }, [id, isLoggedIn]);

    // Refs for timeouts
    const propertySearchTimeout = useRef(null);
    const leadSearchTimeout = useRef(null);

    // Handler for property search
    const handlePropertySearch = (event) => {
        const query = event.query;
        setPropertySearch(query);

        if (propertySearchTimeout.current) {
            clearTimeout(propertySearchTimeout.current);
        }

        if (query.length < 2) {
            setPropertySearchSuggestions([]);
            return;
        }

        propertySearchTimeout.current = setTimeout(async () => {
            try {
                setSearchLoading(true);
                const response = await IrgApi.get(`/mls-properties/search?q=${encodeURIComponent(query)}`);

                if (response.data.status === 'success') {
                    setPropertySearchSuggestions(response.data.data || []);
                }
            } catch (error) {
                console.error('Property search error:', error);
            } finally {
                setSearchLoading(false);
            }
        }, 300);
    };

    // Handler for property selection
    const handlePropertySelect = (property) => {
        setSelectedProperty(property);
        setPropertySearch(property.address);
    };

    // Handler for lead search (placeholder)
    const handleLeadSearch = (_event) => {
        setLeadSearchSuggestions([]);
    };

    // Handler for seller lead search (placeholder)
    const handleSellerLeadSearch = (_event) => {
        setSellerLeadSearchSuggestions([]);
    };

    // Handler for client info changes
    const handleClientInfoChange = (field, value) => {
        setClientInfo((prev) => ({ ...prev, [field]: value }));
    };

    // Handler for transaction info changes
    const handleTransactionInfoChange = (field, value) => {
        setTransactionInfo((prev) => ({ ...prev, [field]: value }));
    };

    // Handler for contingency changes
    const handleContingencyChange = (field, checked) => {
        setContingencies((prev) => ({ ...prev, [field]: checked }));
    };

    // Handler for contingency date changes
    const handleContingencyDateChange = (field, value) => {
        setContingencyDates((prev) => ({ ...prev, [field]: value }));
    };

    // Handler to add a new client credit
    const handleAddClientCredit = () => {
        setClientCredits((prev) => [...prev, { category: 'General', amount: 0, id: Date.now() }]);
    };

    // Handler to remove a client credit
    const handleRemoveClientCredit = (id) => {
        setClientCredits((prev) => prev.filter((credit) => credit.id !== id));
    };

    // Handler to update a client credit
    const handleUpdateClientCredit = (id, field, value) => {
        setClientCredits((prev) =>
            prev.map((credit) => (credit.id === id ? { ...credit, [field]: value } : credit))
        );
    };

    // Handler for client credits checkbox
    const handleClientCreditsCheckbox = (checked) => {
        setShowClientCredits(checked);
        if (!checked) {
            setClientCredits([]);
        }
    };

    // Calculate agent commission based on sales price and percentage
    const calculateAgentCommission = useCallback((salesPrice, percentage) => {
        if (!salesPrice || !percentage) return 0;
        const price = parseFloat(salesPrice);
        const pct = parseFloat(percentage);
        if (isNaN(price) || isNaN(pct) || price <= 0 || pct <= 0) return 0;
        return (price * (pct / 100)).toFixed(2);
    }, []);

    // Auto-calculate agent commission when price or percentage changes
    useEffect(() => {
        if (transactionInfo.price && transactionInfo.buyersAgentCommissionPct) {
            const calculated = calculateAgentCommission(
                transactionInfo.price,
                transactionInfo.buyersAgentCommissionPct
            );
            if (calculated !== transactionInfo.estimatedAgentCommission) {
                setTransactionInfo((prev) => ({
                    ...prev,
                    estimatedAgentCommission: calculated,
                }));
            }
        }
    }, [transactionInfo.price, transactionInfo.buyersAgentCommissionPct, calculateAgentCommission]);

    // Handler for form submission
    const handleSubmit = async () => {
        // Validation
        if (!selectedProperty) {
            showToast('error', 'Please select a property', 'Validation Error');
            return;
        }

        if (!transactionInfo.acceptanceDate || !transactionInfo.expectedCloseDate) {
            showToast('error', 'Acceptance date and expected close date are required', 'Validation Error');
            return;
        }

        if (!transactionInfo.price || parseFloat(transactionInfo.price) <= 0) {
            showToast('error', 'Valid sales price is required', 'Validation Error');
            return;
        }

        if (!transactionInfo.escrowLength || parseInt(transactionInfo.escrowLength) <= 0) {
            showToast('error', 'Escrow length is required', 'Validation Error');
            return;
        }

        if (!transactionInfo.leadSource) {
            showToast('error', 'Lead source is required', 'Validation Error');
            return;
        }

        if (!transactionInfo.totalEstimatedCommission || parseFloat(transactionInfo.totalEstimatedCommission) <= 0) {
            showToast('error', 'Total estimated commission is required', 'Validation Error');
            return;
        }

        // If status is Closed, require actual closing date
        if (transactionInfo.status === 'Closed' && !transactionInfo.actualClosingDate) {
            showToast('error', 'Actual closing date is required for closed transactions', 'Validation Error');
            return;
        }

        // Prepare transaction data
        const transactionData = {
            property: selectedProperty._id,
            address: selectedProperty.address,
            city: selectedProperty.city,
            state: selectedProperty.state,
            zipCode: parseInt(selectedProperty.zip_code),
            lead: linkToLead && leadSearch ? leadSearch._id : undefined,
            salesPrice: parseFloat(transactionInfo.price),
            financing: transactionInfo.financing !== 'cash',
            acceptanceDate: transactionInfo.acceptanceDate,
            anticipatedClosingDate: transactionInfo.expectedCloseDate,
            escrowLength: parseInt(transactionInfo.escrowLength),
            leadSource: transactionInfo.leadSource,
            referralFee: transactionInfo.referralFee,
            referralFeeAmt: transactionInfo.referralFee ? parseFloat(transactionInfo.referralFeeAmt || 0) : 0,
            totalEstimatedCommission: parseFloat(transactionInfo.totalEstimatedCommission),
            estimatedAgentCommission: parseFloat(transactionInfo.estimatedAgentCommission || 0),
            buyersAgentCommissionPct: parseFloat(transactionInfo.buyersAgentCommissionPct || 0),
            clientCredits: clientCredits.map((credit) => ({
                category: credit.category,
                amount: parseFloat(credit.amount || 0),
            })),
            sellerLead: doubleEnded && sellerLeadSearch ? sellerLeadSearch._id : undefined,
            doubleEnded: doubleEnded,
            status: transactionInfo.status,
            actualClosingDate: transactionInfo.actualClosingDate || undefined,
            agent: agent._id,
        };

        try {
            setSaving(true);
            const response = await IrgApi.post(
                `/transactions/single-transaction/${id}`,
                { transaction: transactionData },
                {
                    headers: {
                        Authorization: `Bearer ${isLoggedIn}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.data.status === 'success') {
                showToast('success', 'Transaction updated successfully', 'Success');
                // Redirect back to dashboard
                router.push('/transactions');
            }
        } catch (error) {
            console.error('Transaction update error:', error);
            showToast('error', error.response?.data?.message || 'Failed to update transaction', 'Error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <MainLayout>
                <div style={{ padding: '3rem', textAlign: 'center' }}>
                    <i className="pi pi-spin pi-spinner" style={{ fontSize: '3rem', color: '#667eea' }}></i>
                    <p style={{ marginTop: '1rem', color: '#6c757d' }}>Loading transaction...</p>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
                {/* Page Header */}
                <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1
                            style={{
                                fontSize: '2rem',
                                fontWeight: '700',
                                color: '#2c3e50',
                                marginBottom: '0.5rem',
                            }}
                        >
                            Edit Transaction
                        </h1>
                        <p style={{ fontSize: '1rem', color: '#6c757d' }}>
                            Update the details for this transaction
                        </p>
                    </div>
                    <Button
                        label="Back to Dashboard"
                        icon="pi pi-arrow-left"
                        className="p-button-text"
                        onClick={() => router.push('/transactions')}
                    />
                </div>

                {/* Property Section */}
                <Card
                    title="Property"
                    style={{
                        marginBottom: '1.5rem',
                        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                        borderRadius: '12px',
                    }}
                >
                    {selectedProperty && (
                        <div
                            style={{
                                padding: '1rem',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '8px',
                                marginBottom: '1rem',
                            }}
                        >
                            <div style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                                {selectedProperty.address}
                            </div>
                            <div style={{ color: '#6c757d', fontSize: '0.9rem' }}>
                                {selectedProperty.city}, {selectedProperty.state} {selectedProperty.zip_code}
                            </div>
                            {selectedProperty.mls_number && (
                                <div style={{ color: '#6c757d', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                                    MLS#: {selectedProperty.mls_number}
                                </div>
                            )}
                        </div>
                    )}
                </Card>

                {/* Status & Transaction Information */}
                <Card
                    title="Transaction Details"
                    style={{
                        marginBottom: '1.5rem',
                        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                        borderRadius: '12px',
                    }}
                >
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        {/* Transaction Status */}
                        <div>
                            <label
                                htmlFor="status"
                                style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#495057',
                                }}
                            >
                                Transaction Status *
                            </label>
                            <Dropdown
                                id="status"
                                value={transactionInfo.status}
                                options={statusOptions}
                                onChange={(e) => handleTransactionInfoChange('status', e.value)}
                                placeholder="Select status"
                                style={{ width: '100%' }}
                            />
                        </div>

                        {/* Actual Closing Date (if Closed) */}
                        {transactionInfo.status === 'Closed' && (
                            <div>
                                <label
                                    htmlFor="actualClosingDate"
                                    style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontWeight: '600',
                                        color: '#495057',
                                    }}
                                >
                                    Actual Closing Date *
                                </label>
                                <Calendar
                                    id="actualClosingDate"
                                    value={transactionInfo.actualClosingDate}
                                    onChange={(e) => handleTransactionInfoChange('actualClosingDate', e.value)}
                                    showIcon
                                    dateFormat="mm/dd/yy"
                                    style={{ width: '100%' }}
                                />
                            </div>
                        )}

                        {/* Sales Price */}
                        <div>
                            <label
                                htmlFor="price"
                                style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#495057',
                                }}
                            >
                                Sales Price *
                            </label>
                            <InputText
                                id="price"
                                value={transactionInfo.price}
                                onChange={(e) => handleTransactionInfoChange('price', e.target.value)}
                                placeholder="Enter sales price"
                                style={{ width: '100%' }}
                                type="number"
                            />
                        </div>

                        {/* Financing Type */}
                        <div>
                            <label
                                htmlFor="financing"
                                style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#495057',
                                }}
                            >
                                Financing Type
                            </label>
                            <Dropdown
                                id="financing"
                                value={transactionInfo.financing}
                                options={financingOptions}
                                onChange={(e) => handleTransactionInfoChange('financing', e.value)}
                                placeholder="Select financing type"
                                style={{ width: '100%' }}
                            />
                        </div>

                        {/* Acceptance Date */}
                        <div>
                            <label
                                htmlFor="acceptanceDate"
                                style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#495057',
                                }}
                            >
                                Acceptance Date *
                            </label>
                            <Calendar
                                id="acceptanceDate"
                                value={transactionInfo.acceptanceDate}
                                onChange={(e) => handleTransactionInfoChange('acceptanceDate', e.value)}
                                showIcon
                                dateFormat="mm/dd/yy"
                                style={{ width: '100%' }}
                            />
                        </div>

                        {/* Expected Close Date */}
                        <div>
                            <label
                                htmlFor="expectedCloseDate"
                                style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#495057',
                                }}
                            >
                                Expected Close Date *
                            </label>
                            <Calendar
                                id="expectedCloseDate"
                                value={transactionInfo.expectedCloseDate}
                                onChange={(e) => handleTransactionInfoChange('expectedCloseDate', e.value)}
                                showIcon
                                dateFormat="mm/dd/yy"
                                style={{ width: '100%' }}
                            />
                        </div>

                        {/* Escrow Length */}
                        <div>
                            <label
                                htmlFor="escrowLength"
                                style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#495057',
                                }}
                            >
                                Escrow Length (days) *
                            </label>
                            <InputText
                                id="escrowLength"
                                value={transactionInfo.escrowLength}
                                onChange={(e) => handleTransactionInfoChange('escrowLength', e.target.value)}
                                placeholder="Enter escrow length"
                                style={{ width: '100%' }}
                                type="number"
                            />
                        </div>

                        {/* Lead Source */}
                        <div>
                            <label
                                htmlFor="leadSource"
                                style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#495057',
                                }}
                            >
                                Lead Source *
                            </label>
                            <Dropdown
                                id="leadSource"
                                value={transactionInfo.leadSource}
                                options={leadSourceOptions}
                                onChange={(e) => handleTransactionInfoChange('leadSource', e.value)}
                                placeholder="Select lead source"
                                style={{ width: '100%' }}
                            />
                        </div>

                        {/* Total Estimated Commission */}
                        <div>
                            <label
                                htmlFor="totalEstimatedCommission"
                                style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#495057',
                                }}
                            >
                                Total Estimated Commission *
                            </label>
                            <InputText
                                id="totalEstimatedCommission"
                                value={transactionInfo.totalEstimatedCommission}
                                onChange={(e) => handleTransactionInfoChange('totalEstimatedCommission', e.target.value)}
                                placeholder="Enter total commission"
                                style={{ width: '100%' }}
                                type="number"
                            />
                        </div>

                        {/* Referral Fee Checkbox */}
                        <div style={{ display: 'flex', alignItems: 'center', paddingTop: '2rem' }}>
                            <Checkbox
                                inputId="referralFee"
                                checked={transactionInfo.referralFee}
                                onChange={(e) => handleTransactionInfoChange('referralFee', e.checked)}
                            />
                            <label
                                htmlFor="referralFee"
                                style={{ marginLeft: '0.5rem', fontWeight: '600', color: '#495057', cursor: 'pointer' }}
                            >
                                Referral Fee
                            </label>
                        </div>

                        {/* Referral Fee Amount */}
                        {transactionInfo.referralFee && (
                            <div>
                                <label
                                    htmlFor="referralFeeAmt"
                                    style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontWeight: '600',
                                        color: '#495057',
                                    }}
                                >
                                    Referral Fee Amount
                                </label>
                                <InputText
                                    id="referralFeeAmt"
                                    value={transactionInfo.referralFeeAmt}
                                    onChange={(e) => handleTransactionInfoChange('referralFeeAmt', e.target.value)}
                                    placeholder="Enter referral fee amount"
                                    style={{ width: '100%' }}
                                    type="number"
                                />
                            </div>
                        )}

                        {/* Buyer's Agent Commission Percentage */}
                        <div>
                            <label
                                htmlFor="agent-commission-pct"
                                style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#495057',
                                }}
                            >
                                Buyer's Agent Commission (%)
                            </label>
                            <InputText
                                id="agent-commission-pct"
                                value={transactionInfo.buyersAgentCommissionPct}
                                onChange={(e) => handleTransactionInfoChange('buyersAgentCommissionPct', e.target.value)}
                                placeholder="e.g., 2.5"
                                style={{ width: '100%' }}
                                type="number"
                                step="0.01"
                            />
                        </div>

                        {/* Estimated Agent Commission (Read-only calculated field) */}
                        <div>
                            <label
                                htmlFor="estimated-agent-commission"
                                style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#495057',
                                }}
                            >
                                Estimated Agent Commission
                            </label>
                            <InputText
                                id="estimated-agent-commission"
                                value={transactionInfo.estimatedAgentCommission}
                                placeholder="Auto-calculated"
                                style={{ width: '100%', backgroundColor: '#f8f9fa' }}
                                disabled
                            />
                        </div>
                    </div>

                    {/* Client Credits Section */}
                    <div style={{ marginTop: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <Checkbox
                                inputId="client-credits"
                                checked={showClientCredits}
                                onChange={(e) => handleClientCreditsCheckbox(e.checked)}
                            />
                            <label htmlFor="client-credits" style={{ fontWeight: '600', color: '#495057', cursor: 'pointer' }}>
                                Client Credits
                            </label>
                        </div>

                        {showClientCredits && (
                            <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h4 style={{ margin: 0, color: '#495057' }}>Client Credits</h4>
                                    <Button icon="pi pi-plus" label="Add Credit" className="p-button-sm" onClick={handleAddClientCredit} />
                                </div>

                                {clientCredits.length === 0 ? (
                                    <p style={{ color: '#6c757d', fontStyle: 'italic' }}>No credits added. Click "Add Credit" to begin.</p>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {clientCredits.map((credit) => (
                                            <div
                                                key={credit.id}
                                                style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: '2fr 2fr auto',
                                                    gap: '1rem',
                                                    alignItems: 'end',
                                                    padding: '0.75rem',
                                                    backgroundColor: 'white',
                                                    borderRadius: '4px',
                                                }}
                                            >
                                                <div>
                                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#495057', fontSize: '0.9rem' }}>
                                                        Category
                                                    </label>
                                                    <Dropdown
                                                        value={credit.category}
                                                        options={clientCreditCategories}
                                                        onChange={(e) => handleUpdateClientCredit(credit.id, 'category', e.value)}
                                                        style={{ width: '100%' }}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#495057', fontSize: '0.9rem' }}>
                                                        Amount
                                                    </label>
                                                    <InputText
                                                        value={credit.amount}
                                                        onChange={(e) => handleUpdateClientCredit(credit.id, 'amount', e.target.value)}
                                                        placeholder="Enter amount"
                                                        style={{ width: '100%' }}
                                                        type="number"
                                                        step="0.01"
                                                    />
                                                </div>
                                                <Button
                                                    icon="pi pi-trash"
                                                    className="p-button-danger p-button-text"
                                                    onClick={() => handleRemoveClientCredit(credit.id)}
                                                    tooltip="Remove credit"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Double-Ended Transaction */}
                    <div style={{ marginTop: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Checkbox inputId="double-ended" checked={doubleEnded} onChange={(e) => setDoubleEnded(e.checked)} />
                            <label htmlFor="double-ended" style={{ fontWeight: '600', color: '#495057', cursor: 'pointer' }}>
                                Double-Ended Transaction
                            </label>
                        </div>
                    </div>
                </Card>

                {/* Submit Buttons */}
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <Button
                        label="Cancel"
                        icon="pi pi-times"
                        className="p-button-secondary"
                        onClick={() => router.push('/transactions')}
                        disabled={saving}
                    />
                    <Button
                        label={saving ? 'Saving...' : 'Save Changes'}
                        icon={saving ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
                        onClick={handleSubmit}
                        disabled={saving}
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: 'none',
                            padding: '0.75rem 2rem',
                            fontSize: '1rem',
                            fontWeight: '600',
                        }}
                    />
                </div>
            </div>
        </MainLayout>
    );
};

export default EditTransaction;
