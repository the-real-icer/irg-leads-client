/**
 * API route: receives Google's form POST in redirect auth mode.
 * Google sends Content-Type: application/x-www-form-urlencoded (NOT JSON),
 * so we disable Next.js default body parser and parse manually.
 */

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
    if (req.method !== 'POST') {
        return res.redirect(302, '/?error=invalid_method');
    }

    try {
        const rawBody = await getRawBody(req);
        const params = new URLSearchParams(rawBody);
        const credential = params.get('credential');

        if (!credential) {
            return res.redirect(302, '/?error=no_credential');
        }

        // Verify Google's CSRF token — Google sends g_csrf_token in both
        // the POST body and a cookie. Both must be present and match.
        const csrfTokenBody = params.get('g_csrf_token');
        const csrfTokenCookie = req.cookies?.g_csrf_token;

        if (!csrfTokenBody || !csrfTokenCookie) {
            return res.redirect(302, '/?error=csrf_missing');
        }
        if (csrfTokenBody !== csrfTokenCookie) {
            return res.redirect(302, '/?error=csrf_mismatch');
        }

        return res.redirect(
            302,
            `/auth/google/callback#credential=${encodeURIComponent(credential)}`,
        );
    } catch (error) {
        return res.redirect(302, '/?error=callback_failed');
    }
}
