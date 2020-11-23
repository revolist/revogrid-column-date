const path = require('path');

let libraryName = 'index';
module.exports = {
  entry: {
    [libraryName]: './src/index.ts'
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: '[name].js',
    library: libraryName,
    libraryTarget: 'umd',
    umdNamedDefine: true,
  },
  externals: {
    '@revolist/revogrid': '@revolist/revogrid',
    '@revolist/revogrid/loader': '@revolist/revogrid/loader',
    '@duetds/date-picker': '@duetds/date-picker',
    '@duetds/date-picker/dist/loader': '@duetds/date-picker/dist/loader'
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
};
