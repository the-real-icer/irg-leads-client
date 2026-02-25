import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'irg-theme';

export default function useTheme() {
    const [theme, setThemeState] = useState('light');
    const [mounted, setMounted] = useState(false);

    // Initialize on mount — read stored preference or system preference
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === 'dark' || stored === 'light') {
            setThemeState(stored);
            applyTheme(stored, false);
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const initial = prefersDark ? 'dark' : 'light';
            setThemeState(initial);
            applyTheme(initial, false);
        }
        setMounted(true);
    }, []);

    // Listen for system preference changes (only if no stored preference)
    useEffect(() => {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (e) => {
            if (!localStorage.getItem(STORAGE_KEY)) {
                const newTheme = e.matches ? 'dark' : 'light';
                setThemeState(newTheme);
                applyTheme(newTheme, true);
            }
        };
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    const applyTheme = (newTheme, animate) => {
        const html = document.documentElement;

        if (animate) {
            html.classList.add('theme-transition');
        }

        if (newTheme === 'dark') {
            html.classList.add('dark');
        } else {
            html.classList.remove('dark');
        }

        if (animate) {
            setTimeout(() => html.classList.remove('theme-transition'), 200);
        }
    };

    const toggleTheme = useCallback(() => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setThemeState(newTheme);
        localStorage.setItem(STORAGE_KEY, newTheme);
        applyTheme(newTheme, true);
    }, [theme]);

    return { theme, toggleTheme, mounted };
}
