var path = require("path")

module.exports = {
  devtool: "nosources-source-map",
  entry: path.join(__dirname, "lib/index.js"),
  externals: [
    "commandland",
    "fs-extra",
    "glob",
    "mkdirp",
    "source-map-support",
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: "babel-loader",
          options: {
            plugins: [
              "transform-async-to-generator",
              "transform-object-rest-spread",
            ],
            presets: ["node6"],
          },
        },
      },
    ],
  },
  output: {
    filename: "index.js",
    libraryTarget: "commonjs",
    path: path.join(__dirname, "dist"),
  },
  target: "node",
}
