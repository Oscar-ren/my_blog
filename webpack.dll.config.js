const path = require("path");
const webpack = require("webpack");

module.exports = {
  entry: {
    vendor: ['inferno', 'inferno-component', 'inferno-router', 'history/createBrowserHistory', 'fecha']
  },
  output: {
    path: path.resolve('dist'),
    filename: "[name].dll.js",
    library: "[name]_[hash]"
  },
  resolve: {
    extensions: [".js", ".jsx"],
    alias: {
      fecha: "fecha/fecha.min.js"
    }
  },
  plugins: [
    new webpack.DllPlugin({
      path: path.join(__dirname, "dist", "[name]-manifest.json"),
      name: "[name]_[hash]"
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    })
  ]
};
