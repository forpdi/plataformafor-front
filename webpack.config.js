/* eslint-disable */

const Webpack = require('webpack');
const path = require('path');
const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');

const envFilePath = process.env.ENV_FILE_PATH || '.env';

var env = dotenv.config({ path: envFilePath });
dotenvExpand(env);
const envParsed = env.parsed;

const envKeys = Object.keys(envParsed).reduce((prev, next) => {
  prev[`process.env.${next}`] = JSON.stringify(envParsed[next])
  return prev
}, {})

const isDevelopment = process.env.NODE_ENV === 'development';

module.exports = {
  context: __dirname,
  mode: 'development',

  devtool: '#eval-cheap-module-source-map',
  entry: [
    "./favicon.ico",
    "./favicon2.ico",
    "./index.html",
    "./index.js",
    "./img/caret-down.png",
    "./img/calendar-alt-solid.svg",
    "./img/calendar-for.svg",
    "./img/vector-clock.svg"
  ],
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'bundle.js',
    publicPath: '/',
    pathinfo: true,
  },

  devServer: {
    historyApiFallback: {
      disableDotRule: true,
    },
    compress: true,
    proxy: {
      '/forpdi/**': {
        target: 'http://localhost:8080',
        secure: false,
      },
    },
  },

  resolve: {
    extensions: ['.js', '.jsx', '.json', '.scss', '.css'],
    alias: {
      '@': path.resolve(__dirname, 'jsx'),
	  "forpdi": __dirname,
	  "jquery.ui.widget": "./vendor/jquery.ui.widget.js",
	  "jquery-ui/ui/widget": "./vendor/jquery.ui.widget.js"
	},

  },

  plugins: [
    new Webpack.DefinePlugin({
      PRODUCTION: JSON.stringify(false),
      'process.env': {
    		'NODE_ENV': JSON.stringify('development')
	    }
    }),
    new Webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery"
    }),
    new Webpack.DefinePlugin(envKeys),
  ],

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loaders: isDevelopment ? ['babel-loader', 'eslint-loader'] : ['babel-loader'],
      }, {
        test: /_[a-z\-]+\.scss$/,
        loaders: [
          'style-loader',
          'css-loader',
          'postcss-loader',
          'sass-loader',
        ],
      }, {
        test: /\.pdf$/,
        loaders: ['file-loader?name=documents/[name].[ext]'],
      }, {
        test: /\.css$/,
        loaders: ['style-loader', 'css-loader', 'postcss-loader'],
      }, {
        test: /\.(html)$/,
        loader: ['file-loader?name=[name].[ext]', './propreplace-loader.js'],
      }, {
        test: /\.(ico)$/,
        loader: 'file-loader?name=[name].[ext]',
      }, {
        test: /\.(jpg|jpeg|png|svg|gif)(\?v=[0-9].[0-9].[0-9])?$/,
        loader: 'file-loader?name=images/[name].[ext]',
      }, {
        test: /\.(woff|woff2|ttf|eot)(\?v=[0-9].[0-9].[0-9])?$/,
        loader: 'file-loader?name=fonts/[name].[ext]',
      },
    ],
  },

};
