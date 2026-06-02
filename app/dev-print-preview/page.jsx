import { notFound } from 'next/navigation';

import PrintPreviewHarness from './PrintPreviewHarness';

// Dev-only verification harness for the schedule-showings print packet
// (route: /dev-print-preview). GUARD: this route must never be reachable in
// production. As a server component the NODE_ENV check runs at build/request
// time, so a production build statically resolves this to a 404 and the harness
// (and its fixtures) is never served. In local dev it renders the packet for
// screenshot/inspection via scripts/print-shot.mjs and scripts/print-check.mjs.
export default function DevPrintPreviewPage() {
    if (process.env.NODE_ENV === 'production') {
        notFound();
    }

    return <PrintPreviewHarness />;
}
