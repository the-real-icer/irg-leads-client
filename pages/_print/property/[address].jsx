import axios from 'axios';
import { useEffect } from 'react';
import PropTypes from 'prop-types';

import PrintablePropertySheet from '../../../components/Print/PrintablePropertySheet';

const INTERNAL_API_BASE = process.env.INTERNAL_API_BASE_URL || 'http://127.0.0.1:4000';

export const getServerSideProps = async (ctx) => {
    const authHeader = ctx.req.headers.authorization;
    if (!authHeader) return { notFound: true };

    try {
        const response = await axios.post(
            `${INTERNAL_API_BASE}/api/v1/print/_resolve`,
            { kind: 'property' },
            { headers: { Authorization: authHeader }, timeout: 10_000 },
        );
        const { property, agent } = response.data || {};
        if (!property) return { notFound: true };
        return { props: { property, agent: agent || null } };
    } catch {
        return { notFound: true };
    }
};

const PropertyPrintPage = ({ property, agent }) => {
    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.__printReady = true;
        }
    }, []);

    return (
        <>
            <style>
                {`
                    @font-face {
                        font-family: 'Lato';
                        font-style: normal;
                        font-weight: 400;
                        font-display: swap;
                        src: url('/fonts/lato/lato-regular.woff2') format('woff2');
                    }
                    @font-face {
                        font-family: 'Lato';
                        font-style: normal;
                        font-weight: 700;
                        font-display: swap;
                        src: url('/fonts/lato/lato-bold.woff2') format('woff2');
                    }
                    html, body { margin: 0; padding: 0; background: #ffffff; color: #111827; }
                    .Toastify, .Toastify__toast-container { display: none !important; }
                    @page { size: Letter; margin: 0.5in; }
                    .print-page { break-after: page; page-break-after: always; }
                    .print-page:last-child { break-after: auto; page-break-after: auto; }
                    .print-avoid-break { break-inside: avoid; page-break-inside: avoid; }
                    .print-image { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
                `}
            </style>
            <main style={{ fontFamily: '"Lato", Arial, sans-serif', fontSize: '12px', lineHeight: 1.45 }}>
                <PrintablePropertySheet property={property} agentContact={agent} />
            </main>
        </>
    );
};

PropertyPrintPage.propTypes = {
    property: PropTypes.shape({}).isRequired,
    agent: PropTypes.shape({}),
};

PropertyPrintPage.defaultProps = {
    agent: null,
};

export default PropertyPrintPage;
