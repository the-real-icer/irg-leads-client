// React
import React from 'react';
import PropTypes from 'prop-types';

// Third Party Components
import Slider from 'react-slick';
import { IoIosArrowDroprightCircle, IoIosArrowDropleftCircle } from 'react-icons/io';

// IRG Componenents
import ImageSlide from './ImageSlide';

class PropertyImageSlider extends React.Component {
    constructor(props) {
        super(props);
        // ________________________Component State__________________________\\
        this.state = {
            images: [],
        };
    }

    componentDidMount() {
        let propertyImages = [];

        // Check to see if property has listing_pictures
        if (
            this.props.property.listing_pictures &&
            this.props.property.listing_pictures.length > 0
        ) {
            propertyImages = this.props.property.listing_pictures.map((pic) =>
                pic.media_url.replace(/http:/, 'https:').concat('?preset=X-Large'),
            );
        } else if (
            this.props.property.listing_pictures &&
            this.props.property.listing_pictures.length === 0 &&
            this.props.property.listing_pics.length === 0 &&
            this.props.theme === 'light'
        ) {
            propertyImages = ['/No-Photo-Light-Large.jpg'];
        } else if (
            this.props.property.listing_pictures &&
            this.props.property.listing_pictures.length === 0 &&
            this.props.property.listing_pics.length === 0 &&
            this.props.theme === 'dark'
        ) {
            propertyImages = ['/No-Photo-Dark-Large.jpg'];
        } else {
            const cleanURL = this.props.property.listing_pics
                .replace(/\/120\/90\//g, '/2048/2048/')
                .replace(/preset=thumb/g, 'preset=X-Large')
                .replace(/http:/, 'https:');

            propertyImages = [cleanURL];

             
            for (let i = 0; i < this.props.property.pic_count; i++) {
                const j = i + 1;
                propertyImages.push(
                    cleanURL.replace(/\/0\//, `/${j}/`).replace(/.JPG/, `-${j}.JPG`),
                );
            }
        }

        this.setState({ images: propertyImages });

        this.slider.slickGoTo(0);
    }

    render() {
        // ________________________Component Props________________________\\
        const { property } = this.props;

        // _________________________________Functions__________________________\\
        const SampleNextArrow = (props) => {
            const { className, style, onClick } = props;
            return (
                <IoIosArrowDroprightCircle
                    className={className}
                    style={{ ...style, margin: '0 4rem', zIndex: '2', opacity: '90%' }}
                    onClick={onClick}
                    color="white"
                />
            );
        };

        const SamplePrevArrow = (props) => {
            const { className, style, onClick } = props;
            return (
                <IoIosArrowDropleftCircle
                    className={className}
                    style={{ ...style, margin: '0 4rem', zIndex: '2', opacity: '90%' }}
                    onClick={onClick}
                    color="white"
                />
            );
        };
        // _________________________________Constants__________________________\\
        const settings = {
            fade: true,
            infinite: true,
            speed: 500,
            swipeToSlide: true,
            slidesToShow: 1,
            slidesToScroll: 1,
            nextArrow: <SampleNextArrow className="slick-arrow slick-next" />,
            prevArrow: <SamplePrevArrow className="slick-arrow slick-prev" />,
            lazyLoad: 'progressive',
        };

        return (
            <div className="property_image_slider_container">
                <Slider ref={(slider) => (this.slider = slider)} {...settings}>
                    {this.state.images.map((image, index) => (
                        <ImageSlide
                            key={image}
                            image={image}
                            address={property.address}
                            number={index + 1}
                        />
                    ))}
                </Slider>
            </div>
        );
    }
}

PropertyImageSlider.propTypes = {
    property: PropTypes.shape({
    listing_pictures: PropTypes.arrayOf(
    PropTypes.shape({
        media_url: PropTypes.string.isRequired,
    })
    ),
    listing_pics: PropTypes.string,
    pic_count: PropTypes.number,
    address: PropTypes.string,
    }).isRequired,
    theme: PropTypes.oneOf(['light', 'dark']).isRequired,
};

export default PropertyImageSlider;
