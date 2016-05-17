const path = require('path');
const webpack = require('webpack');

const phaserModule = path.join(__dirname, '/node_modules/phaser/');
const phaser = path.join(phaserModule, 'build/custom/phaser-split.js');
const pixi = path.join(phaserModule, 'build/custom/pixi.js');
const p2 = path.join(phaserModule, 'build/custom/p2.js');

module.exports = {
  target: 'web',
  devtool: 'eval-source-map',
  entry: {
    demo: path.join(__dirname, `demo/demo.js`)
  },
  output: {
    publicPath: '/',
    filename: '[name].js',
    libraryTarget: 'umd'
  },
  module: {
    loaders: [
      {test: /\.vue$/, loader: 'vue'},
      {test: /\.png$/, loader: 'url'},
      {test: /\.woff$/, loader: 'url'},
      {test: /\.json$/, loader: 'json'},
      {test: /\.yaml$/, loader: 'json!yaml'},
      {test: /\.css$/, loader: 'style!css'},
      //{test: /pixi\.js|p2\.js/, loader: 'script'},
      {test: /(pixi|phaser).js/, loader: 'script'},
      {test: /\.js$/, loader: 'babel', exclude: /node_modules/}
    ]
  },
  babel: {
    presets: ['es2015', 'stage-0']
  }
  /*externals: [
   {
   vue: true,
   'babel-polyfill': true,
   'gemini-scrollbar': true,
   easystarjs : true
   }
   ]*/
}