import PropTypes from 'prop-types';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import NoteIconWithPreview from './NoteIconWithPreview';
import { usePropertyFallbackImage } from '../../utils/propertyImageFallback';
import ikUrl from '../../utils/imageKit';

const Button = dynamic(() => import('primereact/button').then((mod) => mod.Button), { ssr: false });
const Chip = dynamic(() => import('primereact/chip').then((mod) => mod.Chip), { ssr: false });

const getCleanImageUrl = (property) => {
    if (property.listing_pics) {
        const pic = Array.isArray(property.listing_pics) ? property.listing_pics[0] : property.listing_pics;
        if (pic) {
            return String(pic).replace(/http:/, 'https:');
        }
    }
    if (property.listing_pictures?.length > 0) {
        const url = property.listing_pictures[0].media_url || property.listing_pictures[0];
        return String(url).replace(/http:/, 'https:');
    }
    return null;
};

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const channelLabels = {
    saved_search: 'Saved Search',
    e_alert: 'E-Alert',
    agent_direct: 'Direct Send',
};

const reactionConfig = {
    like: { label: 'Liked', icon: 'pi pi-heart-fill', className: 'reaction-liked' },
    maybe: { label: 'Maybe', icon: 'pi pi-question-circle', className: 'reaction-maybe' },
    discard: { label: 'Discarded', icon: 'pi pi-times-circle', className: 'reaction-discarded' },
};

const showingStatusConfig = {
    requested: { label: 'Showing Requested', severity: 'warning' },
    confirmed: { label: 'Showing Confirmed', severity: 'success' },
    cancelled: { label: 'Showing Cancelled', severity: 'danger' },
    completed: { label: 'Showing Completed', severity: 'info' },
};

const AgentPropertyCard = ({ delivery, onOpenNotes, onShowingAction, leadId, isLoggedIn }) => {
    const fallbackImage = usePropertyFallbackImage();
    const property = delivery.property;
    if (!property) return null;

    const imageUrl = ikUrl(getCleanImageUrl(property)) || fallbackImage;
    const unitSuffix = property.unit_number ? ` #${property.unit_number}` : '';
    const address = `${property.address}${unitSuffix}, ${property.city}, CA ${property.zip_code}`;
    const propertyUrl = property.property_url ? `/property/${property.property_url}` : null;
    const reaction = delivery.reaction;
    const reactionInfo = reaction ? reactionConfig[reaction] : null;
    const showing = delivery.showing_request;

    return (
        <div className={`agent-card ${reaction === 'discard' ? 'agent-card--discarded' : ''}`}>
            {/* Image */}
            <div className="agent-card__image-wrapper">
                {propertyUrl ? (
                    <Link href={propertyUrl} style={{ display: 'block' }}>
                        <img
                            src={imageUrl}
                            alt={address}
                            className="agent-card__image"
                            loading="lazy"
                            onError={(e) => {
                                if (e.currentTarget.src !== fallbackImage) {
                                    e.currentTarget.src = fallbackImage;
                                }
                            }}
                        />
                    </Link>
                ) : (
                    <img
                        src={imageUrl}
                        alt={address}
                        className="agent-card__image"
                        loading="lazy"
                        onError={(e) => {
                            if (e.currentTarget.src !== fallbackImage) {
                                e.currentTarget.src = fallbackImage;
                            }
                        }}
                    />
                )}
                {/* Channel badge */}
                <span className="agent-card__channel">
                    {channelLabels[delivery.channel] || delivery.channel}
                </span>
                {/* Reaction badge */}
                {reactionInfo ? (
                    <span className={`agent-card__reaction ${reactionInfo.className}`}>
                        <i className={reactionInfo.icon}></i> {reactionInfo.label}
                    </span>
                ) : (
                    <span className="agent-card__reaction reaction-none">No Response</span>
                )}
            </div>

            {/* Info */}
            <div className="agent-card__info">
                {propertyUrl ? (
                    <Link href={propertyUrl} className="agent-card__address" style={{ textDecoration: 'none', color: 'inherit' }}>{address}</Link>
                ) : (
                    <div className="agent-card__address">{address}</div>
                )}
                <div className="agent-card__price">{property.price}</div>
                <div className="agent-card__details">
                    {property.bedrooms} Bed, {property.bathrooms} Bath, {property.sqft} SqFt
                </div>
                <div className="agent-card__meta">
                    {delivery.source_search_name && (
                        <span className="agent-card__source">{delivery.source_search_name}</span>
                    )}
                    <span className="agent-card__date">{formatDate(delivery.delivered_at)}</span>
                </div>
            </div>

            {/* Actions */}
            <div className="agent-card__actions">
                {/* Notes icon with hover preview */}
                <NoteIconWithPreview
                    delivery={delivery}
                    leadId={leadId}
                    isLoggedIn={isLoggedIn}
                    onOpenNotes={onOpenNotes}
                />

                {/* Showing request status + actions */}
                {showing ? (
                    <div className="agent-card__showing">
                        <Chip
                            label={showingStatusConfig[showing.status]?.label || 'Requested'}
                            className={`showing-chip showing-chip--${showing.status}`}
                        />
                        {showing.status === 'requested' && (
                            <div className="agent-card__showing-actions">
                                <Button
                                    icon="pi pi-check"
                                    className="p-button-success p-button-sm p-button-text"
                                    tooltip="Confirm"
                                    tooltipOptions={{ position: 'top' }}
                                    onClick={() => onShowingAction(showing._id, 'confirmed')}
                                />
                                <Button
                                    icon="pi pi-times"
                                    className="p-button-danger p-button-sm p-button-text"
                                    tooltip="Cancel"
                                    tooltipOptions={{ position: 'top' }}
                                    onClick={() => onShowingAction(showing._id, 'cancelled')}
                                />
                            </div>
                        )}
                        {showing.status === 'confirmed' && (
                            <Button
                                icon="pi pi-check-circle"
                                className="p-button-info p-button-sm p-button-text"
                                tooltip="Mark Complete"
                                tooltipOptions={{ position: 'top' }}
                                onClick={() => onShowingAction(showing._id, 'completed')}
                            />
                        )}
                    </div>
                ) : (
                    <span className="agent-card__no-showing">No showing requested</span>
                )}
            </div>
        </div>
    );
};

AgentPropertyCard.propTypes = {
    delivery: PropTypes.object.isRequired,
    onOpenNotes: PropTypes.func.isRequired,
    onShowingAction: PropTypes.func.isRequired,
    leadId: PropTypes.string.isRequired,
    isLoggedIn: PropTypes.string.isRequired,
};

export default AgentPropertyCard;
