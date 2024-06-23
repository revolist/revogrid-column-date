const path = require('path');

let libraryName = 'index';
const common = {
  entry: {
    [libraryName]: './src/index.ts',
  },
  externals: {
    '@revolist/revogrid': '@revolist/revogrid',
    '@revolist/revogrid/loader': '@revolist/revogrid/loader',
    '@duetds/date-picker': '@duetds/date-picker',
    '@duetds/date-picker/dist/loader': '@duetds/date-picker/dist/loader',
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
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
      {
        test: /\.svg/,
        use: ['svg-url-loader'],
      },
    ],
  },
};
module.exports = [
  {
    ...common,
    output: {
      path: path.resolve(__dirname, '../dist'),
      filename: '[name].umd.js',
      library: libraryName,
      libraryTarget: 'umd',
      umdNamedDefine: true,
    },
  },
  {
    ...common,
    output: {
      path: path.resolve(__dirname, '../dist'),
      filename: '[name].mjs',
      libraryTarget: 'module',
    },
    experiments: {
      outputModule: true // Enables experimental support for ESM output
    },
  },
];
