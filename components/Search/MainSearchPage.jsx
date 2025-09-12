import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

// Redux
import { useSelector, useDispatch } from 'react-redux';

import { ProgressBar } from 'primereact/progressbar';

// Third Party Hooks
import { useWindowSize } from 'react-use';

import SearchMap from './SearchMap/SearchMap';
import HomeList from './HomeList/HomeList';
import SearchFilters from './SearchFilters/SearchFilters';

import IrgApi from '../../assets/irgApi';
import {
    setCenter,
    setZoom,
    changeSearch,
    setPolygon,
    setLoadingHomes,
} from '../../store/actions/searchPage';

import filteringHomes from '../../utils/filterHomes';

const propertyType = 'Home';

const MainSearchPage = () => {
    // __________________Redux State______________________\\
    const searchPage = useSelector((state) => state.searchPage);
    const searchFilter = useSelector((state) => state.searchFilter);
    const irgAreas = useSelector((state) => state.irgAreas);

    // _____________________Hooks_____________________\\
    const router = useRouter();
    const { area, type } = router.query;
    const dispatch = useDispatch();

    // ________________Component State_________________\\
    const [resultsCount, setResultsCount] = useState(0);
    const [initialResults, setInitialResults] = useState([]);
    const [filteredResults, setFilteredResults] = useState([]);

    // useEffect(() => {
    //     console.log(router.query.type);
    //     console.log(router.query.area);
    // }, []);

    useEffect(() => {
        const getHomes = async (url) => {
            const res = await IrgApi.get(url);
            setInitialResults(res.data.data);
            setResultsCount(res.data.results);
            dispatch(setLoadingHomes(false));
        };

        const getHoodHomes = async (url, bounds) => {
            const res = await IrgApi.post(url, JSON.stringify(bounds), {
                headers: { 'Content-Type': 'application/json' },
            });
            setInitialResults(res.data.data);
            setResultsCount(res.data.results);
            dispatch(setLoadingHomes(false));
        };

        if (type === 'city') {
            dispatch(setLoadingHomes(true));
            const b = irgAreas.City.filter((a) => a.as === `/${type}/${area}`);
            dispatch(changeSearch({ term: b[0].name, type: b[0].type }));
            dispatch(setZoom(b[0].zoom));
            dispatch(setCenter(b[0].coordinates));
            const polygonBounds = b[0].boundary[0].map((item) => ({ lat: item[1], lng: item[0] }));
            dispatch(setPolygon(polygonBounds));
            getHomes(`/mlsproperties/city/${area}`);
        }

        if (type === 'zipcode') {
            dispatch(setLoadingHomes(true));
            const b = irgAreas.City.filter((a) => a.as === `/${type}/${area}`);
            dispatch(changeSearch({ term: b[0].name, type: b[0].type }));
            dispatch(setZoom(b[0].zoom));
            dispatch(setCenter(b[0].coordinates));
            const polygonBounds = b[0].boundary[0].map((item) => ({ lat: item[1], lng: item[0] }));
            dispatch(setPolygon(polygonBounds));
            getHomes(`/mlsproperties/zipcode/${area}`);
        }

        if (type === 'neighborhood') {
            dispatch(setLoadingHomes(true));
            const b = irgAreas.Neighborhood.filter((a) => a.as === `/${type}/${area}`);
            dispatch(changeSearch({ term: b[0].name, type: b[0].type }));
            dispatch(setZoom(b[0].zoom));
            dispatch(setCenter(b[0].coordinates));
            const polygonBounds = b[0].boundary[0].map((item) => ({ lat: item[1], lng: item[0] }));
            dispatch(setPolygon(polygonBounds));
            const bounds = b[0].boundary;
            getHoodHomes('/mlsproperties/withinpolygon', bounds);
        }

        if (type === 'condo-building') {
            dispatch(setLoadingHomes(true));
            const b = irgAreas.CondoBuilding.filter((a) => a.as === `/condos/building/${area}`);
            dispatch(changeSearch({ term: b[0].name, type: b[0].type }));
            dispatch(setZoom(b[0].zoom));
            dispatch(setCenter(b[0].coordinates));
            const polygonBounds = b[0].boundary[0].map((item) => ({ lat: item[1], lng: item[0] }));
            dispatch(setPolygon(polygonBounds));
            getHomes(`/mlsproperties/condos/bldgname/${area}`);
        }

        return () => {
            setInitialResults([]);
            setResultsCount(0);
        };
    }, [area, type]); //eslint-disable-line

    // useEffect to update Result Count based on changes in filteredResults
    useEffect(() => {
        setResultsCount(filteredResults.length);
    }, [filteredResults]);

    // useEffect to apply filters to homes
    useEffect(() => {
        const filteredHomes = filteringHomes(initialResults, searchFilter);
        setFilteredResults(filteredHomes);
    }, [initialResults, searchFilter]);

    // _____________________Hooks_____________________\\
    const { width } = useWindowSize();
    return (
        <div className="SrchRsltsCntnt__Container">
            {width > 700 && (
                <div className="SrchRsltsCntnt__Left">
                    <SearchFilters />
                    <div className="SrchRsltsCntnt__Map SrchRsltsCntnt__Map_no_user">
                        <div className="SrchRsltsCntnt__Map__Loading">
                            {searchPage.loadingHomes && (
                                <ProgressBar mode="indeterminate" style={{ height: '6px' }} />
                            )}
                        </div>
                        <SearchMap homes={filteredResults} />
                    </div>
                </div>
            )}
            <div className="SrchRsltsCntnt__Right">
                <div className="SrchRsltsList__Title">
                    <h1 className="SrchRsltsList__Title-Main">
                        {searchPage.term !== 'user' && searchPage.term} {propertyType}s For Sale &
                        Real Estate
                    </h1>
                    <h2 className="SrchRsltsList__Title-Count">
                        {resultsCount && resultsCount} {propertyType}
                        {resultsCount === 1 ? null : 's'} for Sale
                    </h2>
                </div>
                <div className="SrchRsltsList__Container">
                    <HomeList homes={filteredResults} searchPage={searchPage} />
                </div>
            </div>
        </div>
    );
};

export default MainSearchPage;
