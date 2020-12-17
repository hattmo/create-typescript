import copy from "../helpers/copy";
import { join as p } from "path";
import { MainAnswers } from "../types";
import rimraf from "rimraf";
import { promisify } from "util";

const rm = promisify(rimraf);

export default async (
  answers: MainAnswers,
  packageJson: any,
  dep: string[],
  devDep: string[]
) => {
  packageJson.scripts.build = "webpack --watch";
  packageJson.scripts.prepare = "webpack --mode production && tsc --project .";
  packageJson.scripts.start = "webpack serve";
  packageJson.main = "./dst/lib/index.js";
  packageJson.files.push("/static/");

  devDep.push(
    "@types/webpack",
    "@types/webpack-dev-server",
    "webpack",
    "webpack-dev-server",
    "webpack-cli",
    "html-webpack-plugin",
    "ts-loader",
    "file-loader",
    "ts-node"
  );

  await rm("./src/bin/*");
  await copy(
    p(__dirname, "../../templates/browser"),
    process.cwd(),
    (title, text) => {
      if (title === "webpack.config.ts_T") {
        return text.toString("utf-8").replace("###APPNAME###", answers.appName);
      }
      return text;
    }
  );
};
