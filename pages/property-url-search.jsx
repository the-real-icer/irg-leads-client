// React & NextJS
import { useState, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
// import Image from 'next/image';
// Redux
import { useSelector } from 'react-redux';

// Third Party Components
const InputText = dynamic(() => import('primereact/inputtext').then((mod) => mod.InputText), {
    ssr: false,
});
const Button = dynamic(() => import('primereact/button').then((mod) => mod.Button), { ssr: false });

// IRG Components
import MainLayout from '../components/layout/MainLayout';
import ConfirmOffMarketDialog from '../components/Property/AdminBar/ConfirmOffMarketDialog';
import showToast from '../utils/showToast';

// IRG API - HOOKS - INFO - UTILS
import IrgApi from '../assets/irgApi';

const PropertyUrlSearch = () => {
    // __________________Redux State______________________\\
    const isLoggedIn = useSelector((state) => state.isLoggedIn);

    // ________________Component State_________________\\
    const [value1, setValue1] = useState('');
    const [home, setHome] = useState(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    const handleOffMarket = useCallback(() => {
        setShowConfirmDialog(true);
    }, []);

    const onBtnClick = useCallback(
        async (e) => {
            e.preventDefault();
            if (!value1) {
                showToast('error', 'Please enter a search value.', 'Validation Error', 'top-left');
                return;
            }

            try {
                const res = await IrgApi.get(`/mlsproperties/address/${value1}`, {
                    headers: { Authorization: `Bearer ${isLoggedIn}` },
                });

                if (res.data.data.result) {
                    setHome(res.data.data.result);
                } else if (res.data.data.result === null) {
                    setHome(null);
                    showToast('warn', 'No homes with that url.', 'None Found', 'top-left');
                }
            } catch (error) {
                showToast(
                    'error',
                    error.message || 'Failed to fetch property.',
                    'Error',
                    'top-left',
                );
            }
        },
        [value1, isLoggedIn],
    );

    const handleOffMarketSubmit = useCallback(async () => {
        if (!home?.property_url) {
            showToast('error', 'No property selected.', 'Error', 'top-left');
            return;
        }

        try {
            const res = await IrgApi.get(
                `/mlsproperties/change-to-off-market/${home.property_url}`,
                {
                    headers: { Authorization: `Bearer ${isLoggedIn}` },
                },
            );

            if (res.data.status === 'success') {
                showToast(
                    'success',
                    `${home.address} has been changed to Off Market`,
                    'Home Status Changed',
                    'top-left',
                );
                setShowConfirmDialog(false);
                //   if (res.data.property) {
                //     dispatch(updateNewPropertyAsync({
                //       ...res.data.property,
                //       imageUrl: res.data.property.imageUrl || null,
                //     }));
                //   }
            }
        } catch (error) {
            showToast(
                'error',
                error.message || 'Failed to update property status.',
                'Error',
                'top-left',
            );
        }
    }, [home, isLoggedIn]);

    const goodImage =
        home?.listing_pictures?.length > 0
            ? home.listing_pictures[0].media_url.replace(/http:/, 'https:')
            : '/No-Photo-Light-Large.jpg';

    return (
        <MainLayout>
            <ConfirmOffMarketDialog
                showConfirmDialog={showConfirmDialog}
                setShowConfirmDialog={setShowConfirmDialog}
                handleOffMarketSubmit={handleOffMarketSubmit}
            />
            <div className="property-url-search">
                <div className="property-url-search__container">
                    <h1 style={{ marginBottom: '2rem' }}>Property Url Search</h1>
                    <form className="property-url-search__search" onSubmit={onBtnClick}>
                        <span className="p-input-icon-right">
                            <i className="pi pi-search" />
                            <InputText
                                value={value1}
                                onChange={(e) => setValue1(e.target.value)}
                                placeholder="Search"
                                // style={inputStyle}
                                className="property-url-search__input"
                            />
                        </span>
                        <Button
                            label="Submit"
                            icon="pi pi-check"
                            type="submit"
                            style={{ fontSize: '1.5rem' }}
                        />
                    </form>
                    {home && (
                        <div className="prop_url_card">
                            <div className="prop_url_card_container">
                                <Link href={`/property/${home.property_url}`} passHref>
                                    <img
                                        src={goodImage}
                                        alt={home.address}
                                        className="prop_url_card_img"
                                    />
                                </Link>
                                <div className="prop_url_card_right">
                                    <Link href={`/property/${home.property_url}`} passHref>
                                        <div className="prop_url_card_address">
                                            <span>{home.address}</span>
                                            <span>
                                                {home.city}, {home.state} {home.zip_code}
                                            </span>
                                            <span>{home.mls_number}</span>
                                        </div>
                                    </Link>
                                    <Link href={`/property/${home.property_url}`} passHref>
                                        <div className="prop_url_card_status">
                                            <span className="prop_url_card_status__label">
                                                Status
                                            </span>
                                            <span>{home.status}</span>
                                            <span>{home.price}</span>
                                        </div>
                                    </Link>
                                    <Link href={`/property/${home.property_url}`} passHref>
                                        <div className="prop_url_card_url">
                                            {home.is_duplicate_property && (
                                                <span>
                                                    <strong>DUPLICATE</strong>
                                                </span>
                                            )}
                                            <span>{home.property_url}</span>
                                            <span>{home.full_address}</span>
                                        </div>
                                    </Link>
                                    <Button
                                        label="Change To Off Market"
                                        onClick={handleOffMarket}
                                        className="p-button-danger"
                                        style={{
                                            marginRight: '1rem',
                                            fontSize: '1.5rem',
                                            fontWeight: '500',
                                            marginBottom: '.5rem',
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
};

export default PropertyUrlSearch;
