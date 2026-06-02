'use client';

// Dev-only verification harness for the schedule-showings print packet.
// App Router route (bypasses pages/_app.jsx auth/persist gating) → /dev-print-preview.
// Renders <PrintableTourPacket> visibly with a full-detail fixture so the print
// components can be screenshotted / inspected (via scripts/print-shot.mjs and
// scripts/print-check.mjs) without auth or a backend. The parent page.jsx guards
// this so it 404s in production — it must only be reachable in local dev.

import '../../styles/tailwind.css';
import '../../styles/design-tokens.css';
// Load PrimeFlex AFTER Tailwind to faithfully reproduce the real Pages-Router
// packet environment (pages/_app.jsx loads primeflex after tailwind). PrimeFlex
// hijacks `.grid` (display:flex + negative margins) — without this the harness
// silently hides the grid-collision layout bugs that appear in real Chrome print.
import 'primeflex/primeflex.css';
import PrintableTourPacket from '../../components/Print/PrintableTourPacket';

// ImageKit demo base — passes through ikUrl() unchanged and responds fast, so the
// harness renders real images (unknown ?preset params are ignored by ImageKit;
// ?tr= transforms are honored). Fixture only — not real listing photos.
const DEMO = 'https://ik.imagekit.io/demo/img';
const pics = (a, b, c, d) => [
    { media_url: `${DEMO}/${a}` },
    { media_url: `${DEMO}/${b}` },
    { media_url: `${DEMO}/${c}` },
    { media_url: `${DEMO}/${d}` },
];

const fullStop = (overrides) => ({
    mls_number: 'NDP000111',
    address: '1234 Seabreeze Lane',
    unit_number: '',
    city: 'La Jolla',
    state: 'CA',
    zip_code: '92037',
    price: '$2,450,000',
    price_raw: 2450000,
    bedrooms: 4,
    bathrooms: 3,
    sqft_raw: 2840,
    year_built: 1998,
    property_sub_type: 'Single Family Residence',
    levels: 'U',
    lot_size_acres: 0.21,
    association_fee: 145,
    occupant_type: 'Owner',
    list_agent_name: 'Dana Whitfield',
    list_agent_phone: '858-555-0142',
    list_agent_email: 'dana@coastalrealty.com',
    list_office_name: 'Coastal Realty Group',
    showing_instructions: 'Call listing agent 30 minutes ahead. Lockbox on side gate; remove shoes inside.',
    private_remarks: 'Seller motivated. Do not discuss price in front of tenant. Solar is owned.',
    coordinates: { lat: 32.842, lng: -117.272 },
    listing_pictures: pics('image1.jpeg', 'image2.jpeg', 'plant.jpeg', 'image2.jpeg'),
    status: 'confirmed',
    note: 'Client loved the kitchen photos — prioritize backyard + primary suite.',
    scheduled_time: '2026-06-07T17:30:00.000Z',
    ...overrides,
});

const stops = [
    fullStop(),
    fullStop({
        mls_number: 'NDP000222',
        address: '88 Cliffside Terrace',
        city: 'Del Mar',
        zip_code: '92014',
        price: '$3,100,000',
        price_raw: 3100000,
        bedrooms: 5,
        bathrooms: 4,
        sqft_raw: 3620,
        year_built: 2015,
        association_fee: 0,
        listing_pictures: pics('plant.jpeg', 'image1.jpeg', 'image2.jpeg', 'image1.jpeg'),
        status: 'requested',
        note: '',
        scheduled_time: '2026-06-07T18:45:00.000Z',
    }),
    // Resilience case: slim fallback stop (detail fetch failed) — scalars only, no photos.
    {
        mls_number: 'NDP000333',
        address: '17 Marisol Court',
        city: 'Encinitas',
        state: 'CA',
        zip_code: '92024',
        price: '',
        coordinates: null,
        mapUnavailable: true,
        status: 'pending',
        note: '',
        scheduled_time: null,
    },
];

const agent = {
    name: 'Andrew Nefcy',
    image: `${DEMO}/image1.jpeg`,
    title: 'Broker / Owner',
    display_email: 'andrew@icerealtygroup.com',
    email: 'andrew@icerealtygroup.com',
    phone: '619-555-0100',
    dre_license: '02012345',
};

const client = { first_name: 'Jordan', last_name: 'Avery', email: 'jordan.avery@example.com' };

const rootStyle = {
    width: '8.5in',
    margin: '0 auto',
    padding: '0.5in',
    background: '#ffffff',
    color: '#111827',
    fontFamily: 'Lato, Arial, sans-serif',
    fontSize: '12px',
    lineHeight: 1.45,
    // Mirror PrintDocumentShell's Chunk-E rule so a printBackground:false PDF of
    // this harness exercises the same background-forcing behavior.
    printColorAdjust: 'exact',
    WebkitPrintColorAdjust: 'exact',
};

export default function PrintPreviewHarness() {
    return (
        <div style={{ background: '#9ca3af', minHeight: '100vh', padding: '24px 0' }}>
            <div style={rootStyle} className="print-document-root-preview">
                <PrintableTourPacket
                    name="Avery Family — Coastal Tour"
                    client={client}
                    agent={agent}
                    scheduledDate="2026-06-07T16:00:00.000Z"
                    stops={stops}
                    generatedAt={new Date('2026-06-01T18:00:00.000Z')}
                    hasUnsavedChanges={false}
                />
            </div>
        </div>
    );
}
