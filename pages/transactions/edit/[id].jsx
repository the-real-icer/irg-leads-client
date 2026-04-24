// React & NextJS
import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';

// Dynamically import PrimeReact components
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
const Dialog = dynamic(() => import('primereact/dialog').then((mod) => mod.Dialog), { ssr: false });

// IRG Components
import MainLayout from '../../../components/layout/MainLayout';
import OffMlsPropertyFields from '../../../components/Transactions/OffMlsPropertyFields';

// API & Utils
import IrgApi from '../../../assets/irgApi';
import showToast from '../../../utils/showToast';
import getLeadDisplayName from '../../../utils/getLeadDisplayName';
import { calculateCommission } from '../../../utils/calculateCommission';
import { TRANSACTION_FEES } from '../../../constants/transactionFees';

// ── Constants ────────────────────────────────────────────────────
const financingOptions = [
    { label: 'Cash', value: 'cash' },
    { label: 'Conventional', value: 'conventional' },
    { label: 'FHA', value: 'fha' },
    { label: 'VA', value: 'va' },
    { label: 'Seller-Financed', value: 'seller-financed' },
    { label: 'USDA', value: 'usda' },
    { label: 'Other', value: 'other' },
];

const clientCreditCategories = [
    { label: 'Closing Costs', value: 'Closing Costs' },
    { label: 'Home Warranty', value: 'Home Warranty' },
    { label: 'Repairs', value: 'Repairs' },
    { label: 'General', value: 'General' },
];

const REPRESENTATION_OPTIONS = [
    { value: 'buyer', label: 'Buyer' },
    { value: 'seller', label: 'Seller' },
    { value: 'both', label: 'Both' },
];

const statusOptions = [
    { label: 'Pending', value: 'Pending' },
    { label: 'In Escrow', value: 'In Escrow' },
    { label: 'Closed', value: 'Closed' },
    { label: 'Cancelled', value: 'Cancelled' },
];

// ── Helper: format currency ──────────────────────────────────────
const formatCurrency = (value) => {
    if (!value && value !== 0) return '';
    const digits = String(value).replace(/\D/g, '');
    if (!digits) return '';
    return '$' + Number(digits).toLocaleString('en-US');
};

// Currency formatter for commission breakdown (handles decimals correctly)
const formatCommCurrency = (value) => {
    if (!value && value !== 0) return '$0';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

// Commission Breakdown Row component
const BreakdownRow = ({ label, value, sublabel, deduction, subtotal, total, highlight, muted }) => (
    <div
        style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            padding: '8px 16px',
            borderTop: subtotal || total ? '1px solid hsl(var(--border))' : 'none',
            background: highlight ? 'hsl(var(--primary) / 0.06)' : 'transparent',
            marginTop: subtotal || total ? '4px' : '0',
        }}
    >
        <div>
            <span
                style={{
                    fontSize: '0.85rem',
                    color: muted ? 'hsl(var(--foreground-muted))' : 'hsl(var(--foreground))',
                    fontWeight: subtotal || total ? '600' : '400',
                }}
            >
                {label}
            </span>
            {sublabel && (
                <span
                    style={{
                        display: 'block',
                        fontSize: '0.75rem',
                        color: 'hsl(var(--foreground-muted))',
                        marginTop: '1px',
                    }}
                >
                    {sublabel}
                </span>
            )}
        </div>
        <span
            style={{
                fontSize: total ? '0.95rem' : '0.85rem',
                fontWeight: subtotal || total ? '700' : '400',
                color: deduction
                    ? 'hsl(var(--danger))'
                    : highlight
                      ? 'hsl(var(--primary))'
                      : muted
                        ? 'hsl(var(--foreground-muted))'
                        : 'hsl(var(--foreground))',
                whiteSpace: 'nowrap',
                marginLeft: '16px',
            }}
        >
            {deduction ? '\u2212 ' : ''}
            {formatCommCurrency(value)}
        </span>
    </div>
);

