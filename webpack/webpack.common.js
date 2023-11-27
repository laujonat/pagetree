const webpack = require("webpack");
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

const srcDir = path.join(__dirname, "..", "src");
const _resolve = {
    extensions: [".ts", ".tsx", ".js"],
    modules: [
        path.resolve(__dirname, 'node_modules'),
        'node_modules'
    ]
}
module.exports = {
    entry: {
        sidepanel: path.join(srcDir, "sidepanel.tsx"),
        options: path.join(srcDir, "options.tsx"),
        background: path.join(srcDir, "background.ts"),
        content_script: path.join(srcDir, "content_script.tsx"),
    },
    output: {
        path: path.join(__dirname, "../dist/js"),
        filename: "[name].js",
    },
    optimization: {
        splitChunks: {
            name: "vendor",
            chunks(chunk) {
                return chunk.name !== "background";
            },
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
    resolve: _resolve,
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: ".", to: "../", context: "public" },
                { from: "styles/*.css", to: "../", context: srcDir },
                { from: "icons/*.{png,svg}", to: "../", context: srcDir },
            ],
            options: {},
        }),
    ],
};
