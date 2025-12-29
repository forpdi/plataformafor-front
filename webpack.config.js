/* eslint-disable */

const Webpack = require('webpack');
const path = require('path');
const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');

// pega o NODE_ENV, default 'development'
const nodeEnv = process.env.NODE_ENV || 'development';

// se tiver ENV_FILE_PATH, usa; senão, escolhe baseado no NODE_ENV
const defaultEnvPath = nodeEnv === 'production' ? '.env.production' : '.env';
const envFilePath = process.env.ENV_FILE_PATH || defaultEnvPath;

let env = dotenv.config({ path: envFilePath });
dotenvExpand(env);

// se não achar arquivo ou der erro, parsed pode ser undefined
const envParsed = env.parsed || {};

const envKeys = Object.keys(envParsed).reduce((prev, next) => {
  prev[`process.env.${next}`] = JSON.stringify(envParsed[next]);
  return prev;
}, {});

const isDevelopment = nodeEnv === 'development';

module.exports = {
  context: __dirname,
  mode: isDevelopment ? 'development' : 'production',

  devtool: isDevelopment ? '#eval-cheap-module-source-map' : false,
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
    pathinfo: isDevelopment,
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
    // Prefer CJS entrypoints over ESM in libs like htmlparser2 to avoid parsing issues on Webpack 4
    mainFields: ['browser', 'main', 'module'],
    alias: {
      '@': path.resolve(__dirname, 'jsx'),
      "forpdi": __dirname,
      "jquery.ui.widget": "./vendor/jquery.ui.widget.js",
      "jquery-ui/ui/widget": "./vendor/jquery.ui.widget.js"
    },
  },

  plugins: [
    new Webpack.DefinePlugin({
      PRODUCTION: JSON.stringify(!isDevelopment),
      'process.env': {
        'NODE_ENV': JSON.stringify(nodeEnv),
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
