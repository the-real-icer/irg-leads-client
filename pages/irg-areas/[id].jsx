// React & NextJS
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

// Redux
import { useSelector } from 'react-redux';

// Google Maps
import { GoogleMap, Polygon, Marker } from '@react-google-maps/api';
import useGoogleMaps from '../../utils/useGoogleMaps';

// Dynamically import PrimeReact components
const Button = dynamic(() => import('primereact/button').then((mod) => mod.Button), { ssr: false });
const Card = dynamic(() => import('primereact/card').then((mod) => mod.Card), { ssr: false });
const InputText = dynamic(() => import('primereact/inputtext').then((mod) => mod.InputText), { ssr: false });
const InputNumber = dynamic(() => import('primereact/inputnumber').then((mod) => mod.InputNumber), { ssr: false });
const Dropdown = dynamic(() => import('primereact/dropdown').then((mod) => mod.Dropdown), { ssr: false });
const Checkbox = dynamic(() => import('primereact/checkbox').then((mod) => mod.Checkbox), { ssr: false });

// IRG Components
import MainLayout from '../../components/layout/MainLayout';

// API & Utils
import IrgApi from '../../assets/irgApi';
import showToast from '../../utils/showToast';

const AreaDetail = () => {
    // __________________Next Router______________________\\
    const router = useRouter();
    const { id } = router.query;

    // __________________Redux State______________________\\
    const isLoggedIn = useSelector((state) => state.isLoggedIn);
    const agent = useSelector((state) => state.agent);

    // ________________Component State_________________\\
    const [area, setArea] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form state
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

    const [boundaryText, setBoundaryText] = useState('');

    const areaTypeOptions = [
        { label: 'City', value: 'City' },
        { label: 'Neighborhood', value: 'Neighborhood' },
        { label: 'Zipcode', value: 'Zip' },
        { label: 'Condo Building', value: 'CondoBuilding' },
    ];

    const countyOptions = [
        { label: 'San Diego', value: 'San Diego' },
        { label: 'Los Angeles', value: 'Los Angeles' },
        { label: 'Riverside', value: 'Riverside' },
        { label: 'Orange', value: 'Orange' },
        { label: 'San Bernardino', value: 'San Bernardino' },
    ];

    // Google Maps setup
    const { isLoaded } = useGoogleMaps();

    const mapContainerStyle = {
        width: '100%',
        height: '600px',
        borderRadius: '8px',
    };

    // Fetch area data on mount
    useEffect(() => {
        if (!isLoggedIn || !id || !agent || agent.role !== 'admin') return;

        const fetchArea = async () => {
            setLoading(true);
            try {
                const response = await IrgApi.get(`/irg-areas/${id}`, {
                    headers: { Authorization: `Bearer ${isLoggedIn}` },
                });

                if (response.data.status === 'success') {
                    const areaData = response.data.data;
                    setArea(areaData);

                    // Populate form with area data
                    setFormData({
                        name: areaData.name || '',
                        search_name: areaData.search_name || '',
                        type: areaData.type || 'City',
                        state: areaData.state || 'CA',
                        city: areaData.city || '',
                        county: areaData.county || 'San Diego',
                        zipcode: areaData.zipcode || '',
                        address: areaData.address || '',
                        address_2: areaData.address_2 || '',
                        as: areaData.as || '',
                        label: areaData.label || '',
                        href: areaData.href || '',
                        coordinates: areaData.coordinates || { lat: 0, lng: 0 },
                        boundary: areaData.boundary || [],
                        zoom: areaData.zoom || 12,
                        is_multi_address: areaData.is_multi_address || false,
                        condo_addresses: areaData.condo_addresses || [],
                    });

                    // Set boundary text as formatted JSON
                    if (areaData.boundary) {
                        setBoundaryText(JSON.stringify(areaData.boundary, null, 2));
                    }
                }
            } catch (error) {
                let errorMessage = 'Failed to load area';
                if (error.response?.data?.message) {
                    errorMessage = error.response.data.message;
                } else if (error.message) {
                    errorMessage = error.message;
                }

                showToast('error', errorMessage, 'Error');

                if (error.response?.status === 404) {
                    setTimeout(() => router.push('/irg-areas'), 2000);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchArea();
    }, [isLoggedIn, id, agent, router]);

    // Handle form input changes
    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    // Handle nested coordinate changes
    const handleCoordinateChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            coordinates: { ...prev.coordinates, [field]: value },
        }));
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

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.name || !formData.search_name || !formData.state || !formData.href) {
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

            const response = await IrgApi.patch(`/irg-areas/${id}`, areaData, {
                headers: {
                    Authorization: `Bearer ${isLoggedIn}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.data.status === 'success') {
                showToast('success', 'Area updated successfully', 'Success');
                setArea(response.data.data);
            }
        } catch (error) {
            let errorMessage = 'Failed to update area';

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

    // Handle back button
    const handleBack = () => {
        router.push('/irg-areas');
    };

    // Render Google Map with boundary
    const renderMap = () => {
        const center = formData.coordinates;
        const boundary = formData.boundary;

        // Convert boundary to Google Maps format
        let polygonPaths = [];

        if (boundary && boundary.length > 0) {
            // Extract the coordinate array - boundary is nested: [[coords]]
            const coords = Array.isArray(boundary[0]) ? boundary[0] : boundary;

            polygonPaths = coords.map((coord) => {
                // Handle GeoJSON array format: [lng, lat]
                if (Array.isArray(coord) && coord.length >= 2) {
                    return { lat: coord[1], lng: coord[0] };
                }
                // Handle object format: {lat, lng}
                if (coord && typeof coord === 'object' && coord.lat !== undefined && coord.lng !== undefined) {
                    return { lat: coord.lat, lng: coord.lng };
                }

                return null;
            }).filter((coord) => coord !== null
                && !Number.isNaN(coord.lat)
                && !Number.isNaN(coord.lng));
        }

        return (
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={center}
                zoom={formData.zoom || 12}
            >
                {polygonPaths.length > 0 && (
                    <Polygon
                        paths={polygonPaths}
                        options={{
                            fillColor: '#667eea',
                            fillOpacity: 0.3,
                            strokeColor: '#667eea',
                            strokeOpacity: 0.8,
                            strokeWeight: 2,
                        }}
                    />
                )}
                {/* Center marker */}
                <Marker
                    position={center}
                    title="Center Point"
                />
            </GoogleMap>
        );
    };

    return (
        <MainLayout>
            <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <Button
                            icon="pi pi-arrow-left"
                            className="p-button-text p-button-rounded"
                            onClick={handleBack}
                            tooltip="Back to IRG Areas"
                        />
                        <h1 style={{
                            fontSize: '2rem',
                            fontWeight: '700',
                            color: '#2c3e50',
                            margin: 0,
                        }}>
                            {loading ? 'Loading...' : `Edit Area: ${area?.name || ''}`}
                        </h1>
                    </div>
                    <p style={{ color: '#6c757d', fontSize: '0.95rem', marginLeft: '4rem' }}>
                        Update area information and boundaries
                    </p>
                </div>

                {/* Content */}
                {loading ? (
                    <Card style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)', borderRadius: '12px' }}>
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#6c757d' }}>
                            <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
                            <p style={{ marginTop: '1rem' }}>Loading area details...</p>
                        </div>
                    </Card>
                ) : (
                    <>
                        {/* Map Section */}
                        <Card
                            title="Area Boundary Map"
                            style={{
                                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                                borderRadius: '12px',
                                marginBottom: '2rem',
                            }}
                        >
                            {isLoaded ? (
                                renderMap()
                            ) : (
                                <div style={{ textAlign: 'center', padding: '3rem', color: '#6c757d' }}>
                                    <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
                                    <p style={{ marginTop: '1rem' }}>Loading map...</p>
                                </div>
                            )}
                        </Card>

                        {/* Edit Form */}
                        <Card
                            title="Area Details"
                            style={{
                                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                                borderRadius: '12px',
                            }}
                        >
                            <form onSubmit={handleSubmit}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    {/* Basic Information */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#495057' }}>
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
                                            <label htmlFor="search_name" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#495057' }}>
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
                                            <label htmlFor="type" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#495057' }}>
                                                Type
                                            </label>
                                            <Dropdown
                                                id="type"
                                                value={formData.type}
                                                options={areaTypeOptions}
                                                onChange={(e) => handleChange('type', e.value)}
                                                style={{ width: '100%' }}
                                                placeholder="Select Type"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="county" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#495057' }}>
                                                County
                                            </label>
                                            <Dropdown
                                                id="county"
                                                value={formData.county}
                                                options={countyOptions}
                                                onChange={(e) => handleChange('county', e.value)}
                                                style={{ width: '100%' }}
                                                placeholder="Select County"
                                            />
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label htmlFor="state" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#495057' }}>
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
                                            <label htmlFor="city" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#495057' }}>
                                                City
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
                                            <label htmlFor="as" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#495057' }}>
                                                County/Area (as)
                                            </label>
                                            <InputText
                                                id="as"
                                                value={formData.as}
                                                onChange={(e) => handleChange('as', e.target.value)}
                                                placeholder="e.g., San Diego County"
                                                style={{ width: '100%' }}
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="href" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#495057' }}>
                                                HREF/URL *
                                            </label>
                                            <InputText
                                                id="href"
                                                value={formData.href}
                                                onChange={(e) => handleChange('href', e.target.value)}
                                                placeholder="e.g., /search/city/san-diego"
                                                style={{ width: '100%' }}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Coordinates */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label htmlFor="lat" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#495057' }}>
                                                Center Latitude *
                                            </label>
                                            <InputNumber
                                                id="lat"
                                                value={formData.coordinates.lat}
                                                onValueChange={(e) => handleCoordinateChange('lat', e.value)}
                                                placeholder="e.g., 32.7157"
                                                style={{ width: '100%' }}
                                                minFractionDigits={2}
                                                maxFractionDigits={6}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="lng" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#495057' }}>
                                                Center Longitude *
                                            </label>
                                            <InputNumber
                                                id="lng"
                                                value={formData.coordinates.lng}
                                                onValueChange={(e) => handleCoordinateChange('lng', e.value)}
                                                placeholder="e.g., -117.1611"
                                                style={{ width: '100%' }}
                                                minFractionDigits={2}
                                                maxFractionDigits={6}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="zoom" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#495057' }}>
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
                                        <label htmlFor="boundary" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#495057' }}>
                                            Boundary Coordinates (JSON Array) *
                                        </label>
                                        <textarea
                                            id="boundary"
                                            value={boundaryText}
                                            onChange={(e) => handleBoundaryTextChange(e.target.value)}
                                            placeholder='[[[lng, lat], [lng, lat], ...]]'
                                            style={{
                                                width: '100%',
                                                minHeight: '250px',
                                                padding: '0.75rem',
                                                borderRadius: '6px',
                                                border: '1px solid #ced4da',
                                                fontFamily: 'monospace',
                                                fontSize: '0.875rem',
                                                resize: 'vertical',
                                            }}
                                            required
                                        />
                                        <small style={{ color: '#6c757d', display: 'block', marginTop: '0.25rem' }}>
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
                                        <label htmlFor="is_multi_address" style={{ fontWeight: '600', color: '#495057', cursor: 'pointer' }}>
                                            Multi-Address Area
                                        </label>
                                    </div>

                                    {/* Submit Buttons */}
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #dee2e6' }}>
                                        <Button
                                            label="Cancel"
                                            className="p-button-text"
                                            onClick={handleBack}
                                            type="button"
                                            disabled={saving}
                                        />
                                        <Button
                                            label={saving ? 'Saving...' : 'Save Changes'}
                                            icon={saving ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
                                            type="submit"
                                            disabled={saving}
                                            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}
                                        />
                                    </div>
                                </div>
                            </form>
                        </Card>
                    </>
                )}
            </div>
        </MainLayout>
    );
};

export default AreaDetail;
