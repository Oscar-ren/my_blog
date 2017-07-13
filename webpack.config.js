const webpack = require('webpack');
const path = require("path");
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const productionConfig = {
  plugins: process.env.NODE_ENV == 'dev' ? [] :[
    new UglifyJSPlugin({
      compress: {
        warnings: false
      }
    })
  ]
}

module.exports = {
  entry: {
    app: './src/index.jsx',
    vendor: ['inferno', 'inferno-component', 'inferno-router', 'history', 'fecha']
  },
  output: {
    path: path.resolve('dist'),
    publicPath: '/statics',
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: ['babel-loader']
      },
      {
        test: /\.css$/,
        use: ['css-hot-loader'].concat(ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              options: {
                minimize: true,
                modules: true,
                localIdentName: '[name]__[local]',
                importLoaders: 1
              }
            },
            {
              loader: 'postcss-loader',
              options: {
                plugins: [
                  require('postcss-cssnext')({
                    features: {
                      calc: {},
                      nesting: {},
                      autoprefixer: {},
                      customProperties: {
                        variables: {
                          mainColor: "white",
                          theme: '#68c144',
                        }
                      }
                    }
                  })
                ]
              }
            }
          ],
        })),
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              options: {
                minimize: true,
              },
            },
          ],
        }),
        include: /node_modules/,
      },
    ],
    noParse: [/fecha.min/]
  },

  devtool: process.env.NODE_ENV == 'dev' ? 'source-map' : false,

  plugins: [
    ...productionConfig.plugins,
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
    }),
    new ExtractTextPlugin('style.css'),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.optimize.CommonsChunkPlugin({
      name: "vendor",
      filename: "vendor.js",
      minChunks: Infinity,
    }),
    //new BundleAnalyzerPlugin()
  ],
  resolve: {
    extensions: [".js", ".jsx"],
    alias: {
      fecha: "fecha/fecha.min.js"
    }
  },
  devServer: {
    contentBase: [path.join(__dirname, "public"),path.join(__dirname, "dist")],
    proxy: {
      '*': {
        target: 'http://localhost:3000'
      }
    },
    compress: true,
    stats: 'minimal',
    watchContentBase: true,
    port: 9000
  }
}