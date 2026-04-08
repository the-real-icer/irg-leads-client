import Head from 'next/head';

const MainHead = ({ title = 'CRM' }) => (
    <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
        <meta
            httpEquiv="Accept-CH"
            content="viewport-width, width, device-memory, dpr, downlink, ect, DPR, Width"
        />
        <title>{title ? `${title} | IRG` : 'CRM | IRG'}</title>
        <link rel="icon" type="image/png" sizes="64x64" href="/favicon64.png" />
    </Head>
);

export default MainHead;
