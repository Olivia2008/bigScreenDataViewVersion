const path = require("path");

module.exports = {
  devServer: {
    port: "8808",
    open: true
  },
  chainWebpack: config => {
    config.resolve.alias
      .set("@", path.resolve(__dirname, "src"))
      .set("assets", path.resolve(__dirname, "src/assets"))
      .set("router", path.resolve(__dirname, "src/router"))
      .set("views", path.resolve(__dirname, "src/views"))
      .set("store", path.resolve(__dirname, "src/store"))
      .set("components", path.resolve(__dirname, "src/components"))
      .set("plugins", path.resolve(__dirname, "src/plugins"))
      .set("utils", path.resolve(__dirname, "src/utils"))
  }
};
