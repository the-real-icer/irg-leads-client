/** @type {import('tailwindcss').Config} */
const config = {
    content: ['./pages/**/*.{js,jsx}', './components/**/*.{js,jsx}'],

    // Dark mode via class — toggle by adding class="dark" to <html> or <body>
    darkMode: 'class',

    // Safelist classes that are generated at runtime via template literals
    // and therefore invisible to Tailwind's JIT scanner. Schedule Showings
    // builds `bg-tour-stop-${tailwindKey}` / `text-tour-stop-*` / `ring-
    // tour-stop-*` dynamically for status badges, pill selectors, and
    // marker ring states.
    //
    // Patterns with `\/\d+` alternation DON'T enumerate opacity variants
    // exhaustively — Tailwind's safelist needs each opacity value spelled
    // out in bounded alternation. The opacity values below (`15`, `40`)
    // match the actual usage in TourList.jsx and StopEditDialog.jsx; if
    // you add a new opacity (e.g. `/20`), add it here too.
    safelist: [
        {
            pattern:
                /^bg-tour-stop-(pending|requested|confirmed|not-available|showed|skipped)$/,
        },
        {
            pattern:
                /^bg-tour-stop-(pending|requested|confirmed|not-available|showed|skipped)\/(15|40)$/,
        },
        {
            pattern:
                /^text-tour-stop-(pending|requested|confirmed|not-available|showed|skipped)$/,
        },
        {
            pattern:
                /^ring-tour-stop-(pending|requested|confirmed|not-available|showed|skipped)$/,
        },
        {
            pattern:
                /^ring-tour-stop-(pending|requested|confirmed|not-available|showed|skipped)\/(15|40)$/,
        },
        {
            pattern:
                /^border-tour-stop-(pending|requested|confirmed|not-available|showed|skipped)$/,
        },
    ],

    theme: {
        extend: {
            /* ──────────────────────────────────────────────────────────
               COLORS — Semantic tokens (reference CSS vars from design-tokens.css)
               These auto-switch between light/dark mode.
               Supports opacity modifiers: bg-primary/50, text-foreground/80
               ────────────────────────────────────────────────────────── */
            colors: {
                background: 'hsl(var(--background) / <alpha-value>)',
                foreground: 'hsl(var(--foreground) / <alpha-value>)',
                'foreground-muted': 'hsl(var(--foreground-muted) / <alpha-value>)',

                surface: {
                    DEFAULT: 'hsl(var(--surface) / <alpha-value>)',
                    elevated: 'hsl(var(--surface-elevated) / <alpha-value>)',
                },

                primary: {
                    DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
                    foreground: 'hsl(var(--primary-foreground) / <alpha-value>)',
                    hover: 'hsl(var(--primary-hover) / <alpha-value>)',
                },

                secondary: {
                    DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
                    foreground: 'hsl(var(--secondary-foreground) / <alpha-value>)',
                    hover: 'hsl(var(--secondary-hover) / <alpha-value>)',
                },

                accent: {
                    DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
                    foreground: 'hsl(var(--accent-foreground) / <alpha-value>)',
                },

                success: {
                    DEFAULT: 'hsl(var(--success) / <alpha-value>)',
                    foreground: 'hsl(var(--success-foreground) / <alpha-value>)',
                },

                warning: {
                    DEFAULT: 'hsl(var(--warning) / <alpha-value>)',
                    foreground: 'hsl(var(--warning-foreground) / <alpha-value>)',
                },

                danger: {
                    DEFAULT: 'hsl(var(--danger) / <alpha-value>)',
                    foreground: 'hsl(var(--danger-foreground) / <alpha-value>)',
                },

                muted: {
                    DEFAULT: 'hsl(var(--muted) / <alpha-value>)',
                    foreground: 'hsl(var(--muted-foreground) / <alpha-value>)',
                },

                border: 'hsl(var(--border) / <alpha-value>)',
                'border-subtle': 'hsl(var(--border-subtle) / <alpha-value>)',
                input: 'hsl(var(--input) / <alpha-value>)',
                ring: 'hsl(var(--ring) / <alpha-value>)',

                // Sidebar
                sidebar: {
                    DEFAULT: 'hsl(var(--sidebar) / <alpha-value>)',
                    foreground: 'hsl(var(--sidebar-foreground) / <alpha-value>)',
                    border: 'hsl(var(--sidebar-border) / <alpha-value>)',
                    accent: 'hsl(var(--sidebar-accent) / <alpha-value>)',
                    'accent-foreground':
                        'hsl(var(--sidebar-accent-foreground) / <alpha-value>)',
                },

                // Lead status badges
                status: {
                    watch: 'hsl(var(--status-watch) / <alpha-value>)',
                    hot: 'hsl(var(--status-hot) / <alpha-value>)',
                    qualify: 'hsl(var(--status-qualify) / <alpha-value>)',
                    new: 'hsl(var(--status-new) / <alpha-value>)',
                    nurture: 'hsl(var(--status-nurture) / <alpha-value>)',
                    trash: 'hsl(var(--status-trash) / <alpha-value>)',
                    archive: 'hsl(var(--status-archive) / <alpha-value>)',
                    pending: 'hsl(var(--status-pending) / <alpha-value>)',
                    closed: 'hsl(var(--status-closed) / <alpha-value>)',
                },

                // Tour stop statuses (Schedule Showings feature)
                'tour-stop': {
                    pending: 'hsl(var(--tour-stop-pending) / <alpha-value>)',
                    requested: 'hsl(var(--tour-stop-requested) / <alpha-value>)',
                    confirmed: 'hsl(var(--tour-stop-confirmed) / <alpha-value>)',
                    'not-available': 'hsl(var(--tour-stop-not-available) / <alpha-value>)',
                    showed: 'hsl(var(--tour-stop-showed) / <alpha-value>)',
                    skipped: 'hsl(var(--tour-stop-skipped) / <alpha-value>)',
                },

                /* ── Static Brand Palettes ───────────────────────────
                   Full scales for fine-grained use outside the
                   semantic system. Not affected by dark mode.
                   Brand anchors marked with ← brand.
                   ──────────────────────────────────────────────────── */
                navy: {
                    50: '#EFF5FA',
                    100: '#D6E4EF',
                    200: '#ADC9DF',
                    300: '#84AECF',
                    400: '#5B8FB5',
                    500: '#3A7399',
                    600: '#2C5C7E',
                    700: '#204D6B',
                    800: '#163D5C' /* ← brand */,
                    900: '#0E2C44',
                    950: '#081B2C',
                },
                green: {
                    50: '#F0FBEA',
                    100: '#DDF5CE',
                    200: '#BBE7A0',
                    300: '#AACE8A' /* ← brand muted  */,
                    400: '#9ACF87' /* ← brand soft   */,
                    500: '#8EDD65' /* ← brand vibrant */,
                    600: '#6FC241',
                    700: '#539930',
                    800: '#3E7526',
                    900: '#2B531C',
                    950: '#183313',
                },
            },

            /* ──────────────────────────────────────────────────────────
               TYPOGRAPHY
               ────────────────────────────────────────────────────────── */
            fontFamily: {
                sans: [
                    'var(--font-inter)',
                    'Inter',
                    'system-ui',
                    '-apple-system',
                    'Segoe UI',
                    'Roboto',
                    'Helvetica Neue',
                    'Arial',
                    'sans-serif',
                ],
                heading: [
                    'var(--font-inter)',
                    'Inter',
                    'system-ui',
                    '-apple-system',
                    'Segoe UI',
                    'Roboto',
                    'sans-serif',
                ],
                mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
            },

            fontSize: {
                xs: ['0.75rem', { lineHeight: '1rem' }],
                sm: ['0.875rem', { lineHeight: '1.25rem' }],
                base: ['1rem', { lineHeight: '1.5rem' }],
                lg: ['1.125rem', { lineHeight: '1.75rem' }],
                xl: ['1.25rem', { lineHeight: '1.75rem' }],
                '2xl': ['1.5rem', { lineHeight: '2rem' }],
                '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
                '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
            },

            fontWeight: {
                normal: '400',
                medium: '500',
                semibold: '600',
                bold: '700',
            },

            /* ──────────────────────────────────────────────────────────
               SPACING — extends Tailwind's default 0.25rem scale
               ────────────────────────────────────────────────────────── */
            spacing: {
                4.5: '1.125rem',
                13: '3.25rem',
                15: '3.75rem',
                18: '4.5rem',
                22: '5.5rem',
                30: '7.5rem',
                sidebar: '280px', // matches current sidebar width
                topbar: '60px', // matches current topbar height
            },

            /* ──────────────────────────────────────────────────────────
               BORDER RADIUS — subtle rounding, modern not bubbly
               ────────────────────────────────────────────────────────── */
            borderRadius: {
                sm: '0.25rem', //  4px — inputs, small elements
                DEFAULT: 'var(--radius)', //  6px — standard
                md: '0.5rem', //  8px — cards
                lg: '0.75rem', // 12px — larger cards, panels
                xl: '1rem', // 16px — modals, dialogs
                '2xl': '1.25rem', // 20px — hero cards
            },

            /* ──────────────────────────────────────────────────────────
               SHADOWS — theme-aware via --shadow-color token
               Light: cool-gray base. Dark: deep-navy base.
               ────────────────────────────────────────────────────────── */
            boxShadow: {
                xs: '0 1px 2px 0 hsl(var(--shadow-color) / 0.05)',
                sm: '0 1px 3px 0 hsl(var(--shadow-color) / 0.1), 0 1px 2px -1px hsl(var(--shadow-color) / 0.1)',
                DEFAULT:
                    '0 4px 6px -1px hsl(var(--shadow-color) / 0.1), 0 2px 4px -2px hsl(var(--shadow-color) / 0.1)',
                md: '0 8px 15px -3px hsl(var(--shadow-color) / 0.1), 0 4px 6px -4px hsl(var(--shadow-color) / 0.1)',
                lg: '0 16px 30px -5px hsl(var(--shadow-color) / 0.15), 0 8px 10px -6px hsl(var(--shadow-color) / 0.1)',
                xl: '0 24px 50px -12px hsl(var(--shadow-color) / 0.25)',

                // Named presets for common patterns
                card: '0 1px 3px 0 hsl(var(--shadow-color) / 0.08), 0 1px 2px -1px hsl(var(--shadow-color) / 0.08)',
                'card-hover':
                    '0 8px 20px -4px hsl(var(--shadow-color) / 0.12), 0 4px 6px -2px hsl(var(--shadow-color) / 0.08)',
                dropdown:
                    '0 10px 20px -5px hsl(var(--shadow-color) / 0.15), 0 4px 6px -4px hsl(var(--shadow-color) / 0.1)',
                modal: '0 24px 50px -12px hsl(var(--shadow-color) / 0.3)',
            },

            /* ──────────────────────────────────────────────────────────
               TRANSITIONS
               ────────────────────────────────────────────────────────── */
            transitionDuration: {
                DEFAULT: '150ms',
                fast: '100ms',
                normal: '200ms',
                slow: '300ms',
            },

            /* ──────────────────────────────────────────────────────────
               Z-INDEX SCALE
               ────────────────────────────────────────────────────────── */
            zIndex: {
                dropdown: '1000',
                sticky: '1020',
                fixed: '1030',
                'modal-backdrop': '1040',
                modal: '1050',
                popover: '1060',
                tooltip: '1070',
                toast: '1080',
            },

            /* ──────────────────────────────────────────────────────────
               ANIMATIONS — dropdowns, modals, toasts
               ────────────────────────────────────────────────────────── */
            keyframes: {
                'slide-down': {
                    from: { opacity: '0', transform: 'translateY(-4px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                'slide-up': {
                    from: { opacity: '0', transform: 'translateY(4px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                'fade-in': {
                    from: { opacity: '0' },
                    to: { opacity: '1' },
                },
            },
            animation: {
                'slide-down': 'slide-down 150ms ease-out',
                'slide-up': 'slide-up 150ms ease-out',
                'fade-in': 'fade-in 150ms ease-out',
            },
        },
    },

    plugins: [],

    corePlugins: {
        // Disable Tailwind's CSS reset — the project already has its own
        // in _base.scss + PrimeReact's theme. Re-enable when PrimeFlex is removed.
        preflight: false,
    },
};

export default config;
