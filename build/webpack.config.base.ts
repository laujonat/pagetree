import { CleanWebpackPlugin } from "clean-webpack-plugin";
import CopyPlugin from "copy-webpack-plugin";
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import path from "path";
import { Configuration as WebpackConfiguration } from "webpack";

// const chromeMainfestVersion = pkg.chromeExtension["manifest-version"];
const srcDir = path.join(__dirname, "..", "src");
const resolveExtensions = [".ts", ".tsx", ".js"];
const resolveModules = [
  path.resolve(__dirname, "node_modules"),
  "node_modules",
];

const config: WebpackConfiguration = {
  entry: {
    background: path.join(srcDir, "extension/background/main.ts"),
    content_script: path.join(srcDir, "extension/content_script.tsx"),
    sidepanel: path.join(srcDir, "extension/sidepanel.tsx"),
    script: path.join(srcDir, "extension/scripts/inspector.ts"),
    options: path.join(srcDir, "extension/options.tsx"),
  },
  output: {
    path: path.join(__dirname, "../dist/js"),
    filename: "[name].js",
    hotUpdateChunkFilename: "hot/[id].[fullhash].hot-update.js",
    hotUpdateMainFilename: "hot/[runtime].[fullhash].hot-update.json",
  },
  resolve: {
    extensions: resolveExtensions,
    modules: resolveModules,
    alias: {
      "@": srcDir,
    },
  },
  cache: {
    type: "filesystem",
    buildDependencies: {
      config: [__filename],
    },
  },
  stats: {
    hash: true,
    assets: false,
    modules: false,
    children: false,
  },
  module: {
    rules: [
      {
        test: /\.(ts)x?$/,
        exclude: /node_modules|\.d\.ts$/, // this line as well
        use: {
          loader: "ts-loader",
          options: {
            compilerOptions: {
              noEmit: false, // this option will solve the issue
            },
          },
        },
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new ForkTsCheckerWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: "css/[name].css",
    }),
    new CopyPlugin({
      patterns: [
        { from: ".", to: "../", context: "public" },
        { from: "styles/*.css", to: "../", context: srcDir },
        { from: "assets/*.{png,svg}", to: "../", context: srcDir },
      ],
      options: {},
    }),
    new HtmlWebpackPlugin({
      filename: "sidepanel.html",
      chunks: ["sidepanel"],
      title: "Pagetree",
    }),
    new HtmlWebpackPlugin({
      filename: "options.html",
      chunks: ["options"],
      title: "options page",
    }),
  ].filter(Boolean),
  watchOptions: {
    // for some systems, watching many files can result in a lot of CPU or memory usage
    // https://webpack.js.org/configuration/watch/#watchoptionsignored
    ignored: /node_modules/,
  },
  optimization: {
    minimizer: [],
    splitChunks: {
      // Add a default splitChunks configuration
      chunks(chunk) {
        return chunk.name !== "background";
      },
      name: "vendor",
    },
  },
};

export default config;
