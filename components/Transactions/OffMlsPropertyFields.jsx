import dynamic from 'next/dynamic';
import PropTypes from 'prop-types';

import styles from './OffMlsPropertyFields.module.css';

// Dynamic imports match the house style in pages/transactions/* — keeps
// PrimeReact out of the SSR bundle.
const InputText = dynamic(
    () => import('primereact/inputtext').then((mod) => mod.InputText),
    { ssr: false },
);
const Dropdown = dynamic(
    () => import('primereact/dropdown').then((mod) => mod.Dropdown),
    { ssr: false },
);

// ── Property-type enum ────────────────────────────────────────────
// MUST match the server enum at Apps/Backend/server/models/
// transactionModel.js `VALID_OFF_MLS_PROPERTY_TYPES`. The server will
// reject any value not in this list; changes here MUST be mirrored
// server-side and vice versa.
export const OFF_MLS_PROPERTY_TYPES = [
    'Single Family',
    'Condo',
    'Townhouse',
    'Multi-Family',
    'Land',
    'Manufactured',
    'Other',
];

const propertyTypeOptions = OFF_MLS_PROPERTY_TYPES.map((t) => ({
    label: t,
    value: t,
}));

// Shared label style — kept inline because we also want the
// required-indicator asterisk slot consistently. Pure Tailwind.
const LABEL_CLASS = 'text-[12px] text-foreground/70';

// Controlled component. Parent holds the state; each input calls
// `onChange({ fieldName: newValue })` with a partial update which the
// parent merges via setState((prev) => ({ ...prev, ...updates })).
const OffMlsPropertyFields = ({ value, onChange }) => {
    const handle = (field) => (e) => onChange({ [field]: e.target.value });
    const handleDropdown = (field) => (e) => onChange({ [field]: e.value });

    return (
        <div
            className={
                'rounded-[12px] border border-border bg-surface '
                + 'p-[16px] flex flex-col gap-[12px]'
            }
        >
            <div className="text-[14px] font-semibold text-foreground">
                Off-MLS Property Details
            </div>

            {/* Address — full width */}
            <div className="flex flex-col gap-[4px]">
                <label htmlFor="off-mls-address" className={LABEL_CLASS}>
                    Address *
                </label>
                <InputText
                    id="off-mls-address"
                    value={value.address}
                    onChange={handle('address')}
                    placeholder="123 Main St"
                    style={{ width: '100%' }}
                />
            </div>

            {/* City / State / Zip */}
            <div className={styles.cityStateZipGrid}>
                <div className="flex flex-col gap-[4px]">
                    <label htmlFor="off-mls-city" className={LABEL_CLASS}>
                        City *
                    </label>
                    <InputText
                        id="off-mls-city"
                        value={value.city}
                        onChange={handle('city')}
                        placeholder="San Diego"
                        style={{ width: '100%' }}
                    />
                </div>
                <div className="flex flex-col gap-[4px]">
                    <label htmlFor="off-mls-state" className={LABEL_CLASS}>
                        State *
                    </label>
                    <InputText
                        id="off-mls-state"
                        value={value.state}
                        onChange={handle('state')}
                        placeholder="CA"
                        maxLength={2}
                        style={{ width: '100%', textTransform: 'uppercase' }}
                    />
                </div>
                <div className="flex flex-col gap-[4px]">
                    <label htmlFor="off-mls-zip" className={LABEL_CLASS}>
                        Zip *
                    </label>
                    <InputText
                        id="off-mls-zip"
                        value={value.zipCode}
                        // Strip non-digits on input so we can safely
                        // parseInt on submit without format errors.
                        onChange={(e) => onChange({
                            zipCode: e.target.value.replace(/\D/g, '').slice(0, 5),
                        })}
                        placeholder="92101"
                        inputMode="numeric"
                        style={{ width: '100%' }}
                    />
                </div>
            </div>

            {/* Property Type — full width */}
            <div className="flex flex-col gap-[4px]">
                <label htmlFor="off-mls-property-type" className={LABEL_CLASS}>
                    Property Type *
                </label>
                <Dropdown
                    id="off-mls-property-type"
                    value={value.propertyType}
                    options={propertyTypeOptions}
                    onChange={handleDropdown('propertyType')}
                    placeholder="Select type"
                    style={{ width: '100%' }}
                />
            </div>

            {/* Beds / Baths / Sqft */}
            <div className={styles.bedsBathsSqftGrid}>
                <div className="flex flex-col gap-[4px]">
                    <label htmlFor="off-mls-bedrooms" className={LABEL_CLASS}>
                        Bedrooms *
                    </label>
                    <InputText
                        id="off-mls-bedrooms"
                        value={value.bedrooms}
                        onChange={(e) => onChange({
                            bedrooms: e.target.value.replace(/\D/g, ''),
                        })}
                        placeholder="3"
                        inputMode="numeric"
                        style={{ width: '100%' }}
                    />
                </div>
                <div className="flex flex-col gap-[4px]">
                    <label htmlFor="off-mls-bathrooms" className={LABEL_CLASS}>
                        Bathrooms *
                    </label>
                    <InputText
                        id="off-mls-bathrooms"
                        value={value.bathrooms}
                        // Bathrooms permit halves (e.g. 2.5) — allow
                        // digits + one dot.
                        onChange={(e) => onChange({
                            bathrooms: e.target.value.replace(/[^\d.]/g, ''),
                        })}
                        placeholder="2"
                        inputMode="decimal"
                        style={{ width: '100%' }}
                    />
                </div>
                <div className="flex flex-col gap-[4px]">
                    <label htmlFor="off-mls-sqft" className={LABEL_CLASS}>
                        Sqft
                    </label>
                    <InputText
                        id="off-mls-sqft"
                        value={value.sqft}
                        onChange={(e) => onChange({
                            sqft: e.target.value.replace(/\D/g, ''),
                        })}
                        placeholder="1800"
                        inputMode="numeric"
                        style={{ width: '100%' }}
                    />
                </div>
            </div>
        </div>
    );
};

OffMlsPropertyFields.propTypes = {
    value: PropTypes.shape({
        address: PropTypes.string,
        city: PropTypes.string,
        state: PropTypes.string,
        zipCode: PropTypes.string,
        propertyType: PropTypes.string,
        bedrooms: PropTypes.string,
        bathrooms: PropTypes.string,
        sqft: PropTypes.string,
    }).isRequired,
    onChange: PropTypes.func.isRequired,
};

export default OffMlsPropertyFields;
