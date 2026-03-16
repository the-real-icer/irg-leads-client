// React & NextJS
import { useCallback, memo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';

// Redux
import { useSelector, useDispatch } from 'react-redux';

import { MdAdd, MdClear } from 'react-icons/md';
import find from 'lodash.find';
import { Button } from 'primereact/button';

import IrgApi from '../../assets/irgApi';
import showToast from '../../utils/showToast';
import { usePropertyFallbackImage } from '../../utils/propertyImageFallback';
import ikUrl from '../../utils/imageKit';
import { addSelectedHome, removeSelectedHome, fetchNewProperties } from '../../store/actions';

const PrpCard = memo(({ property, handleOpenMapDialog }) => {
    // __________________Redux State______________________\\
    const selectedHomes = useSelector((state) => state.selectedHomes);
    const agent = useSelector((state) => state.agent);
    const isLoggedIn = useSelector((state) => state.isLoggedIn);

    // _____________________Hooks_____________________\\
    const dispatch = useDispatch();
    const router = useRouter();
    const fallbackImage = usePropertyFallbackImage();

    const goodImage = property?.listing_pics
        ? ikUrl(property.listing_pics.replace(/http:/, 'https:'))
        : fallbackImage;

    const isSelected = find(selectedHomes, (home) => home.mls_number === property.mls_number);

    const addHome = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        dispatch(addSelectedHome(property));
        const unitNum = property?.unit_number ? ` #${property.unit_number}` : '';
        showToast('success', `${property.address}${unitNum} has been added!`, 'Home Added!');
    }, [dispatch, property]);

    const removeHome = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        dispatch(removeSelectedHome(property));
        const unitNum = property?.unit_number ? ` #${property.unit_number}` : '';
        showToast('success', `${property.address}${unitNum} has been removed!`, 'Home Removed!');
    }, [dispatch, property]);

    const handleOffMarket = useCallback(async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            const res = await IrgApi.get(
                `/mlsproperties/un-approve-new-property/${property.mls_number}`,
                { headers: { Authorization: `Bearer ${isLoggedIn}` } },
            );
            if (res.data.status === 'success') {
                showToast('warn', `${property.address} moved off market`, 'Off Market');
                dispatch(fetchNewProperties(isLoggedIn));
            }
        } catch (_err) {
            showToast('error', 'Something went wrong', 'Error');
        }
    }, [property, isLoggedIn, dispatch]);

    const linkAddress = useCallback(() => {
        if (!property?.property_url) return '';

        if (router.pathname !== '/search') {
            return `/property/${property.property_url}`;
        }

        const params = new URLSearchParams({
            returnTo: router.asPath,
        });

        return `/property/${property.property_url}?${params.toString()}`;
    }, [property?.property_url, router.pathname, router.asPath]);

    return (
        <div className="PrpCard">
            <Link href={linkAddress()} passHref>
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
                        loading="lazy"
                        onError={(e) => {
                            if (e.currentTarget.src !== fallbackImage) {
                                e.currentTarget.src = fallbackImage;
                            }
                        }}
                    />
                </div>
            </Link>
            <Link href={linkAddress()} passHref>
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
                {agent?.role === 'admin' && (
                    <Button
                        label="Off Market"
                        className="p-button-warning"
                        onClick={handleOffMarket}
                    />
                )}
                <Button
                    label="Show Map"
                    className="p-button-info"
                    onClick={() => handleOpenMapDialog(property)}
                />
            </div>
        </div>
    );
}, (prev, next) => prev.property._id === next.property._id);

PrpCard.displayName = 'PrpCard';

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
