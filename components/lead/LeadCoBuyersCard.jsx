import AddCoBuyerDialog from './AddCoBuyerDialog';

const LeadCoBuyersCard = ({
    leadId,
    coBuyers,
    addCoBuyerOpen,
    unlinkingId,
    isLoggedIn,
    onAddOpen,
    onAddClose,
    onLinked,
    onUnlink,
    onNavigateToLead,
}) => (
    <div className="lead-co-buyers">
        <div className="lead-co-buyers__header">
            <h3 className="lead-co-buyers__title">Co-Buyers</h3>
            <button className="lead-co-buyers__add-btn" onClick={onAddOpen} type="button">
                <i className="pi pi-plus" /> Add Co-Buyer
            </button>
        </div>
        {coBuyers.length === 0 ? (
            <p className="lead-co-buyers__empty">
                No co-buyers linked. Add a co-buyer to share property searches with this lead.
            </p>
        ) : (
            <div className="lead-co-buyers__list">
                {coBuyers.map((cb) => (
                    <div
                        key={cb._id}
                        className="lead-co-buyers__card"
                        onClick={() => onNavigateToLead(cb._id)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onNavigateToLead(cb._id); }}
                        role="button"
                        tabIndex={0}
                    >
                        <div className="lead-co-buyers__avatar">{cb.first_name?.[0]}{cb.last_name?.[0]}</div>
                        <div className="lead-co-buyers__info">
                            <span className="lead-co-buyers__name">{cb.first_name} {cb.last_name}</span>
                            <span className="lead-co-buyers__email">{cb.email}</span>
                        </div>
                        <div className="lead-co-buyers__actions">
                            <button
                                onClick={(e) => { e.stopPropagation(); onUnlink(cb._id); }}
                                title="Unlink co-buyer"
                                type="button"
                                className="lead-co-buyers__unlink-btn"
                                disabled={unlinkingId === cb._id}
                            >
                                <i className={unlinkingId === cb._id ? 'pi pi-spin pi-spinner' : 'pi pi-times'} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )}
        <AddCoBuyerDialog
            visible={addCoBuyerOpen}
            onHide={onAddClose}
            leadId={leadId}
            existingCoBuyers={coBuyers}
            isLoggedIn={isLoggedIn}
            onLinked={onLinked}
        />
    </div>
);

export default LeadCoBuyersCard;
