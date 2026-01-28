// React & NextJS
import { useCallback } from 'react';
import Link from 'next/link';
import PropTypes from 'prop-types';

// Redux
import { useSelector, useDispatch } from 'react-redux';

import { MdAdd, MdClear } from 'react-icons/md';
import find from 'lodash.find';
import { Button } from 'primereact/button';

import showToast from '../../utils/showToast';
import { addSelectedHome, removeSelectedHome } from '../../store/actions';

const PrpCard = ({ property, handleOpenMapDialog }) => {
    // __________________Redux State______________________\\
    const selectedHomes = useSelector((state) => state.selectedHomes);

    // _____________________Hooks_____________________\\
    const dispatch = useDispatch();

    const goodImage = property?.listing_pics
        ? property.listing_pics.replace(/http:/, 'https:')
        : '/No-Photo-Light-Large.jpg'; // Fallback image

    const isSelected = find(selectedHomes, (home) => home.mls_number === property.mls_number);

    const addHome = useCallback(() => {
        dispatch(addSelectedHome(property));
        const unitNum = property?.unit_number ? ` #${property.unit_number}` : '';
        showToast('success', `${property.address}${unitNum} has been added!`, 'Home Added!');
    }, [dispatch, property]);

    const removeHome = useCallback(() => {
        dispatch(removeSelectedHome(property));
        const unitNum = property?.unit_number ? ` #${property.unit_number}` : '';
        showToast('success', `${property.address}${unitNum} has been removed!`, 'Home Removed!');
    }, [dispatch, property]);

    const linkAddress = property?.property_url ? `/property/${property.property_url}` : '';

    return (
        <div className="PrpCard">
            <Link href={linkAddress} passHref>
                <div className="PrpCard__ImgContainer">
                    {!isSelected ? (
                        <MdAdd className="PrpCard__Icon PrpCard__Icon__not" onClick={addHome} />
                    ) : (
                        <MdClear className="PrpCard__Icon PrpCard__Icon__is" onClick={removeHome} />
                    )}
                    <img
                        src={goodImage}
                        alt={`${property.address} - ${property.city} Home for Sale`}
                        className="PrpCard__Img PrpCard__Img__Main"
                    />
                </div>
            </Link>
            <Link href={linkAddress} passHref>
                <div className="PrpCard__Vitals">
                    <div className="PrpCard__Price">{property?.price}</div>
                    <div className="PrpCard__Details">
                        <span>
                            {property?.bedrooms} {property?.bedrooms === 1 ? 'Bed' : 'Beds'}
                        </span>
                        <span className="divider">|</span>
                        <span>
                            {property?.bathrooms} {property?.bathrooms === 1 ? 'Bath' : 'Baths'}
                        </span>
                        <span className="divider">|</span>
                        <span>{property?.sqft} SqFt</span>
                    </div>
                    <div className="PrpCard__Address">
                        {property?.address}
                        {property?.unit_number && ` #${property?.unit_number}`},{' '}
                        {property?.city}, CA {property?.zip_code}
                    </div>
                </div>
            </Link>
            <div className="PrpCard__Actions">
                <Button
                    label="Off Market"
                    className="p-button-warning"
                    // onClick={() => handleOffMarket(property)}
                />
                <Button
                    label="Show Map"
                    className="p-button-info"
                    onClick={() => handleOpenMapDialog(property)}
                />
            </div>
        </div>
    );
};

PrpCard.propTypes = {
    property: PropTypes.shape({
        address: PropTypes.string.isRequired,
        unit_number: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        city: PropTypes.string.isRequired,
        listing_pics: PropTypes.string.isRequired,
        property_url: PropTypes.string.isRequired,
        status: PropTypes.string.isRequired,
        days_on_market: PropTypes.number.isRequired,
        bedrooms: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        bathrooms: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        sqft: PropTypes.string.isRequired,
        price: PropTypes.string.isRequired,
        mls_number: PropTypes.string.isRequired,
        zip_code: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    }).isRequired,
    handleOpenMapDialog: PropTypes.func.isRequired
};

export default PrpCard;
