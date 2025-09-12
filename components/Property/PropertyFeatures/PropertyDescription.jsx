// React
import React, { useState } from 'react';
import PropTypes from 'prop-types';

const PropertyDescription = ({ property }) => {
    // let isLoaded = false;
    // ________________________Component State__________________________\\
    const [isLongDescription, setIsLongDescription] = useState(false);

    // _________________________________Constants__________________________\\
    let shortDescription = '';
    if (property) {
        shortDescription = property.public_remarks.slice(0, 1200);
    }

    // _________________________________Functions__________________________\\
    const handleLongDescriptionButton = () => setIsLongDescription(true);
    const handleShortDescriptionButton = () => setIsLongDescription(false);

    return (
        <div className="property__features__description">
            {!isLongDescription && (
                <p>
                    {shortDescription}
                    {property.public_remarks.length > 1200 && (
                        <React.Fragment>
                            ...{' '}
                            <span
                                style={{ cursor: 'pointer' }}
                                onClick={handleLongDescriptionButton}
                                onKeyPress={handleLongDescriptionButton}
                                role="switch"
                                tabIndex="0"
                                aria-checked="false"
                            >
                                <strong>READ MORE</strong>
                            </span>
                        </React.Fragment>
                    )}
                </p>
            )}
            {isLongDescription && (
                <p>
                    {property.public_remarks} ...
                    <span
                        style={{ cursor: 'pointer' }}
                        onClick={handleShortDescriptionButton}
                        onKeyPress={handleLongDescriptionButton}
                        role="switch"
                        tabIndex="-1"
                        aria-checked="true"
                    >
                        <strong>READ LESS</strong>
                    </span>
                </p>
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
