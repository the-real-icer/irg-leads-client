/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // CSP is handled exclusively by Helmet in server.js — do not set a
    // second Content-Security-Policy header here. Browsers enforce ALL CSP
    // headers (most restrictive wins), so having two sources is error-prone.
    images: {
        domains: ['media.crmls.org'],
    },
    eslint: {
        ignoreDuringBuilds: false,
    },
};

export default nextConfig;
