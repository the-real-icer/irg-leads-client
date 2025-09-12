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
import ImageSlider from '../../components/Property/ImageSlider/ImageSlider';
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
        const getProperty = async () => {
            try {
                const res = await IrgApi.get(`/mlsproperties/address/${address}`, {
                    headers: { Authorization: `Bearer ${isLoggedIn}` },
                });
                setProperty(res.data.data.result);
            } catch (error) {
                console.error(error.message); // eslint-disable-line
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
                {property && <TopBar property={property} handleToastMessage={handleToastMessage} />}
                {property && agent.role === 'admin' && (
                    <AdminBar
                        property={property}
                        setProperty={setProperty}
                        handleToastMessage={handleToastMessage}
                    />
                )}
                {property && <ImageSlider property={property} />}
                {property && <PropertyFeatures property={property} />}
                {property && <PropertyMap property={property} />}
            </div>
        </MainLayout>
    );
};

export default Address;
