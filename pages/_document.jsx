import { Html, Head, Main, NextScript } from 'next/document';

// Inline script prevents flash of wrong theme on page load.
// Runs before React hydration — reads localStorage or system preference
// and applies the dark class immediately.
const themeScript = `
(function() {
    var t = localStorage.getItem('irg-theme');
    if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    }
})();
`;

export default function Document() {
    return (
        <Html lang="en">
            <Head>
                <script dangerouslySetInnerHTML={{ __html: themeScript }} />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
