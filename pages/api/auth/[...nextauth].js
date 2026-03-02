import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: {
                params: {
                    prompt: 'select_account',
                },
            },
        }),
    ],

    // JWT strategy — no database needed; next-auth session is transient
    session: {
        strategy: 'jwt',
        // Short TTL — this session only ferries the Google id_token to the
        // login page. Real auth lives in Redux (CRM JWT).
        maxAge: 5 * 60, // 5 minutes
    },

    callbacks: {
        /**
         * jwt callback — fires on sign-in and on every session check.
         * On first sign-in, `account` contains Google's tokens.
         */
        async jwt({ token, account }) {
            if (account) {
                // account.id_token is the Google-signed JWT that the CRM
                // backend verifies via OAuth2Client.verifyIdToken()
                token.googleIdToken = account.id_token;

                if (process.env.NODE_ENV === 'development') {
                    console.log('[next-auth jwt] account keys:', Object.keys(account));
                    console.log('[next-auth jwt] id_token present:', !!account.id_token);
                }
            }
            return token;
        },

        /**
         * session callback — expose the Google id_token so the client
         * can POST it to the CRM backend as `credential`.
         */
        async session({ session, token }) {
            session.googleIdToken = token.googleIdToken;
            return session;
        },
    },

    // Custom pages — use the CRM login page for sign-in and errors
    pages: {
        signIn: '/',
        error: '/',
    },

    debug: process.env.NODE_ENV === 'development',
};

export default NextAuth(authOptions);
