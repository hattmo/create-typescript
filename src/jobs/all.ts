import copy from "../helpers/copy";
import { join as p } from "path";
import { MainAnswers } from "../types";

export default async (
  answers: MainAnswers,
  packageJson: any,
  dep: string[],
  devDep: string[]
) => {
  packageJson.name = "@" + answers.npmName + "/" + answers.appName;
  packageJson.description = answers.description;
  packageJson.scripts = {};
  packageJson.author = answers.author;
  packageJson.version = "0.1.0";
  packageJson.license = "GPL-3.0-or-later";
  packageJson.files = ["/dst/"];

  devDep.push("typescript", "@types/node");

  await copy(
    p(__dirname, "../../templates/all"),
    process.cwd(),
    (filename, text) => {
      if (filename === "README.md_T") {
        return text
          .toString("utf-8")
          .replace(/###name###/, answers.appName.toUpperCase())
          .replace(/###description###/, answers.description);
      } else {
        return text;
      }
    }
  );
};
