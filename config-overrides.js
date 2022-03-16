const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
module.exports = {
  webpack: function (config) {
    return {
      ...config,
      plugins: [...config.plugins, new NodePolyfillPlugin()],
      ignoreWarnings: [/Failed to parse source map/],
      resolve: {
        extensions: [".tsx", ".ts", ".js"],
        fallback: {
          fs: false,
          child_process: false,
          net: false,
          dns: false,
          repl: false,
          tls: false,
          module: false
        }
      }
    };
  }
};
