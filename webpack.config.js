const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const productionConfig = {
  plugins: process.env.NODE_ENV === 'dev' ? [] : [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    })
  ]
};

module.exports = {
  entry: {
    app: './src/index.jsx'
  },
  output: {
    path: path.resolve('public'),
    publicPath: '/statics',
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: ['babel-loader'],
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract([
          {
            loader: 'css-loader',
            options: {
              modules: true,
              localIdentName: '[name]__[local]',
            }
          },
          {
            loader: 'postcss-loader'
          }
        ]),
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract(['css-loader']),
        include: /node_modules/
      }
    ]
  },

  devtool: process.env.NODE_ENV === 'dev' ? 'source-map' : false,

  plugins: [
    ...productionConfig.plugins,
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
    }),
    new ExtractTextPlugin({
      filename: '[name].css'
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: function (module) {
        return (
          module.resource &&
          /\.js$/.test(module.resource) &&
          module.resource.indexOf(
            path.resolve('node_modules')
          ) === 0
        );
      }
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
      minChunks: Infinity
    })
    // new (require('webpack-bundle-analyzer').BundleAnalyzerPlugin)()
  ],
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      fecha: 'fecha/fecha.min.js',
      'react': 'inferno-compat',
      'react-dom': 'inferno-compat'
    }
  },
  devServer: {
    contentBase: [path.join(__dirname, 'public'), path.join(__dirname, 'dist')],
    proxy: {
      '*': {
        target: 'http://localhost:3000'
      }
    },
    compress: true,
    open: true,
    hot: true,
    inline: true,
    stats: 'minimal',
    watchContentBase: true,
    port: 9000
  }
};
