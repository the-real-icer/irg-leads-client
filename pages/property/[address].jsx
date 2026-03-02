// React & NextJS
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';

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

const Address = () => {
    // __________________Redux State______________________\\
    const agent = useSelector((state) => state.agent);
    const isLoggedIn = useSelector((state) => state.isLoggedIn);

    // ________________Component State_________________\\
    const [property, setProperty] = useState(null);

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

    const { address } = router.query;

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
    }, [address, isLoggedIn]);

    return (
        <MainLayout>
            <div className="property__page">
                <Toast
                    ref={toastProperty}
                    className="irg__toast"
                    position="top-right"
                    baseZIndex={200000000}
                />
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
