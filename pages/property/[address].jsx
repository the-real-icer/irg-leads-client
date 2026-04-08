// React & NextJS
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

// Redux
import { useSelector } from 'react-redux';

// Third Party Components
import { Toast } from 'primereact/toast';

// IRG Components
import MainLayout from '../../components/layout/MainLayout';
import TopBar from '../../components/Property/TopBar/TopBar';
import PropertyGallery from '../../components/Property/PropertyGallery/PropertyGallery';
import QueueButton from '../../components/Property/TopBar/QueueButton';
import UserActions from '../../components/Property/TopBar/UserActions';
import AdminBar from '../../components/Property/AdminBar/AdminBar';
import PropertyMap from '../../components/Property/PropertyMap/PropertyMap';
import PropertyFeatures from '../../components/Property/PropertyFeatures/PropertyFeatures';

// IRG API - HOOKS - INFO - UTILS
import IrgApi from '../../assets/irgApi';

const getSafeReturnTo = (rawReturnTo) => {
    if (typeof rawReturnTo !== 'string') return null;

    const value = rawReturnTo.trim();
    if (!value.startsWith('/search')) return null;
    if (value.startsWith('//')) return null;

    return value;
};

const Address = () => {
    // __________________Redux State______________________\\
    const agent = useSelector((state) => state.agent);
    const isLoggedIn = useSelector((state) => state.isLoggedIn);

    // ________________Component State_________________\\
    const [property, setProperty] = useState(null);
    const [refetchTrigger, setRefetchTrigger] = useState(0);

    const toastProperty = useRef(null);

    const handleToastMessage = (severity, summary, detail, life) => {
        toastProperty.current.show({
            severity,
            summary,
            detail,
            life,
        });
    };

    const router = useRouter();

    const { address, returnTo } = router.query;
    const safeReturnTo = getSafeReturnTo(returnTo);

    useEffect(() => {
        if (!address || !isLoggedIn) return;

        const getProperty = async () => {
            try {
                const res = await IrgApi.get(`/mlsproperties/address/${address}`, {
                    headers: { Authorization: `Bearer ${isLoggedIn}` },
                });
                setProperty(res.data.data.result);
            } catch (error) {
                // Error handled — property state remains null
            }
        };
        getProperty();
    }, [address, isLoggedIn, refetchTrigger]);

    // Re-fetch when a background tab becomes visible (Chrome throttles background tabs)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && !property) {
                setRefetchTrigger((prev) => prev + 1);
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [property]);

    return (
        <MainLayout title={address ? decodeURIComponent(address) : 'Property'}>
            <div className="property__page">
                <Toast
                    ref={toastProperty}
                    className="irg__toast"
                    position="top-right"
                    baseZIndex={200000000}
                />
                {safeReturnTo && (
                    <div className="property__page__container" style={{ marginBottom: '1rem' }}>
                        <Link
                            href={safeReturnTo}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '1.4rem',
                                fontWeight: 600,
                                textDecoration: 'none',
                            }}
                        >
                            <i className="pi pi-arrow-left" />
                            <span>Back to Search</span>
                        </Link>
                    </div>
                )}
                {property && <TopBar property={property} />}
                {property && (
                    <div className="property__action-bar">
                        <div className="property__action-bar__left">
                            <QueueButton property={property} />
                        </div>
                        <div className="property__action-bar__right">
                            {agent.role === 'admin' ? (
                                <AdminBar
                                    property={property}
                                    setProperty={setProperty}
                                    handleToastMessage={handleToastMessage}
                                />
                            ) : (
                                <UserActions property={property} />
                            )}
                        </div>
                    </div>
                )}
                {property && <PropertyGallery property={property} />}
                {property && <PropertyFeatures property={property} />}
                {property && <PropertyMap property={property} />}
            </div>
        </MainLayout>
    );
};

export default Address;
