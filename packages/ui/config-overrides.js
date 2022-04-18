const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const ModuleScopePlugin = require("react-dev-utils/ModuleScopePlugin");
const webpack = require("webpack");
const path = require("path");

module.exports = function override(config, env) {
  config.plugins = [
    ...config.plugins,
    new NodePolyfillPlugin(),
    new webpack.ContextReplacementPlugin(/mocha|typescript|redspot|express/),
    new webpack.IgnorePlugin({
      resourceRegExp: /ts-node|perf_hooks/
    }),

  ];
  config.entry = ['@babel/polyfill', './src/index.tsx'],
  config.module.rules.push(
    {
      test: /\.js$/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/env'],
          plugins: [    // ordering important, decorators before class properties
            '@babel/plugin-proposal-nullish-coalescing-operator',
            '@babel/plugin-proposal-numeric-separator',
            '@babel/plugin-proposal-optional-chaining',
            ['@babel/plugin-transform-runtime', {useESModules: true}],
            '@babel/plugin-syntax-bigint',
            '@babel/plugin-syntax-dynamic-import',
            '@babel/plugin-syntax-import-meta',
            '@babel/plugin-syntax-top-level-await',
            'babel-plugin-styled-components',]
        }
      }
    })

  config.resolve = {
    ...config.resolve,
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'],
    fallback: {
      fs: require.resolve("browserify-fs"),
      repl: false,
      module: false,
      child_process: false,
      pnpapi: false,
      net: false,
      tls: false
    },
    modules: [
      path.resolve('../../../../node_modules')
    ]
  };
  config.ignoreWarnings = [/Failed to parse source map/];
  config.resolve.plugins = config.resolve.plugins.filter(
    (plugin) => !(plugin instanceof ModuleScopePlugin)
  );
  config.cache = false;
  config.output = {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].js',
    library: 'LIB',
    libraryTarget: 'var',
  }

  return config;
};
