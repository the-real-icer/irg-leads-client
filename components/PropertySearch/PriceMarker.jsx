import { memo } from 'react';
import { OverlayView } from '@react-google-maps/api';
import formatPrice from '../../utils/formatPrice';

// Stable references — prevents OverlayView from doing extra work on every draw frame
const ZERO_OFFSET = () => ({ x: 0, y: 0 });
const WRAPPER_STYLE = { overflow: 'visible', width: 0, height: 0 };

const PriceMarker = memo(({ property, isActive, onClick, onMouseEnter, onMouseLeave }) => {
    const position = {
        lat: property.coordinates.lat,
        lng: property.coordinates.lng,
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick(property._id);
        }
    };

    return (
        <OverlayView
            position={position}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            getPixelPositionOffset={ZERO_OFFSET}
        >
            <div style={WRAPPER_STYLE}>
                <div
                    className={`price-marker${isActive ? ' price-marker--active' : ''}`}
                    onClick={() => onClick(property._id)}
                    onMouseEnter={() => onMouseEnter(property._id)}
                    onMouseLeave={onMouseLeave}
                    onKeyDown={handleKeyDown}
                    role="button"
                    tabIndex={0}
                >
                    {formatPrice(property.price_raw || property.price)}
                </div>
            </div>
        </OverlayView>
    );
}, (prev, next) => prev.property._id === next.property._id && prev.isActive === next.isActive);

PriceMarker.displayName = 'PriceMarker';

export default PriceMarker;
