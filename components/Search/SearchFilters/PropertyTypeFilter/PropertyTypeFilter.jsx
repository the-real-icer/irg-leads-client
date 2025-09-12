// React
import { useState, useEffect } from 'react';

// Redux
import { useSelector, useDispatch } from 'react-redux';

// Third Party Components
import { MultiSelect } from 'primereact/multiselect';

import { singleFamily, townHomes, condos } from '../../../../store/actions/searchFilters';

const PropertyTypeFilter = () => {
    // __________________Redux State______________________\\
    const searchFilter = useSelector((state) => state.searchFilter);
    const theme = 'light';
    // ________________________Component State__________________________\\
    const [propertyTypes, setPropertyTypes] = useState([]);

    // _____________________Hooks_____________________\\
    const dispatch = useDispatch();

    // _______________________________UseEffects___________________________\\
    // useEffect to run in the beginning to sync with redux state
    useEffect(() => {
        const propertyTypesToSet = [];

        if (searchFilter.singleFamily.length > 0) {
            propertyTypesToSet.push(searchFilter.singleFamily);
        }

        if (searchFilter.townHomes.length > 0) {
            propertyTypesToSet.push(searchFilter.townHomes);
        }

        if (searchFilter.condos.length > 0) {
            propertyTypesToSet.push(searchFilter.condos);
        }

        setPropertyTypes(propertyTypesToSet);
    }, []); // eslint-disable-line

    // _________________________________Constants__________________________\\
    const propertyTypesSelectItems = [
        { label: 'Single Family', value: 'Single Family Residence' },
        { label: 'Townhomes', value: 'Townhouse' },
        { label: 'Condos', value: 'Condominium' },
    ];

    // _________________________________Functions__________________________\\
    const typeTemplate = (option) => (
        <div className={`Search__Filters__Multi-Item Search__Filters__Multi-Item-${theme}`}>
            {option.label}
        </div>
    );

    const selectedTypesTemplate = (option) => {
        let displayName = '';

        if (option === 'Condominium') {
            displayName = 'CONDO';
        }

        if (option === 'Townhouse') {
            displayName = 'TWNHS';
        }

        if (option === 'Single Family Residence') {
            displayName = 'SFR';
        }

        if (option) {
            return (
                <div
                    className={`Search__Filters__Multi-Item__Value Search__Filters__Multi-Item__Value-${theme}`}
                >
                    <div>{displayName}</div>
                </div>
            );
        }

        return (
            <div
                className={`Search__Filters__Multi-Item__Label Search__Filters__Multi-Item__Label-${theme}`}
            >
                <div>Property Types</div>
            </div>
        );
    };

    const handleChange = (e) => {
        setPropertyTypes(e.target.value);

        if (e.target.value.includes('Condominium')) {
            dispatch(condos('Condominium'));
        } else {
            dispatch(condos(''));
        }

        if (e.target.value.includes('Townhouse')) {
            dispatch(townHomes('Townhouse'));
        } else {
            dispatch(townHomes(''));
        }

        if (e.target.value.includes('Single Family Residence')) {
            dispatch(singleFamily('Single Family Residence'));
        } else {
            dispatch(singleFamily(''));
        }
    };

    return (
        <MultiSelect
            className={`Search__Filters__Multi Search__Filters__Multi-${theme}`}
            value={propertyTypes}
            options={propertyTypesSelectItems}
            onChange={handleChange}
            selectedItemTemplate={selectedTypesTemplate}
            itemTemplate={typeTemplate}
            panelClassName={`Search__Filters__Multi__Panel Search__Filters__Multi__Panel-${theme}`}
        />
    );
};

export default PropertyTypeFilter;
