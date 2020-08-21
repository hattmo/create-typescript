import { MainAnswers } from "../types";

export default async (
  answers: MainAnswers,
  packageJson: any,
  dep: string[],
  devDep: string[]
) => {
  packageJson.scripts.build = "tsc --watch --project .";
  packageJson.scripts.prepare = "tsc --project .";
  packageJson.scripts.start = "nodemon ./dst/bin/main.js";
  packageJson.bin = "./dst/bin/main.js";
  packageJson.main = "./dst/lib/index.js";

  devDep.push("nodemon");
};
