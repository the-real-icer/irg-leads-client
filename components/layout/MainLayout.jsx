// React & NextJS
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

// Redux
import { useSelector, useDispatch } from 'react-redux';

// Third Party Components
import { useInterval } from 'react-use';

import MainHead from './MainHead/MainHead';
import SideBar from './SideBar/SideBar';
import TopBar from './TopBar/TopBar';

import {
    fetchLeads,
    fetchIrgAreas,
    fetchNewProperties,
    fetchAllAddresses,
} from '../../store/actions';

const MainLayout = (props) => {
    const { children } = props; // eslint-disable-line

    // __________________Redux State______________________\\
    const isLoggedIn = useSelector((state) => state.isLoggedIn);
    const agent = useSelector((state) => state.agent);
    const irgAreas = useSelector((state) => state.irgAreas);

    const newProperties = useSelector((state) => state.newProperties);

    // __________________Mobile Sidebar______________________\\
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const router = useRouter();

    // Close mobile menu on route change
    useEffect(() => {
        const handleRouteChange = () => setMobileMenuOpen(false);
        router.events.on('routeChangeStart', handleRouteChange);
        return () => router.events.off('routeChangeStart', handleRouteChange);
    }, [router.events]);

    // _____________________Hooks_____________________\\
    const dispatch = useDispatch();

    // Fetch leads whenever the authenticated agent changes
    useEffect(() => {
        if (agent?._id && isLoggedIn) {
            dispatch(fetchLeads(agent._id, isLoggedIn));
        }
    }, [agent?._id, isLoggedIn]); // eslint-disable-line

    // useInterval to update leads list every 2 minutes — silent refresh (no spinner)
    useInterval(() => {
        if (agent?._id && isLoggedIn) {
            dispatch(fetchLeads(agent._id, isLoggedIn, { silent: true }));
        }
    }, 120000);

    // ________________________________useEffect to get Irg Areas_____________\\
    useEffect(() => {
        const irgAreasTimer = setTimeout(() => { //eslint-disable-line
            if (irgAreas.City.length === 0) {
                dispatch(fetchIrgAreas());
            }
        }, 1500);
        return () => clearTimeout(irgAreasTimer); //eslint-disable-line
    }, []); //eslint-disable-line

    // ________________________________useEffect to get New Properties_____________\\
    useEffect(() => {
        const newPropertiesTimer = setTimeout(() => { //eslint-disable-line
            if (newProperties.length === 0) {
                dispatch(fetchNewProperties(isLoggedIn));
            }
        }, 1000);
        return () => clearTimeout(newPropertiesTimer); //eslint-disable-line
    }, []); //eslint-disable-line

    // useInterval to check for new homes every 1 minute
    useInterval(() => {
        dispatch(fetchNewProperties(isLoggedIn));
    }, 60000);

    // ________________________________useEffect to get New All Addresses_____________\\
    // useEffect for loading irgAreas and Addresses
    useEffect(() => {
        const getIrgAddresses = setTimeout(() => { //eslint-disable-line
            if (irgAreas.Addresses.length === 0) {
                dispatch(fetchAllAddresses());
            }
        }, 1000);
        return () => clearTimeout(getIrgAddresses); //eslint-disable-line
    }, []); // eslint-disable-line


    return (
        <>
            <MainHead />
            <div className="min-h-screen flex relative bg-background">
                {/* Mobile overlay */}
                {mobileMenuOpen && (
                    <div
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[998] lg:hidden transition-opacity duration-200"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                )}

                <SideBar mobileOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

                <div className="min-h-screen flex flex-column flex-auto min-w-0 lg:ml-[280px]">
                    <TopBar onMobileMenuToggle={() => setMobileMenuOpen((prev) => !prev)} />
                    <main className="flex-auto" style={{ overflowY: 'auto', overflowX: 'hidden', scrollbarGutter: 'stable' }}>{children}</main>
                </div>
            </div>
        </>
    );
};

export default MainLayout;
