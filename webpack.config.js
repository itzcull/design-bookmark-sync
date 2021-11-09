const webpack = require('webpack');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production',
  devtool: 'inline-nosources-cheap-module-source-map',
  entry: './src/background.ts',
  output: {
    clean: true,
    filename: './background.js',
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
        exclude: /node_modules/,
      },
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(png|jpe?g)$/i,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
    ],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: './src/manifest.json', to: './manifest.json' },
        { from: './src/assets/trav_logo.png', to: './assets/trav_logo.png' },
      ],
    }),
  ],
  resolve: {
    extensions: ['.ts', '.js', '.css'],
  },
};
