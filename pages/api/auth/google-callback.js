/**
 * API route: receives Google's form POST in redirect auth mode.
 * Google sends Content-Type: application/x-www-form-urlencoded (NOT JSON),
 * so we disable Next.js default body parser and parse manually.
 */

// Disable Next.js default body parser — it may not handle form-urlencoded
export const config = {
    api: {
        bodyParser: false,
    },
};

const getRawBody = (req) =>
    new Promise((resolve, reject) => {
        let data = '';
        req.on('data', (chunk) => {
            data += chunk;
        });
        req.on('end', () => resolve(data));
        req.on('error', reject);
    });

export default async function handler(req, res) {
    console.log('[Google Callback API] ▶ Request received'); // eslint-disable-line
    console.log('[Google Callback API] Method:', req.method); // eslint-disable-line
    console.log('[Google Callback API] Content-Type:', req.headers['content-type']); // eslint-disable-line
    console.log('[Google Callback API] URL:', req.url); // eslint-disable-line

    if (req.method !== 'POST') {
        console.log('[Google Callback API] ❌ Not a POST, redirecting to login'); // eslint-disable-line
        return res.redirect(302, '/?error=invalid_method');
    }

    try {
        // Manually parse the form-urlencoded body
        console.log('[Google Callback API] Parsing raw body...'); // eslint-disable-line
        const rawBody = await getRawBody(req);
        console.log('[Google Callback API] Raw body length:', rawBody.length); // eslint-disable-line
        console.log('[Google Callback API] Raw body (first 200 chars):', rawBody.substring(0, 200)); // eslint-disable-line

        const params = new URLSearchParams(rawBody);
        const credential = params.get('credential');
        const gCsrfToken = params.get('g_csrf_token');

        console.log('[Google Callback API] credential:', credential ? `present, length: ${credential.length}` : 'MISSING'); // eslint-disable-line
        console.log('[Google Callback API] g_csrf_token:', gCsrfToken ? 'present' : 'MISSING'); // eslint-disable-line

        if (!credential) {
            console.error('[Google Callback API] ❌ No credential in form body'); // eslint-disable-line
            return res.redirect(302, '/?error=no_credential');
        }

        const redirectUrl = `/auth/google/callback#credential=${encodeURIComponent(credential)}`;
        console.log('[Google Callback API] ✅ Redirecting to:', redirectUrl.substring(0, 80) + '...'); // eslint-disable-line

        return res.redirect(302, redirectUrl);
    } catch (error) {
        console.error('[Google Callback API] ❌ CRASHED'); // eslint-disable-line
        console.error('[Google Callback API] Error message:', error.message); // eslint-disable-line
        console.error('[Google Callback API] Error stack:', error.stack); // eslint-disable-line
        console.error('[Google Callback API] Error type:', error.constructor.name); // eslint-disable-line

        return res.status(500).json({
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        });
    }
}
