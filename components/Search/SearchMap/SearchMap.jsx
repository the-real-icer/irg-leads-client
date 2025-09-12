import React from 'react';
import PropTypes from 'prop-types';

// Redux
import { useSelector } from 'react-redux';

// Third Party Components
import { GoogleMap, Marker, Polygon, useJsApiLoader } from '@react-google-maps/api';

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const polyOptions = {
    fillColor: 'lightgrey',
    fillOpacity: 0.4,
    strokeColor: 'black',
    strokeOpacity: 0.8,
    strokeWeight: 3,
    clickable: false,
    draggable: false,
    editable: false,
    geodesic: false,
    zIndex: 1,
};

const SearchMap = ({ homes }) => {
    // __________________Redux State______________________\\
    const searchPage = useSelector((state) => state.searchPage);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: apiKey,
    });
    // eslint-disable-next-line
    const [map, setMap] = React.useState(null);
    // eslint-disable-next-line
    const onLoad = React.useCallback(function callback(map) {
        // const bounds = new window.google.maps.LatLngBounds();
        // map.fitBounds(bounds);
        setMap(map);
    }, []);

    // eslint-disable-next-line
    const onUnmount = React.useCallback(function callback(map) {
        setMap(null);
    }, []);

    // _________________________Render Marker Function__________________\\
    // eslint-disable-next-line
    const renderMarkers = () => {
        return homes.map((property) => {
            let cleanSqFt = '';
            if (property?.sqft?.length > 0) {
                cleanSqFt = property.sqft.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            }
            return (
                <Marker
                    key={property._id}
                    address={property.address}
                    price={property.price}
                    beds={property.bedrooms}
                    baths={property.bathrooms}
                    sqft={cleanSqFt}
                    position={{ lat: property.coordinates.lat, lng: property.coordinates.lng }}
                    icon="/blue-icon-small.png"
                />
            );
        });
    };

    return isLoaded ? (
        <div className="SrchRsltsCntnt__Map-Container">
            <GoogleMap
                mapContainerClassName="SrchRsltsCntnt__Map-Map"
                center={searchPage.map.center}
                zoom={searchPage.map.zoom}
                onLoad={onLoad}
                onUnmount={onUnmount}
            >
                {renderMarkers()}
                {searchPage.map.polygon !== null && (
                    <Polygon paths={searchPage.map.polygon} options={polyOptions} />
                )}
            </GoogleMap>
        </div>
    ) : null;
};

SearchMap.propTypes = {
    homes: PropTypes.array.isRequired,
};

export default SearchMap;
