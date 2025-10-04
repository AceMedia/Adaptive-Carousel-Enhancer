const defaultConfig = require("@wordpress/scripts/config/webpack.config");
const path = require("path");

module.exports = {
  ...defaultConfig,

  entry: {
    index: "./src/index.js",
    frontend: "./src/frontend.js",
  },

  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "build"),
  },

  // Remove MiniCssExtractPlugin – not needed now
  plugins: [
    ...defaultConfig.plugins.filter(
      (plugin) =>
        plugin.constructor.name !== "MiniCssExtractPlugin" &&
        plugin.constructor.name !== "RtlCssPlugin"
    ),
  ],

  // Remove SCSS handling – it's now CLI-based
  module: {
    rules: [
      ...defaultConfig.module.rules.filter(rule => {
        if (!rule.test) return true;
        const testStr = rule.test.toString();
        return !testStr.includes("css") && !testStr.includes("scss");
      }),
    ],
  },
};
