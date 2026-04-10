import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

/**
 * Auth.js v5 configuration — Google OAuth bridge.
 *
 * next-auth is NOT the real auth system. It exists solely to:
 *   1. Handle the Google OAuth popup/redirect flow
 *   2. Capture Google's id_token
 *   3. Ferry that id_token to the client via a short-lived JWT session
 *   4. The login page POSTs the id_token to /auth/google-login (CRM backend)
 *   5. The CRM backend returns its own JWT → stored in Redux
 *   6. The next-auth session is immediately destroyed via signOut()
 *
 * Session TTL is 5 minutes — just long enough to complete the handoff.
 */
export const { handlers, auth } = NextAuth({
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: {
                params: {
                    prompt: 'select_account',
                },
            },
        }),
    ],

    session: {
        strategy: 'jwt',
        maxAge: 5 * 60, // 5 minutes
    },

    callbacks: {
        /**
         * jwt callback — fires on sign-in and on every session check.
         * On first sign-in, `account` contains Google's OAuth tokens.
         *
         * We stash account.id_token (Google's signed JWT) so the session
         * callback can expose it to the client. The CRM backend verifies
         * this token via OAuth2Client.verifyIdToken().
         */
        async jwt({ token, account }) {
            if (account) {
                token.googleIdToken = account.id_token;
            }
            return token;
        },

        /**
         * session callback — expose the Google id_token so the client
         * can read session.googleIdToken and POST it to the CRM backend
         * as the `credential` field in /auth/google-login.
         */
        async session({ session, token }) {
            session.googleIdToken = token.googleIdToken;
            return session;
        },
    },

    pages: {
        signIn: '/',
        error: '/',
    },
});
