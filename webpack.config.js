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
    // Lazy chunks (swiper-extras) are cached for a year like the rest, so their URL carries a hash.
    chunkFilename: "[name].js?ver=[chunkhash]",
    path: path.resolve(__dirname, "build"),
  },

  // Swiper's package only exports its modules barrel, which drags every module into whichever
  // chunk imports it. Importing the module files directly keeps the rarer ones in swiper-extras.
  resolve: {
    ...defaultConfig.resolve,
    alias: {
      ...(defaultConfig.resolve && defaultConfig.resolve.alias),
      "swiper-modules": path.resolve(__dirname, "node_modules/swiper/modules"),
    },
  },

  // One lazy file for the extras, not a separate vendor chunk alongside it.
  optimization: {
    ...defaultConfig.optimization,
    splitChunks: { cacheGroups: { default: false, defaultVendors: false } },
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
