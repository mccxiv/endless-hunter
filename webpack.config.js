const path = require('path');
const webpack = require('webpack');

module.exports = {
  target: 'web',
  devtool: 'cheap-source-map',
  entry: {
    demo: path.join(__dirname, `demo/demo.js`)
  },
  output: {
    publicPath: '/',
    filename: '[name].js'
  },
  module: {
    loaders: [
      {test: /\.vue$/, loader: 'vue'},
      {test: /\.png$/, loader: 'url'},
      {test: /\.woff$/, loader: 'url'},
      {test: /\.json$/, loader: 'json'},
      {test: /\.yaml$/, loader: 'json!yaml'},
      {test: /\.css$/, loader: 'style!css'},
      {test: /(pixi|phaser).js/, loader: 'script'},
      {test: /\.js$/, loader: 'babel', exclude: /node_modules/}
    ]
  },
  babel: {
    presets: ['es2015', 'stage-0']
  }
};