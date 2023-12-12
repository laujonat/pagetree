/* eslint-env node */
module.exports = {
    env: {
        browser: true,
        node: true, // Recognize Node.js globals
        "jest/globals": true
    },
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    root: true,
    rules: {
        '@typescript-eslint/ban-ts-comment': [
            'warn',
            { 'ts-ignore': 'allow-with-description' },
        ]
    },
    overrides: [
        {
            files: [
                "**/*.test.{ts,tsx}"
            ],
            env: {
                jest: true
            }
        },
    ]
};