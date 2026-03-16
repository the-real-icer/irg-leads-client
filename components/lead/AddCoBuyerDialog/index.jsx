import { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import dynamic from 'next/dynamic';

const Dialog = dynamic(() => import('primereact/dialog').then((mod) => mod.Dialog), { ssr: false });

import IrgApi from '../../../assets/irgApi';
import showToast from '../../../utils/showToast';
import getLeadDisplayName from '../../../utils/getLeadDisplayName';

const AddCoBuyerDialog = ({ visible, onHide, leadId, existingCoBuyers = [], isLoggedIn, onLinked }) => {
    const allLeads = useSelector((state) => state.allLeadsPage.leads);
    const [searchQuery, setSearchQuery] = useState('');
    const [linking, setLinking] = useState(null);

    const excludeIds = useMemo(() => {
        const ids = new Set([leadId]);
        existingCoBuyers.forEach((cb) => ids.add(cb._id));
        return ids;
    }, [leadId, existingCoBuyers]);

    const filteredLeads = useMemo(() => {
        const available = (allLeads || []).filter((l) => !excludeIds.has(l._id));
        if (!searchQuery.trim()) return available.slice(0, 10);
        const q = searchQuery.toLowerCase().trim();
        return available
            .filter((l) => {
                const name = `${l.first_name || ''} ${l.last_name || ''}`.toLowerCase();
                const email = (l.email || '').toLowerCase();
                return name.includes(q) || email.includes(q);
            })
            .slice(0, 10);
    }, [allLeads, excludeIds, searchQuery]);

    const handleLink = async (lead) => {
        setLinking(lead._id);
        try {
            const res = await IrgApi.post(
                `/users/${leadId}/co-buyers/link`,
                { coBuyerId: lead._id },
                { headers: { Authorization: `Bearer ${isLoggedIn}` } }
            );
            onLinked(res.data.data);
            showToast('success', `${getLeadDisplayName(lead)} linked as co-buyer`, 'Co-Buyer Linked');
        } catch {
            showToast('error', 'Failed to link co-buyer', 'Error');
        } finally {
            setLinking(null);
        }
    };

    const handleHide = () => {
        setSearchQuery('');
        setLinking(null);
        onHide();
    };

    const getInitials = (lead) => {
        const f = lead.first_name?.[0] || '';
        const l = lead.last_name?.[0] || '';
        return (f + l).toUpperCase() || '?';
    };

    return (
        <Dialog
            header="Add Co-Buyer"
            visible={visible}
            onHide={handleHide}
            style={{ width: '440px', maxWidth: '95vw' }}
            modal
            dismissableMask
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Search Input */}
                <div style={{ position: 'relative' }}>
                    <i className="pi pi-search" style={{
                        position: 'absolute', left: '12px', top: '50%',
                        transform: 'translateY(-50%)', color: 'hsl(var(--muted-foreground))', fontSize: '14px',
                    }} />
                    <input
                        type="text"
                        placeholder="Search leads by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%', padding: '10px 12px 10px 36px',
                            border: '1px solid hsl(var(--border))', borderRadius: '8px',
                            background: 'hsl(var(--background))', color: 'hsl(var(--foreground))',
                            fontSize: '14px', outline: 'none',
                        }}
                    />
                </div>

                {/* Results */}
                <div style={{ maxHeight: '320px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {filteredLeads.length === 0 ? (
                        <div style={{
                            textAlign: 'center', padding: '24px', color: 'hsl(var(--muted-foreground))',
                            fontSize: '13px', fontStyle: 'italic',
                        }}>
                            {searchQuery.trim() ? 'No leads match your search' : 'No available leads to link'}
                        </div>
                    ) : (
                        filteredLeads.map((lead) => (
                            <div
                                key={lead._id}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '12px',
                                    padding: '10px 12px', borderRadius: '8px',
                                    border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))',
                                    transition: 'background 0.15s',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = 'hsl(var(--accent))'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'hsl(var(--card))'; }}
                            >
                                {/* Avatar */}
                                <div style={{
                                    width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                                    background: 'hsl(var(--primary) / 0.15)', color: 'hsl(var(--primary))',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '13px', fontWeight: '700', textTransform: 'uppercase',
                                }}>
                                    {getInitials(lead)}
                                </div>

                                {/* Name + Email */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        fontSize: '14px', fontWeight: '600', color: 'hsl(var(--foreground))',
                                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                    }}>
                                        {getLeadDisplayName(lead)}
                                    </div>
                                    <div style={{
                                        fontSize: '12px', color: 'hsl(var(--muted-foreground))',
                                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                    }}>
                                        {lead.email || 'No email'}
                                    </div>
                                </div>

                                {/* Link Button */}
                                <button
                                    type="button"
                                    onClick={() => handleLink(lead)}
                                    disabled={linking === lead._id}
                                    style={{
                                        padding: '6px 14px', border: '1px solid hsl(var(--primary) / 0.4)',
                                        borderRadius: '6px', background: 'hsl(var(--primary) / 0.1)',
                                        color: 'hsl(var(--primary))', fontSize: '13px', fontWeight: '600',
                                        cursor: linking === lead._id ? 'wait' : 'pointer', flexShrink: 0,
                                    }}
                                >
                                    {linking === lead._id ? (
                                        <i className="pi pi-spin pi-spinner" style={{ fontSize: '13px' }} />
                                    ) : 'Link'}
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </Dialog>
    );
};

AddCoBuyerDialog.propTypes = {
    visible: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    leadId: PropTypes.string.isRequired,
    existingCoBuyers: PropTypes.array,
    isLoggedIn: PropTypes.string.isRequired,
    onLinked: PropTypes.func.isRequired,
};

export default AddCoBuyerDialog;