const EditTransaction = () => {
    const router = useRouter();
    const { id } = router.query;

    // ── Redux ────────────────────────────────────────────────────
    const isLoggedIn = useSelector((state) => state.isLoggedIn);
    const agent = useSelector((state) => state.agent);
    const authChecked = useSelector((state) => state.authChecked);
    const allLeads = useSelector((state) => state.allLeadsPage.leads);
    const isAdmin = agent?.role === 'admin';
    const currentAgentId = agent?._id;

    // ── Loading & action states ──────────────────────────────────
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [soldConfirmVisible, setSoldConfirmVisible] = useState(false);
    const [markingSold, setMarkingSold] = useState(false);

    // ── Property search state ────────────────────────────────────
    const [propertySearch, setPropertySearch] = useState('');
    const [propertySearchSuggestions, setPropertySearchSuggestions] = useState([]);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [searchLoading, setSearchLoading] = useState(false);

    // ── Off-MLS / "Property Not Listed" state ────────────────────
    // Parallel track to the MLS AutoComplete. All values are strings
    // for PrimeReact controlled-input compatibility; coerced to
    // numbers at submit time.
    const [propertyNotListed, setPropertyNotListed] = useState(false);
    const [offMlsProperty, setOffMlsProperty] = useState({
        address: '',
        city: '',
        state: 'CA',
        zipCode: '',
        propertyType: '',
        bedrooms: '',
        bathrooms: '',
        sqft: '',
    });

    // ── Representation (buyer / seller / both) ───────────────────
    const [representation, setRepresentation] = useState('buyer');

    // ── Buyer lead link state ────────────────────────────────────
    const [linkBuyerLead, setLinkBuyerLead] = useState(false);
    const [buyerLeadInput, setBuyerLeadInput] = useState('');
    const [selectedBuyerLead, setSelectedBuyerLead] = useState(null);
    const [buyerLeadSuggestions, setBuyerLeadSuggestions] = useState([]);
    const [buyerAutoFilled, setBuyerAutoFilled] = useState(false);

    // ── Seller lead link state ───────────────────────────────────
    const [linkSellerLead, setLinkSellerLead] = useState(false);
    const [sellerLeadInput, setSellerLeadInput] = useState('');
    const [selectedSellerLead, setSelectedSellerLead] = useState(null);
    const [sellerLeadSuggestions, setSellerLeadSuggestions] = useState([]);
    const [sellerAutoFilled, setSellerAutoFilled] = useState(false);

    // ── Client information — buyer side ──────────────────────────
    const [buyerInfo, setBuyerInfo] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
    });

    // ── Client information — seller side ─────────────────────────
    const [sellerInfo, setSellerInfo] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
    });

    // ── Transaction information state ────────────────────────────
    const [transactionInfo, setTransactionInfo] = useState({
        price: '',
        financing: null,
        escrowLength: '',
        referralFee: false,
        referralFeeAmt: 0,
        buyersAgentCommissionPct: '',
        estimatedAgentCommission: '',
        status: 'Pending',
    });

    // ── Agent assignment (admin only) ───────────────────────────
    const [selectedAgentId, setSelectedAgentId] = useState(null);
    const [transactionOwnerAgentId, setTransactionOwnerAgentId] = useState(null);
    const [permissionChecked, setPermissionChecked] = useState(false);
    const [agentsList, setAgentsList] = useState([]);

    // ── Referral fee percentage (separate from transactionInfo) ──
    const [referralFeePercentage, setReferralFeePercentage] = useState('');

    // ── Inline validation errors ───────────────────────────────
    const [escrowLengthError, setEscrowLengthError] = useState('');

    // ── Dates state ──────────────────────────────────────────────
    const [acceptanceDate, setAcceptanceDate] = useState(null);
    const [expectedCloseDate, setExpectedCloseDate] = useState(null);
    const [actualClosingDate, setActualClosingDate] = useState(null);

    // ── Contingencies state ──────────────────────────────────────
    const [contingencies, setContingencies] = useState({
        inspection: false,
        appraisal: false,
        financing: false,
        propertySale: false,
    });

    const [contingencyDates, setContingencyDates] = useState({
        inspectionDue: null,
        appraisalDue: null,
        financingDue: null,
        propertySaleDue: null,
    });

    // ── Client credits ───────────────────────────────────────────
    const [clientCredits, setClientCredits] = useState([]);
    const [showClientCredits, setShowClientCredits] = useState(false);

    // ── Debounce ref ─────────────────────────────────────────────
    const searchTimeoutRef = useRef(null);

    const isOwner = Boolean(
        transactionOwnerAgentId
        && currentAgentId
        && transactionOwnerAgentId === currentAgentId,
    );
    const canEditTransaction = isAdmin || isOwner;
    const canDeleteTransaction = isAdmin;
    const canReassignTransaction = isAdmin;

    // ── Memoized recent leads (sorted by last_visit) ─────────────
    const recentLeads = useMemo(() => {
        return [...(allLeads || [])]
            .sort((a, b) => {
                const da = a.last_visit ? new Date(a.last_visit) : new Date(0);
                const db = b.last_visit ? new Date(b.last_visit) : new Date(0);
                return db - da;
            })
            .slice(0, 5);
    }, [allLeads]);

    // ── Fetch agents list (admin only) ──────────────────────────
    useEffect(() => {
        if (authChecked && !isLoggedIn) {
            router.replace('/');
        }
    }, [authChecked, isLoggedIn, router]);

    useEffect(() => {
        if (!authChecked || !isLoggedIn || !isAdmin) return;
        const fetchAgents = async () => {
            try {
                const response = await IrgApi.get('/agents/all-agents', {
                    headers: { Authorization: `Bearer ${isLoggedIn}` },
                });
                if (response.data.status === 'success') {
                    setAgentsList(response.data.data);
                }
            } catch (err) {
                // silent fail
            }
        };
        fetchAgents();
    }, [authChecked, isLoggedIn, isAdmin]);

    // ══════════════════════════════════════════════════════════════
    // FETCH TRANSACTION ON MOUNT
    // ══════════════════════════════════════════════════════════════

    useEffect(() => {
        if (!authChecked || !isLoggedIn || !currentAgentId || !id) return;

        const fetchTransaction = async () => {
            try {
                setLoading(true);
                setPermissionChecked(false);
                setTransactionOwnerAgentId(null);
                const response = await IrgApi.get(`/transactions/single-transaction/${id}`, {
                    headers: { Authorization: `Bearer ${isLoggedIn}` },
                });

                if (response.data.status === 'success' && response.data.data) {
                    const txn = response.data.data;
                    const ownerAgentId = txn.agent && typeof txn.agent === 'object'
                        ? txn.agent._id
                        : txn.agent;
                    const userCanEdit = isAdmin || ownerAgentId === currentAgentId;

                    setTransactionOwnerAgentId(ownerAgentId || null);
                    setPermissionChecked(true);

                    if (!userCanEdit) {
                        router.replace('/transactions');
                        return;
                    }

                    // Property (now populated from backend)
                    if (txn.property && typeof txn.property === 'object') {
                        setSelectedProperty(txn.property);
                        const unitNum = txn.property.unit_number ? ` #${txn.property.unit_number}` : '';
                        setPropertySearch(
                            `${txn.property.address}${unitNum}, ${txn.property.city}, ${txn.property.state} ${txn.property.zip_code} (MLS# ${txn.property.mls_number})`,
                        );
                    }

                    // Off-MLS hydration. Top-level address/city/state/
                    // zipCode are denormalized on the transaction for
                    // both branches — we pull them from the transaction
                    // doc directly rather than off_mls_property.
                    if (txn.property_not_listed) {
                        setPropertyNotListed(true);
                        setSelectedProperty(null);
                        const offMls = txn.off_mls_property || {};
                        setOffMlsProperty({
                            address: txn.address || '',
                            city: txn.city || '',
                            state: txn.state || 'CA',
                            zipCode: txn.zipCode != null ? String(txn.zipCode) : '',
                            propertyType: offMls.property_type || '',
                            bedrooms: offMls.bedrooms != null ? String(offMls.bedrooms) : '',
                            bathrooms: offMls.bathrooms != null ? String(offMls.bathrooms) : '',
                            sqft: offMls.sqft != null ? String(offMls.sqft) : '',
                        });
                    }

                    // Derive representation from doubleEnded + lead fields
                    let rep = 'buyer';
                    if (txn.doubleEnded) {
                        rep = 'both';
                    } else if (txn.sellerLead && !txn.lead) {
                        rep = 'seller';
                    }
                    setRepresentation(rep);

                    // Buyer lead (now populated from backend)
                    if (txn.lead && typeof txn.lead === 'object') {
                        setLinkBuyerLead(true);
                        setSelectedBuyerLead(txn.lead);
                        setBuyerLeadInput(getLeadDisplayName(txn.lead));
                        setBuyerInfo({
                            firstName: txn.lead.first_name || '',
                            lastName: txn.lead.last_name || '',
                            phone: txn.lead.phone_number || '',
                            email: txn.lead.email || '',
                        });
                        setBuyerAutoFilled(true);
                    }

                    // Seller lead (now populated from backend)
                    if (txn.sellerLead && typeof txn.sellerLead === 'object') {
                        setLinkSellerLead(true);
                        setSelectedSellerLead(txn.sellerLead);
                        setSellerLeadInput(getLeadDisplayName(txn.sellerLead));
                        setSellerInfo({
                            firstName: txn.sellerLead.first_name || '',
                            lastName: txn.sellerLead.last_name || '',
                            phone: txn.sellerLead.phone_number || '',
                            email: txn.sellerLead.email || '',
                        });
                        setSellerAutoFilled(true);
                    }

                    // Agent assignment (for admin editing)
                    if (txn.agent) {
                        setSelectedAgentId(typeof txn.agent === 'object' ? txn.agent._id : txn.agent);
                    }

                    // Transaction info
                    setTransactionInfo({
                        price: txn.salesPrice ? String(txn.salesPrice) : '',
                        financing: txn.financing === false ? 'cash' : (txn.financing ? 'conventional' : null),
                        escrowLength: txn.escrowLength ? String(txn.escrowLength) : '',
                        referralFee: txn.referralFee || false,
                        referralFeeAmt: txn.referralFeeAmt || 0,
                        buyersAgentCommissionPct: txn.buyersAgentCommissionPct ? String(txn.buyersAgentCommissionPct) : '',
                        estimatedAgentCommission: txn.estimatedAgentCommission ? String(txn.estimatedAgentCommission) : '',
                        status: txn.status || 'Pending',
                    });

                    // Referral fee percentage (from new commission chain fields)
                    if (txn.referral_fee_percentage) {
                        setReferralFeePercentage(String(txn.referral_fee_percentage));
                    }

                    // Dates
                    setAcceptanceDate(txn.acceptanceDate ? new Date(txn.acceptanceDate) : null);
                    setExpectedCloseDate(txn.anticipatedClosingDate ? new Date(txn.anticipatedClosingDate) : null);
                    setActualClosingDate(txn.actualClosingDate ? new Date(txn.actualClosingDate) : null);

                    // Contingencies
                    const hasInspection = !!txn.inspectionContingencyDate;
                    const hasAppraisal = !!txn.appraisalContingencyDate;
                    const hasLoan = !!txn.loanContingencyDate;
                    const hasPropertySale = !!txn.propertySaleContingencyDate;
                    setContingencies({
                        inspection: hasInspection,
                        appraisal: hasAppraisal,
                        financing: hasLoan,
                        propertySale: hasPropertySale,
                    });
                    setContingencyDates({
                        inspectionDue: hasInspection ? new Date(txn.inspectionContingencyDate) : null,
                        appraisalDue: hasAppraisal ? new Date(txn.appraisalContingencyDate) : null,
                        financingDue: hasLoan ? new Date(txn.loanContingencyDate) : null,
                        propertySaleDue: hasPropertySale ? new Date(txn.propertySaleContingencyDate) : null,
                    });

                    // Client credits
                    if (txn.clientCredits?.length > 0) {
                        setClientCredits(
                            txn.clientCredits.map((credit, idx) => ({
                                ...credit,
                                id: Date.now() + idx,
                            })),
                        );
                        setShowClientCredits(true);
                    }
                }
            } catch (error) {
                showToast('error', 'Failed to load transaction', 'Error');
            } finally {
                setLoading(false);
            }
        };

        fetchTransaction();
    }, [id, authChecked, isLoggedIn, currentAgentId, isAdmin, router]);

    // ══════════════════════════════════════════════════════════════
    // HANDLERS — Property Search
    // ══════════════════════════════════════════════════════════════

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
                    const formattedSuggestions = properties.map((prop) => {
                        const unitNum = prop.unit_number ? ` #${prop.unit_number}` : '';
                        return {
                            label: `${prop.address}${unitNum}, ${prop.city}, ${prop.state} ${prop.zip_code} (MLS# ${prop.mls_number})`,
                            value: prop,
                        };
                    });
                    setPropertySearchSuggestions(formattedSuggestions);
                    if (formattedSuggestions.length === 0) {
                        showToast('info', 'No properties found matching your search', 'No Results');
                    }
                }
            } catch (error) {
                showToast('error', 'Failed to search properties', 'Search Error');
                setPropertySearchSuggestions([]);
            } finally {
                setSearchLoading(false);
            }
        }, 300);
    }, []);

    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        };
    }, []);

    const handlePropertySelect = useCallback((e) => {
        if (e.value && e.value.value) {
            const property = e.value.value;
            setSelectedProperty(property);
            setPropertySearch(e.value.label);
            showToast('success', 'Property selected', 'Success');
        }
    }, []);

    const handleClearProperty = useCallback(() => {
        setSelectedProperty(null);
        setPropertySearch('');
        setPropertySearchSuggestions([]);
    }, []);

    // Toggle between MLS and off-MLS. Edit-specific behavior: when
    // converting an existing MLS transaction to off-MLS, prefill the
    // new fields from the current MLS property so the agent doesn't
    // retype beds/baths/sqft they already have on record. Only fills
    // currently-empty fields — won't clobber anything the agent has
    // already typed in this session.
    const handlePropertyNotListedToggle = (checked) => {
        setPropertyNotListed(checked);

        if (checked) {
            if (selectedProperty) {
                setOffMlsProperty((prev) => ({
                    ...prev,
                    address: prev.address || selectedProperty.address || '',
                    city: prev.city || selectedProperty.city || '',
                    state: prev.state || selectedProperty.state || 'CA',
                    zipCode: prev.zipCode || (selectedProperty.zip_code != null
                        ? String(selectedProperty.zip_code)
                        : ''),
                    bedrooms: prev.bedrooms || (selectedProperty.bedrooms != null
                        ? String(selectedProperty.bedrooms)
                        : ''),
                    bathrooms: prev.bathrooms || (selectedProperty.bathrooms != null
                        ? String(selectedProperty.bathrooms)
                        : ''),
                    sqft: prev.sqft || (selectedProperty.sqft != null
                        ? String(selectedProperty.sqft)
                        : ''),
                    // propertyType stays empty — MLS has no enum so we
                    // can't guarantee a match with OFF_MLS_PROPERTY_TYPES.
                    // Agent must explicitly pick.
                }));
            }
            setSelectedProperty(null);
            setPropertySearch('');
            setPropertySearchSuggestions([]);
        } else {
            setOffMlsProperty({
                address: '',
                city: '',
                state: 'CA',
                zipCode: '',
                propertyType: '',
                bedrooms: '',
                bathrooms: '',
                sqft: '',
            });
        }
    };

    // ══════════════════════════════════════════════════════════════
    // HANDLERS — Lead Search (shared logic)
    // ══════════════════════════════════════════════════════════════

    const handleLeadSearch = useCallback(
        (event, setSuggestions) => {
            const query = (event.query || '').toLowerCase().trim();
            if (!query) {
                setSuggestions(recentLeads);
                return;
            }
            const filtered = (allLeads || []).filter((lead) => {
                const displayName = getLeadDisplayName(lead).toLowerCase();
                const email = (lead.email || '').toLowerCase();
                return displayName.includes(query) || email.includes(query);
            });
            setSuggestions(filtered.slice(0, 10));
        },
        [allLeads, recentLeads],
    );

    const handleBuyerLeadSearch = useCallback(
        (event) => handleLeadSearch(event, setBuyerLeadSuggestions),
        [handleLeadSearch],
    );

    const handleSellerLeadSearch = useCallback(
        (event) => handleLeadSearch(event, setSellerLeadSuggestions),
        [handleLeadSearch],
    );

    const handleBuyerLeadSelect = useCallback((e) => {
        const lead = e.value;
        if (lead && lead._id) {
            setSelectedBuyerLead(lead);
            setBuyerLeadInput(getLeadDisplayName(lead));
            setBuyerInfo({
                firstName: lead.first_name || '',
                lastName: lead.last_name || '',
                phone: lead.phone_number || '',
                email: lead.email || '',
            });
            setBuyerAutoFilled(true);
        }
    }, []);

    const handleSellerLeadSelect = useCallback((e) => {
        const lead = e.value;
        if (lead && lead._id) {
            setSelectedSellerLead(lead);
            setSellerLeadInput(getLeadDisplayName(lead));
            setSellerInfo({
                firstName: lead.first_name || '',
                lastName: lead.last_name || '',
                phone: lead.phone_number || '',
                email: lead.email || '',
            });
            setSellerAutoFilled(true);
        }
    }, []);

    const leadItemTemplate = (lead) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem', padding: '0.125rem 0' }}>
            <span style={{ fontWeight: '600', color: 'hsl(var(--foreground))', fontSize: '0.9rem' }}>
                {getLeadDisplayName(lead)}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'hsl(var(--foreground-muted))' }}>
                {lead.email || ''}
            </span>
        </div>
    );

    // ══════════════════════════════════════════════════════════════
    // HANDLERS — Transaction Info
    // ══════════════════════════════════════════════════════════════

    const handleTransactionInfoChange = (field, value) => {
        setTransactionInfo((prev) => ({ ...prev, [field]: value }));
    };

    // ══════════════════════════════════════════════════════════════
    // HANDLERS — Contingencies
    // ══════════════════════════════════════════════════════════════

    const handleContingencyChange = (field, value) => {
        setContingencies((prev) => ({ ...prev, [field]: value }));
        if (!value) {
            const dateField = `${field}Due`;
            setContingencyDates((prev) => ({ ...prev, [dateField]: null }));
        }
    };

    const handleContingencyDateChange = (field, value) => {
        setContingencyDates((prev) => ({ ...prev, [field]: value }));
    };

    // ══════════════════════════════════════════════════════════════
    // HANDLERS — Client Credits
    // ══════════════════════════════════════════════════════════════

    const handleAddClientCredit = () => {
        setClientCredits((prev) => [...prev, { category: 'General', amount: 0, id: Date.now() }]);
    };

    const handleRemoveClientCredit = (creditId) => {
        setClientCredits((prev) => prev.filter((credit) => credit.id !== creditId));
    };

    const handleUpdateClientCredit = (creditId, field, value) => {
        setClientCredits((prev) =>
            prev.map((credit) => (credit.id === creditId ? { ...credit, [field]: value } : credit)),
        );
    };

    const handleClientCreditsCheckbox = (checked) => {
        setShowClientCredits(checked);
        if (!checked) setClientCredits([]);
    };

    // ══════════════════════════════════════════════════════════════
    // COMMISSION — Full chain calculation (live preview)
    // ══════════════════════════════════════════════════════════════

    const totalClientCredits = useMemo(
        () => clientCredits.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0),
        [clientCredits],
    );

    const calc = useMemo(
        () =>
            calculateCommission({
                salesPrice: parseFloat(transactionInfo.price) || 0,
                commissionPercentage: parseFloat(transactionInfo.buyersAgentCommissionPct) || 0,
                representationType: representation,
                referralFeePercentage: parseFloat(referralFeePercentage) || 0,
                commissionSplit: agent?.commissionSplit || 0,
                clientCredits: totalClientCredits,
            }),
        [
            transactionInfo.price,
            transactionInfo.buyersAgentCommissionPct,
            representation,
            referralFeePercentage,
            agent?.commissionSplit,
            totalClientCredits,
        ],
    );

    // ══════════════════════════════════════════════════════════════
    // HANDLERS — Delete Transaction
    // ══════════════════════════════════════════════════════════════

    const handleDelete = async () => {
        if (!canDeleteTransaction) return;

        try {
            setDeleting(true);
            await IrgApi.delete(`/transactions/single-transaction/${id}`, {
                headers: { Authorization: `Bearer ${isLoggedIn}` },
            });
            showToast('success', 'Transaction deleted successfully', 'Deleted');
            router.push('/transactions');
        } catch (error) {
            showToast('error', error.response?.data?.message || 'Failed to delete transaction', 'Error');
        } finally {
            setDeleting(false);
            setDeleteConfirmVisible(false);
        }
    };

    // ══════════════════════════════════════════════════════════════
    // HANDLERS — Mark as Sold
    // ══════════════════════════════════════════════════════════════

    const handleMarkSold = async () => {
        if (!canEditTransaction) return;

        try {
            setMarkingSold(true);
            const response = await IrgApi.patch(
                `/transactions/single-transaction/${id}/status`,
                { status: 'Closed', actualClosingDate: new Date() },
                { headers: { Authorization: `Bearer ${isLoggedIn}` } },
            );
            if (response.data.status === 'success') {
                setTransactionInfo((prev) => ({ ...prev, status: 'Closed' }));
                setActualClosingDate(new Date());
                showToast('success', 'Transaction marked as Sold', 'Success');
            }
        } catch (error) {
            showToast('error', error.response?.data?.message || 'Failed to update status', 'Error');
        } finally {
            setMarkingSold(false);
            setSoldConfirmVisible(false);
        }
    };

    // ══════════════════════════════════════════════════════════════
    // SUBMIT
    // ══════════════════════════════════════════════════════════════

    const handleSubmit = async () => {
        if (!canEditTransaction) return;

        // Validation
        if (canReassignTransaction && !selectedAgentId) {
            showToast('error', 'Please select an agent for this transaction', 'Validation Error');
            return;
        }

        if (propertyNotListed) {
            // Off-MLS branch — every field except sqft is required.
            // Server enforces the same contract via pre-validate hook,
            // but catching client-side avoids a wasted round trip.
            const p = offMlsProperty;
            const errors = [];
            if (!p.address.trim()) errors.push('Address is required');
            if (!p.city.trim()) errors.push('City is required');
            if (!p.state.trim()) errors.push('State is required');
            if (!p.zipCode.trim()) errors.push('Zip code is required');
            else if (!/^\d{5}$/.test(p.zipCode.trim())) errors.push('Zip code must be 5 digits');
            if (!p.propertyType) errors.push('Property type is required');
            if (!p.bedrooms) errors.push('Bedrooms is required');
            if (!p.bathrooms) errors.push('Bathrooms is required');

            if (errors.length > 0) {
                showToast('error', errors.join('. '), 'Validation Error');
                return;
            }
        } else if (!selectedProperty) {
            showToast('error', 'Please select a property or check "Property Not Listed"', 'Validation Error');
            return;
        }

        if (!acceptanceDate || !expectedCloseDate) {
            showToast('error', 'Acceptance date and expected close date are required', 'Validation Error');
            return;
        }

        if (!transactionInfo.price || parseFloat(transactionInfo.price) <= 0) {
            showToast('error', 'Valid sales price is required', 'Validation Error');
            return;
        }

        const escrowVal = String(transactionInfo.escrowLength).trim();
        if (
            !escrowVal
            || Number.isNaN(Number(escrowVal))
            || Number(escrowVal) <= 0
            || !Number.isFinite(Number(escrowVal))
        ) {
            setEscrowLengthError('Please enter a valid number of days');
            showToast('error', 'Escrow length must be a valid positive number', 'Validation Error');
            return;
        }
        setEscrowLengthError('');

        // If status is Closed, require actual closing date
        if (transactionInfo.status === 'Closed' && !actualClosingDate) {
            showToast('error', 'Actual closing date is required for closed transactions', 'Validation Error');
            return;
        }

        // Determine lead associations based on representation
        let leadId;
        let sellerLeadId;
        const isDoubleEnded = representation === 'both';

        if (representation === 'buyer' || representation === 'both') {
            if (linkBuyerLead && selectedBuyerLead) {
                leadId = selectedBuyerLead._id;
            }
        }

        if (representation === 'seller') {
            if (linkSellerLead && selectedSellerLead) {
                sellerLeadId = selectedSellerLead._id;
            }
        }

        if (representation === 'both') {
            if (linkSellerLead && selectedSellerLead) {
                sellerLeadId = selectedSellerLead._id;
            }
        }

        // Branch the property fields between MLS and off-MLS. We MUST
        // explicitly null out the abandoned branch's key — the server
        // pre-validate hook rejects documents that have both `property`
        // and `property_not_listed: true` set simultaneously. This is
        // especially important for conversion edits.
        const propertyFields = propertyNotListed
            ? {
                property: null,
                property_not_listed: true,
                address: offMlsProperty.address.trim(),
                city: offMlsProperty.city.trim(),
                state: offMlsProperty.state.trim().toUpperCase(),
                zipCode: parseInt(offMlsProperty.zipCode, 10),
                off_mls_property: {
                    property_type: offMlsProperty.propertyType,
                    bedrooms: parseInt(offMlsProperty.bedrooms, 10),
                    bathrooms: parseFloat(offMlsProperty.bathrooms),
                    sqft: offMlsProperty.sqft ? parseInt(offMlsProperty.sqft, 10) : undefined,
                },
            }
            : {
                property: selectedProperty._id,
                property_not_listed: false,
                off_mls_property: null,
                address: selectedProperty.address,
                city: selectedProperty.city,
                state: selectedProperty.state,
                zipCode: parseInt(selectedProperty.zip_code, 10),
            };

        const transactionData = {
            ...propertyFields,
            lead: leadId,
            salesPrice: parseFloat(transactionInfo.price),
            financing: transactionInfo.financing !== 'cash',
            acceptanceDate,
            anticipatedClosingDate: expectedCloseDate,
            escrowLength: parseInt(transactionInfo.escrowLength, 10),
            referralFee: transactionInfo.referralFee,
            referralFeeAmt: calc.referralFeeAmount,
            referral_fee_percentage: parseFloat(referralFeePercentage) || 0,
            estimatedAgentCommission: calc.agentNetCommission,
            buyersAgentCommissionPct: parseFloat(transactionInfo.buyersAgentCommissionPct || 0),
            total_commission_amount: calc.totalCommissionAmount,
            tc_fee: calc.tcFee,
            total_brokerage_commission: calc.totalBrokerageCommission,
            agent_commission_gross: calc.agentCommissionGross,
            brokerage_commission_gross: calc.brokerageCommissionGross,
            client_credits_total: totalClientCredits,
            agent_net_commission: calc.agentNetCommission,
            brokerage_net_commission: calc.brokerageNetCommission,
            agent_split_percentage_used: calc.agentSplitPercentageUsed,
            clientCredits: clientCredits.map((credit) => ({
                category: credit.category,
                amount: parseFloat(credit.amount || 0),
            })),
            sellerLead: sellerLeadId,
            doubleEnded: isDoubleEnded,
            agent: canReassignTransaction ? selectedAgentId : transactionOwnerAgentId,
            status: transactionInfo.status,
            actualClosingDate: actualClosingDate || undefined,
            inspectionContingencyDate: contingencies.inspection ? contingencyDates.inspectionDue : undefined,
            appraisalContingencyDate: contingencies.appraisal ? contingencyDates.appraisalDue : undefined,
            loanContingencyDate: contingencies.financing ? contingencyDates.financingDue : undefined,
            propertySaleContingencyDate: contingencies.propertySale ? contingencyDates.propertySaleDue : undefined,
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
                },
            );

            if (response.data.status === 'success') {
                showToast('success', 'Transaction updated successfully', 'Success');
                router.push('/transactions');
            }
        } catch (error) {
            showToast('error', error.response?.data?.message || 'Failed to update transaction', 'Error');
        } finally {
            setSaving(false);
        }
    };

    // ══════════════════════════════════════════════════════════════
    // RENDER — Lead Autocomplete + Client Fields Block
    // ══════════════════════════════════════════════════════════════

    const renderClientBlock = (side) => {
        const isBuyer = side === 'buyer';
        const linkLead = isBuyer ? linkBuyerLead : linkSellerLead;
        const setLinkLead = isBuyer ? setLinkBuyerLead : setLinkSellerLead;
        const leadInput = isBuyer ? buyerLeadInput : sellerLeadInput;
        const setLeadInput = isBuyer ? setBuyerLeadInput : setSellerLeadInput;
        const leadSuggestions = isBuyer ? buyerLeadSuggestions : sellerLeadSuggestions;
        const handleSearch = isBuyer ? handleBuyerLeadSearch : handleSellerLeadSearch;
        const handleSelect = isBuyer ? handleBuyerLeadSelect : handleSellerLeadSelect;
        const info = isBuyer ? buyerInfo : sellerInfo;
        const setInfo = isBuyer ? setBuyerInfo : setSellerInfo;
        const autoFilled = isBuyer ? buyerAutoFilled : sellerAutoFilled;
        const setAutoFilled = isBuyer ? setBuyerAutoFilled : setSellerAutoFilled;
        const sideLabel = isBuyer ? 'Buyer' : 'Seller';
        const idPrefix = isBuyer ? 'buyer' : 'seller';

        const handleInfoChange = (field, value) => {
            setInfo((prev) => ({ ...prev, [field]: value }));
            setAutoFilled(false);
        };

        const handleToggleLead = (checked) => {
            setLinkLead(checked);
            if (!checked) {
                setLeadInput('');
                if (isBuyer) setSelectedBuyerLead(null);
                else setSelectedSellerLead(null);
            }
        };

        return (
            <>
                {/* Link to Lead */}
                <div className="txn-new__lead-link">
                    <Checkbox
                        inputId={`${idPrefix}-link-lead`}
                        checked={linkLead}
                        onChange={(e) => handleToggleLead(e.checked)}
                    />
                    <label htmlFor={`${idPrefix}-link-lead`}>
                        Link {sideLabel} to an Existing Lead
                    </label>
                </div>

                {/* Lead Autocomplete */}
                {linkLead && (
                    <div className="txn-new__lead-search">
                        <AutoComplete
                            id={`${idPrefix}-lead-search`}
                            value={leadInput}
                            suggestions={leadSuggestions}
                            completeMethod={handleSearch}
                            onChange={(e) => {
                                if (typeof e.value === 'string') {
                                    setLeadInput(e.value);
                                }
                            }}
                            onSelect={handleSelect}
                            itemTemplate={leadItemTemplate}
                            field="first_name"
                            placeholder={`Search for a ${sideLabel.toLowerCase()} lead by name...`}
                            emptyMessage="No leads found"
                            style={{ width: '100%' }}
                            inputStyle={{ width: '100%' }}
                            panelStyle={{ zIndex: 1100 }}
                            delay={100}
                            minLength={0}
                        />
                    </div>
                )}

                {/* Client Fields */}
                <div className="txn-new__grid">
                    <div className={`txn-new__field${autoFilled ? ' txn-new__input--autofilled' : ''}`}>
                        <label className="txn-new__label" htmlFor={`${idPrefix}-first-name`}>
                            First Name
                        </label>
                        <InputText
                            id={`${idPrefix}-first-name`}
                            value={info.firstName}
                            onChange={(e) => handleInfoChange('firstName', e.target.value)}
                            placeholder="Enter first name"
                            style={{ width: '100%' }}
                        />
                    </div>

                    <div className={`txn-new__field${autoFilled ? ' txn-new__input--autofilled' : ''}`}>
                        <label className="txn-new__label" htmlFor={`${idPrefix}-last-name`}>
                            Last Name
                        </label>
                        <InputText
                            id={`${idPrefix}-last-name`}
                            value={info.lastName}
                            onChange={(e) => handleInfoChange('lastName', e.target.value)}
                            placeholder="Enter last name"
                            style={{ width: '100%' }}
                        />
                    </div>

                    <div className={`txn-new__field${autoFilled ? ' txn-new__input--autofilled' : ''}`}>
                        <label className="txn-new__label" htmlFor={`${idPrefix}-phone`}>
                            Phone
                        </label>
                        <InputText
                            id={`${idPrefix}-phone`}
                            value={info.phone}
                            onChange={(e) => handleInfoChange('phone', e.target.value)}
                            placeholder="Enter phone number"
                            style={{ width: '100%' }}
                        />
                    </div>

                    <div className={`txn-new__field${autoFilled ? ' txn-new__input--autofilled' : ''}`}>
                        <label className="txn-new__label" htmlFor={`${idPrefix}-email`}>
                            Email
                        </label>
                        <InputText
                            id={`${idPrefix}-email`}
                            value={info.email}
                            onChange={(e) => handleInfoChange('email', e.target.value)}
                            placeholder="Enter email address"
                            style={{ width: '100%' }}
                            type="email"
                        />
                    </div>
                </div>
            </>
        );
    };

    // ══════════════════════════════════════════════════════════════
    // RENDER
    // ══════════════════════════════════════════════════════════════

    if (!authChecked || !isLoggedIn || loading || !permissionChecked || !canEditTransaction) {
        return (
            <MainLayout title="Edit Transaction">
                <div className="txn-new">
                    <div className="txn-new__header">
                        <h1 className="txn-new__title">Edit Transaction</h1>
                        <p className="txn-new__subtitle">Loading transaction data...</p>
                    </div>
                    <div className="txn-new__card" style={{ textAlign: 'center', padding: '3rem' }}>
                        <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem', color: 'hsl(var(--primary))' }}></i>
                        <p style={{ marginTop: '1rem', color: 'hsl(var(--foreground-muted))' }}>Loading transaction...</p>
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout title="Edit Transaction">
            <div className="txn-new">
                {/* ── Page Header ─────────────────────────────────── */}
                <div className="txn-new__header">
                    <h1 className="txn-new__title">Edit Transaction</h1>
                    <p className="txn-new__subtitle">Update the details for this transaction</p>
                </div>

                {/* ════════════════════════════════════════════════════
                    SECTION 1 — PROPERTY
                    MLS search OR off-MLS ("Property Not Listed") branch.
                    The AutoComplete is disabled whenever the off-MLS
                    checkbox is active to prevent both branches from
                    being populated at once.
                    ════════════════════════════════════════════════════ */}
                <div className="txn-new__card">
                    <h2 className="txn-new__card-title">Property</h2>

                    <div className="txn-new__field">
                        <label className="txn-new__label" htmlFor="property-search">
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
                            disabled={propertyNotListed || selectedProperty !== null}
                            loading={searchLoading}
                        />
                    </div>

                    {/* Off-MLS toggle row */}
                    <div className="flex items-center gap-[8px] mt-[12px]">
                        <Checkbox
                            inputId="property-not-listed"
                            checked={propertyNotListed}
                            onChange={(e) => handlePropertyNotListedToggle(e.checked)}
                        />
                        <label
                            htmlFor="property-not-listed"
                            className="text-[14px] text-foreground cursor-pointer"
                        >
                            Property Not Listed (Off-MLS / Private Sale)
                        </label>
                    </div>

                    {/* Branched render: off-MLS fields, or selected-MLS card, or nothing */}
                    {propertyNotListed ? (
                        <div className="mt-[12px]">
                            <OffMlsPropertyFields
                                value={offMlsProperty}
                                onChange={(updates) => setOffMlsProperty((prev) => ({ ...prev, ...updates }))}
                            />
                        </div>
                    ) : (
                        selectedProperty && (
                            <div className="txn-new__selected-property">
                                <div className="txn-new__selected-property-inner">
                                    <div className="txn-new__selected-property-content">
                                        <img
                                            src={selectedProperty.listing_pics?.replace(/http:/, 'https:') || '/No-Photo-Light-Large.jpg'}
                                            alt={selectedProperty.address}
                                            className="txn-new__selected-property-img"
                                        />
                                        <div className="txn-new__selected-property-details">
                                            <div className="txn-new__selected-property-address">
                                                {selectedProperty.address}
                                                {selectedProperty.unit_number && ` #${selectedProperty.unit_number}`}
                                            </div>
                                            <div className="txn-new__selected-property-location">
                                                {selectedProperty.city}, {selectedProperty.state} {selectedProperty.zip_code}
                                            </div>
                                            <div className="txn-new__selected-property-meta">
                                                <span><strong>MLS#:</strong> {selectedProperty.mls_number}</span>
                                                <span><strong>Status:</strong> {selectedProperty.status}</span>
                                                <span><strong>Price:</strong> {selectedProperty.price}</span>
                                            </div>
                                            <div className="txn-new__selected-property-meta" style={{ marginTop: '0.25rem' }}>
                                                <span>{selectedProperty.bedrooms} Beds</span>
                                                <span>|</span>
                                                <span>{selectedProperty.bathrooms} Baths</span>
                                                <span>|</span>
                                                <span>{selectedProperty.sqft} SqFt</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        icon="pi pi-times"
                                        className="p-button-rounded p-button-text p-button-danger"
                                        onClick={handleClearProperty}
                                        tooltip="Clear selection"
                                        tooltipOptions={{ position: 'left' }}
                                    />
                                </div>
                            </div>
                        )
                    )}
                </div>

                {/* ════════════════════════════════════════════════════
                    SECTION 2 — ACTION BAR
                    ════════════════════════════════════════════════════ */}
                <div className="txn-edit__action-bar">
                    {canDeleteTransaction && (
                        <Button
                            label={deleting ? 'Deleting...' : 'Delete Transaction'}
                            icon={deleting ? 'pi pi-spin pi-spinner' : 'pi pi-trash'}
                            className="p-button-outlined p-button-danger"
                            onClick={() => setDeleteConfirmVisible(true)}
                            disabled={saving || deleting || markingSold}
                        />
                    )}
                    <div className="txn-edit__action-bar__right">
                        {canEditTransaction && transactionInfo.status !== 'Closed' && transactionInfo.status !== 'Cancelled' && (
                            <Button
                                label={markingSold ? 'Updating...' : 'Mark as Sold'}
                                icon={markingSold ? 'pi pi-spin pi-spinner' : 'pi pi-check-circle'}
                                className="txn-edit__btn-sold"
                                onClick={() => setSoldConfirmVisible(true)}
                                disabled={saving || deleting || markingSold}
                            />
                        )}
                        <Button
                            label={saving ? 'Saving...' : 'Save Changes'}
                            icon={saving ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
                            className="txn-new__btn-submit"
                            onClick={handleSubmit}
                            disabled={saving || deleting || markingSold}
                        />
                    </div>
                </div>

                {/* ════════════════════════════════════════════════════
                    SECTION 3 — TRANSACTION INFORMATION
                    ════════════════════════════════════════════════════ */}
                <div className="txn-new__card">
                    <h2 className="txn-new__card-title">Transaction Information</h2>

                    {/* Agent Assignment (admin only) */}
                    {canReassignTransaction && agentsList.length > 0 && (
                        <div className="txn-new__field" style={{ marginBottom: '1.5rem' }}>
                            <label className="txn-new__label" htmlFor="agent-select">Assign to Agent *</label>
                            <Dropdown
                                id="agent-select"
                                value={selectedAgentId}
                                options={agentsList.map((a) => ({ label: a.name, value: a._id }))}
                                onChange={(e) => setSelectedAgentId(e.value)}
                                placeholder="Select an agent"
                                style={{ width: '100%' }}
                            />
                        </div>
                    )}

                    {/* Status Dropdown (edit-only) */}
                    <div className="txn-new__grid" style={{ marginBottom: '1.5rem' }}>
                        <div className="txn-new__field">
                            <label className="txn-new__label" htmlFor="status">Transaction Status</label>
                            <Dropdown
                                id="status"
                                value={transactionInfo.status}
                                options={statusOptions}
                                onChange={(e) => handleTransactionInfoChange('status', e.value)}
                                placeholder="Select status"
                                style={{ width: '100%' }}
                            />
                        </div>

                        {/* Actual Closing Date (shown when Closed) */}
                        {transactionInfo.status === 'Closed' && (
                            <div className="txn-new__field">
                                <label className="txn-new__label" htmlFor="actual-closing-date">
                                    Actual Closing Date *
                                </label>
                                <Calendar
                                    id="actual-closing-date"
                                    value={actualClosingDate}
                                    onChange={(e) => setActualClosingDate(e.value)}
                                    placeholder="Select date"
                                    style={{ width: '100%' }}
                                    showIcon
                                    dateFormat="mm/dd/yy"
                                />
                            </div>
                        )}
                    </div>

                    {/* Representation Selector */}
                    <div className="txn-new__field" style={{ marginBottom: '1.5rem' }}>
                        <label className="txn-new__label">Are You Representing:</label>
                        <div className="txn-new__rep-group">
                            {REPRESENTATION_OPTIONS.map((opt) => (
                                <div key={opt.value} className="txn-new__rep-option">
                                    <input
                                        type="radio"
                                        id={`rep-${opt.value}`}
                                        name="representation"
                                        value={opt.value}
                                        checked={representation === opt.value}
                                        onChange={() => setRepresentation(opt.value)}
                                    />
                                    <label htmlFor={`rep-${opt.value}`} className="txn-new__rep-label">
                                        {opt.label}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Input Grid */}
                    <div className="txn-new__grid">
                        {/* Price */}
                        <div className="txn-new__field">
                            <label className="txn-new__label" htmlFor="price">Price *</label>
                            <InputText
                                id="price"
                                value={formatCurrency(transactionInfo.price)}
                                onChange={(e) => {
                                    const raw = e.target.value.replace(/\D/g, '');
                                    handleTransactionInfoChange('price', raw);
                                }}
                                placeholder="$0"
                                style={{ width: '100%' }}
                            />
                        </div>

                        {/* Escrow Length */}
                        <div className="txn-new__field">
                            <label className="txn-new__label" htmlFor="escrow-length">Escrow Length (Days) *</label>
                            <InputText
                                id="escrow-length"
                                value={transactionInfo.escrowLength}
                                onChange={(e) => {
                                    handleTransactionInfoChange('escrowLength', e.target.value);
                                    if (escrowLengthError) setEscrowLengthError('');
                                }}
                                placeholder="e.g., 30"
                                style={{ width: '100%' }}
                                className={escrowLengthError ? 'p-invalid' : ''}
                            />
                            {escrowLengthError && (
                                <span className="txn-new__error">{escrowLengthError}</span>
                            )}
                        </div>

                        {/* Financing */}
                        <div className="txn-new__field">
                            <label className="txn-new__label" htmlFor="financing">Financing Type</label>
                            <Dropdown
                                id="financing"
                                value={transactionInfo.financing}
                                options={financingOptions}
                                onChange={(e) => handleTransactionInfoChange('financing', e.value)}
                                placeholder="Select financing type"
                                style={{ width: '100%' }}
                            />
                        </div>

                        {/* Agent Commission % */}
                        <div className="txn-new__field">
                            <label className="txn-new__label" htmlFor="agent-commission-pct">Agent Commission (%)</label>
                            <div className="txn-new__input-wrap">
                                <InputText
                                    id="agent-commission-pct"
                                    value={transactionInfo.buyersAgentCommissionPct}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/[^0-9.]/g, '');
                                        handleTransactionInfoChange('buyersAgentCommissionPct', val);
                                    }}
                                    placeholder="e.g., 2.5"
                                    style={{ width: '100%', paddingRight: '2rem' }}
                                    step="0.01"
                                />
                                {transactionInfo.buyersAgentCommissionPct && (
                                    <span className="txn-new__input-suffix">%</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* TC Fee (read-only display) */}
                    <div className="txn-new__field" style={{ marginTop: '1.5rem' }}>
                        <label className="txn-new__label">Transaction Coordinator Fee</label>
                        <div
                            style={{
                                padding: '10px 14px',
                                background: 'hsl(var(--muted))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: 'var(--radius)',
                                fontSize: '0.85rem',
                                color: 'hsl(var(--foreground))',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <span style={{ color: 'hsl(var(--foreground-muted))' }}>
                                {representation === 'both' ? 'Dual Representation' : 'Single Side'}
                            </span>
                            <span style={{ fontWeight: '600' }}>
                                {formatCommCurrency(
                                    representation === 'both'
                                        ? TRANSACTION_FEES.TC_FEE_DUAL
                                        : TRANSACTION_FEES.TC_FEE_SINGLE_SIDE,
                                )}
                            </span>
                        </div>
                    </div>

                    {/* Referral Fee */}
                    <div className="txn-new__checkbox-row" style={{ marginTop: '1.5rem' }}>
                        <Checkbox
                            inputId="referral-fee"
                            checked={transactionInfo.referralFee}
                            onChange={(e) => {
                                handleTransactionInfoChange('referralFee', e.checked);
                                if (!e.checked) setReferralFeePercentage('');
                            }}
                        />
                        <label htmlFor="referral-fee">Referral Fee</label>
                    </div>

                    {transactionInfo.referralFee && (
                        <div className="txn-new__field" style={{ marginTop: '1rem', maxWidth: '50%' }}>
                            <label className="txn-new__label" htmlFor="referral-fee-pct">Referral Fee (%)</label>
                            <div className="txn-new__input-wrap">
                                <InputText
                                    id="referral-fee-pct"
                                    value={referralFeePercentage}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/[^0-9.]/g, '');
                                        setReferralFeePercentage(val);
                                    }}
                                    placeholder="e.g., 25"
                                    style={{ width: '100%', paddingRight: '2rem' }}
                                />
                                {referralFeePercentage && (
                                    <span className="txn-new__input-suffix">%</span>
                                )}
                            </div>
                            {parseFloat(referralFeePercentage) > 0 && calc.totalCommissionAmount > 0 && (
                                <p
                                    style={{
                                        fontSize: '0.75rem',
                                        color: 'hsl(var(--foreground-muted))',
                                        marginTop: '4px',
                                    }}
                                >
                                    = {formatCommCurrency(calc.referralFeeAmount)} of{' '}
                                    {formatCommCurrency(calc.totalCommissionAmount)} total commission
                                </p>
                            )}
                        </div>
                    )}

                    {/* Client Credits */}
                    <div className="txn-new__checkbox-row" style={{ marginTop: '1.5rem' }}>
                        <Checkbox
                            inputId="client-credits"
                            checked={showClientCredits}
                            onChange={(e) => handleClientCreditsCheckbox(e.checked)}
                        />
                        <label htmlFor="client-credits">Client Credits</label>
                    </div>

                    {showClientCredits && (
                        <div className="txn-new__credits-section">
                            <div className="txn-new__credits-header">
                                <h4 className="txn-new__credits-title">Client Credits</h4>
                                <Button
                                    icon="pi pi-plus"
                                    label="Add Credit"
                                    className="p-button-sm"
                                    onClick={handleAddClientCredit}
                                />
                            </div>

                            {clientCredits.length === 0 ? (
                                <p className="txn-new__credits-empty">
                                    No credits added. Click &quot;Add Credit&quot; to begin.
                                </p>
                            ) : (
                                clientCredits.map((credit) => (
                                    <div key={credit.id} className="txn-new__credit-row">
                                        <div className="txn-new__field">
                                            <label className="txn-new__label" style={{ fontSize: '0.8rem' }}>Category</label>
                                            <Dropdown
                                                value={credit.category}
                                                options={clientCreditCategories}
                                                onChange={(e) => handleUpdateClientCredit(credit.id, 'category', e.value)}
                                                style={{ width: '100%' }}
                                            />
                                        </div>
                                        <div className="txn-new__field">
                                            <label className="txn-new__label" style={{ fontSize: '0.8rem' }}>Amount</label>
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
                                ))
                            )}
                        </div>
                    )}

                    {/* Commission Breakdown Panel */}
                    {calc && parseFloat(transactionInfo.price) > 0 && parseFloat(transactionInfo.buyersAgentCommissionPct) > 0 && (
                        <div
                            style={{
                                marginTop: '24px',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: 'var(--radius)',
                                overflow: 'hidden',
                            }}
                        >
                            {/* Panel Header */}
                            <div
                                style={{
                                    background: 'hsl(var(--muted))',
                                    padding: '12px 16px',
                                    borderBottom: '1px solid hsl(var(--border))',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: '0.75rem',
                                        fontWeight: '700',
                                        letterSpacing: '0.08em',
                                        textTransform: 'uppercase',
                                        color: 'hsl(var(--foreground-muted))',
                                    }}
                                >
                                    Commission Breakdown
                                </span>
                                <span
                                    style={{
                                        fontSize: '0.75rem',
                                        color: 'hsl(var(--foreground-muted))',
                                    }}
                                >
                                    {agent?.commissionSplit || 0}% Agent Split
                                </span>
                            </div>

                            {/* Breakdown Rows */}
                            <div style={{ padding: '4px 0' }}>
                                <BreakdownRow
                                    label="Total Commission Amount"
                                    value={calc.totalCommissionAmount}
                                    sublabel={`${formatCommCurrency(parseFloat(transactionInfo.price))} \u00d7 ${transactionInfo.buyersAgentCommissionPct}%`}
                                />
                                <BreakdownRow
                                    label={`TC Fee (${representation === 'both' ? 'Dual' : 'Single Side'})`}
                                    value={calc.tcFee}
                                    deduction
                                />
                                {calc.referralFeeAmount > 0 && (
                                    <BreakdownRow
                                        label={`Referral Fee (${referralFeePercentage}%)`}
                                        value={calc.referralFeeAmount}
                                        deduction
                                    />
                                )}
                                <BreakdownRow
                                    label="Total Brokerage Commission"
                                    value={calc.totalBrokerageCommission}
                                    subtotal
                                />
                                <BreakdownRow
                                    label={`Agent Gross (${agent?.commissionSplit || 0}%)`}
                                    value={calc.agentCommissionGross}
                                />
                                <BreakdownRow
                                    label={`Brokerage Gross (${100 - (agent?.commissionSplit || 0)}%)`}
                                    value={calc.brokerageCommissionGross}
                                    muted
                                />
                                {totalClientCredits > 0 && (
                                    <BreakdownRow
                                        label="Client Credits"
                                        value={totalClientCredits}
                                        deduction
                                    />
                                )}
                                <BreakdownRow
                                    label="Agent Net Commission (Est.)"
                                    value={calc.agentNetCommission}
                                    total
                                    highlight
                                />
                                <BreakdownRow
                                    label="Brokerage Net Commission"
                                    value={calc.brokerageNetCommission}
                                    total
                                    muted
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* ════════════════════════════════════════════════════
                    SECTION 4 — CLIENT INFORMATION
                    ════════════════════════════════════════════════════ */}
                <div className="txn-new__card">
                    <h2 className="txn-new__card-title">Client Information</h2>

                    {representation === 'buyer' && renderClientBlock('buyer')}

                    {representation === 'seller' && renderClientBlock('seller')}

                    {representation === 'both' && (
                        <div className="txn-new__dual-clients">
                            <div className="txn-new__client-panel">
                                <h3 className="txn-new__client-panel-title">Buyer Side</h3>
                                {renderClientBlock('buyer')}
                            </div>
                            <div className="txn-new__client-panel">
                                <h3 className="txn-new__client-panel-title">Seller Side</h3>
                                {renderClientBlock('seller')}
                            </div>
                        </div>
                    )}
                </div>

                {/* ════════════════════════════════════════════════════
                    SECTION 5 — TRANSACTION DATES
                    ════════════════════════════════════════════════════ */}
                <div className="txn-new__card">
                    <h2 className="txn-new__card-title">Transaction Dates</h2>

                    <div className="txn-new__grid">
                        <div className="txn-new__field">
                            <label className="txn-new__label" htmlFor="acceptance-date">Acceptance Date *</label>
                            <Calendar
                                id="acceptance-date"
                                value={acceptanceDate}
                                onChange={(e) => setAcceptanceDate(e.value)}
                                placeholder="Select date"
                                style={{ width: '100%' }}
                                showIcon
                                dateFormat="mm/dd/yy"
                            />
                        </div>
                        <div className="txn-new__field">
                            <label className="txn-new__label" htmlFor="close-date">Expected Close Date *</label>
                            <Calendar
                                id="close-date"
                                value={expectedCloseDate}
                                onChange={(e) => setExpectedCloseDate(e.value)}
                                placeholder="Select date"
                                style={{ width: '100%' }}
                                showIcon
                                dateFormat="mm/dd/yy"
                            />
                        </div>
                    </div>
                </div>

                {/* ════════════════════════════════════════════════════
                    SECTION 6 — CONTINGENCIES IN PLACE
                    ════════════════════════════════════════════════════ */}
                <div className="txn-new__card">
                    <h2 className="txn-new__card-title">Contingencies In Place</h2>

                    <div className="txn-new__contingency-checks">
                        <div className="txn-new__contingency-item">
                            <Checkbox
                                inputId="inspection-contingency"
                                checked={contingencies.inspection}
                                onChange={(e) => handleContingencyChange('inspection', e.checked)}
                            />
                            <label htmlFor="inspection-contingency">Inspection Contingency</label>
                        </div>

                        <div className="txn-new__contingency-item">
                            <Checkbox
                                inputId="appraisal-contingency"
                                checked={contingencies.appraisal}
                                onChange={(e) => handleContingencyChange('appraisal', e.checked)}
                            />
                            <label htmlFor="appraisal-contingency">Appraisal Contingency</label>
                        </div>

                        <div className="txn-new__contingency-item">
                            <Checkbox
                                inputId="financing-contingency"
                                checked={contingencies.financing}
                                onChange={(e) => handleContingencyChange('financing', e.checked)}
                            />
                            <label htmlFor="financing-contingency">Financing Contingency</label>
                        </div>

                        <div className="txn-new__contingency-item">
                            <Checkbox
                                inputId="property-sale-contingency"
                                checked={contingencies.propertySale}
                                onChange={(e) => handleContingencyChange('propertySale', e.checked)}
                            />
                            <label htmlFor="property-sale-contingency">Contingency of Property Sale</label>
                        </div>
                    </div>

                    {/* Contingency Date Pickers (conditional) */}
                    {(contingencies.inspection || contingencies.appraisal || contingencies.financing || contingencies.propertySale) && (
                        <div className="txn-new__contingency-dates">
                            {contingencies.inspection && (
                                <div className="txn-new__field">
                                    <label className="txn-new__label" htmlFor="inspection-due">
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

                            {contingencies.appraisal && (
                                <div className="txn-new__field">
                                    <label className="txn-new__label" htmlFor="appraisal-due">
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

                            {contingencies.financing && (
                                <div className="txn-new__field">
                                    <label className="txn-new__label" htmlFor="financing-due">
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

                            {contingencies.propertySale && (
                                <div className="txn-new__field">
                                    <label className="txn-new__label" htmlFor="property-sale-due">
                                        Property Sale Contingency Due
                                    </label>
                                    <Calendar
                                        id="property-sale-due"
                                        value={contingencyDates.propertySaleDue}
                                        onChange={(e) => handleContingencyDateChange('propertySaleDue', e.value)}
                                        placeholder="Select date"
                                        style={{ width: '100%' }}
                                        showIcon
                                        dateFormat="mm/dd/yy"
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Delete Confirmation Dialog ──────────────────── */}
                {canDeleteTransaction && (
                    <Dialog
                        visible={deleteConfirmVisible}
                        onHide={() => setDeleteConfirmVisible(false)}
                        header="Delete Transaction"
                        style={{ width: '450px' }}
                        modal
                        footer={
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                <Button
                                    label="Cancel"
                                    className="p-button-text"
                                    onClick={() => setDeleteConfirmVisible(false)}
                                    disabled={deleting}
                                />
                                <Button
                                    label={deleting ? 'Deleting...' : 'Delete'}
                                    icon={deleting ? 'pi pi-spin pi-spinner' : 'pi pi-trash'}
                                    className="p-button-danger"
                                    onClick={handleDelete}
                                    disabled={deleting}
                                />
                            </div>
                        }
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <i
                                className="pi pi-exclamation-triangle"
                                style={{ fontSize: '2rem', color: 'hsl(var(--danger))' }}
                            />
                            <span>Are you sure you want to delete this transaction? This cannot be undone.</span>
                        </div>
                    </Dialog>
                )}

                {/* ── Sold Confirmation Dialog ────────────────────── */}
                <Dialog
                    visible={soldConfirmVisible}
                    onHide={() => setSoldConfirmVisible(false)}
                    header="Mark as Sold"
                    style={{ width: '450px' }}
                    modal
                    footer={
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                            <Button
                                label="Cancel"
                                className="p-button-text"
                                onClick={() => setSoldConfirmVisible(false)}
                                disabled={markingSold}
                            />
                            <Button
                                label={markingSold ? 'Updating...' : 'Mark as Sold'}
                                icon={markingSold ? 'pi pi-spin pi-spinner' : 'pi pi-check-circle'}
                                className="txn-edit__btn-sold"
                                onClick={handleMarkSold}
                                disabled={markingSold}
                            />
                        </div>
                    }
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <i className="pi pi-check-circle" style={{ fontSize: '2rem', color: '#22c55e' }} />
                        <span>Mark this transaction as Sold? This will update the status to Closed.</span>
                    </div>
                </Dialog>
            </div>
        </MainLayout>
    );
};

export default EditTransaction;
