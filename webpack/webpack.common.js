const { CleanWebpackPlugin } = require( "clean-webpack-plugin" );
const CopyWebpackPlugin = require( "copy-webpack-plugin" );
const paths = require( "./paths" );
module.exports = {
  // Where webpack looks to start building the bundle
  entry: [ paths.src + "/beaned.js" ],

  // Where webpack outputs the assets and bundles
  output: {
    path: paths.build,
    filename: "[name].bundle.js",
    publicPath: "/",
  },

  // Customize the webpack build process
  plugins: [
    // Removes/cleans build folders and unused assets when rebuilding
    new CleanWebpackPlugin(),

    // Copies files from target to destination folder
    new CopyWebpackPlugin( {
      patterns: [
        {
          from: paths.public,
          to: "assets",
          globOptions: {
            ignore: [ "*.DS_Store" ],
          },
          noErrorOnMissing: true,
        },
      ],
    } )
  ],

  // Determine how modules within the project are treated
  module: {
    rules: [
      // JavaScript: Use Babel to transpile JavaScript files
      { test: /\.js$/, use: [ "babel-loader" ] },
    ],
  },

  resolve: {
    modules: [ paths.src, "node_modules" ],
    extensions: [ ".js", ".jsx", ".json" ],
    alias: {
      "@": paths.src,
    },
  },
};