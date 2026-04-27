import dynamic from 'next/dynamic';

const Card = dynamic(() => import('primereact/card').then((mod) => mod.Card), { ssr: false });
const Button = dynamic(() => import('primereact/button').then((mod) => mod.Button), {
    ssr: false,
});

const LeadDripCampaignsCard = ({
    lead,
    onEnrollClick,
    onUnenroll,
    getDripCampaignProgress,
    getLastSentDate,
    getLastOpenedDate,
    getDripTypeBadgeColor,
}) => (
    <div className="lead-drip-campaigns" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
        <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: 'hsl(var(--foreground))',
                    margin: 0
                }}>
                    Drip Campaigns
                    {lead?.email_preferences?.drip_campaigns === false && (
                        <span style={{
                            fontSize: '10px',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            backgroundColor: 'hsl(var(--danger) / 0.1)',
                            color: 'hsl(var(--danger))',
                            marginLeft: '8px',
                            verticalAlign: 'middle',
                        }}>
                            Opted Out
                        </span>
                    )}
                </h3>
                <Button
                    label="Enroll In Campaign"
                    icon="pi pi-plus"
                    className="p-button-sm p-button-outlined"
                    onClick={onEnrollClick}
                    style={{ fontWeight: '600' }}
                />
            </div>

            {lead?.drip_campaigns?.filter((dc) => dc.enabled).length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {lead.drip_campaigns
                        .filter((dc) => dc.enabled)
                        .map((enrollment) => {
                            const campaign = enrollment.campaign;
                            const progress = getDripCampaignProgress(enrollment);
                            const lastSent = getLastSentDate(enrollment);
                            const lastOpened = getLastOpenedDate(enrollment);
                            const badgeColor = getDripTypeBadgeColor(campaign?.type);

                            return (
                                <div
                                    key={enrollment._id}
                                    style={{
                                        padding: '1rem',
                                        backgroundColor: 'hsl(var(--muted))',
                                        borderLeft: '4px solid hsl(var(--primary))',
                                        borderRadius: '8px',
                                    }}
                                >
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'start',
                                        marginBottom: '0.75rem'
                                    }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                                <span style={{ fontWeight: '700', fontSize: '1rem', color: 'hsl(var(--foreground))' }}>
                                                    {campaign?.name || 'Unknown Campaign'}
                                                </span>
                                                {campaign?.type && (
                                                    <span style={{
                                                        backgroundColor: badgeColor.bg,
                                                        color: badgeColor.color,
                                                        border: `1px solid ${badgeColor.border}`,
                                                        padding: '0.15rem 0.5rem',
                                                        borderRadius: '12px',
                                                        fontSize: '0.7rem',
                                                        fontWeight: '600',
                                                    }}>
                                                        {campaign.type}
                                                    </span>
                                                )}
                                            </div>
                                            <span style={{ fontSize: '0.85rem', color: 'hsl(var(--foreground-muted))' }}>
                                                {progress.sent} of {progress.total} emails sent
                                            </span>
                                        </div>
                                        <Button
                                            icon="pi pi-times"
                                            className="p-button-sm p-button-danger p-button-text"
                                            onClick={() => onUnenroll(campaign?._id || enrollment.campaign)}
                                            tooltip="Remove from campaign"
                                            tooltipOptions={{ position: 'top' }}
                                        />
                                    </div>

                                    {/* Progress Bar */}
                                    <div style={{
                                        height: '6px',
                                        backgroundColor: 'hsl(var(--border))',
                                        borderRadius: '3px',
                                        marginBottom: '0.75rem',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            height: '100%',
                                            width: `${progress.percent}%`,
                                            backgroundColor: progress.percent === 100 ? 'hsl(var(--success))' : 'hsl(var(--primary))',
                                            borderRadius: '3px',
                                            transition: 'width 0.3s ease',
                                        }} />
                                    </div>

                                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                                        {lastSent && (
                                            <span style={{ fontSize: '0.8rem', color: 'hsl(var(--foreground-muted))' }}>
                                                <i className="pi pi-send" style={{ marginRight: '0.3rem' }}></i>
                                                Last sent: {new Date(lastSent).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </span>
                                        )}
                                        {lastOpened && (
                                            <span style={{ fontSize: '0.8rem', color: 'hsl(var(--success))' }}>
                                                <i className="pi pi-eye" style={{ marginRight: '0.3rem' }}></i>
                                                Last opened: {new Date(lastOpened).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </span>
                                        )}
                                        {!lastSent && !lastOpened && (
                                            <span style={{ fontSize: '0.8rem', color: 'hsl(var(--foreground-muted))' }}>
                                                <i className="pi pi-clock" style={{ marginRight: '0.3rem' }}></i>
                                                Enrolled {new Date(enrollment.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                </div>
            ) : (
                <div style={{
                    textAlign: 'center',
                    padding: '2rem',
                    color: 'hsl(var(--foreground-muted))',
                    backgroundColor: 'hsl(var(--muted))',
                    borderRadius: '8px'
                }}>
                    <i className="pi pi-send" style={{ fontSize: '2.5rem', display: 'block', marginBottom: '1rem', opacity: 0.5 }}></i>
                    <p style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>No active drip campaigns</p>
                    <p style={{ fontSize: '0.9rem' }}>Click "Enroll In Campaign" to add an automated email sequence</p>
                </div>
            )}
        </Card>
    </div>
);

export default LeadDripCampaignsCard;
