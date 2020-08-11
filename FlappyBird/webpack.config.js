const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  mode: 'development',
  devServer: {
    contentBase: 'dist',
    port: 5500
  },
  devtool: 'inline-source-map',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [ { from: 'build/assets', to: 'assets' } ]
    }),
    new HTMLWebpackPlugin({
        template: 'build/index.html',
        filename: 'index.html'
    })
  ]
};