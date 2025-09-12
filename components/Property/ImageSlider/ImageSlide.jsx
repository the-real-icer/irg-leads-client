import PropTypes from 'prop-types';

const ImageSlide = ({ image, address, number }) => (
    <div className="property_image_slider">
        <img src={image} className="property_image_slider" alt={`${address} - ${number}`} />
    </div>
);

ImageSlide.propTypes = {
    image: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    number: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default ImageSlide;
