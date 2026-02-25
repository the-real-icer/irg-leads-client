import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const PropertyDescription = ({ property }) => {
    const [expanded, setExpanded] = useState(false);
    const [needsClamp, setNeedsClamp] = useState(false);
    const textRef = useRef(null);

    useEffect(() => {
        const el = textRef.current;
        if (el) {
            setNeedsClamp(el.scrollHeight > el.clientHeight + 1);
        }
    }, []);

    if (!property.public_remarks) return null;

    return (
        <div className="property__features__description">
            <p
                ref={textRef}
                className={`property__features__description__text${!expanded ? ' property__features__description__text--clamped' : ''}`}
            >
                {property.public_remarks}
            </p>
            {needsClamp && (
                <button
                    className="property__features__description__toggle"
                    onClick={() => setExpanded(!expanded)}
                    type="button"
                >
                    {expanded ? 'Read Less' : 'Read More'}
                </button>
            )}
        </div>
    );
};

PropertyDescription.propTypes = {
    property: PropTypes.shape({
        public_remarks: PropTypes.string,
    }).isRequired,
};

export default PropertyDescription;
