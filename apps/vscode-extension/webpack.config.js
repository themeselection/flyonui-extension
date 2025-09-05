const path = require('node:path');
const fs = require('node:fs');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

// Load environment variables from the root .env file
const envPath = path.resolve(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
} else {
  console.warn(
    `[webpack] .env file not found at ${envPath}; Relying on shell environment variables`,
  );
}

/** @type {import('webpack').Configuration} */
const config = {
  target: 'node', // VS Code extensions run in a Node.js-context -> https://webpack.js.org/configuration/node/
  mode: 'none', // Set mode to 'production' or 'development' or 'none'. 'none' is often good for extensions. Production minifies.

  entry: './src/extension.ts', // The entry point of your extension -> https://webpack.js.org/configuration/entry-context/
  output: {
    // The bundle is stored in the 'out' folder (check package.json) -> https://webpack.js.org/configuration/output/
    path: path.resolve(__dirname, 'out'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2', // Required for VS Code extensions
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.POSTHOG_API_KEY': JSON.stringify(
        process.env.POSTHOG_API_KEY,
      ),
      'process.env.POSTHOG_HOST': JSON.stringify(process.env.POSTHOG_HOST),
      'process.env.STAGEWISE_CONSOLE_URL': JSON.stringify(
        process.env.STAGEWISE_CONSOLE_URL,
      ),
      'process.env.API_URL': JSON.stringify(process.env.API_URL),
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'src/webviews/media',
          to: 'src/webviews/media',
          globOptions: {
            ignore: ['**/.DS_Store'],
          },
        },
      ],
    }),
  ],
  externals: {
    vscode: 'commonjs vscode', // The vscode-module is created on-the-fly and must be excluded -> https://webpack.js.org/configuration/externals/
    // Add other modules that cannot be webpack'ed, if any. E.g., native Node modules.
  },
  resolve: {
    // Support reading TypeScript and JavaScript files -> https://github.com/TypeStrong/ts-loader
    extensions: ['.ts', '.js'],
    // --- Use TsconfigPathsPlugin to handle workspace paths ---
    plugins: [
      new TsconfigPathsPlugin({
        configFile: path.resolve(__dirname, './tsconfig.json'),
      }),
    ],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
          },
        ],
      },
    ],
  },
  devtool: 'nosources-source-map', // Control source map generation - 'nosources-source-map' is good for extensions
  infrastructureLogging: {
    level: 'log', // Enable webpack infrastructure logging -> https://webpack.js.org/configuration/other-options/#infrastructurelogging
  },
};
module.exports = config;
