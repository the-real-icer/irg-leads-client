import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';

const PrintStyles = () => (
    <style>
        {`
            @media screen {
                .print-document-root {
                    display: none;
                }
            }

            @media print {
                @page {
                    size: Letter;
                    margin: 0.5in;
                }

                html,
                body {
                    background: #ffffff !important;
                }

                body.printing-tour-packet #__next {
                    display: none !important;
                }

                body.printing-tour-packet .print-document-root {
                    display: block !important;
                }

                .print-document-root {
                    display: none;
                    width: 100%;
                    background: #ffffff;
                    color: #111827;
                    font-family: Lato, Arial, sans-serif;
                    font-size: 12px;
                    line-height: 1.45;
                }

                .print-page {
                    min-height: 9.8in;
                    break-after: page;
                    page-break-after: always;
                }

                .print-page:last-child {
                    break-after: auto;
                    page-break-after: auto;
                }

                .print-avoid-break {
                    break-inside: avoid;
                    page-break-inside: avoid;
                }

                .print-image {
                    print-color-adjust: exact;
                    -webkit-print-color-adjust: exact;
                }
            }
        `}
    </style>
);

const PrintDocumentShell = ({ children }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || typeof document === 'undefined') return null;

    return createPortal(
        <div className="print-document-root">
            <PrintStyles />
            {children}
        </div>,
        document.body,
    );
};

PrintDocumentShell.propTypes = {
    children: PropTypes.node.isRequired,
};

export default PrintDocumentShell;
