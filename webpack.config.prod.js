const path = require('path');
const webpack = require('webpack');

const name = 'endless-hunter';

module.exports = {
  target: 'web',
  devtool: 'eval-source-map',
  entry: {
    [name+'.js']: path.join(__dirname, `src/${name}.js`)
  },
  output: {
    path: path.join(__dirname, `dist/${name}.js`),
    publicPath: '/',
    filename: '[name]',
    library: 'EndlessHunter',
    libraryTarget: 'commonjs2'
  },
  module: {
    loaders: [
      {test: /\.vue$/, loader: 'vue'},
      {test: /\.png$/, loader: 'url'},
      {test: /\.woff$/, loader: 'url'},
      {test: /\.yaml$/, loader: 'json!yaml'},
      {test: /\.css$/, loader: 'style!css'},
      {test: /pixi\.js|p2\.js/, loader: 'script'},
      {test: /\.js$/, loader: 'babel', exclude: /node_modules/}
    ]
  },
  babel: {
    presets: ['es2015', 'stage-0']
  },
  externals: [
    {
      vue: true,
      phaser: true,
      'babel-polyfill': true,
      'gemini-scrollbar': true,
      easystarjs : true
    }
  ],
  resolve: {
    alias: {
      'phaser': phaser,
      'pixi.js': pixi,
      'p2': p2
    }
  }
};