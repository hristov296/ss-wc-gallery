const path = require("path");

module.exports = (env) => {
  const suffix = env.prod ? ".min" : "";
  console.log(env);
  const config = {
    mode: env.prod ? "production" : "development",
    entry: {
      gallery: "./src/Gallery/index.js",
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: ["babel-loader", "eslint-loader"],
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"],
        },
        {
          test: /\.(png|svg|jpg|gif)$/,
          use: ["file-loader"],
        },
      ],
    },
    output: {
      filename: `[name].wc-react${suffix}.js`,
      chunkFilename: `[name].wc-react${suffix}.js`,
      path: path.resolve(__dirname, "dist"),
      publicPath: "/wp-content/plugins/ss-woocommerce-gallery/dist/",
    },
    externals: {
      react: "React",
      "react-dom": "ReactDOM",
      gsap: "gsap",
    },
    optimization: {
      splitChunks: {
        cacheGroups: {
          commons: {
            name: "commons",
            chunks: "initial",
            minChunks: 2,
            minSize: 0,
          },
        },
      },
      chunkIds: "named", // To keep filename consistent between different modes (for example building only)
    },
  };
  if (env === "dev") {
    config.devtool = "inline-source-map";
  }

  return config;
};
