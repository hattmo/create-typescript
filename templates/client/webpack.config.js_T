const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const ts = {
  test: /\.ts(x)?$/,
  use: [
    {
      loader: 'ts-loader',
    },
  ],
};

const config = {
  entry: './src/main.tsx',
  output: {
    path: path.resolve(__dirname, 'dist/'),
    filename: 'bundle.js',
  },
  module: {
    rules: [ts],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Test',
      filename: 'index.html',
      inject: 'body',
      meta: { viewport: 'width=device-width, initial-scale=1, shrink-to-fit=no' },
      minify: /staging/.test(process.env.NODE_ENV),
    }),
  ],
  resolve: {
    extensions: [' ', '.js', '.jsx', '.ts', '.tsx'],
  },
};
module.exports = config;
