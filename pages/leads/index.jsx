import { useState } from 'react';
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
import { FilterMatchMode, FilterOperator } from 'primereact/api';

// IRG Components
import MainLayout from '../../components/layout/MainLayout';

const Leads = () => {
    // __________________Redux State______________________\\
    const leads = useSelector((state) => state.allLeadsPage);

    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        name: {
            operator: FilterOperator.AND,
            constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
        },
        'country.name': {
            operator: FilterOperator.AND,
            constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
        },
        representative: { value: null, matchMode: FilterMatchMode.IN },
        date: {
            operator: FilterOperator.AND,
            constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
        },
        balance: {
            operator: FilterOperator.AND,
            constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
        },
        status: {
            operator: FilterOperator.OR,
            constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
        },
        activity: { value: null, matchMode: FilterMatchMode.BETWEEN },
    });
    const [globalFilterValue, setGlobalFilterValue] = useState('');

    const statuses = ['unqualified', 'qualified', 'new', 'negotiation', 'renewal', 'proposal'];

    const onGlobalFilterChange = (e) => {
        const { value } = e.target;
        const _filters = { ...filters };
        _filters.global.value = value;

        setFilters(_filters);
        setGlobalFilterValue(value);
    };

    const router = useRouter();

    const onRowSelect = (event) => {
        router.push(`/lead/${event.data.id}`);
    };

    const formatDate = (val) => {
        const properDate = new Date(val);

        return properDate.toLocaleDateString('en-US', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const dateBodyTemplate = (rowData) => formatDate(rowData.last_visit);

    const statusItemTemplate = (option) => (
        <span className={`customer-badge status-${option}`}>{option}</span>
    );

    const statusFilterTemplate = (options) => (
        <Dropdown
            value={options.value}
            options={statuses}
            onChange={(e) => options.filterCallback(e.value, options.index)}
            itemTemplate={statusItemTemplate}
            placeholder="Select a Status"
            className="p-column-filter"
            showClear
        />
    );

    const statusBodyTemplate = (rowData) => (
        <span className={`customer-badge status-${rowData.backend_profile.lead_category}`}>
            {rowData.backend_profile.lead_category}
        </span>
    );

    const nameBodyTemplate = (rowData) => (
        <span>
            {rowData.first_name} {rowData.last_name}
        </span>
    );

    const phoneBodyTemplate = (rowData) => {
        const formatPhoneNumber = (phoneNumberString) => {
            const cleaned = ('' + phoneNumberString).replace(/\D/g, ''); // eslint-disable-line
            const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
            if (match) {
                return '(' + match[1] + ') ' + match[2] + '-' + match[3]; // eslint-disable-line
            }
            return null;
        };

        return <span>{formatPhoneNumber(rowData.phone_number)}</span>;
    };

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

    const renderHeader = () => (
        <div className="flex justify-content-between align-items-center">
            <h3 className="m-0">Leads</h3>
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText
                    value={globalFilterValue}
                    onChange={onGlobalFilterChange}
                    placeholder="Keyword Search"
                />
            </span>
        </div>
    );

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
                    filters={filters}
                    filterDisplay="menu"
                    responsiveLayout="scroll"
                >
                    <Column
                        header="Name"
                        sortable
                        filter
                        filterPlaceholder="Search by name"
                        style={{ minWidth: '14rem' }}
                        body={nameBodyTemplate}
                    />
                    <Column field="email" header="Email" sortable filter></Column>
                    <Column body={phoneBodyTemplate} header="Phone" sortable filter></Column>
                    <Column
                        header="Status"
                        sortable
                        filterMenuStyle={{ width: '14rem' }}
                        style={{ minWidth: '10rem' }}
                        body={statusBodyTemplate}
                        filter
                        filterElement={statusFilterTemplate}
                    />
                    <Column
                        field="backend_profile.lead_type"
                        header="Type"
                        sortable
                        filterMenuStyle={{ width: '14rem' }}
                        style={{ minWidth: '10rem' }}
                        filter
                    />
                    <Column
                        field="backend_profile.lead_source"
                        header="Source"
                        sortable
                        filterMenuStyle={{ width: '14rem' }}
                        style={{ minWidth: '10rem' }}
                        filter
                    />
                    <Column
                        header="Avg. Price"
                        sortable
                        showFilterMatchModes={false}
                        style={{ minWidth: '10rem' }}
                        body={avgPriceBodyTemplate}
                        filter
                    />
                    <Column
                        field="last_visit"
                        header="Last Visit"
                        sortable
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
