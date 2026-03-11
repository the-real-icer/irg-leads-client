import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { fixupConfigRules } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';
import eslint from '@eslint/js';
import nextPlugin from '@next/eslint-plugin-next';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: eslint.configs.recommended,
});

export default [
    {
        ignores: [
            '.next/**',
            'build/**',
            'coverage/**',
            'node_modules/**',
            'eslint.config.js',
        ],
    },
    ...fixupConfigRules(
        compat.extends(
            'airbnb-base',
            'plugin:react/recommended',
            'plugin:react-hooks/recommended',
            'plugin:jsx-a11y/recommended',
            'prettier',
        ),
    ),
    nextPlugin.flatConfig.coreWebVitals,
    {
        files: ['**/*.{js,jsx}'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            parserOptions: {
                ecmaFeatures: { jsx: true },
            },
            globals: {
                window: 'readonly',
                document: 'readonly',
                navigator: 'readonly',
                console: 'readonly',
                process: 'readonly',
                module: 'readonly',
                require: 'readonly',
                URL: 'readonly',
                URLSearchParams: 'readonly',
                FormData: 'readonly',
                Blob: 'readonly',
                File: 'readonly',
                FileReader: 'readonly',
                crypto: 'readonly',
                HTMLElement: 'readonly',
                HTMLInputElement: 'readonly',
                Image: 'readonly',
                IntersectionObserver: 'readonly',
                Node: 'readonly',
                MutationObserver: 'readonly',
                localStorage: 'readonly',
                sessionStorage: 'readonly',
                fetch: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                setInterval: 'readonly',
                clearInterval: 'readonly',
                requestAnimationFrame: 'readonly',
                cancelAnimationFrame: 'readonly',
            },
        },
        settings: {
            react: { version: 'detect' },
            'import/resolver': {
                node: {
                    extensions: ['.js', '.jsx'],
                },
            },
        },
        rules: {
            'no-console': ['warn'],
            'no-restricted-syntax': ['warn'],
            'func-names': ['warn'],
            'no-await-in-loop': ['warn'],
            'no-param-reassign': ['error', { props: false }],
            'no-unused-vars': [
                'error',
                {
                    varsIgnorePattern: '^_',
                    argsIgnorePattern: '^_',
                    caughtErrors: 'none',
                },
            ],
            'no-underscore-dangle': 'off',
            'no-use-before-define': 'off',
            'no-else-return': 'off',
            'no-plusplus': 'off',
            'no-continue': 'off',
            'consistent-return': 'off',
            'prefer-destructuring': 'off',
            'prefer-template': 'off',
            'default-param-last': 'off',
            'arrow-body-style': 'off',
            'no-nested-ternary': 'off',
            camelcase: 'off',
            'react/jsx-filename-extension': [1, { extensions: ['.jsx'] }],
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
            'react/no-unescaped-entities': 'off',
            '@next/next/no-html-link-for-pages': 'off',
            '@next/next/no-img-element': 'off',
            'jsx-a11y/label-has-associated-control': 'off',
            'import/first': 'off',
            'import/order': 'off',
            'import/no-duplicates': 'off',
            'import/prefer-default-export': 'off',
            'import/extensions': ['error', 'never', { js: 'never', jsx: 'never' }],
            'import/no-extraneous-dependencies': [
                'error',
                {
                    devDependencies: ['**/*.test.js', '**/*.test.jsx', 'next.config.js', 'next.config.mjs'],
                },
            ],
            'max-len': ['warn', { code: 120 }],
        },
    },
];
