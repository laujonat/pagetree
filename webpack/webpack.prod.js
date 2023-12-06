// @ts-nocheck
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const customOptimization = {
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                test: /\.js(\?.*)?$/i,
            }),
        ],
    },
};

module.exports = merge(common, {
    mode: 'production',
    optimization: {
        ...common.optimization,  // Merge common optimization settings
        ...customOptimization,   // Merge custom optimization settings
    },
});
