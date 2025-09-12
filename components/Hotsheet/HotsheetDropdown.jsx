// React
// import React from 'react';
import PropTypes from 'prop-types';

// Third Party Components
import { Dropdown } from 'primereact/dropdown';

const HotsheetDropdown = (props) => {
    const { value, options, onChange } = props;

    const selectedTemplate = () => <span className="hotsheet__dropdown__selected">{value}</span>;

    const optionTemplate = (option) => (
        <div className="hotsheet__dropdown__item">
            <div>{option.name}</div>
        </div>
    );

    return (
        <Dropdown
            value={value}
            options={options}
            onChange={onChange}
            filter
            showClear
            filterBy="name"
            valueTemplate={selectedTemplate}
            itemTemplate={optionTemplate}
            className="hotsheet__dropdown"
            panelClassName="hotsheet__dropdown__panel"
            placeholder={value}
        />
    );
};

HotsheetDropdown.propTypes = {
    options: PropTypes.array.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default HotsheetDropdown;
