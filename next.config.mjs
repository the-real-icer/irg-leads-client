/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: "default-src 'self' *; connect-src *; font-src *; img-src https://ice-realty-group.s3-us-west-1.amazonaws.com data: *; script-src https://apis.google.com http://localhost https://*.icerealtygroup.com https://icerealtygroup.com 'self' 'unsafe-eval' 'unsafe-inline' *.google.com *; style-src http://localhost https://*.icerealtygroup.com https://icerealtygroup.com 'self' 'unsafe-inline' *",
                    },
                ],
            },
        ];
    },
    images: {
        domains: ['https://media.crmls.org', 'media.crmls.org'],
    },
    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;
