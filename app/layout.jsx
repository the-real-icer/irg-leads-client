// Root layout for App Router pages.
// Pages Router routes (everything except this layout, the auth handler,
// and the _print/* tree) continue to be served via pages/_app.jsx —
// Next.js 15 supports this hybrid configuration natively.
//
// Deliberately minimal: no Redux Provider, no SessionProvider, no Inter
// font wrapper, no ToastContainer. Print pages mount their own clean
// shell so nothing from the on-screen CRM bleeds into PDF output.
export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body style={{ margin: 0 }}>{children}</body>
        </html>
    );
}
