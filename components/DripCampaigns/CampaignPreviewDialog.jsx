import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import DOMPurify from 'isomorphic-dompurify';

const Dialog = dynamic(() => import('primereact/dialog').then((mod) => mod.Dialog), {
    ssr: false,
});
const Button = dynamic(() => import('primereact/button').then((mod) => mod.Button), {
    ssr: false,
});

const TRUNCATE_LENGTH = 180;

const CampaignPreviewDialog = ({ visible, campaign, onHide }) => {
    const [expandedEmails, setExpandedEmails] = useState({});

    const toggleExpand = (index) => {
        setExpandedEmails((prev) => ({ ...prev, [index]: !prev[index] }));
    };

    const sortedEmails = useMemo(() => {
        if (!campaign?.emails) return [];
        return [...campaign.emails].sort((a, b) => a.dayNumber - b.dayNumber);
    }, [campaign]);

    const totalDays =
        sortedEmails.length > 0 ? sortedEmails[sortedEmails.length - 1].dayNumber : 0;

    // Reset expanded state when campaign changes
    const handleShow = () => setExpandedEmails({});

    const headerContent = (
        <div className="campaign-preview__header">
            <h3 className="campaign-preview__name">{campaign?.name}</h3>
            <p className="campaign-preview__subtitle">
                {sortedEmails.length} {sortedEmails.length === 1 ? 'email' : 'emails'}
                {totalDays > 0 && ` over ${totalDays} days`}
            </p>
        </div>
    );

    return (
        <Dialog
            visible={visible}
            onHide={onHide}
            onShow={handleShow}
            header={headerContent}
            dismissableMask
            draggable={false}
            className="campaign-preview-dialog"
            contentClassName="campaign-preview__content"
        >
            {sortedEmails.length === 0 ? (
                <div className="campaign-preview__empty">
                    <i className="pi pi-inbox" />
                    <p>This campaign has no emails yet</p>
                </div>
            ) : (
                <div className="campaign-preview__list">
                    {sortedEmails.map((email, index) => {
                        const isLong = email.body && email.body.length > TRUNCATE_LENGTH;
                        const isExpanded = expandedEmails[index];

                        return (
                            <div key={email._id || index} className="campaign-preview__email">
                                <div className="campaign-preview__email-header">
                                    <span className="campaign-preview__day-badge">
                                        Day {email.dayNumber}
                                    </span>
                                    <span className="campaign-preview__email-order">
                                        Email {index + 1} of {sortedEmails.length}
                                    </span>
                                </div>
                                <h4 className="campaign-preview__email-subject">
                                    {email.subject}
                                </h4>
                                <div
                                    className={`campaign-preview__email-body${
                                        !isExpanded && isLong
                                            ? ' campaign-preview__email-body--truncated'
                                            : ''
                                    }`}
                                    dangerouslySetInnerHTML={{
                                        __html: DOMPurify.sanitize(
                                            !isExpanded && isLong
                                                ? email.body.slice(0, TRUNCATE_LENGTH) + '...'
                                                : email.body
                                        ),
                                    }}
                                />
                                {isLong && (
                                    <button
                                        className="campaign-preview__toggle"
                                        onClick={() => toggleExpand(index)}
                                    >
                                        {isExpanded ? 'Show less' : 'Show more'}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </Dialog>
    );
};

export default CampaignPreviewDialog;
