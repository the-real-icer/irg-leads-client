// React & NextJS
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

// Redux
import { useSelector } from 'react-redux';

// Dynamically import PrimeReact components
const Button = dynamic(() => import('primereact/button').then((mod) => mod.Button), { ssr: false });
const Card = dynamic(() => import('primereact/card').then((mod) => mod.Card), { ssr: false });
const Dialog = dynamic(() => import('primereact/dialog').then((mod) => mod.Dialog), { ssr: false });
const Dropdown = dynamic(() => import('primereact/dropdown').then((mod) => mod.Dropdown), { ssr: false });
const InputText = dynamic(() => import('primereact/inputtext').then((mod) => mod.InputText), { ssr: false });
const InputNumber = dynamic(() => import('primereact/inputnumber').then((mod) => mod.InputNumber), { ssr: false });
const Checkbox = dynamic(() => import('primereact/checkbox').then((mod) => mod.Checkbox), { ssr: false });

// IRG Components
import MainLayout from '../../components/layout/MainLayout';

// API & Utils
import IrgApi from '../../assets/irgApi';
import showToast from '../../utils/showToast';

const IrgAreas = () => {
    // __________________Next Router______________________\\
    const router = useRouter();

    // __________________Redux State______________________\\
    const isLoggedIn = useSelector((state) => state.isLoggedIn);
    const agent = useSelector((state) => state.agent);

    // ________________Component State_________________\\
    const [areas, setAreas] = useState([]);
    const [filteredAreas, setFilteredAreas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDialog, setShowDialog] = useState(false);
    const [saving, setSaving] = useState(false);

    // Filter state — initialize from URL query params
    const [selectedCounty, setSelectedCounty] = useState(router.query.county || 'All');
    const [selectedType, setSelectedType] = useState(router.query.type || 'All');
    const [searchQuery, setSearchQuery] = useState(router.query.q || '');

    // Boundary text state for Add New dialog
    const [boundaryText, setBoundaryText] = useState('');

    // Form state for new area
    const [formData, setFormData] = useState({
        name: '',
        search_name: '',
        type: 'City',
        state: 'CA',
        city: '',
        county: 'San Diego',
        zipcode: '',
        address: '',
        address_2: '',
        as: '',
        label: '',
        href: '',
        coordinates: { lat: 0, lng: 0 },
        boundary: [],
        zoom: 12,
        is_multi_address: false,
        condo_addresses: [],
    });

    const typeOptions = [
        { label: 'All', value: 'All' },
        { label: 'Cities', value: 'City' },
        { label: 'Neighborhoods', value: 'Neighborhood' },
        { label: 'Zipcodes', value: 'Zip' },
        { label: 'Condo Buildings', value: 'CondoBuilding' },
    ];

    const areaTypeOptions = [
        { label: 'City', value: 'City' },
        { label: 'Neighborhood', value: 'Neighborhood' },
        { label: 'Zipcode', value: 'Zip' },
        { label: 'Condo Building', value: 'CondoBuilding' },
    ];

    const countyOptions = [
        { label: 'All', value: 'All' },
        { label: 'San Diego', value: 'San Diego' },
        { label: 'Los Angeles', value: 'Los Angeles' },
        { label: 'Riverside', value: 'Riverside' },
        { label: 'Orange', value: 'Orange' },
        { label: 'San Bernardino', value: 'San Bernardino' },
    ];

    // Fetch all areas on mount
    useEffect(() => {
        if (!isLoggedIn || !agent || agent.role !== 'admin') return;

        const fetchAreas = async () => {
            setLoading(true);
            try {
                const response = await IrgApi.get('/irg-areas/all-irg-areas', {
                    headers: { Authorization: `Bearer ${isLoggedIn}` },
                });

                if (response.data.status === 'success') {
                    // Flatten the categorized data into a single array
                    const allAreas = [
                        ...response.data.data.City,
                        ...response.data.data.Neighborhood,
                        ...response.data.data.Zip,
                        ...response.data.data.CondoBuilding,
                    ];

                    setAreas(allAreas);
                }
            } catch (error) {
                showToast('error', 'Failed to load IRG areas', 'Error');
            } finally {
                setLoading(false);
            }
        };

        fetchAreas();
    }, [isLoggedIn, agent]);

    // Filter areas based on county, type, and search query
    useEffect(() => {
        let filtered = [...areas];

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            filtered = filtered.filter(area =>
                area.name?.toLowerCase().includes(query) ||
                area.search_name?.toLowerCase().includes(query) ||
                area.city?.toLowerCase().includes(query) ||
                area.as?.toLowerCase().includes(query)
            );
        }

        // Filter by county
        if (selectedCounty !== 'All') {
            filtered = filtered.filter(area => area.county === selectedCounty);
        }

        // Filter by type
        if (selectedType !== 'All') {
            filtered = filtered.filter(area => area.type === selectedType);
        }

        // Sort: Cities first, Neighborhoods second, Zipcodes last
        filtered.sort((a, b) => {
            const order = { City: 1, Neighborhood: 2, Zip: 3, CondoBuilding: 4 };
            return order[a.type] - order[b.type];
        });

        setFilteredAreas(filtered);
    }, [areas, selectedCounty, selectedType, searchQuery]);

    // Sync filters to URL query params
    useEffect(() => {
        const params = {};
        if (selectedCounty !== 'All') params.county = selectedCounty;
        if (selectedType !== 'All') params.type = selectedType;
        if (searchQuery.trim()) params.q = searchQuery.trim();

        const hasParams = Object.keys(params).length > 0;
        const target = hasParams
            ? { pathname: '/irg-areas', query: params }
            : '/irg-areas';

        router.replace(target, undefined, { shallow: true });
    }, [selectedCounty, selectedType, searchQuery]);

    const hasActiveFilters = selectedCounty !== 'All' || selectedType !== 'All' || searchQuery.trim() !== '';

    const handleResetFilters = () => {
        setSelectedCounty('All');
        setSelectedType('All');
        setSearchQuery('');
    };

    // Handle form input changes
    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    // Handle boundary text changes
    const handleBoundaryTextChange = (text) => {
        setBoundaryText(text);
        try {
            const parsed = JSON.parse(text);
            if (Array.isArray(parsed)) {
                setFormData((prev) => ({ ...prev, boundary: parsed }));
            }
        } catch (error) {
            // Invalid JSON, don't update formData.boundary
        }
    };

    // Handle nested coordinate changes
    const handleCoordinateChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            coordinates: { ...prev.coordinates, [field]: value },
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.name || !formData.search_name || !formData.state || !formData.href || !formData.zoom || !formData.boundary || formData.boundary.length === 0) {
            showToast('error', 'Please fill in all required fields', 'Validation Error');
            return;
        }

        try {
            setSaving(true);

            // Construct geoCoords for MongoDB geospatial queries
            const areaData = {
                ...formData,
                geoCoords: {
                    type: 'Point',
                    coordinates: [formData.coordinates.lng, formData.coordinates.lat],
                },
            };

            const response = await IrgApi.post('/irg-areas/create-area', areaData, {
                headers: {
                    Authorization: `Bearer ${isLoggedIn}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.data.status === 'success') {
                showToast('success', 'Area created successfully', 'Success');
                setShowDialog(false);

                // Add new area to the list
                setAreas((prev) => [...prev, response.data.data]);

                // Reset form
                setFormData({
                    name: '',
                    search_name: '',
                    type: 'City',
                    state: 'CA',
                    city: '',
                    county: 'San Diego',
                    zipcode: '',
                    address: '',
                    address_2: '',
                    as: '',
                    label: '',
                    href: '',
                    coordinates: { lat: 0, lng: 0 },
                    boundary: [],
                    zoom: 12,
                    is_multi_address: false,
                    condo_addresses: [],
                });
                setBoundaryText('');
            }
        } catch (error) {
            let errorMessage = 'Failed to create area';

            if (error.response?.data?.message) {
                const message = error.response.data.message;

                if (message.includes('duplicate key error') || message.includes('E11000')) {
                    errorMessage = 'An area with this search name already exists';
                } else {
                    errorMessage = message;
                }
            } else if (error.message) {
                errorMessage = error.message;
            }

            showToast('error', errorMessage, 'Error');
        } finally {
            setSaving(false);
        }
    };

    // Handle area card click
    const handleAreaClick = (areaId) => {
        router.push(`/irg-areas/${areaId}`);
    };

    // Get badge color by type
    const getTypeBadgeColor = (type) => {
        switch (type) {
            case 'City':
                return { bg: '#667eea20', color: '#667eea' };
            case 'Neighborhood':
                return { bg: '#4CAF5020', color: '#4CAF50' };
            case 'Zip':
                return { bg: '#f59e0b20', color: '#f59e0b' };
            case 'CondoBuilding':
                return { bg: '#ff525220', color: '#ff5252' };
            default:
                return { bg: '#6c757d20', color: '#6c757d' };
        }
    };

    return (
        <MainLayout>
            {/* Add Area Dialog */}
            <Dialog
                header="Add New IRG Area"
                visible={showDialog}
                style={{ width: '800px' }}
                onHide={() => setShowDialog(false)}
            >
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Basic Information */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                                    Name *
                                </label>
                                <InputText
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    placeholder="e.g., San Diego"
                                    style={{ width: '100%' }}
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="search_name" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                                    Search Name (Unique) *
                                </label>
                                <InputText
                                    id="search_name"
                                    value={formData.search_name}
                                    onChange={(e) => handleChange('search_name', e.target.value)}
                                    placeholder="e.g., san-diego"
                                    style={{ width: '100%' }}
                                    required
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label htmlFor="type" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                                    Type *
                                </label>
                                <Dropdown
                                    id="type"
                                    value={formData.type}
                                    options={areaTypeOptions}
                                    onChange={(e) => handleChange('type', e.value)}
                                    style={{ width: '100%' }}
                                />
                            </div>

                            <div>
                                <label htmlFor="county" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                                    County *
                                </label>
                                <Dropdown
                                    id="county"
                                    value={formData.county}
                                    options={countyOptions.filter(c => c.value !== 'All')}
                                    onChange={(e) => handleChange('county', e.value)}
                                    style={{ width: '100%' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label htmlFor="state" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                                    State *
                                </label>
                                <InputText
                                    id="state"
                                    value={formData.state}
                                    onChange={(e) => handleChange('state', e.target.value)}
                                    placeholder="e.g., CA"
                                    style={{ width: '100%' }}
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="city" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                                    City - SKIP!!
                                </label>
                                <InputText
                                    id="city"
                                    value={formData.city}
                                    onChange={(e) => handleChange('city', e.target.value)}
                                    placeholder="City name"
                                    style={{ width: '100%' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label htmlFor="as" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                                    Proper Url *
                                </label>
                                <InputText
                                    id="as"
                                    value={formData.as}
                                    onChange={(e) => handleChange('as', e.target.value)}
                                    placeholder="e.g., /city/san-diego"
                                    style={{ width: '100%' }}
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="href" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                                    HREF/URL * (ie: /city/[city])
                                </label>
                                <InputText
                                    id="href"
                                    value={formData.href}
                                    onChange={(e) => handleChange('href', e.target.value)}
                                    placeholder="e.g., /city/[city]"
                                    style={{ width: '100%' }}
                                    required
                                />
                            </div>
                        </div>

                        {/* Zipcode */}
                        <div>
                            <label htmlFor="zipcode" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                                Zipcode
                            </label>
                            <InputNumber
                                id="zipcode"
                                value={formData.zipcode}
                                onValueChange={(e) => handleChange('zipcode', e.value)}
                                placeholder="e.g., 92101"
                                style={{ width: '100%' }}
                                useGrouping={false}
                            />
                        </div>

                        {/* Coordinates */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label htmlFor="lat" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                                    Latitude * 33, 34
                                </label>
                                <InputNumber
                                    id="lat"
                                    value={formData.coordinates.lat}
                                    onValueChange={(e) => handleCoordinateChange('lat', e.value)}
                                    placeholder="e.g., 32.7157"
                                    style={{ width: '100%' }}
                                    minFractionDigits={2}
                                    maxFractionDigits={6}
                                />
                            </div>

                            <div>
                                <label htmlFor="lng" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                                    Longitude * -117
                                </label>
                                <InputNumber
                                    id="lng"
                                    value={formData.coordinates.lng}
                                    onValueChange={(e) => handleCoordinateChange('lng', e.value)}
                                    placeholder="e.g., -117.1611"
                                    style={{ width: '100%' }}
                                    minFractionDigits={2}
                                    maxFractionDigits={6}
                                />
                            </div>

                            <div>
                                <label htmlFor="zoom" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                                    Zoom Level *
                                </label>
                                <InputNumber
                                    id="zoom"
                                    value={formData.zoom}
                                    onValueChange={(e) => handleChange('zoom', e.value)}
                                    placeholder="e.g., 12"
                                    style={{ width: '100%' }}
                                    min={1}
                                    max={20}
                                    required
                                />
                            </div>
                        </div>

                        {/* Boundary Coordinates */}
                        <div>
                            <label htmlFor="boundary" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                                Boundary Coordinates (JSON Array) *
                            </label>
                            <textarea
                                id="boundary"
                                value={boundaryText}
                                onChange={(e) => handleBoundaryTextChange(e.target.value)}
                                placeholder='[[[lng, lat], [lng, lat], ...]]'
                                style={{
                                    width: '100%',
                                    minHeight: '200px',
                                    padding: '0.75rem',
                                    borderRadius: '6px',
                                    border: '1px solid hsl(var(--input))',
                                    backgroundColor: 'hsl(var(--surface))',
                                    color: 'hsl(var(--foreground))',
                                    fontFamily: 'monospace',
                                    fontSize: '0.875rem',
                                    resize: 'vertical',
                                }}
                                required
                            />
                            <small style={{ color: 'hsl(var(--foreground-muted))', display: 'block', marginTop: '0.25rem' }}>
                                Format: Array of coordinate pairs [[lng, lat], [lng, lat], ...]
                            </small>
                        </div>

                        {/* Multi-Address Checkbox */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Checkbox
                                inputId="is_multi_address"
                                checked={formData.is_multi_address}
                                onChange={(e) => handleChange('is_multi_address', e.checked)}
                            />
                            <label htmlFor="is_multi_address" style={{ fontWeight: '600', cursor: 'pointer' }}>
                                Multi-Address Area
                            </label>
                        </div>

                        {/* Submit Buttons */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid hsl(var(--border))' }}>
                            <Button
                                label="Cancel"
                                className="p-button-text"
                                onClick={() => setShowDialog(false)}
                                type="button"
                                disabled={saving}
                            />
                            <Button
                                label={saving ? 'Creating...' : 'Create Area'}
                                icon={saving ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
                                type="submit"
                                disabled={saving}
                                style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}
                            />
                        </div>
                    </div>
                </form>
            </Dialog>

            {/* Main Content */}
            <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h1 style={{
                            fontSize: '2rem',
                            fontWeight: '700',
                            color: '#2c3e50',
                            marginBottom: '0.5rem',
                        }}>
                            IRG Areas
                        </h1>
                        <p style={{ color: '#6c757d', fontSize: '0.95rem' }}>
                            Manage cities, neighborhoods, and zipcodes
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        {hasActiveFilters && (
                            <Button
                                label="Reset Filters"
                                icon="pi pi-filter-slash"
                                className="p-button-outlined p-button-secondary"
                                onClick={handleResetFilters}
                                style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}
                            />
                        )}
                        <Button
                            label="Add New Area"
                            icon="pi pi-plus"
                            className="p-button-primary"
                            onClick={() => setShowDialog(true)}
                            style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', fontWeight: '600' }}
                        />
                    </div>
                </div>

                {/* Filters */}
                <Card style={{ marginBottom: '2rem', boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)', borderRadius: '12px' }}>
                    {/* Search Input */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label htmlFor="search-areas" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#495057' }}>
                            Search Areas
                        </label>
                        <span className="p-input-icon-left" style={{ width: '100%' }}>
                            <i className="pi pi-search" />
                            <InputText
                                id="search-areas"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name, city, or location..."
                                style={{ width: '100%', paddingLeft: '2.5rem' }}
                            />
                        </span>
                    </div>

                    {/* Filter Dropdowns */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <label htmlFor="county-filter" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#495057' }}>
                                Filter by County
                            </label>
                            <Dropdown
                                id="county-filter"
                                value={selectedCounty}
                                options={countyOptions}
                                onChange={(e) => setSelectedCounty(e.value)}
                                placeholder="Select County"
                                style={{ width: '100%' }}
                            />
                        </div>

                        <div>
                            <label htmlFor="type-filter" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#495057' }}>
                                Filter by Type
                            </label>
                            <Dropdown
                                id="type-filter"
                                value={selectedType}
                                options={typeOptions}
                                onChange={(e) => setSelectedType(e.value)}
                                placeholder="Select Type"
                                style={{ width: '100%' }}
                            />
                        </div>
                    </div>
                </Card>

                {/* Areas Grid */}
                {loading ? (
                    <Card style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)', borderRadius: '12px' }}>
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#6c757d' }}>
                            <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
                            <p style={{ marginTop: '1rem' }}>Loading areas...</p>
                        </div>
                    </Card>
                ) : filteredAreas.length === 0 ? (
                    <Card style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)', borderRadius: '12px' }}>
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#6c757d' }}>
                            <i className="pi pi-map-marker" style={{ fontSize: '3rem', marginBottom: '1rem', display: 'block' }}></i>
                            <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No areas found</p>
                            <p style={{ fontSize: '0.9rem' }}>Try adjusting your filters or add a new area</p>
                        </div>
                    </Card>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '1.5rem',
                    }}>
                        {filteredAreas.map((area) => {
                            const badgeStyle = getTypeBadgeColor(area.type);
                            return (
                                <button
                                    key={area._id}
                                    type="button"
                                    style={{
                                        background: 'hsl(var(--surface))',
                                        borderRadius: '12px',
                                        boxShadow: '0 2px 12px hsl(var(--shadow-color) / 0.08)',
                                        padding: '1.25rem',
                                        cursor: 'pointer',
                                        border: '1px solid hsl(var(--border))',
                                        textAlign: 'left',
                                        transition: 'all 0.2s ease',
                                    }}
                                    onClick={() => handleAreaClick(area._id)}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                        e.currentTarget.style.boxShadow = '0 6px 20px hsl(var(--shadow-color) / 0.12)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 2px 12px hsl(var(--shadow-color) / 0.08)';
                                    }}
                                >
                                    {/* Area Name */}
                                    <h3 style={{
                                        fontSize: '1.25rem',
                                        fontWeight: '700',
                                        color: 'hsl(var(--foreground))',
                                        marginBottom: '0.5rem',
                                    }}>
                                        {area.name}
                                    </h3>

                                    {/* County */}
                                    <div style={{
                                        fontSize: '0.9rem',
                                        color: 'hsl(var(--foreground-muted))',
                                        marginBottom: '1rem',
                                    }}>
                                        {area.county || area.as}
                                    </div>

                                    {/* Type Badge */}
                                    <div style={{ marginBottom: '1rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '12px',
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            backgroundColor: badgeStyle.bg,
                                            color: badgeStyle.color,
                                        }}>
                                            {area.type === 'Zip' ? 'Zipcode' : area.type}
                                        </span>
                                    </div>

                                    {/* Additional Info */}
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.5rem',
                                        fontSize: '0.875rem',
                                        paddingTop: '1rem',
                                        borderTop: '1px solid hsl(var(--border))',
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <i className="pi pi-map-marker" style={{ color: 'hsl(var(--foreground-muted))', fontSize: '0.875rem' }}></i>
                                            <span style={{ color: 'hsl(var(--foreground))' }}>
                                                {area.coordinates.lat.toFixed(4)}, {area.coordinates.lng.toFixed(4)}
                                            </span>
                                        </div>

                                        {area.zipcode && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <i className="pi pi-envelope" style={{ color: 'hsl(var(--foreground-muted))', fontSize: '0.875rem' }}></i>
                                                <span style={{ color: 'hsl(var(--foreground))' }}>
                                                    {area.zipcode}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default IrgAreas;
