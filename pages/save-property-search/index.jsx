// React & NextJS
import { useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import PrimeReact components
const Card = dynamic(() => import('primereact/card').then((mod) => mod.Card), { ssr: false });
const InputText = dynamic(() => import('primereact/inputtext').then((mod) => mod.InputText), {
    ssr: false,
});
const AutoComplete = dynamic(() => import('primereact/autocomplete').then((mod) => mod.AutoComplete), {
    ssr: false,
});
const Dropdown = dynamic(() => import('primereact/dropdown').then((mod) => mod.Dropdown), {
    ssr: false,
});
const Checkbox = dynamic(() => import('primereact/checkbox').then((mod) => mod.Checkbox), {
    ssr: false,
});
const RadioButton = dynamic(() => import('primereact/radiobutton').then((mod) => mod.RadioButton), {
    ssr: false,
});
const Button = dynamic(() => import('primereact/button').then((mod) => mod.Button), { ssr: false });
const Dialog = dynamic(() => import('primereact/dialog').then((mod) => mod.Dialog), {
    ssr: false,
});
const InputTextarea = dynamic(() => import('primereact/inputtextarea').then((mod) => mod.InputTextarea), {
    ssr: false,
});

import showToast from '../../utils/showToast';

// IRG Components
import MainLayout from '../../components/layout/MainLayout';

const SavePropertySearch = () => {
    // Toast reference
    // const toast = useRef(null);

    // Lead search state
    const [selectedLead, setSelectedLead] = useState('');
    const [leadSuggestions, setLeadSuggestions] = useState([]);

    // Search criteria state
    const [searchCriteria, setSearchCriteria] = useState({
        city: '',
        zipcode: '',
        minPrice: null,
        maxPrice: null,
        minBedrooms: '',
        maxBedrooms: '',
        minBathrooms: '',
        maxBathrooms: '',
        minSqFt: '',
        maxSqFt: '',
        minLotSize: null,
        maxLotSize: null,
    });

    // Checkbox state
    const [searchOptions, setSearchOptions] = useState({
        singleStoryOnly: false,
        exclude55Plus: true, // Checked by default
        mustHavePool: false,
        hasADU: false,
    });

    // Dialog state
    const [showDialog, setShowDialog] = useState(false);
    const [emailFrequency, setEmailFrequency] = useState('');
    const [emailSubject, setEmailSubject] = useState('');
    const [emailBody, setEmailBody] = useState('');

    // Map state
    const [mapAreaSelected, setMapAreaSelected] = useState(false);
    const [drawnArea, setDrawnArea] = useState(null);

    // City and Zipcode autocomplete
    const [citySuggestions, setCitySuggestions] = useState([]);
    const [zipcodeSuggestions, setZipcodeSuggestions] = useState([]);

    // Price options (placeholder values)
    const priceOptions = [
        { label: '$100,000', value: 100000 },
        { label: '$200,000', value: 200000 },
        { label: '$300,000', value: 300000 },
        { label: '$400,000', value: 400000 },
        { label: '$500,000', value: 500000 },
        { label: '$600,000', value: 600000 },
        { label: '$700,000', value: 700000 },
        { label: '$800,000', value: 800000 },
        { label: '$900,000', value: 900000 },
        { label: '$1,000,000', value: 1000000 },
        { label: '$1,500,000', value: 1500000 },
        { label: '$2,000,000', value: 2000000 },
        { label: '$2,500,000+', value: 2500000 },
    ];

    // Lot size options (placeholder values)
    const lotSizeOptions = [
        { label: '2,000 sqft', value: 2000 },
        { label: '3,000 sqft', value: 3000 },
        { label: '4,000 sqft', value: 4000 },
        { label: '5,000 sqft', value: 5000 },
        { label: '7,500 sqft', value: 7500 },
        { label: '10,000 sqft', value: 10000 },
        { label: '1/4 Acre', value: 10890 },
        { label: '1/2 Acre', value: 21780 },
        { label: '1 Acre', value: 43560 },
        { label: '2+ Acres', value: 87120 },
    ];

    // Handler for lead search (placeholder for future implementation)
    const handleLeadSearch = (_event) => {
        // Future: API call to search leads
        setLeadSuggestions([]);
    };

    // Handler for city search (placeholder for future implementation)
    const handleCitySearch = (_event) => {
        // Future: API call to search cities
        setCitySuggestions([]);
    };

    // Handler for zipcode search (placeholder for future implementation)
    const handleZipcodeSearch = (_event) => {
        // Future: API call to search zipcodes
        setZipcodeSuggestions([]);
    };

    // Handler for search criteria changes
    const handleCriteriaChange = (field, value) => {
        setSearchCriteria((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // Handler for checkbox changes
    const handleCheckboxChange = (field, value) => {
        setSearchOptions((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // Handler for map area selection
    const handleMapAreaSelect = () => {
        // Future: Capture actual polygon coordinates
        setMapAreaSelected(true);
        setDrawnArea({
            // Placeholder for polygon coordinates
            type: 'polygon',
            coordinates: [],
        });
    };

    // Handler for clearing map area
    const handleClearMapArea = () => {
        setMapAreaSelected(false);
        setDrawnArea(null);
    };

    // Handler for initial form submission (opens dialog)
    const handleInitialSubmit = (e) => {
        e.preventDefault();
        setShowDialog(true);
    };

    // Handler for dialog close
    const handleDialogClose = () => {
        setShowDialog(false);
        setEmailFrequency('');
        setEmailSubject('');
        setEmailBody('');
    };

    // Reset all form fields
    const resetForm = () => {
        setSelectedLead('');
        setSearchCriteria({
            city: '',
            zipcode: '',
            minPrice: null,
            maxPrice: null,
            minBedrooms: '',
            maxBedrooms: '',
            minBathrooms: '',
            maxBathrooms: '',
            minSqFt: '',
            maxSqFt: '',
            minLotSize: null,
            maxLotSize: null,
        });
        setSearchOptions({
            singleStoryOnly: false,
            exclude55Plus: true,
            mustHavePool: false,
            hasADU: false,
        });
    };

    // Handler for final form submission
    const handleFinalSubmit = (e) => {
        e.preventDefault();

        // Validate email frequency is selected
        if (!emailFrequency) {
            showToast(
            'warn',
            'Please select an email frequency',
            'Email Frequency Required',
            'top-right',
        );
            // toast.current.show({
            //     severity: 'warn',
            //     summary: 'Email Frequency Required',
            //     detail: 'Please select an email frequency',
            //     life: 3000,
            // });
            return;
        }

        const formData = {
            lead: selectedLead,
            criteria: searchCriteria,
            options: searchOptions,
            emailFrequency,
            emailSubject,
            emailBody,
        };

        console.log('Form submitted:', formData); // eslint-disable-line

        showToast(
            'success',
            'Property Search has been saved!',
            'Saved!',
            'top-right',
        );
        // Show success toast
        // toast.current.show({
        //     severity: 'success',
        //     summary: 'Success',
        //     detail: 'Property Search has been saved!',
        //     life: 3000,
        // });

        // Close dialog and reset form
        handleDialogClose();
        resetForm();
    };

    return (
        <MainLayout>
            {/* <Toast ref={toast} /> */}
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
                        Save A Property Search
                    </h1>
                    <p style={{ fontSize: '1rem', color: '#6c757d' }}>
                        Create and save custom property searches for your leads
                    </p>
                </div>

                <form onSubmit={handleInitialSubmit}>
                    {/* Lead Selection Section */}
                    <Card
                        title="Lead Information"
                        style={{
                            marginBottom: '1.5rem',
                            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                        }}
                    >
                        <div>
                            <label
                                htmlFor="lead-search"
                                style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#495057',
                                }}
                            >
                                Link To A Lead
                            </label>
                            <AutoComplete
                                id="lead-search"
                                value={selectedLead}
                                suggestions={leadSuggestions}
                                completeMethod={handleLeadSearch}
                                onChange={(e) => setSelectedLead(e.value)}
                                placeholder="Search for a lead by name"
                                style={{ width: '100%' }}
                                inputStyle={{ width: '100%' }}
                            />
                        </div>
                    </Card>

                    {/* Search Criteria Section */}
                    <Card
                        title="Search Criteria"
                        style={{
                            marginBottom: '1.5rem',
                            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                        }}
                    >
                        {/* Map Section */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div
                                style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#495057',
                                }}
                            >
                                Draw Search Area on Map
                            </div>
                            {/* Map Container - Placeholder for Google Maps */}
                            <div
                                style={{
                                    width: '100%',
                                    height: '400px',
                                    background: '#f8f9fa',
                                    border: '2px solid #dee2e6',
                                    borderRadius: '8px',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    backgroundImage: [
                                        'linear-gradient(45deg, #e9ecef 25%, transparent 25%)',
                                        'linear-gradient(-45deg, #e9ecef 25%, transparent 25%)',
                                        'linear-gradient(45deg, transparent 75%, #e9ecef 75%)',
                                        'linear-gradient(-45deg, transparent 75%, #e9ecef 75%)',
                                    ].join(', '),
                                    backgroundSize: '20px 20px',
                                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                                }}
                            >
                                {/* Map Placeholder Content */}
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        textAlign: 'center',
                                        color: '#6c757d',
                                    }}
                                >
                                    <i
                                        className="pi pi-map"
                                        style={{ fontSize: '3rem', marginBottom: '1rem', display: 'block' }}
                                    />
                                    <div style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                                        Google Maps Drawing Tool
                                    </div>
                                    <div style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                        Click the button below to draw a search area
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                        <Button
                                            label="Draw Area"
                                            icon="pi pi-pencil"
                                            onClick={handleMapAreaSelect}
                                            style={{
                                                padding: '0.5rem 1.5rem',
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                border: 'none',
                                            }}
                                            type="button"
                                        />
                                        {mapAreaSelected && (
                                            <Button
                                                label="Clear Area"
                                                icon="pi pi-times"
                                                className="p-button-secondary"
                                                onClick={handleClearMapArea}
                                                style={{
                                                    padding: '0.5rem 1.5rem',
                                                }}
                                                type="button"
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Map Area Selected Message */}
                            {mapAreaSelected && (
                                <h2
                                    style={{
                                        fontSize: '1.5rem',
                                        fontWeight: '700',
                                        color: '#667eea',
                                        marginTop: '1rem',
                                        marginBottom: '0',
                                    }}
                                >
                                    Map Area Selected
                                </h2>
                            )}
                        </div>

                        {/* Location Section */}
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '1.5rem',
                                marginBottom: '1.5rem',
                            }}
                        >
                            {/* City */}
                            <div>
                                <label
                                    htmlFor="city"
                                    style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontWeight: '600',
                                        color: '#495057',
                                    }}
                                >
                                    City
                                </label>
                                <AutoComplete
                                    id="city"
                                    value={searchCriteria.city}
                                    suggestions={citySuggestions}
                                    completeMethod={handleCitySearch}
                                    onChange={(e) => handleCriteriaChange('city', e.value)}
                                    placeholder="Select city"
                                    style={{ width: '100%' }}
                                    inputStyle={{ width: '100%' }}
                                />
                            </div>

                            {/* Zipcode */}
                            <div>
                                <label
                                    htmlFor="zipcode"
                                    style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontWeight: '600',
                                        color: '#495057',
                                    }}
                                >
                                    Zipcode
                                </label>
                                <AutoComplete
                                    id="zipcode"
                                    value={searchCriteria.zipcode}
                                    suggestions={zipcodeSuggestions}
                                    completeMethod={handleZipcodeSearch}
                                    onChange={(e) => handleCriteriaChange('zipcode', e.value)}
                                    placeholder="Select zipcode"
                                    style={{ width: '100%' }}
                                    inputStyle={{ width: '100%' }}
                                />
                            </div>
                        </div>

                        {/* Price Range Section */}
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '1.5rem',
                                marginBottom: '1.5rem',
                            }}
                        >
                            {/* Min Price */}
                            <div>
                                <label
                                    htmlFor="min-price"
                                    style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontWeight: '600',
                                        color: '#495057',
                                    }}
                                >
                                    Min Price
                                </label>
                                <Dropdown
                                    id="min-price"
                                    value={searchCriteria.minPrice}
                                    options={priceOptions}
                                    onChange={(e) => handleCriteriaChange('minPrice', e.value)}
                                    placeholder="Select minimum price"
                                    style={{ width: '100%' }}
                                />
                            </div>

                            {/* Max Price */}
                            <div>
                                <label
                                    htmlFor="max-price"
                                    style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontWeight: '600',
                                        color: '#495057',
                                    }}
                                >
                                    Max Price
                                </label>
                                <Dropdown
                                    id="max-price"
                                    value={searchCriteria.maxPrice}
                                    options={priceOptions}
                                    onChange={(e) => handleCriteriaChange('maxPrice', e.value)}
                                    placeholder="Select maximum price"
                                    style={{ width: '100%' }}
                                />
                            </div>
                        </div>

                        {/* Bedrooms Section */}
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '1.5rem',
                                marginBottom: '1.5rem',
                            }}
                        >
                            {/* Min Bedrooms */}
                            <div>
                                <label
                                    htmlFor="min-bedrooms"
                                    style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontWeight: '600',
                                        color: '#495057',
                                    }}
                                >
                                    Min Bedrooms
                                </label>
                                <InputText
                                    id="min-bedrooms"
                                    value={searchCriteria.minBedrooms}
                                    onChange={(e) => handleCriteriaChange('minBedrooms', e.target.value)}
                                    placeholder="Enter minimum bedrooms"
                                    style={{ width: '100%' }}
                                    type="number"
                                    min="0"
                                />
                            </div>

                            {/* Max Bedrooms */}
                            <div>
                                <label
                                    htmlFor="max-bedrooms"
                                    style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontWeight: '600',
                                        color: '#495057',
                                    }}
                                >
                                    Max Bedrooms
                                </label>
                                <InputText
                                    id="max-bedrooms"
                                    value={searchCriteria.maxBedrooms}
                                    onChange={(e) => handleCriteriaChange('maxBedrooms', e.target.value)}
                                    placeholder="Enter maximum bedrooms"
                                    style={{ width: '100%' }}
                                    type="number"
                                    min="0"
                                />
                            </div>
                        </div>

                        {/* Bathrooms Section */}
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '1.5rem',
                                marginBottom: '1.5rem',
                            }}
                        >
                            {/* Min Bathrooms */}
                            <div>
                                <label
                                    htmlFor="min-bathrooms"
                                    style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontWeight: '600',
                                        color: '#495057',
                                    }}
                                >
                                    Min Bathrooms
                                </label>
                                <InputText
                                    id="min-bathrooms"
                                    value={searchCriteria.minBathrooms}
                                    onChange={(e) => handleCriteriaChange('minBathrooms', e.target.value)}
                                    placeholder="Enter minimum bathrooms"
                                    style={{ width: '100%' }}
                                    type="number"
                                    min="0"
                                    step="0.5"
                                />
                            </div>

                            {/* Max Bathrooms */}
                            <div>
                                <label
                                    htmlFor="max-bathrooms"
                                    style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontWeight: '600',
                                        color: '#495057',
                                    }}
                                >
                                    Max Bathrooms
                                </label>
                                <InputText
                                    id="max-bathrooms"
                                    value={searchCriteria.maxBathrooms}
                                    onChange={(e) => handleCriteriaChange('maxBathrooms', e.target.value)}
                                    placeholder="Enter maximum bathrooms"
                                    style={{ width: '100%' }}
                                    type="number"
                                    min="0"
                                    step="0.5"
                                />
                            </div>
                        </div>

                        {/* Square Footage Section */}
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '1.5rem',
                                marginBottom: '1.5rem',
                            }}
                        >
                            {/* Min SqFt */}
                            <div>
                                <label
                                    htmlFor="min-sqft"
                                    style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontWeight: '600',
                                        color: '#495057',
                                    }}
                                >
                                    Min SqFt
                                </label>
                                <InputText
                                    id="min-sqft"
                                    value={searchCriteria.minSqFt}
                                    onChange={(e) => handleCriteriaChange('minSqFt', e.target.value)}
                                    placeholder="Enter minimum square feet"
                                    style={{ width: '100%' }}
                                    type="number"
                                    min="0"
                                />
                            </div>

                            {/* Max SqFt */}
                            <div>
                                <label
                                    htmlFor="max-sqft"
                                    style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontWeight: '600',
                                        color: '#495057',
                                    }}
                                >
                                    Max SqFt
                                </label>
                                <InputText
                                    id="max-sqft"
                                    value={searchCriteria.maxSqFt}
                                    onChange={(e) => handleCriteriaChange('maxSqFt', e.target.value)}
                                    placeholder="Enter maximum square feet"
                                    style={{ width: '100%' }}
                                    type="number"
                                    min="0"
                                />
                            </div>
                        </div>

                        {/* Lot Size Section */}
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '1.5rem',
                            }}
                        >
                            {/* Min Lot Size */}
                            <div>
                                <label
                                    htmlFor="min-lot-size"
                                    style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontWeight: '600',
                                        color: '#495057',
                                    }}
                                >
                                    Min Lot Size
                                </label>
                                <Dropdown
                                    id="min-lot-size"
                                    value={searchCriteria.minLotSize}
                                    options={lotSizeOptions}
                                    onChange={(e) => handleCriteriaChange('minLotSize', e.value)}
                                    placeholder="Select minimum lot size"
                                    style={{ width: '100%' }}
                                />
                            </div>

                            {/* Max Lot Size */}
                            <div>
                                <label
                                    htmlFor="max-lot-size"
                                    style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontWeight: '600',
                                        color: '#495057',
                                    }}
                                >
                                    Max Lot Size
                                </label>
                                <Dropdown
                                    id="max-lot-size"
                                    value={searchCriteria.maxLotSize}
                                    options={lotSizeOptions}
                                    onChange={(e) => handleCriteriaChange('maxLotSize', e.value)}
                                    placeholder="Select maximum lot size"
                                    style={{ width: '100%' }}
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Additional Options Section */}
                    <Card
                        title="Additional Options"
                        style={{
                            marginBottom: '1.5rem',
                            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                        }}
                    >
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: '1.5rem',
                            }}
                        >
                            {/* Single Story Only */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Checkbox
                                    inputId="single-story"
                                    checked={searchOptions.singleStoryOnly}
                                    onChange={(e) => handleCheckboxChange('singleStoryOnly', e.checked)}
                                />
                                <label
                                    htmlFor="single-story"
                                    style={{
                                        fontWeight: '500',
                                        color: '#495057',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Single Story Only
                                </label>
                            </div>

                            {/* Exclude 55+ Communities */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Checkbox
                                    inputId="exclude-55"
                                    checked={searchOptions.exclude55Plus}
                                    onChange={(e) => handleCheckboxChange('exclude55Plus', e.checked)}
                                />
                                <label
                                    htmlFor="exclude-55"
                                    style={{
                                        fontWeight: '500',
                                        color: '#495057',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Exclude 55+ Communities
                                </label>
                            </div>

                            {/* Must Have Pool */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Checkbox
                                    inputId="must-have-pool"
                                    checked={searchOptions.mustHavePool}
                                    onChange={(e) => handleCheckboxChange('mustHavePool', e.checked)}
                                />
                                <label
                                    htmlFor="must-have-pool"
                                    style={{
                                        fontWeight: '500',
                                        color: '#495057',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Must Have Pool
                                </label>
                            </div>

                            {/* Has ADU */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Checkbox
                                    inputId="has-adu"
                                    checked={searchOptions.hasADU}
                                    onChange={(e) => handleCheckboxChange('hasADU', e.checked)}
                                />
                                <label
                                    htmlFor="has-adu"
                                    style={{
                                        fontWeight: '500',
                                        color: '#495057',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Has ADU?
                                </label>
                            </div>
                        </div>
                    </Card>

                    {/* Submit Button */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <Button
                            label="Save Search As"
                            icon="pi pi-bell"
                            type="submit"
                            style={{
                                padding: '0.75rem 2rem',
                                fontSize: '1rem',
                                fontWeight: '600',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                border: 'none',
                            }}
                        />
                    </div>
                </form>
            </div>

            {/* Email Configuration Dialog */}
            <Dialog
                header="Email Notification Settings"
                visible={showDialog}
                onHide={handleDialogClose}
                style={{ width: '600px', maxWidth: '90vw' }}
                contentStyle={{
                    padding: '1.5rem',
                    background: '#ffffff',
                    borderRadius: '8px',
                }}
            >
                <form onSubmit={handleFinalSubmit}>
                    {/* Email Frequency Section */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3
                            style={{
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                color: '#495057',
                                marginBottom: '1rem',
                            }}
                        >
                            Email Frequency
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {/* Instantly */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <RadioButton
                                    inputId="freq-instantly"
                                    name="frequency"
                                    value="instantly"
                                    onChange={(e) => setEmailFrequency(e.value)}
                                    checked={emailFrequency === 'instantly'}
                                />
                                <label
                                    htmlFor="freq-instantly"
                                    style={{
                                        fontWeight: '500',
                                        color: '#495057',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Instantly
                                </label>
                            </div>

                            {/* Twice A Week */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <RadioButton
                                    inputId="freq-twice-week"
                                    name="frequency"
                                    value="twice-weekly"
                                    onChange={(e) => setEmailFrequency(e.value)}
                                    checked={emailFrequency === 'twice-weekly'}
                                />
                                <label
                                    htmlFor="freq-twice-week"
                                    style={{
                                        fontWeight: '500',
                                        color: '#495057',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Twice A Week
                                </label>
                            </div>

                            {/* Daily */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <RadioButton
                                    inputId="freq-daily"
                                    name="frequency"
                                    value="daily"
                                    onChange={(e) => setEmailFrequency(e.value)}
                                    checked={emailFrequency === 'daily'}
                                />
                                <label
                                    htmlFor="freq-daily"
                                    style={{
                                        fontWeight: '500',
                                        color: '#495057',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Daily
                                </label>
                            </div>

                            {/* Weekly */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <RadioButton
                                    inputId="freq-weekly"
                                    name="frequency"
                                    value="weekly"
                                    onChange={(e) => setEmailFrequency(e.value)}
                                    checked={emailFrequency === 'weekly'}
                                />
                                <label
                                    htmlFor="freq-weekly"
                                    style={{
                                        fontWeight: '500',
                                        color: '#495057',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Weekly
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Email Subject */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label
                            htmlFor="email-subject"
                            style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                fontWeight: '600',
                                color: '#495057',
                            }}
                        >
                            Email Subject
                        </label>
                        <InputText
                            id="email-subject"
                            value={emailSubject}
                            onChange={(e) => setEmailSubject(e.target.value)}
                            placeholder="Enter email subject"
                            style={{ width: '100%' }}
                        />
                    </div>

                    {/* Email Body */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label
                            htmlFor="email-body"
                            style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                fontWeight: '600',
                                color: '#495057',
                            }}
                        >
                            Email Body
                        </label>
                        <InputTextarea
                            id="email-body"
                            value={emailBody}
                            onChange={(e) => setEmailBody(e.target.value)}
                            placeholder="Enter email message"
                            rows={6}
                            style={{ width: '100%' }}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <Button
                            label="Cancel"
                            className="p-button-secondary"
                            onClick={handleDialogClose}
                            type="button"
                            style={{
                                padding: '0.75rem 1.5rem',
                                fontWeight: '600',
                            }}
                        />
                        <Button
                            label="Save Search & Notify"
                            icon="pi pi-check"
                            type="submit"
                            style={{
                                padding: '0.75rem 1.5rem',
                                fontWeight: '600',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                border: 'none',
                            }}
                        />
                    </div>
                </form>
            </Dialog>
        </MainLayout>
    );
};

export default SavePropertySearch;
