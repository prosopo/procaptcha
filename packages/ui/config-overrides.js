const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const ModuleScopePlugin = require("react-dev-utils/ModuleScopePlugin");

module.exports = function override(config, env) {
  config.plugins = [...config.plugins, new NodePolyfillPlugin()];
  config.resolve = {
    ...config.resolve,
    fallback: {
      fs: false,
      repl: false,
      module: false,
      child_process: false,
      pnpapi: false,
      net: false,
      tls: false
    }
  };
  config.resolve.plugins = config.resolve.plugins.filter(
    (plugin) => !(plugin instanceof ModuleScopePlugin)
  );
  return config;
};
