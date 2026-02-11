// React & NextJS
import { useState, useCallback, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useSelector } from 'react-redux';

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
import MainLayout from '../../components/layout/MainLayout';

// API & Utils
import IrgApi from '../../assets/irgApi';
import showToast from '../../utils/showToast';

const Transactions = () => {
    // Redux state
    const isLoggedIn = useSelector((state) => state.isLoggedIn);
    const agent = useSelector((state) => state.agent);

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
        { label: 'USDA', value: 'usda' },
        { label: 'Other', value: 'other' },
    ];

    // Client credit categories
    const clientCreditCategories = [
        { label: 'Closing Costs', value: 'Closing Costs' },
        { label: 'Home Warranty', value: 'Home Warranty' },
        { label: 'Repairs', value: 'Repairs' },
        { label: 'General', value: 'General' },
    ];

    // Debounce timer ref
    const searchTimeoutRef = useRef(null);

    // Handler for property search with debouncing
    const handlePropertySearch = useCallback((event) => {
        const query = event.query;

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        if (!query || query.trim().length < 2) {
            setPropertySearchSuggestions([]);
            return;
        }

        searchTimeoutRef.current = setTimeout(async () => {
            setSearchLoading(true);

            try {
                const response = await IrgApi.get(`/mlsproperties/search?q=${encodeURIComponent(query)}`);

                if (response.data.status === 'success') {
                    const properties = response.data.data;

                    const formattedSuggestions = properties.map(prop => {
                        const unitNum = prop.unit_number ? ` #${prop.unit_number}` : '';
                        return {
                            label: `${prop.address}${unitNum}, ${prop.city}, ${prop.state} ${prop.zip_code} (MLS# ${prop.mls_number})`,
                            value: prop
                        };
                    });

                    setPropertySearchSuggestions(formattedSuggestions);

                    if (formattedSuggestions.length === 0) {
                        showToast('info', 'No properties found matching your search', 'No Results');
                    }
                }
            } catch (error) {
                console.error('Property search error:', error);
                showToast('error', 'Failed to search properties', 'Search Error');
                setPropertySearchSuggestions([]);
            } finally {
                setSearchLoading(false);
            }
        }, 300);
    }, []);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    // Handler for selecting a property from suggestions
    const handlePropertySelect = useCallback((e) => {
        if (e.value && e.value.value) {
            const property = e.value.value;
            setSelectedProperty(property);
            setPropertySearch(e.value.label);
            showToast('success', 'Property selected', 'Success');
        }
    }, []);

    // Handler to clear selected property
    const handleClearProperty = useCallback(() => {
        setSelectedProperty(null);
        setPropertySearch('');
        setPropertySearchSuggestions([]);
    }, []);

    // Handler for lead search (placeholder for future implementation)
    const handleLeadSearch = (_event) => {
        // Future: API call to search leads
        setLeadSearchSuggestions([]);
    };

    // Handler for seller lead search (placeholder for future implementation)
    const handleSellerLeadSearch = (_event) => {
        // Future: API call to search leads (same as buyer lead)
        setSellerLeadSearchSuggestions([]);
    };

    // Handler for client info changes
    const handleClientInfoChange = (field, value) => {
        setClientInfo((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // Handler for transaction info changes
    const handleTransactionInfoChange = (field, value) => {
        setTransactionInfo((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // Handler for contingency checkbox changes
    const handleContingencyChange = (field, value) => {
        setContingencies((prev) => ({
            ...prev,
            [field]: value,
        }));
        // Clear the corresponding date if unchecked
        if (!value) {
            const dateField = `${field}Due`;
            setContingencyDates((prev) => ({
                ...prev,
                [dateField]: null,
            }));
        }
    };

    // Handler for contingency date changes
    const handleContingencyDateChange = (field, value) => {
        setContingencyDates((prev) => ({
            ...prev,
            [field]: value,
        }));
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
        return (price * pct / 100).toFixed(2);
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
            agent: agent._id,
            status: 'Pending',
        };

        try {
            const response = await IrgApi.post('/transactions/create-transaction',
                { transaction: transactionData },
                {
                    headers: {
                        Authorization: `Bearer ${isLoggedIn}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.status === 'success') {
                showToast('success', 'Transaction created successfully', 'Success');

                // Reset form
                setSelectedProperty(null);
                setPropertySearch('');
                setClientInfo({ firstName: '', lastName: '', phone: '', email: '' });
                setTransactionInfo({
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
                });
                setContingencies({ inspection: false, appraisal: false, financing: false });
                setContingencyDates({ inspectionDue: null, appraisalDue: null, financingDue: null });
                setClientCredits([]);
                setShowClientCredits(false);
                setDoubleEnded(false);
                setSellerLeadSearch('');
                setSellerLeadSearchSuggestions([]);
            }
        } catch (error) {
            console.error('Transaction creation error:', error); // eslint-disable-line
            showToast('error', error.response?.data?.message || 'Failed to create transaction', 'Error');
        }
    };

    return (
        <MainLayout>
            <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
                {/* Page Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <h1
                        style={{
                            fontSize: '2rem',
                            fontWeight: '700',
                            color: '#2c3e50',
                            marginBottom: '0.5rem',
                        }}
                    >
                        Add New Transaction
                    </h1>
                    <p style={{ fontSize: '1rem', color: '#6c757d' }}>
                        Enter the details for a new real estate transaction
                    </p>
                </div>

                {/* Property Search Section */}
                <Card
                    title="Property"
                    style={{
                        marginBottom: '1.5rem',
                        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                    }}
                >
                    <div style={{ marginBottom: '1rem' }}>
                        <label
                            htmlFor="property-search"
                            style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                fontWeight: '600',
                                color: '#495057',
                            }}
                        >
                            Search by Address or MLS Number
                        </label>
                        <AutoComplete
                            id="property-search"
                            value={propertySearch}
                            suggestions={propertySearchSuggestions}
                            completeMethod={handlePropertySearch}
                            onChange={(e) => {
                                if (typeof e.value === 'string') {
                                    setPropertySearch(e.value);
                                } else {
                                    handlePropertySelect(e);
                                }
                            }}
                            field="label"
                            placeholder="Enter property address or MLS number (min 2 characters)"
                            style={{ width: '100%' }}
                            inputStyle={{ width: '100%' }}
                            disabled={selectedProperty !== null}
                            loading={searchLoading}
                        />
                    </div>

                    {/* Selected Property Display */}
                    {selectedProperty && (
                        <div style={{
                            marginTop: '1.5rem',
                            padding: '1rem',
                            border: '2px solid #667eea',
                            borderRadius: '8px',
                            backgroundColor: '#f8f9fa'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ display: 'flex', gap: '1rem', flex: 1 }}>
                                    {/* Property Image */}
                                    <div style={{ width: '120px', height: '90px', flexShrink: 0 }}>
                                        <img
                                            src={selectedProperty.listing_pics?.replace(/http:/, 'https:') || '/No-Photo-Light-Large.jpg'}
                                            alt={selectedProperty.address}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                borderRadius: '4px'
                                            }}
                                        />
                                    </div>

                                    {/* Property Details */}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '700', fontSize: '1.1rem', color: '#2c3e50', marginBottom: '0.5rem' }}>
                                            {selectedProperty.address}
                                            {selectedProperty.unit_number && ` #${selectedProperty.unit_number}`}
                                        </div>
                                        <div style={{ color: '#6c757d', marginBottom: '0.5rem' }}>
                                            {selectedProperty.city}, {selectedProperty.state} {selectedProperty.zip_code}
                                        </div>
                                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', color: '#495057' }}>
                                            <span><strong>MLS#:</strong> {selectedProperty.mls_number}</span>
                                            <span><strong>Status:</strong> {selectedProperty.status}</span>
                                            <span><strong>Price:</strong> {selectedProperty.price}</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', color: '#495057', marginTop: '0.25rem' }}>
                                            <span>{selectedProperty.bedrooms} Beds</span>
                                            <span>|</span>
                                            <span>{selectedProperty.bathrooms} Baths</span>
                                            <span>|</span>
                                            <span>{selectedProperty.sqft} SqFt</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Clear Button */}
                                <Button
                                    icon="pi pi-times"
                                    className="p-button-rounded p-button-text p-button-danger"
                                    onClick={handleClearProperty}
                                    tooltip="Clear selection"
                                    tooltipOptions={{ position: 'left' }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Link to Lead Checkbox */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Checkbox
                                inputId="link-lead"
                                checked={linkToLead}
                                onChange={(e) => setLinkToLead(e.checked)}
                            />
                            <label
                                htmlFor="link-lead"
                                style={{ fontWeight: '600', color: '#495057', cursor: 'pointer' }}
                            >
                                Link To An Existing Lead
                            </label>
                        </div>

                        {/* Lead Search Field (conditional) */}
                        {linkToLead && (
                            <div style={{ flex: 1 }}>
                                <AutoComplete
                                    id="lead-search"
                                    value={leadSearch}
                                    suggestions={leadSearchSuggestions}
                                    completeMethod={handleLeadSearch}
                                    onChange={(e) => setLeadSearch(e.value)}
                                    placeholder="Search for a lead by name"
                                    style={{ width: '100%' }}
                                    inputStyle={{ width: '100%' }}
                                />
                            </div>
                        )}
                    </div>
                </Card>

                {/* Client Information Section */}
                <Card
                    title="Client Information"
                    style={{
                        marginBottom: '1.5rem',
                        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                    }}
                >
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        {/* First Name */}
                        <div>
                            <label
                                htmlFor="first-name"
                                style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#495057',
                                }}
                            >
                                First Name
                            </label>
                            <InputText
                                id="first-name"
                                value={clientInfo.firstName}
                                onChange={(e) => handleClientInfoChange('firstName', e.target.value)}
                                placeholder="Enter first name"
                                style={{ width: '100%' }}
                            />
                        </div>

                        {/* Last Name */}
                        <div>
                            <label
                                htmlFor="last-name"
                                style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#495057',
                                }}
                            >
                                Last Name
                            </label>
                            <InputText
                                id="last-name"
                                value={clientInfo.lastName}
                                onChange={(e) => handleClientInfoChange('lastName', e.target.value)}
                                placeholder="Enter last name"
                                style={{ width: '100%' }}
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label
                                htmlFor="phone"
                                style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#495057',
                                }}
                            >
                                Phone
                            </label>
                            <InputText
                                id="phone"
                                value={clientInfo.phone}
                                onChange={(e) => handleClientInfoChange('phone', e.target.value)}
                                placeholder="Enter phone number"
                                style={{ width: '100%' }}
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label
                                htmlFor="email"
                                style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#495057',
                                }}
                            >
                                Email
                            </label>
                            <InputText
                                id="email"
                                value={clientInfo.email}
                                onChange={(e) => handleClientInfoChange('email', e.target.value)}
                                placeholder="Enter email address"
                                style={{ width: '100%' }}
                                type="email"
                            />
                        </div>
                    </div>
                </Card>

                {/* Transaction Information Section */}
                <Card
                    title="Transaction Information"
                    style={{
                        marginBottom: '1.5rem',
                        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                    }}
                >
                    {/* Price and Financing */}
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '1.5rem',
                            marginBottom: '1.5rem',
                        }}
                    >
                        {/* Price */}
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
                                Price
                            </label>
                            <InputText
                                id="price"
                                value={transactionInfo.price}
                                onChange={(e) => handleTransactionInfoChange('price', e.target.value)}
                                placeholder="Enter transaction price"
                                style={{ width: '100%' }}
                            />
                        </div>

                        {/* Financing */}
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
                                Financing
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

                        {/* Escrow Length */}
                        <div>
                            <label
                                htmlFor="escrow-length"
                                style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#495057',
                                }}
                            >
                                Escrow Length (Days) *
                            </label>
                            <InputText
                                id="escrow-length"
                                value={transactionInfo.escrowLength}
                                onChange={(e) => handleTransactionInfoChange('escrowLength', e.target.value)}
                                placeholder="e.g., 30"
                                style={{ width: '100%' }}
                                type="number"
                            />
                        </div>

                        {/* Lead Source */}
                        <div>
                            <label
                                htmlFor="lead-source"
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
                                id="lead-source"
                                value={transactionInfo.leadSource}
                                options={[
                                    { label: 'Zillow', value: 'zillow' },
                                    { label: 'Realtor.com', value: 'realtor' },
                                    { label: 'Referral', value: 'referral' },
                                    { label: 'Past Client', value: 'past-client' },
                                    { label: 'Open House', value: 'open-house' },
                                    { label: 'Social Media', value: 'social-media' },
                                    { label: 'Website', value: 'website' },
                                    { label: 'Other', value: 'other' },
                                ]}
                                onChange={(e) => handleTransactionInfoChange('leadSource', e.value)}
                                placeholder="Select lead source"
                                style={{ width: '100%' }}
                            />
                        </div>

                        {/* Referral Fee Checkbox */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '2rem' }}>
                            <Checkbox
                                inputId="referral-fee"
                                checked={transactionInfo.referralFee}
                                onChange={(e) => handleTransactionInfoChange('referralFee', e.checked)}
                            />
                            <label
                                htmlFor="referral-fee"
                                style={{ fontWeight: '600', color: '#495057', cursor: 'pointer' }}
                            >
                                Referral Fee
                            </label>
                        </div>

                        {/* Referral Fee Amount (conditional) */}
                        {transactionInfo.referralFee && (
                            <div>
                                <label
                                    htmlFor="referral-fee-amt"
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
                                    id="referral-fee-amt"
                                    value={transactionInfo.referralFeeAmt}
                                    onChange={(e) => handleTransactionInfoChange('referralFeeAmt', e.target.value)}
                                    placeholder="Enter amount"
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

                    {/* Client Credits Checkbox */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '2rem' }}>
                        <Checkbox
                            inputId="client-credits"
                            checked={showClientCredits}
                            onChange={(e) => handleClientCreditsCheckbox(e.checked)}
                        />
                        <label htmlFor="client-credits" style={{ fontWeight: '600', color: '#495057', cursor: 'pointer' }}>
                            Client Credits
                        </label>
                    </div>

                    {/* Client Credits Section (conditional) */}
                    {showClientCredits && (
                        <div
                            style={{
                                marginTop: '1.5rem',
                                padding: '1rem',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '8px',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '1rem',
                                }}
                            >
                                <h4 style={{ margin: 0, color: '#495057' }}>Client Credits</h4>
                                <Button icon="pi pi-plus" label="Add Credit" className="p-button-sm" onClick={handleAddClientCredit} />
                            </div>

                            {clientCredits.length === 0 ? (
                                <p style={{ color: '#6c757d', fontStyle: 'italic' }}>
                                    No credits added. Click "Add Credit" to begin.
                                </p>
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
                                            {/* Category Dropdown */}
                                            <div>
                                                <label
                                                    style={{
                                                        display: 'block',
                                                        marginBottom: '0.5rem',
                                                        fontWeight: '600',
                                                        color: '#495057',
                                                        fontSize: '0.9rem',
                                                    }}
                                                >
                                                    Category
                                                </label>
                                                <Dropdown
                                                    value={credit.category}
                                                    options={clientCreditCategories}
                                                    onChange={(e) => handleUpdateClientCredit(credit.id, 'category', e.value)}
                                                    style={{ width: '100%' }}
                                                />
                                            </div>

                                            {/* Amount Input */}
                                            <div>
                                                <label
                                                    style={{
                                                        display: 'block',
                                                        marginBottom: '0.5rem',
                                                        fontWeight: '600',
                                                        color: '#495057',
                                                        fontSize: '0.9rem',
                                                    }}
                                                >
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

                                            {/* Remove Button */}
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

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
                        {/* Total Estimated Commission */}
                        <div>
                            <label
                                htmlFor="total-commission"
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
                                id="total-commission"
                                value={transactionInfo.totalEstimatedCommission}
                                onChange={(e) => handleTransactionInfoChange('totalEstimatedCommission', e.target.value)}
                                placeholder="Enter total commission"
                                style={{ width: '100%' }}
                                type="number"
                            />
                        </div>
                    </div>

                    {/* Double-Ended Transaction Checkbox */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '2rem' }}>
                        <Checkbox inputId="double-ended" checked={doubleEnded} onChange={(e) => setDoubleEnded(e.checked)} />
                        <label htmlFor="double-ended" style={{ fontWeight: '600', color: '#495057', cursor: 'pointer' }}>
                            Double-Ended Transaction
                        </label>
                    </div>

                    {/* Seller Lead Section (conditional) */}
                    {doubleEnded && (
                        <div
                            style={{
                                marginTop: '1.5rem',
                                padding: '1rem',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '8px',
                            }}
                        >
                            <h4 style={{ marginBottom: '1rem', color: '#495057' }}>Seller Lead Information</h4>
                            <div style={{ marginBottom: '1rem' }}>
                                <label
                                    htmlFor="seller-lead-search"
                                    style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontWeight: '600',
                                        color: '#495057',
                                    }}
                                >
                                    Search for Seller Lead
                                </label>
                                <AutoComplete
                                    id="seller-lead-search"
                                    value={sellerLeadSearch}
                                    suggestions={sellerLeadSearchSuggestions}
                                    completeMethod={handleSellerLeadSearch}
                                    onChange={(e) => setSellerLeadSearch(e.value)}
                                    placeholder="Search for a seller lead by name"
                                    style={{ width: '100%' }}
                                    inputStyle={{ width: '100%' }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Contingencies In Place */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3
                            style={{
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                color: '#495057',
                                marginBottom: '1rem',
                            }}
                        >
                            Contingencies In Place
                        </h3>
                        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                            {/* Inspection Contingency */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Checkbox
                                    inputId="inspection-contingency"
                                    checked={contingencies.inspection}
                                    onChange={(e) => handleContingencyChange('inspection', e.checked)}
                                />
                                <label
                                    htmlFor="inspection-contingency"
                                    style={{ fontWeight: '500', color: '#495057', cursor: 'pointer' }}
                                >
                                    Inspection Contingency
                                </label>
                            </div>

                            {/* Appraisal Contingency */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Checkbox
                                    inputId="appraisal-contingency"
                                    checked={contingencies.appraisal}
                                    onChange={(e) => handleContingencyChange('appraisal', e.checked)}
                                />
                                <label
                                    htmlFor="appraisal-contingency"
                                    style={{ fontWeight: '500', color: '#495057', cursor: 'pointer' }}
                                >
                                    Appraisal Contingency
                                </label>
                            </div>

                            {/* Financing Contingency */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Checkbox
                                    inputId="financing-contingency"
                                    checked={contingencies.financing}
                                    onChange={(e) => handleContingencyChange('financing', e.checked)}
                                />
                                <label
                                    htmlFor="financing-contingency"
                                    style={{ fontWeight: '500', color: '#495057', cursor: 'pointer' }}
                                >
                                    Financing Contingency
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Date Selectors */}
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '1.5rem',
                        }}
                    >
                        {/* Acceptance Date */}
                        <div>
                            <label
                                htmlFor="acceptance-date"
                                style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#495057',
                                }}
                            >
                                Acceptance Date
                            </label>
                            <Calendar
                                id="acceptance-date"
                                value={transactionInfo.acceptanceDate}
                                onChange={(e) => handleTransactionInfoChange('acceptanceDate', e.value)}
                                placeholder="Select date"
                                style={{ width: '100%' }}
                                showIcon
                                dateFormat="mm/dd/yy"
                            />
                        </div>

                        {/* Inspection Contingency Due (conditional) */}
                        {contingencies.inspection && (
                            <div>
                                <label
                                    htmlFor="inspection-due"
                                    style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontWeight: '600',
                                        color: '#495057',
                                    }}
                                >
                                    Inspection Contingency Due
                                </label>
                                <Calendar
                                    id="inspection-due"
                                    value={contingencyDates.inspectionDue}
                                    onChange={(e) => handleContingencyDateChange('inspectionDue', e.value)}
                                    placeholder="Select date"
                                    style={{ width: '100%' }}
                                    showIcon
                                    dateFormat="mm/dd/yy"
                                />
                            </div>
                        )}

                        {/* Appraisal Contingency Due (conditional) */}
                        {contingencies.appraisal && (
                            <div>
                                <label
                                    htmlFor="appraisal-due"
                                    style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontWeight: '600',
                                        color: '#495057',
                                    }}
                                >
                                    Appraisal Contingency Due
                                </label>
                                <Calendar
                                    id="appraisal-due"
                                    value={contingencyDates.appraisalDue}
                                    onChange={(e) => handleContingencyDateChange('appraisalDue', e.value)}
                                    placeholder="Select date"
                                    style={{ width: '100%' }}
                                    showIcon
                                    dateFormat="mm/dd/yy"
                                />
                            </div>
                        )}

                        {/* Financing Contingency Due (conditional) */}
                        {contingencies.financing && (
                            <div>
                                <label
                                    htmlFor="financing-due"
                                    style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontWeight: '600',
                                        color: '#495057',
                                    }}
                                >
                                    Financing Contingency Due
                                </label>
                                <Calendar
                                    id="financing-due"
                                    value={contingencyDates.financingDue}
                                    onChange={(e) => handleContingencyDateChange('financingDue', e.value)}
                                    placeholder="Select date"
                                    style={{ width: '100%' }}
                                    showIcon
                                    dateFormat="mm/dd/yy"
                                />
                            </div>
                        )}

                        {/* Expected Close Date */}
                        <div>
                            <label
                                htmlFor="close-date"
                                style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#495057',
                                }}
                            >
                                Expected Close Date
                            </label>
                            <Calendar
                                id="close-date"
                                value={transactionInfo.expectedCloseDate}
                                onChange={(e) => handleTransactionInfoChange('expectedCloseDate', e.value)}
                                placeholder="Select date"
                                style={{ width: '100%' }}
                                showIcon
                                dateFormat="mm/dd/yy"
                            />
                        </div>
                    </div>
                </Card>

                {/* Submit Button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <Button
                        label="Cancel"
                        className="p-button-secondary"
                        style={{
                            padding: '0.75rem 2rem',
                            fontSize: '1rem',
                            fontWeight: '600',
                        }}
                        onClick={() => window.history.back()}
                    />
                    <Button
                        label="Create Transaction"
                        icon="pi pi-check"
                        style={{
                            padding: '0.75rem 2rem',
                            fontSize: '1rem',
                            fontWeight: '600',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: 'none',
                        }}
                        onClick={handleSubmit}
                    />
                </div>
            </div>
        </MainLayout>
    );
};

export default Transactions;
