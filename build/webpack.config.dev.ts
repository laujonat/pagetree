import { merge } from "webpack-merge";

import common from "./webpack.config.base";

const config = merge(common, {
  devtool: "inline-source-map",
  mode: "development",
});

export default config;
