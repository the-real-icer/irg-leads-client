// React & NextJS
import Link from 'next/link';
import PropTypes from 'prop-types';

const RecentListingCard = ({ home }) => {
    const linkAddress = home?.property_url ? `/property/${home.property_url}` : '';

    const today = new Date();
    const dateCreated = new Date(home.date_created);
    const diffMs = today - dateCreated;
    const diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000);

    return (
        <Link href={linkAddress} passHref>
            <li
                className="py-3 border-bottom-1 surface-border flex md:align-items-start md:justify-content-between flex-column md:flex-row"
                style={{ cursor: 'pointer' }}
            >
                <div className="flex align-items-start mr-0 lg:mr-5">
                    <img src={home.listing_pics} alt="avatar-f-1" className="mr-3 w-6rem h-4rem" />
                    <div>
                        <span className="text-900 font-medium block mb-2">
                            {home.address}
                            {home?.unit_number && ` #${home?.unit_number}`}, {home.city},{' '}
                            {home.state} {home.zip_code}
                        </span>
                        <div className="text-700 mb-2">
                            {home?.bedrooms} {home?.bedrooms === 1 ? 'Bed' : 'Beds'} |{' '}
                            {home?.bathrooms} {home?.bathrooms === 1 ? 'Bath' : 'Baths'} |{' '}
                            {home.sqft} SqFt
                        </div>
                        <a className="text-blue-500 cursor-pointer">
                            <span>{home.price}</span>
                        </a>
                    </div>
                </div>
                <span className="block text-500 font-medium ml-7 md:ml-5 mt-2 md:mt-0">
                    {diffMins} mins ago
                </span>
            </li>
        </Link>
    );
};

RecentListingCard.propTypes = {
    home: PropTypes.shape({
        address: PropTypes.string.isRequired,
        state: PropTypes.string.isRequired,
        date_created: PropTypes.string.isRequired,
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
};

export default RecentListingCard;
