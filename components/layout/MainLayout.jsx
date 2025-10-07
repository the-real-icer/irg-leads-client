// React & NextJS
import React, { useEffect } from 'react';

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
    // fetchNewStories,
} from '../../store/actions';
import { fetchHotsheetHomes } from '../../store/actions/hotsheet';

const MainLayout = (props) => {
    const { children } = props; // eslint-disable-line

    // __________________Redux State______________________\\
    const isLoggedIn = useSelector((state) => state.isLoggedIn);
    const agent = useSelector((state) => state.agent);
    // const selectedHomes = useSelector((state) => state.selectedHomes);
    const allLeadsPage = useSelector((state) => state.allLeadsPage);
    const irgAreas = useSelector((state) => state.irgAreas);
    const hotsheet = useSelector((state) => state.hotsheet);
    const newProperties = useSelector((state) => state.newProperties);

    // _____________________Hooks_____________________\\
    const dispatch = useDispatch();

    // UseEffect to run once to fetch all the leads for the agent & News stories
    // TODO - Reimplement after date format
    useEffect(() => {
        if (allLeadsPage.length === 0) {
            dispatch(fetchLeads(agent._id, isLoggedIn));
            // dispatch(fetchNewStories());
        }
    }, []); // eslint-disable-line

    // useInterval to update leads list every 2 minutes
    useInterval(() => {
        dispatch(fetchLeads(agent._id, isLoggedIn));
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

    // ________________________Hotsheet Functions_______________\\
    // Load initial Hotsheet homes
    useEffect(() => {
        if (hotsheet.initialHomes && hotsheet.initialHomes.length === 0) {
            dispatch(
                fetchHotsheetHomes({
                    days: 3,
                    city: '',
                    county: 'san-diego',
                    hood: '',
                    zip: '',
                    limit: 100,
                })
            );
        }
    }, []); //eslint-disable-line

    return (
        <React.Fragment>
            <MainHead />
            <div className="min-h-screen flex relative lg:static surface-ground">
                <SideBar />
                <div className="min-h-screen flex flex-column relative flex-auto">
                    <TopBar />
                    <main>{children}</main>
                </div>
            </div>
        </React.Fragment>
    );
};

export default MainLayout;
