'use strict';


const path = require('path'),
      HTMLWebpackPlugin = require('html-webpack-plugin');


module.exports = require('webpack-validator')({
  entry: path.join(__dirname, './src/game.js'),

  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[hash].js',
  },

  resolve: {
    extensions: ['', '.js'],
  },

  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        include: [
          path.resolve(__dirname, 'src'),
        ],
        query: {
          presets: [
            "es2015",
          ],

          plugins: [
            "transform-decorators-legacy",
          ],
        }
      },
    ],
  },

  plugins: [
    new HTMLWebpackPlugin({
      template: path.resolve(__dirname, 'index.html'),
    }),
  ]
});
