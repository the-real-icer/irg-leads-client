// React & NextJS
import { useState } from 'react';
import dynamic from 'next/dynamic';

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

const Transactions = () => {
    // Property search state
    const [propertySearch, setPropertySearch] = useState('');
    const [propertySearchSuggestions, setPropertySearchSuggestions] = useState([]);

    // Link to lead state
    const [linkToLead, setLinkToLead] = useState(false);
    const [leadSearch, setLeadSearch] = useState('');
    const [leadSearchSuggestions, setLeadSearchSuggestions] = useState([]);

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

    // Handler for property search (placeholder for future implementation)
    const handlePropertySearch = (_event) => {
        // Future: API call to search properties
        setPropertySearchSuggestions([]);
    };

    // Handler for lead search (placeholder for future implementation)
    const handleLeadSearch = (_event) => {
        // Future: API call to search leads
        setLeadSearchSuggestions([]);
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

    // Handler for form submission
    const handleSubmit = () => {
        const formData = {
            property: propertySearch,
            linkedLead: linkToLead ? leadSearch : null,
            clientInfo,
            transactionInfo,
            contingencies,
            contingencyDates,
        };
        console.log('Form submitted:', formData); // eslint-disable-line
        // Future: API call to save transaction
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
                        New Transaction
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
                            onChange={(e) => setPropertySearch(e.value)}
                            placeholder="Enter property address or MLS number"
                            style={{ width: '100%' }}
                            inputStyle={{ width: '100%' }}
                        />
                    </div>

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
                    </div>

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
