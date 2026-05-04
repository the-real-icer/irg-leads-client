import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

import PrintablePropertySheet from '../../../../components/Print/PrintablePropertySheet';

const INTERNAL_API_BASE = process.env.INTERNAL_API_BASE_URL || 'http://127.0.0.1:4000';

export default async function PrintPropertyPage({ params }) {
    // Next.js 15 made params and headers() async — must await.
    // The URL address segment is for routing/debugging; the authoritative
    // address is in the verified token payload server-side.
    const { address: _address } = await params;
    const headersList = await headers();
    const token = headersList.get('authorization');

    if (!token) notFound();

    let data = null;
    try {
        const response = await fetch(`${INTERNAL_API_BASE}/api/v1/print/_resolve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: token },
            body: JSON.stringify({ kind: 'property' }),
            cache: 'no-store',
        });
        if (response.ok) {
            data = await response.json();
        }
    } catch {
        // network/parse error — falls through to notFound() below
    }

    const property = data?.property;
    const agent = data?.agent || null;

    if (!property) notFound();

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
}
