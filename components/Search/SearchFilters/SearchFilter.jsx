import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// Redux
import { useDispatch } from 'react-redux';

// Third Party Components
import { Dropdown } from 'primereact/dropdown';

const SearchFilter = ({ options }) => {
    const [placeholder, setPlaceHolder] = useState(options.placeholder);

    const dispatch = useDispatch();

    // _______________________________UseEffects___________________________\\
    // useEffect to sync filter value with redux on first load
    useEffect(() => {
        if (options.searchFilter !== options.defaultValueforFilter) {
            const value = options.values.find(
                (option) => option.value === options.searchFilter.toString()
            );
            setPlaceHolder(value.label);
        }
    }, []); //eslint-disable-line

    // useEffect to Update filter when reset filters is clicked
    useEffect(() => {
        if (options.searchFilter === options.defaultValueforFilter) {
            setPlaceHolder(options.placeholder);
        }
    }, [options.searchFilter, options.defaultValueforFilter, options.placeholder]);

    const handelChange = (e) => {
        // console.log(e.value);
        if (!e.value) {
            dispatch(options.reduxFunction(options.defaultValueforFilter));
            setPlaceHolder(options.placeholder);
        } else {
            dispatch(options.reduxFunction(e.value));
            setPlaceHolder(e.value);
        }
    };

    const itemTemplate = (option) => (
        <div className={`Search__Filters-Item Search__Filters-Item-${options.theme}`}>
            {option.label}
        </div>
    );

    const selectedItemTemplate = (option) => {
        if (option) {
            return (
                <div
                    className={`Search__Filters-Item__Value Search__Filters-Item__Value-${options.theme}`}
                >
                    <div>{option.label}</div>
                </div>
            );
        }

        return (
            <div
                className={`Search__Filters-Item__Value Search__Filters-Item__Value-${options.theme}`}
            >
                <div>{placeholder}</div>
            </div>
        );
    };

    let reducedFilterValues = options.values;
    if (options.reducerFunction) {
        reducedFilterValues = options.reducerFunction(options.values);
    }

    return (
        <Dropdown
            value={placeholder}
            options={reducedFilterValues}
            onChange={handelChange}
            className={`Search__Filters-Select Search__Filters-Select-${options.theme}`}
            valueTemplate={selectedItemTemplate}
            itemTemplate={itemTemplate}
            placeholder={placeholder}
            showClear
            panelClassName={`Search__Filters-Select__Panel Search__Filters-Select__Panel-${options.theme}`}
        />
    );
};

SearchFilter.propTypes = {
    options: PropTypes.shape({
        placeholder: PropTypes.string.isRequired,
        searchFilter: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        defaultValueforFilter: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        values: PropTypes.arrayOf(
            PropTypes.shape({
                value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
                label: PropTypes.string.isRequired,
            })
        ).isRequired,
        theme: PropTypes.string.isRequired,
        reduxFunction: PropTypes.func.isRequired,
        reducerFunction: PropTypes.func,
    }).isRequired,
};

export default SearchFilter;
