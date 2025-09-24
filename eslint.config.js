import eslintPluginReact from 'eslint-plugin-react';
import eslintPluginReactHooks from 'eslint-plugin-react-hooks';
import eslintPluginJsxA11y from 'eslint-plugin-jsx-a11y';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import eslintPluginImport from 'eslint-plugin-import';
import nextPlugin from '@next/eslint-plugin-next';
import prettierConfig from 'eslint-config-prettier';
import airbnbBase from 'eslint-config-airbnb-base';
import { fixupPluginRules } from '@eslint/compat';
import eslint from '@eslint/js';

export default [
    {
        ignores: [
            'build/**', // Ignore entire build directory and its contents
            '.next/**', // Ignore entire .next directory and its contents
            'node_modules/**', // Optional: ESLint ignores node_modules by default
            '!build/test.js', // Unignore build/test.js if needed
            'eslint.config.js',
        ],
        files: ['**/*.{js,jsx}'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            parserOptions: {
                ecmaFeatures: { jsx: true },
            },
            globals: {
                browser: true,
                node: true,
                window: true,
                console: true,
                process: true,
                navigator: true
            },
        },
        plugins: {
            react: eslintPluginReact,
            'react-hooks': fixupPluginRules(eslintPluginReactHooks),
            'jsx-a11y': eslintPluginJsxA11y,
            prettier: eslintPluginPrettier,
            import: eslintPluginImport,
            '@next/next': nextPlugin,
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
            ...eslint.configs.recommended.rules,
            ...airbnbBase.rules,
            ...eslintPluginReact.configs.recommended.rules,
            ...eslintPluginReactHooks.configs.recommended.rules,
            ...eslintPluginJsxA11y.configs.recommended.rules,
            ...nextPlugin.configs['core-web-vitals'].rules,
            ...prettierConfig.rules,
            'no-console': ['warn'],
            'no-restricted-syntax': ['warn'],
            'import/no-extraneous-dependencies': ['warn'],
            'func-names': ['warn'],
            'no-await-in-loop': ['warn'],
            'no-unused-vars': ['error', { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }],
            'react/jsx-filename-extension': [1, { extensions: ['.jsx'] }],
            'react/react-in-jsx-scope': 'off',
            '@next/next/no-html-link-for-pages': 'error',
            'import/extensions': ['error', 'never', { js: 'never', jsx: 'never' }],
            'import/no-extraneous-dependencies': [
                'error',
                {
                    devDependencies: ['**/*.test.js', '**/*.test.jsx', 'next.config.js'],
                },
            ],
            'max-len': ['warn', { code: 120 }],
        },
    },
];
