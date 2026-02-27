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
        domains: ['media.crmls.org'],
    },
    eslint: {
        ignoreDuringBuilds: false,
    },
};

export default nextConfig;
