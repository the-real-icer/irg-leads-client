import PropTypes from 'prop-types';
import { usePropertyFallbackImage } from '../../../utils/propertyImageFallback';

const ImageSlide = ({ image, address, number }) => {
    const fallbackImage = usePropertyFallbackImage();

    return (
        <div className="property_image_slider">
            <img
                src={image}
                className="property_image_slider"
                alt={`${address} - ${number}`}
                onError={(e) => {
                    if (e.currentTarget.src !== fallbackImage) {
                        e.currentTarget.src = fallbackImage;
                    }
                }}
            />
        </div>
    );
};

ImageSlide.propTypes = {
    image: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    number: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default ImageSlide;
