import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

import PrintablePropertySheet from '../../../../components/Print/PrintablePropertySheet';

const API_PREFIX = '/api/v1';
const PRINT_TOKEN_NOT_FOUND_STATUSES = new Set([400, 401, 404]);

const normalizeBaseUrl = (value) => String(value || '').trim().replace(/\/+$/, '');

const baseIncludesApiPrefix = (base) => {
    try {
        const pathname = new URL(base).pathname.replace(/\/+$/, '');
        return pathname === API_PREFIX || pathname.endsWith(API_PREFIX);
    } catch {
        const normalized = base.replace(/\/+$/, '');
        return normalized === API_PREFIX || normalized.endsWith(API_PREFIX);
    }
};

const getPrintResolveEndpoint = () => {
    const internalBase = normalizeBaseUrl(process.env.INTERNAL_API_BASE_URL);
    const publicBase = normalizeBaseUrl(process.env.NEXT_PUBLIC_IRG_API_URL);
    const base = internalBase || publicBase;

    if (!base) {
        throw new Error('Print resolver API base is not configured');
    }

    const resolvePath = baseIncludesApiPrefix(base) ? '/print/_resolve' : `${API_PREFIX}/print/_resolve`;

    return {
        url: `${base}${resolvePath}`,
        internalApiBaseConfigured: Boolean(internalBase),
    };
};

const logPrintResolverFailure = ({
    statusCode = null,
    renderAddress,
    internalApiBaseConfigured,
    reason,
}) => {
    process.stderr.write(`${JSON.stringify({
        event: 'print_resolver_failed',
        statusCode,
        renderAddress,
        internalApiBaseConfigured,
        reason,
    })}\n`);
};

export default async function PrintPropertyPage({ params }) {
    // Next.js 15 made params and headers() async; await both for server rendering.
    const { address } = await params;
    const headersList = await headers();
    const token = headersList.get('authorization');

    if (!token) notFound();

    let endpoint;
    try {
        // Server-side only: Puppeteer resolves the signed print token without browser session cookies.
        endpoint = getPrintResolveEndpoint();
    } catch {
        const internalApiBaseConfigured = Boolean(normalizeBaseUrl(process.env.INTERNAL_API_BASE_URL));
        logPrintResolverFailure({
            renderAddress: address,
            internalApiBaseConfigured,
            reason: 'missing_api_base',
        });
        throw new Error(
            'Print resolver API base is not configured. Set INTERNAL_API_BASE_URL or NEXT_PUBLIC_IRG_API_URL.',
        );
    }

    let response;
    try {
        response = await fetch(endpoint.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: token },
            body: JSON.stringify({ kind: 'property' }),
            cache: 'no-store',
        });
    } catch {
        logPrintResolverFailure({
            renderAddress: address,
            internalApiBaseConfigured: endpoint.internalApiBaseConfigured,
            reason: 'request_failed',
        });
        throw new Error('Print resolver request failed. Check the server-side CRM backend API base URL.');
    }

    if (!response.ok) {
        if (PRINT_TOKEN_NOT_FOUND_STATUSES.has(response.status)) {
            notFound();
        }

        logPrintResolverFailure({
            statusCode: response.status,
            renderAddress: address,
            internalApiBaseConfigured: endpoint.internalApiBaseConfigured,
            reason: 'unexpected_status',
        });
        throw new Error(`Print resolver returned HTTP ${response.status}`);
    }

    let data;
    try {
        data = await response.json();
    } catch {
        logPrintResolverFailure({
            statusCode: response.status,
            renderAddress: address,
            internalApiBaseConfigured: endpoint.internalApiBaseConfigured,
            reason: 'invalid_json',
        });
        throw new Error('Print resolver returned an invalid response body');
    }

    const property = data?.property;
    const agent = data?.agent || null;

    if (!property) {
        logPrintResolverFailure({
            statusCode: response.status,
            renderAddress: address,
            internalApiBaseConfigured: endpoint.internalApiBaseConfigured,
            reason: 'missing_property',
        });
        throw new Error('Print resolver returned no property data');
    }

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
