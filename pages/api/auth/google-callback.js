/**
 * API route: receives Google's form POST in redirect auth mode.
 * Extracts the credential JWT and redirects to the client callback page
 * with the credential in the URL hash (hash is not sent to servers).
 */
export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.redirect(302, '/?error=invalid_method');
    }

    const credential = req.body?.credential;

    if (!credential) {
        return res.redirect(302, '/?error=no_credential');
    }

    res.redirect(
        302,
        `/auth/google/callback#credential=${encodeURIComponent(credential)}`,
    );
}
