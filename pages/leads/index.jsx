import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';

// Redux
import {
    useSelector,
    //  useDispatch
} from 'react-redux';

// Third Party Components
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';

// IRG Components
import MainLayout from '../../components/layout/MainLayout';

const formatPhoneNumber = (phoneNumberString) => {
    const cleaned = ('' + phoneNumberString).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
        return '(' + match[1] + ') ' + match[2] + '-' + match[3];
    }
    return null;
};

const Leads = () => {
    // __________________Redux State______________________\\
    const allLeads = useSelector((state) => state.allLeadsPage);

    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [selectedType, setSelectedType] = useState(null);
    const [selectedSource, setSelectedSource] = useState(null);

    // Sorting state
    const [sortField, setSortField] = useState(null);
    const [sortOrder, setSortOrder] = useState(null);

    // Ensure allLeads is an array
    const leadsArray = Array.isArray(allLeads) ? allLeads : [];

    // Get unique values for dropdowns — memoized to avoid recalc on every render
    const statusValues = useMemo(() => [
        ...new Set(
            leadsArray
                .map((lead) => lead.backend_profile?.lead_category)
                .filter((status) => status)
        ),
    ].sort(), [leadsArray]);

    const types = useMemo(() => [
        ...new Set(
            leadsArray
                .map((lead) => lead.backend_profile?.lead_type)
                .filter((type) => type)
        ),
    ].sort(), [leadsArray]);

    const sources = useMemo(() => [
        ...new Set(
            leadsArray
                .map((lead) => lead.backend_profile?.lead_source)
                .filter((source) => source)
        ),
    ].sort(), [leadsArray]);

    // Filter + sort leads — memoized to avoid O(n log n) on every render
    const leads = useMemo(() => {
        let filtered = leadsArray.filter((lead) => {
            if (globalFilterValue) {
                const searchLower = globalFilterValue.toLowerCase();
                const matchesGlobal =
                    lead.first_name?.toLowerCase().includes(searchLower) ||
                    lead.last_name?.toLowerCase().includes(searchLower) ||
                    lead.email?.toLowerCase().includes(searchLower) ||
                    lead.phone_number?.toLowerCase().includes(searchLower);

                if (!matchesGlobal) return false;
            }

            if (selectedStatus && lead.backend_profile?.lead_category !== selectedStatus) {
                return false;
            }

            if (selectedType && lead.backend_profile?.lead_type !== selectedType) {
                return false;
            }

            if (selectedSource && lead.backend_profile?.lead_source !== selectedSource) {
                return false;
            }

            return true;
        });

        // Apply sorting if sortField is set
        if (sortField && sortOrder) {
            filtered = [...filtered].sort((a, b) => {
                let aValue, bValue;

                if (sortField.includes('.')) {
                    const fields = sortField.split('.');
                    aValue = fields.reduce((obj, field) => obj?.[field], a);
                    bValue = fields.reduce((obj, field) => obj?.[field], b);
                } else {
                    aValue = a[sortField];
                    bValue = b[sortField];
                }

                if (aValue == null && bValue == null) return 0;
                if (aValue == null) return 1;
                if (bValue == null) return -1;

                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    const comparison = aValue.toLowerCase().localeCompare(bValue.toLowerCase());
                    return sortOrder === 1 ? comparison : -comparison;
                }

                if (aValue < bValue) return sortOrder === 1 ? -1 : 1;
                if (aValue > bValue) return sortOrder === 1 ? 1 : -1;
                return 0;
            });
        }

        return filtered;
    }, [leadsArray, globalFilterValue, selectedStatus, selectedType, selectedSource, sortField, sortOrder]);

    const onGlobalFilterChange = (e) => {
        setGlobalFilterValue(e.target.value);
    };

    const clearFilters = () => {
        setGlobalFilterValue('');
        setSelectedStatus(null);
        setSelectedType(null);
        setSelectedSource(null);
    };

    const onSort = (event) => {
        setSortField(event.sortField);
        // If sortOrder is undefined, default to ascending (1)
        setSortOrder(event.sortOrder !== undefined ? event.sortOrder : 1);
    };

    const router = useRouter();

    const onRowSelect = (event) => {
        router.push(`/lead/${event.data._id}`);
    };

    const formatDate = (val) => {
        if (!val) {
            return 'Not Visited';
        }

        const properDate = new Date(val);

        if (isNaN(properDate.getTime())) {
            return 'Not Visited';
        }

        return properDate.toLocaleDateString('en-US', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const dateBodyTemplate = (rowData) => formatDate(rowData.last_visit);

    const statusBodyTemplate = (rowData) => (
        <span className={`customer-badge status-${rowData.backend_profile.lead_category}`}>
            {rowData.backend_profile.lead_category}
        </span>
    );

    // Template for status dropdown items (option is the string value)
    const statusItemTemplate = (option) => {
        if (!option) return null;
        return (
            <span className={`customer-badge status-${option}`}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
            </span>
        );
    };

    // Template for selected status value in dropdown
    const statusValueTemplate = (option) => {
        if (!option) return <span>Status</span>;
        return (
            <span className={`customer-badge status-${option}`}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
            </span>
        );
    };

    const nameBodyTemplate = (rowData) => (
        <span>
            {rowData.first_name} {rowData.last_name}
        </span>
    );

    const phoneBodyTemplate = (rowData) => (
        <span>{formatPhoneNumber(rowData.phone_number)}</span>
    );

    const avgPriceBodyTemplate = (rowData) => {
        if (rowData.viewed_homes.length) {
            let totalPrice = 0;

            for (const home of rowData.viewed_homes) {
                if (home.property_viewed?.price_raw) {
                    totalPrice += home.property_viewed.price_raw;
                }
            }

            const avgPrice = totalPrice / rowData.viewed_homes.length;

            const formatter = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                maximumFractionDigits: 0,
                minimumFractionDigits: 0,
            });

            const avgPriceClean = formatter.format(avgPrice);

            return <span>{avgPriceClean}</span>;
        }

        return <span>No Homes Viewed</span>;
    };

    const renderHeader = () => {
        const hasActiveFilters = selectedStatus || selectedType || selectedSource || globalFilterValue;

        return (
            <div style={{ marginBottom: '1.5rem' }}>
                {/* Title and Search Row */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1.25rem'
                    }}
                >
                    <h2 style={{
                        margin: 0,
                        fontSize: '1.75rem',
                        fontWeight: '600',
                        color: 'hsl(var(--foreground))'
                    }}>
                        Leads
                    </h2>
                    <span className="p-input-icon-left">
                        <i className="pi pi-search" style={{ color: 'hsl(var(--foreground-muted))' }} />
                        <InputText
                            value={globalFilterValue}
                            onChange={onGlobalFilterChange}
                            placeholder="Search leads..."
                            style={{
                                width: '320px',
                                borderRadius: '8px',
                                padding: '0.75rem 1rem 0.75rem 2.5rem'
                            }}
                        />
                    </span>
                </div>

                {/* Filters Row */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '1rem 1.25rem',
                        backgroundColor: 'hsl(var(--muted))',
                        borderRadius: '10px',
                        border: '1px solid hsl(var(--border))'
                    }}
                >
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: 'hsl(var(--foreground-muted))',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        minWidth: '60px'
                    }}>
                        <i className="pi pi-filter" style={{ fontSize: '0.9rem' }}></i>
                        <span>Filters</span>
                    </div>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        flex: 1
                    }}>
                        <Dropdown
                            value={selectedStatus}
                            options={statusValues}
                            onChange={(e) => setSelectedStatus(e.value)}
                            placeholder="Status"
                            showClear
                            itemTemplate={statusItemTemplate}
                            valueTemplate={statusValueTemplate}
                            style={{ minWidth: '160px' }}
                            className="filter-dropdown"
                        />
                        <Dropdown
                            value={selectedType}
                            options={types}
                            onChange={(e) => setSelectedType(e.value)}
                            placeholder="Type"
                            showClear
                            style={{ minWidth: '160px' }}
                            className="filter-dropdown"
                        />
                        <Dropdown
                            value={selectedSource}
                            options={sources}
                            onChange={(e) => setSelectedSource(e.value)}
                            placeholder="Source"
                            showClear
                            style={{ minWidth: '160px' }}
                            className="filter-dropdown"
                        />
                    </div>

                    {hasActiveFilters && (
                        <Button
                            icon="pi pi-times"
                            rounded
                            text
                            severity="secondary"
                            onClick={clearFilters}
                            tooltip="Clear all filters"
                            tooltipOptions={{ position: 'bottom' }}
                            style={{
                                width: '2.5rem',
                                height: '2.5rem',
                                marginLeft: 'auto'
                            }}
                        />
                    )}
                </div>
            </div>
        );
    };

    const header = renderHeader();

    return (
        <MainLayout>
            <div className="card">
                <DataTable
                    value={leads}
                    rows={10}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    rowsPerPageOptions={[10, 25, 50]}
                    paginator
                    rowHover
                    emptyMessage="No leads found."
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
                    selectionMode="single"
                    onRowSelect={onRowSelect}
                    header={header}
                    responsiveLayout="scroll"
                    sortMode="single"
                    sortField={sortField}
                    sortOrder={sortOrder}
                    onSort={onSort}
                >
                    <Column
                        header="Name"
                        sortable
                        sortField="first_name"
                        style={{ minWidth: '14rem' }}
                        body={nameBodyTemplate}
                    />
                    <Column field="email" header="Email" sortable></Column>
                    <Column
                        body={phoneBodyTemplate}
                        header="Phone"
                        sortable
                        sortField="phone_number"
                    ></Column>
                    <Column
                        header="Status"
                        sortable
                        sortField="backend_profile.lead_category"
                        style={{ minWidth: '10rem' }}
                        body={statusBodyTemplate}
                    />
                    <Column
                        field="backend_profile.lead_type"
                        header="Type"
                        sortable
                        style={{ minWidth: '10rem' }}
                    />
                    <Column
                        field="backend_profile.lead_source"
                        header="Source"
                        sortable
                        style={{ minWidth: '10rem' }}
                    />
                    <Column
                        header="Avg. Price"
                        style={{ minWidth: '10rem' }}
                        body={avgPriceBodyTemplate}
                    />
                    <Column
                        header="Last Visit"
                        sortable
                        sortField="last_visit"
                        dataType="date"
                        style={{ minWidth: '8rem' }}
                        body={dateBodyTemplate}
                    />
                </DataTable>
            </div>
        </MainLayout>
    );
};

export default Leads;
