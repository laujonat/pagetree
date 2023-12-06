/* eslint-disable @typescript-eslint/no-var-requires */
// @ts-nocheck
const webpack = require("webpack");
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

const srcDir = path.join(__dirname, "..", "src");

const resolveExtensions = [".ts", ".tsx", ".js"];
const resolveModules = [
    path.resolve(__dirname, 'node_modules'),
    'node_modules'
];

module.exports = {
    entry: {
        background: path.join(srcDir, "extension/background/main.ts"),
        colorscheme: path.join(srcDir, "extension/background/colorscheme.ts"),
        content_script: path.join(srcDir, "extension/content_script.tsx"),
        sidepanel: path.join(srcDir, "extension/sidepanel.tsx"),
        script: path.join(srcDir, "extension/scripts/inspector.ts"),
        options: path.join(srcDir, "extension/options.tsx"),
    },
    output: {
        path: path.join(__dirname, "../dist/js"),
        filename: "[name].js",
    },
    optimization: {
        minimizer: [],
        splitChunks: {  // Add a default splitChunks configuration
            chunks(chunk) {
                return chunk.name !== "background";
            },
            name: 'vendor',
        },
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
        ],
    },
    resolve: {
        extensions: resolveExtensions,
        modules: resolveModules,
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: ".", to: "../", context: "public" },
                { from: "styles/*.css", to: "../", context: srcDir },
                { from: "assets/*.{png,svg}", to: "../", context: srcDir },
            ],
            options: {},
        }),
    ],
};
