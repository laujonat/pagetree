/* eslint-env node */
module.exports = {
    env: {
        node: true, // Recognize Node.js globals
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