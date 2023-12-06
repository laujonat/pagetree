// @ts-nocheck
const { merge } = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const common = require('./webpack.common.js');

const customOptimization = {
    minimize: true,
    minimizer: [
        new TerserPlugin({
            terserOptions: {
                compress: {
                    drop_console: true,
                },
            },
        }),
        new CssMinimizerPlugin({}),
    ],
};

module.exports = merge(common, {
    mode: 'production',
    optimization: {
        ...customOptimization,   // Merge custom optimization settings
    },
});
