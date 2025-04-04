import path from "path";
import { fileURLToPath } from "url";

const production = process.env.NODE_ENV === "production";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, "dist");

export default {
  entry: "./tldraw.js",
  output: {
    path: distPath,
    filename: production ? "tldraw.min.js" : "tldraw.js",
    library: "tldraw",
    libraryTarget: "umd",
  },
  module: {
    rules: [
      {
        test: /\.css$/, // Matches any .css file
        use: [
          "style-loader", // Injects styles into DOM
          "css-loader", // Turns CSS into CommonJS
        ],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
          },
        },
      },
    ],
  },
  //   externals: {
  //     react: "React",
  //     "react-dom": "ReactDOM",
  //   },
  optimization: {
    minimize: production, // Minimize only in production mode
  },
  mode: production ? "production" : "development",
  devtool: production ? false : "inline-source-map",
};
